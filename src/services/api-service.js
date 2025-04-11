// DevSpark IDE - API Service
// This service handles communication with the backend API

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    // Initialize the API service
    initialize() {
        console.log('API Service initialized');
        return this;
    }
    
    // Generic request method
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
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
    async getFiles(path) {
        return this.request(`/files?path=${encodeURIComponent(path)}`);
    }
    
    async getFileContent(path) {
        return this.request(`/files/${encodeURIComponent(path)}`);
    }
    
    async saveFile(path, content) {
        return this.request(`/files/${encodeURIComponent(path)}`, 'POST', { content });
    }
    
    async deleteFile(path) {
        return this.request(`/files/${encodeURIComponent(path)}`, 'DELETE');
    }
    
    // AI Services
    async aiChat(message, context) {
        return this.request('/ai/chat', 'POST', { message, context });
    }
    
    async aiInline(prefix, context) {
        return this.request('/ai/inline', 'POST', { prefix, context });
    }
    
    async aiCommand(command, context) {
        return this.request('/ai/command', 'POST', { command, context });
    }
    
    // Git Operations
    async gitStatus(path) {
        return this.request(`/git/status?path=${encodeURIComponent(path)}`);
    }
    
    async gitBranches(path) {
        return this.request(`/git/branches?path=${encodeURIComponent(path)}`);
    }
    
    async gitCommit(message, repoPath) {
        return this.request('/git/commit', 'POST', { message, repoPath });
    }
    
    async gitPush(remote, branch, repoPath) {
        return this.request('/git/push', 'POST', { remote, branch, repoPath });
    }
    
    // Deployment
    async triggerDeployment(environmentId, options) {
        return this.request('/deploy/trigger', 'POST', { environmentId, options });
    }
    
    async getDeploymentStatus(deploymentId) {
        return this.request(`/deploy/status/${deploymentId}`);
    }
    
    async getDeploymentLogs(deploymentId) {
        return this.request(`/deploy/logs/${deploymentId}`);
    }
    
    // Application Scaffolding
    async getTemplates() {
        return this.request('/templates');
    }
    
    async generateApplication(templateId, parameters) {
        return this.request('/templates/generate', 'POST', { templateId, parameters });
    }
    
    // Terminal
    async executeCommand(command, cwd) {
        return this.request('/terminal/execute', 'POST', { command, cwd });
    }
}

// Export the API service
window.apiService = new ApiService().initialize();
