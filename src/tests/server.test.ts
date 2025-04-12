// Server API Test Suite
// This file contains tests for the server API endpoints

import request from 'supertest';
import app from '../backend/server';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmdirSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// Mock child_process module
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback(null, 'mock output', ''))
}));

describe('Server API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('File Operations', () => {
    test('GET /api/files should return file list', async () => {
      // Mock fs.readdirSync to return test files
      const mockFiles = [
        { name: 'file1.txt', isDirectory: () => false },
        { name: 'folder1', isDirectory: () => true }
      ];
      (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);
      
      const response = await request(app).get('/api/files?path=/test/path');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.files).toHaveLength(2);
      expect(response.body.files[0].name).toBe('file1.txt');
      expect(response.body.files[0].isDirectory).toBe(false);
      expect(response.body.files[1].name).toBe('folder1');
      expect(response.body.files[1].isDirectory).toBe(true);
    });
    
    test('GET /api/files/:filePath should return file content', async () => {
      // Mock fs.readFileSync to return test content
      (fs.readFileSync as jest.Mock).mockReturnValue('test file content');
      
      const response = await request(app).get('/api/files/test/file.txt');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.content).toBe('test file content');
    });
    
    test('POST /api/files/:filePath should save file content', async () => {
      // Mock fs.existsSync to return true for directory
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      
      const response = await request(app)
        .post('/api/files/test/file.txt')
        .send({ content: 'new content' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'test/file.txt',
        'new content',
        'utf8'
      );
    });
    
    test('DELETE /api/files/:filePath should delete file', async () => {
      // Mock fs.existsSync to return true for file
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.statSync to return file stats
      (fs.statSync as jest.Mock).mockReturnValue({
        isDirectory: () => false
      });
      
      const response = await request(app).delete('/api/files/test/file.txt');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith('test/file.txt');
    });
  });
  
  describe('Git Operations', () => {
    test('POST /api/git/clone should clone repository', async () => {
      const response = await request(app)
        .post('/api/git/clone')
        .send({
          repoUrl: 'https://github.com/example/repo.git',
          targetDir: '/test/target'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.output).toBe('mock output');
    });
    
    test('POST /api/git/pull should pull repository', async () => {
      const response = await request(app)
        .post('/api/git/pull')
        .send({
          repoDir: '/test/repo'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.output).toBe('mock output');
    });
  });
  
  describe('Deployment Operations', () => {
    test('POST /api/deploy should deploy project', async () => {
      const response = await request(app)
        .post('/api/deploy')
        .send({
          projectDir: '/test/project',
          deploymentType: 'static'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.output).toBe('mock output');
    });
  });
  
  describe('AI Integration', () => {
    test('POST /api/ai/complete should return completion', async () => {
      const response = await request(app)
        .post('/api/ai/complete')
        .send({
          prompt: 'Test prompt',
          context: 'Test context'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.completion).toContain('AI-generated code');
    });
  });
});
