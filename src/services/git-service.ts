// DevSpark IDE - Git Service
// This service handles Git operations
import { ApiResponse } from '../types';

interface GitOperationResult {
  success: boolean;
  output: string;
  error?: string;
}

class GitService {
    private apiService: any; // Will be properly typed when apiService is injected
    
    constructor() {
        // ApiService will be injected after initialization
        this.apiService = null;
    }
    
    // Initialize the Git service
    initialize(apiService: any): GitService {
        console.log('Git Service initialized');
        this.apiService = apiService;
        return this;
    }
    
    // Clone repository
    async cloneRepository(repoUrl: string, targetDir: string): Promise<GitOperationResult> {
        try {
            const result = await this.apiService.gitClone(repoUrl, targetDir);
            return {
                success: true,
                output: result.output
            };
        } catch (error) {
            console.error('Git clone error:', error);
            return {
                success: false,
                output: '',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    // Pull latest changes
    async pullChanges(repoDir: string): Promise<GitOperationResult> {
        try {
            const result = await this.apiService.gitPull(repoDir);
            return {
                success: true,
                output: result.output
            };
        } catch (error) {
            console.error('Git pull error:', error);
            return {
                success: false,
                output: '',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    // Additional Git operations can be added here
}

export default GitService;
