// DevSpark IDE - Deployment Service
// This service handles deployment functionality including "Pull to Deploy" feature

class DeploymentService {
    constructor() {
        this.deployments = [];
        this.environments = [];
        this.currentDeployment = null;
        this.gitService = window.gitService;
    }
    
    // Initialize the Deployment service
    initialize() {
        console.log('Deployment Service initialized');
        
        // Set up sample environments
        this.setupSampleEnvironments();
        
        // Set up sample deployments
        this.setupSampleDeployments();
        
        return this;
    }
    
    // Set up sample environments for demo purposes
    setupSampleEnvironments() {
        this.environments = [
            {
                id: 'dev',
                name: 'Development',
                url: 'https://dev.example.com',
                branch: 'develop',
                autoDeployEnabled: true,
                deployOnPush: true,
                lastDeployed: '2025-04-10T10:30:00Z',
                status: 'online'
            },
            {
                id: 'staging',
                name: 'Staging',
                url: 'https://staging.example.com',
                branch: 'main',
                autoDeployEnabled: true,
                deployOnPush: true,
                lastDeployed: '2025-04-09T15:45:00Z',
                status: 'online'
            },
            {
                id: 'prod',
                name: 'Production',
                url: 'https://www.example.com',
                branch: 'main',
                autoDeployEnabled: false,
                deployOnPush: false,
                lastDeployed: '2025-04-08T09:15:00Z',
                status: 'online'
            }
        ];
    }
    
    // Set up sample deployments for demo purposes
    setupSampleDeployments() {
        this.deployments = [
            {
                id: 'deploy-1',
                environmentId: 'prod',
                status: 'success',
                startTime: '2025-04-08T09:00:00Z',
                endTime: '2025-04-08T09:15:00Z',
                commit: 'e4f5g6h',
                branch: 'main',
                user: 'John Doe',
                logs: [
                    { time: '2025-04-08T09:00:00Z', level: 'info', message: 'Starting deployment to Production' },
                    { time: '2025-04-08T09:01:00Z', level: 'info', message: 'Building application...' },
                    { time: '2025-04-08T09:10:00Z', level: 'info', message: 'Build successful' },
                    { time: '2025-04-08T09:11:00Z', level: 'info', message: 'Deploying to server...' },
                    { time: '2025-04-08T09:15:00Z', level: 'success', message: 'Deployment successful' }
                ]
            },
            {
                id: 'deploy-2',
                environmentId: 'staging',
                status: 'success',
                startTime: '2025-04-09T15:30:00Z',
                endTime: '2025-04-09T15:45:00Z',
                commit: 'a1b2c3d',
                branch: 'main',
                user: 'Jane Smith',
                logs: [
                    { time: '2025-04-09T15:30:00Z', level: 'info', message: 'Starting deployment to Staging' },
                    { time: '2025-04-09T15:31:00Z', level: 'info', message: 'Building application...' },
                    { time: '2025-04-09T15:40:00Z', level: 'info', message: 'Build successful' },
                    { time: '2025-04-09T15:41:00Z', level: 'info', message: 'Deploying to server...' },
                    { time: '2025-04-09T15:45:00Z', level: 'success', message: 'Deployment successful' }
                ]
            },
            {
                id: 'deploy-3',
                environmentId: 'dev',
                status: 'success',
                startTime: '2025-04-10T10:15:00Z',
                endTime: '2025-04-10T10:30:00Z',
                commit: 'i7j8k9l',
                branch: 'develop',
                user: 'System',
                logs: [
                    { time: '2025-04-10T10:15:00Z', level: 'info', message: 'Starting deployment to Development' },
                    { time: '2025-04-10T10:16:00Z', level: 'info', message: 'Building application...' },
                    { time: '2025-04-10T10:25:00Z', level: 'info', message: 'Build successful' },
                    { time: '2025-04-10T10:26:00Z', level: 'info', message: 'Deploying to server...' },
                    { time: '2025-04-10T10:30:00Z', level: 'success', message: 'Deployment successful' }
                ]
            }
        ];
    }
    
    // Get all environments
    getEnvironments() {
        return this.environments;
    }
    
    // Get environment by ID
    getEnvironment(id) {
        return this.environments.find(env => env.id === id);
    }
    
    // Get all deployments
    getDeployments(environmentId = null) {
        if (environmentId) {
            return this.deployments.filter(deploy => deploy.environmentId === environmentId);
        }
        return this.deployments;
    }
    
    // Get deployment by ID
    getDeployment(id) {
        return this.deployments.find(deploy => deploy.id === id);
    }
    
    // Create a new environment
    async createEnvironment(environment) {
        // Validate environment
        if (!environment.name || !environment.url || !environment.branch) {
            return {
                success: false,
                message: 'Missing required fields'
            };
        }
        
        // Generate ID if not provided
        if (!environment.id) {
            environment.id = 'env-' + Date.now();
        }
        
        // Set defaults
        environment.autoDeployEnabled = environment.autoDeployEnabled || false;
        environment.deployOnPush = environment.deployOnPush || false;
        environment.lastDeployed = null;
        environment.status = 'offline';
        
        // Add to environments
        this.environments.push(environment);
        
        return {
            success: true,
            message: `Environment "${environment.name}" created successfully`,
            environment
        };
    }
    
    // Update an environment
    async updateEnvironment(id, updates) {
        const environment = this.getEnvironment(id);
        if (!environment) {
            return {
                success: false,
                message: `Environment with ID "${id}" not found`
            };
        }
        
        // Update fields
        Object.assign(environment, updates);
        
        return {
            success: true,
            message: `Environment "${environment.name}" updated successfully`,
            environment
        };
    }
    
    // Delete an environment
    async deleteEnvironment(id) {
        const index = this.environments.findIndex(env => env.id === id);
        if (index === -1) {
            return {
                success: false,
                message: `Environment with ID "${id}" not found`
            };
        }
        
        // Remove from environments
        const environment = this.environments[index];
        this.environments.splice(index, 1);
        
        return {
            success: true,
            message: `Environment "${environment.name}" deleted successfully`
        };
    }
    
    // Deploy to an environment
    async deploy(environmentId, options = {}) {
        const environment = this.getEnvironment(environmentId);
        if (!environment) {
            return {
                success: false,
                message: `Environment with ID "${environmentId}" not found`
            };
        }
        
        // Create deployment
        const deployment = {
            id: 'deploy-' + Date.now(),
            environmentId,
            status: 'in_progress',
            startTime: new Date().toISOString(),
            endTime: null,
            commit: options.commit || this.gitService.commitHistory[0].hash,
            branch: options.branch || environment.branch,
            user: options.user || 'Current User',
            logs: [
                { time: new Date().toISOString(), level: 'info', message: `Starting deployment to ${environment.name}` }
            ]
        };
        
        // Add to deployments
        this.deployments.unshift(deployment);
        
        // Set as current deployment
        this.currentDeployment = deployment;
        
        // Simulate deployment process
        this.simulateDeploymentProcess(deployment);
        
        return {
            success: true,
            message: `Deployment to "${environment.name}" started`,
            deployment
        };
    }
    
    // Simulate deployment process
    async simulateDeploymentProcess(deployment) {
        const environment = this.getEnvironment(deployment.environmentId);
        
        // Add build step
        setTimeout(() => {
            this.addDeploymentLog(deployment.id, 'info', 'Building application...');
        }, 1000);
        
        // Add build success
        setTimeout(() => {
            this.addDeploymentLog(deployment.id, 'info', 'Build successful');
        }, 3000);
        
        // Add deploy step
        setTimeout(() => {
            this.addDeploymentLog(deployment.id, 'info', 'Deploying to server...');
        }, 4000);
        
        // Complete deployment
        setTimeout(() => {
            // Add success log
            this.addDeploymentLog(deployment.id, 'success', 'Deployment successful');
            
            // Update deployment
            deployment.status = 'success';
            deployment.endTime = new Date().toISOString();
            
            // Update environment
            environment.lastDeployed = deployment.endTime;
            environment.status = 'online';
            
            // Clear current deployment
            if (this.currentDeployment && this.currentDeployment.id === deployment.id) {
                this.currentDeployment = null;
            }
            
            // Trigger deployment complete event
            const event = new CustomEvent('deployment-complete', {
                detail: { deployment, environment }
            });
            document.dispatchEvent(event);
        }, 6000);
    }
    
    // Add a log to a deployment
    addDeploymentLog(deploymentId, level, message) {
        const deployment = this.getDeployment(deploymentId);
        if (!deployment) return;
        
        // Add log
        const log = {
            time: new Date().toISOString(),
            level,
            message
        };
        
        deployment.logs.push(log);
        
        // Trigger log added event
        const event = new CustomEvent('deployment-log-added', {
            detail: { deployment, log }
        });
        document.dispatchEvent(event);
    }
    
    // Cancel a deployment
    async cancelDeployment(deploymentId) {
        const deployment = this.getDeployment(deploymentId);
        if (!deployment) {
            return {
                success: false,
                message: `Deployment with ID "${deploymentId}" not found`
            };
        }
        
        // Check if deployment is in progress
        if (deployment.status !== 'in_progress') {
            return {
                success: false,
                message: `Deployment is not in progress`
            };
        }
        
        // Update deployment
        deployment.status = 'cancelled';
        deployment.endTime = new Date().toISOString();
        
        // Add log
        this.addDeploymentLog(deploymentId, 'warning', 'Deployment cancelled by user');
        
        // Clear current deployment
        if (this.currentDeployment && this.currentDeployment.id === deploymentId) {
            this.currentDeployment = null;
        }
        
        return {
            success: true,
            message: 'Deployment cancelled successfully',
            deployment
        };
    }
    
    // Handle Git push event for Pull to Deploy
    async handleGitPush(branch) {
        // Find environments configured for auto-deploy on this branch
        const autoDeployEnvironments = this.environments.filter(env => 
            env.autoDeployEnabled && 
            env.deployOnPush && 
            env.branch === branch
        );
        
        // Deploy to each environment
        const deployments = [];
        for (const environment of autoDeployEnvironments) {
            const result = await this.deploy(environment.id, {
                branch,
                user: 'Pull to Deploy'
            });
            
            if (result.success) {
                deployments.push(result.deployment);
            }
        }
        
        return {
            success: true,
            message: `Auto-deployed to ${deployments.length} environment(s)`,
            deployments
        };
    }
    
    // Get deployment logs
    getDeploymentLogs(deploymentId) {
        const deployment = this.getDeployment(deploymentId);
        if (!deployment) {
            return [];
        }
        
        return deployment.logs;
    }
    
    // Get current deployment
    getCurrentDeployment() {
        return this.currentDeployment;
    }
}

// Export the Deployment service
window.deploymentService = new DeploymentService().initialize();
