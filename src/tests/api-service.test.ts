// API Service Test Suite
// This file contains tests for the API service

import ApiService from '../services/api-service';
import { FileEntry, ApiResponse } from '../types';

// Mock fetch for testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: 'test data' })
  })
) as jest.Mock;

describe('API Service Tests', () => {
  let apiService: ApiService;
  
  beforeEach(() => {
    // Create a new instance for each test
    apiService = new ApiService();
    
    // Reset mocks before each test
    (fetch as jest.Mock).mockClear();
  });
  
  test('should initialize API service', () => {
    const service = apiService.initialize();
    expect(service).toBe(apiService);
  });
  
  test('should make a GET request', async () => {
    const result = await apiService.request('/test-endpoint');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
    );
    expect(result).toEqual({ success: true, data: 'test data' });
  });
  
  test('should make a POST request with data', async () => {
    const testData = { name: 'test', value: 123 };
    const result = await apiService.request('/test-endpoint', 'POST', testData);
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(testData)
      })
    );
    expect(result).toEqual({ success: true, data: 'test data' });
  });
  
  test('should handle API errors', async () => {
    // Override the mock for this test to simulate an error
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, message: 'Server error' })
      })
    );
    
    await expect(apiService.request('/test-endpoint')).rejects.toThrow('Server error');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  test('should get files from a directory', async () => {
    // Mock response for getFiles
    const mockFiles: FileEntry[] = [
      { name: 'file1.txt', isDirectory: false, path: '/path/to/file1.txt', extension: 'txt' },
      { name: 'folder1', isDirectory: true, path: '/path/to/folder1', extension: null }
    ];
    
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, files: mockFiles })
      })
    );
    
    const result = await apiService.getFiles('/path/to');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/files?path=%2Fpath%2Fto',
      expect.anything()
    );
    expect(result.success).toBe(true);
    expect(result.files).toEqual(mockFiles);
  });
  
  test('should get file content', async () => {
    // Mock response for getFileContent
    (fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, content: 'file content' })
      })
    );
    
    const result = await apiService.getFileContent('/path/to/file.txt');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/%2Fpath%2Fto%2Ffile.txt',
      expect.anything()
    );
    expect(result.success).toBe(true);
    expect(result.content).toBe('file content');
  });
  
  test('should save file content', async () => {
    const result = await apiService.saveFile('/path/to/file.txt', 'new content');
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/files/%2Fpath%2Fto%2Ffile.txt',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'new content' })
      })
    );
    expect(result.success).toBe(true);
  });
});
