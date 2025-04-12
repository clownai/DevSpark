// DevSpark IDE - API Service
// This service handles communication with the backend API
import { ApiResponse, FileEntry, FileOperation } from '../types';

class ApiService {
    private baseUrl: string;
    private headers: Record<string, string>;
    
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    // Initialize the API service
    initialize(): ApiService {
        console.log('API Service initialized');
        return this;
    }
    
    // Generic request method
    async request<T = any>(endpoint: string, method = 'GET', data: any = null): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        const options: RequestInit = {
            method,
            headers: this.headers,
            credentials: 'include'
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'API request failed');
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }
    }
    
    // File Operations
    async getFiles(path: string): Promise<ApiResponse<{ files: FileEntry[] }>> {
        return this.request(`/files?path=${encodeURIComponent(path)}`);
    }
    
    async getFileContent(path: string): Promise<ApiResponse<{ content: string }>> {
        return this.request(`/files/${encodeURIComponent(path)}`);
    }
    
    async saveFile(path: string, content: string): Promise<ApiResponse> {
        return this.request(`/files/${encodeURIComponent(path)}`, 'POST', { content });
    }
    
    async deleteFile(path: string): Promise<ApiResponse> {
        return this.request(`/files/${encodeURIComponent(path)}`, 'DELETE');
    }
    
    // Git Operations
    async gitClone(repoUrl: string, targetDir: string): Promise<ApiResponse<{ output: string }>> {
        return this.request('/git/clone', 'POST', { repoUrl, targetDir });
    }
    
    async gitPull(repoDir: string): Promise<ApiResponse<{ output: string }>> {
        return this.request('/git/pull', 'POST', { repoDir });
    }
    
    // Deployment Operations
    async deploy(projectDir: string, deploymentType: 'static' | 'node'): Promise<ApiResponse<{ output: string }>> {
        return this.request('/deploy', 'POST', { projectDir, deploymentType });
    }
    
    // AI Operations
    async aiComplete(prompt: string, context?: string): Promise<ApiResponse<{ completion: string }>> {
        return this.request('/ai/complete', 'POST', { prompt, context });
    }
}

export default ApiService;
