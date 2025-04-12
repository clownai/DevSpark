// DevSpark IDE - Deployment UI Components
// This file contains the UI components for deployment functionality including "Pull to Deploy"
interface DeploymentEnvironment {
  name: string;
  type: 'static' | 'node' | 'docker';
  url?: string;
  repoUrl?: string;
  branch?: string;
  buildCommand?: string;
  deployCommand?: string;
  status: 'idle' | 'building' | 'deploying' | 'success' | 'failed';
  lastDeployed?: Date;
}

interface DeploymentService {
  deployProject(options: {
    projectDir: string;
    deploymentType: 'static' | 'node' | 'docker';
    environmentVariables?: Record<string, string>;
    buildCommand?: string;
  }): Promise<{
    success: boolean;
    output: string;
    deploymentUrl?: string;
    error?: string;
  }>;
}

interface GitService {
  cloneRepository(repoUrl: string, targetDir: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
  }>;
  pullChanges(repoDir: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    deploymentService: DeploymentService;
    gitService: GitService;
  }
}

class DeploymentUI {
    private deploymentService: DeploymentService;
    private gitService: GitService;
    private deploymentPanel: HTMLElement | null = null;
    private environments: DeploymentEnvironment[] = [];
    private selectedEnvironment: DeploymentEnvironment | null = null;
    
    constructor() {
        this.deploymentService = window.deploymentService;
        this.gitService = window.gitService;
        
        // Create deployment panel if it doesn't exist
        this.createDeploymentPanel();
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the Deployment UI
    initialize(): DeploymentUI {
        console.log('Deployment UI initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current deployment status
        this.updateUI();
        
        return this;
    }
    
    // Create deployment panel
    private createDeploymentPanel(): void {
        // Check if panel already exists
        let deploymentPanel = document.querySelector('.deployment-panel');
        if (deploymentPanel) {
            this.deploymentPanel = deploymentPanel as HTMLElement;
            return;
        }
        
        // Create panel
        deploymentPanel = document.createElement('div');
        deploymentPanel.className = 'panel deployment-panel hidden';
        
        // Add panel header
        const panelHeader = document.createElement('div');
        panelHeader.className = 'panel-header';
        panelHeader.innerHTML = `
            <div class="panel-title">
                <i class="fas fa-rocket"></i> Deployment
            </div>
            <div class="panel-actions">
                <i class="fas fa-plus" title="Add Environment"></i>
                <i class="fas fa-cog" title="Settings"></i>
                <i class="fas fa-times" title="Close"></i>
            </div>
        `;
        
        // Add panel content
        const panelContent = document.createElement('div');
        panelContent.className = 'panel-content';
        
        // Add environments list
        const environmentsList = document.createElement('div');
        environmentsList.className = 'environments-list';
        
        // Add deployment form
        const deploymentForm = document.createElement('div');
        deploymentForm.className = 'deployment-form';
        deploymentForm.innerHTML = `
            <div class="form-group">
                <label for="deployment-type">Deployment Type</label>
                <select id="deployment-type">
                    <option value="static">Static Website</option>
                    <option value="node">Node.js Application</option>
                    <option value="docker">Docker Container</option>
                </select>
            </div>
            <div class="form-group">
                <label for="repo-url">Repository URL</label>
                <input type="text" id="repo-url" placeholder="https://github.com/username/repo.git">
            </div>
            <div class="form-group">
                <label for="branch">Branch</label>
                <input type="text" id="branch" placeholder="main" value="main">
            </div>
            <div class="form-group">
                <label for="build-command">Build Command</label>
                <input type="text" id="build-command" placeholder="npm run build">
            </div>
            <div class="form-group">
                <button id="deploy-button" class="primary-button">Deploy</button>
            </div>
        `;
        
        // Add deployment logs
        const deploymentLogs = document.createElement('div');
        deploymentLogs.className = 'deployment-logs';
        deploymentLogs.innerHTML = `
            <div class="logs-header">
                <span>Deployment Logs</span>
                <button class="clear-logs-button">Clear</button>
            </div>
            <div class="logs-content"></div>
        `;
        
        // Assemble panel
        panelContent.appendChild(environmentsList);
        panelContent.appendChild(deploymentForm);
        panelContent.appendChild(deploymentLogs);
        
        deploymentPanel.appendChild(panelHeader);
        deploymentPanel.appendChild(panelContent);
        
        // Add to document
        document.body.appendChild(deploymentPanel);
        
        this.deploymentPanel = deploymentPanel as HTMLElement;
    }
    
    // Set up event listeners
    private setupEventListeners(): void {
        if (!this.deploymentPanel) return;
        
        // Close button
        const closeButton = this.deploymentPanel.querySelector('.panel-actions .fa-times');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hidePanel();
            });
        }
        
        // Add environment button
        const addButton = this.deploymentPanel.querySelector('.panel-actions .fa-plus');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddEnvironmentForm();
            });
        }
        
        // Settings button
        const settingsButton = this.deploymentPanel.querySelector('.panel-actions .fa-cog');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Deploy button
        const deployButton = this.deploymentPanel.querySelector('#deploy-button');
        if (deployButton) {
            deployButton.addEventListener('click', () => {
                this.deployProject();
            });
        }
        
        // Clear logs button
        const clearLogsButton = this.deploymentPanel.querySelector('.clear-logs-button');
        if (clearLogsButton) {
            clearLogsButton.addEventListener('click', () => {
                this.clearLogs();
            });
        }
    }
    
    // Show deployment panel
    showPanel(): void {
        if (this.deploymentPanel) {
            this.deploymentPanel.classList.remove('hidden');
        }
    }
    
    // Hide deployment panel
    hidePanel(): void {
        if (this.deploymentPanel) {
            this.deploymentPanel.classList.add('hidden');
        }
    }
    
    // Update UI with current deployment status
    private updateUI(): void {
        this.updateEnvironmentsList();
        this.updateDeploymentForm();
    }
    
    // Update environments list
    private updateEnvironmentsList(): void {
        const environmentsList = this.deploymentPanel?.querySelector('.environments-list');
        if (!environmentsList) return;
        
        // Clear list
        environmentsList.innerHTML = '';
        
        // Add environments
        if (this.environments.length === 0) {
            environmentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-rocket"></i>
                    <p>No deployment environments configured</p>
                    <button class="add-environment-button">Add Environment</button>
                </div>
            `;
            
            const addButton = environmentsList.querySelector('.add-environment-button');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    this.showAddEnvironmentForm();
                });
            }
        } else {
            this.environments.forEach(env => {
                const envElement = document.createElement('div');
                envElement.className = `environment-item ${env === this.selectedEnvironment ? 'selected' : ''}`;
                envElement.innerHTML = `
                    <div class="environment-info">
                        <div class="environment-name">${env.name}</div>
                        <div class="environment-type">${env.type}</div>
                    </div>
                    <div class="environment-status ${env.status}">
                        ${env.status}
                    </div>
                `;
                
                envElement.addEventListener('click', () => {
                    this.selectEnvironment(env);
                });
                
                environmentsList.appendChild(envElement);
            });
        }
    }
    
    // Update deployment form
    private updateDeploymentForm(): void {
        if (!this.deploymentPanel) return;
        
        const typeSelect = this.deploymentPanel.querySelector('#deployment-type') as HTMLSelectElement;
        const repoUrlInput = this.deploymentPanel.querySelector('#repo-url') as HTMLInputElement;
        const branchInput = this.deploymentPanel.querySelector('#branch') as HTMLInputElement;
        const buildCommandInput = this.deploymentPanel.querySelector('#build-command') as HTMLInputElement;
        
        if (this.selectedEnvironment) {
            if (typeSelect) typeSelect.value = this.selectedEnvironment.type;
            if (repoUrlInput) repoUrlInput.value = this.selectedEnvironment.repoUrl || '';
            if (branchInput) branchInput.value = this.selectedEnvironment.branch || 'main';
            if (buildCommandInput) buildCommandInput.value = this.selectedEnvironment.buildCommand || '';
        }
    }
    
    // Show add environment form
    private showAddEnvironmentForm(): void {
        // Implementation would go here
        console.log('Show add environment form');
    }
    
    // Show settings
    private showSettings(): void {
        // Implementation would go here
        console.log('Show settings');
    }
    
    // Select environment
    private selectEnvironment(env: DeploymentEnvironment): void {
        this.selectedEnvironment = env;
        this.updateUI();
    }
    
    // Deploy project
    private async deployProject(): Promise<void> {
        if (!this.deploymentPanel) return;
        
        const typeSelect = this.deploymentPanel.querySelector('#deployment-type') as HTMLSelectElement;
        const repoUrlInput = this.deploymentPanel.querySelector('#repo-url') as HTMLInputElement;
        const branchInput = this.deploymentPanel.querySelector('#branch') as HTMLInputElement;
        const buildCommandInput = this.deploymentPanel.querySelector('#build-command') as HTMLInputElement;
        
        if (!typeSelect || !repoUrlInput || !branchInput || !buildCommandInput) return;
        
        const deploymentType = typeSelect.value as 'static' | 'node' | 'docker';
        const repoUrl = repoUrlInput.value;
        const branch = branchInput.value;
        const buildCommand = buildCommandInput.value;
        
        if (!repoUrl) {
            this.logMessage('Error: Repository URL is required', 'error');
            return;
        }
        
        // Create temporary directory for deployment
        const tempDir = `/tmp/deployment-${Date.now()}`;
        
        try {
            // Log start
            this.logMessage(`Starting deployment of ${repoUrl} (${branch})`, 'info');
            
            // Clone repository
            this.logMessage(`Cloning repository...`, 'info');
            const cloneResult = await this.gitService.cloneRepository(repoUrl, tempDir);
            
            if (!cloneResult.success) {
                throw new Error(`Failed to clone repository: ${cloneResult.error}`);
            }
            
            this.logMessage(`Repository cloned successfully`, 'success');
            
            // Deploy project
            this.logMessage(`Deploying project...`, 'info');
            const deployResult = await this.deploymentService.deployProject({
                projectDir: tempDir,
                deploymentType,
                buildCommand: buildCommand || undefined
            });
            
            if (!deployResult.success) {
                throw new Error(`Failed to deploy project: ${deployResult.error}`);
            }
            
            this.logMessage(`Project deployed successfully`, 'success');
            
            if (deployResult.deploymentUrl) {
                this.logMessage(`Deployment URL: ${deployResult.deploymentUrl}`, 'info');
            }
        } catch (error) {
            this.logMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        }
    }
    
    // Log message to deployment logs
    private logMessage(message: string, type: 'info' | 'success' | 'error' | 'warning'): void {
        const logsContent = this.deploymentPanel?.querySelector('.logs-content');
        if (!logsContent) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
        
        logsContent.appendChild(logEntry);
        logsContent.scrollTop = logsContent.scrollHeight;
    }
    
    // Clear logs
    private clearLogs(): void {
        const logsContent = this.deploymentPanel?.querySelector('.logs-content');
        if (logsContent) {
            logsContent.innerHTML = '';
        }
    }
}

export default DeploymentUI;
