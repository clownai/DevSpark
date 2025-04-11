// DevSpark IDE - Deployment UI Components
// This file contains the UI components for deployment functionality including "Pull to Deploy"

class DeploymentUI {
    constructor() {
        this.deploymentService = window.deploymentService;
        this.gitService = window.gitService;
        
        // Create deployment panel if it doesn't exist
        this.createDeploymentPanel();
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the Deployment UI
    initialize() {
        console.log('Deployment UI initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current deployment status
        this.updateUI();
        
        return this;
    }
    
    // Create deployment panel
    createDeploymentPanel() {
        // Check if panel already exists
        let deploymentPanel = document.querySelector('.deployment-panel');
        if (deploymentPanel) return;
        
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
        deploymentPanel.appendChild(panelHeader);
        
        // Add panel content
        const panelContent = document.createElement('div');
        panelContent.className = 'deployment-content';
        
        // Add environments section
        const environmentsSection = document.createElement('div');
        environmentsSection.className = 'deployment-environments';
        environmentsSection.innerHTML = `
            <div class="section-header">
                <span>Environments</span>
            </div>
            <div class="environments-list" id="environments-list">
                <!-- Environments will be populated here -->
            </div>
        `;
        panelContent.appendChild(environmentsSection);
        
        // Add deployments section
        const deploymentsSection = document.createElement('div');
        deploymentsSection.className = 'deployment-history';
        deploymentsSection.innerHTML = `
            <div class="section-header">
                <span>Deployment History</span>
            </div>
            <div class="deployments-list" id="deployments-list">
                <!-- Deployments will be populated here -->
            </div>
        `;
        panelContent.appendChild(deploymentsSection);
        
        // Add deployment logs section
        const logsSection = document.createElement('div');
        logsSection.className = 'deployment-logs';
        logsSection.innerHTML = `
            <div class="section-header">
                <span>Deployment Logs</span>
            </div>
            <div class="logs-container" id="deployment-logs">
                <!-- Logs will be populated here -->
            </div>
        `;
        panelContent.appendChild(logsSection);
        
        deploymentPanel.appendChild(panelContent);
        
        // Add to IDE container
        const ideContainer = document.querySelector('.ide-container');
        ideContainer.appendChild(deploymentPanel);
        
        // Add deployment button to sidebar
        this.addDeploymentButton();
    }
    
    // Add deployment button to sidebar
    addDeploymentButton() {
        // Check if sidebar exists
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Check if button already exists
        let deploymentSection = sidebar.querySelector('.sidebar-section:nth-child(4)');
        if (!deploymentSection) {
            // Create deployment section
            deploymentSection = document.createElement('div');
            deploymentSection.className = 'sidebar-section';
            deploymentSection.innerHTML = `
                <div class="section-header">
                    <i class="fas fa-rocket"></i> Deployment
                </div>
                <div class="deployment-button-container">
                    <div class="deployment-button">
                        <i class="fas fa-rocket"></i> Open Deployment Panel
                    </div>
                </div>
            `;
            
            // Add to sidebar after source control
            const sourceControl = sidebar.querySelector('.sidebar-section:nth-child(3)');
            if (sourceControl) {
                sidebar.insertBefore(deploymentSection, sourceControl.nextSibling);
            } else {
                sidebar.appendChild(deploymentSection);
            }
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Deployment panel toggle
        const deploymentButton = document.querySelector('.deployment-button');
        if (deploymentButton) {
            deploymentButton.addEventListener('click', () => {
                this.toggleDeploymentPanel();
            });
        }
        
        // Deployment panel close button
        const closeButton = document.querySelector('.deployment-panel .panel-actions i.fa-times');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleDeploymentPanel(false);
            });
        }
        
        // Add environment button
        const addButton = document.querySelector('.deployment-panel .panel-actions i.fa-plus');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddEnvironmentDialog();
            });
        }
        
        // Settings button
        const settingsButton = document.querySelector('.deployment-panel .panel-actions i.fa-cog');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showDeploymentSettings();
            });
        }
        
        // Listen for deployment log added events
        document.addEventListener('deployment-log-added', (event) => {
            this.updateDeploymentLogs(event.detail.deployment.id);
        });
        
        // Listen for deployment complete events
        document.addEventListener('deployment-complete', (event) => {
            this.updateUI();
        });
        
        // Listen for Git push events (for Pull to Deploy)
        document.addEventListener('git-push', (event) => {
            this.handleGitPush(event.detail.branch);
        });
    }
    
    // Toggle deployment panel
    toggleDeploymentPanel(show) {
        const deploymentPanel = document.querySelector('.deployment-panel');
        if (!deploymentPanel) return;
        
        if (show === undefined) {
            // Toggle
            deploymentPanel.classList.toggle('hidden');
        } else if (show) {
            // Show
            deploymentPanel.classList.remove('hidden');
        } else {
            // Hide
            deploymentPanel.classList.add('hidden');
        }
        
        // Update UI when showing
        if (!deploymentPanel.classList.contains('hidden')) {
            this.updateUI();
        }
    }
    
    // Update UI with current deployment status
    updateUI() {
        this.updateEnvironmentsList();
        this.updateDeploymentsList();
        this.updateDeploymentLogs();
    }
    
    // Update environments list
    updateEnvironmentsList() {
        const environmentsList = document.getElementById('environments-list');
        if (!environmentsList) return;
        
        // Clear current list
        environmentsList.innerHTML = '';
        
        // Get environments
        const environments = this.deploymentService.getEnvironments();
        
        // Add environments
        environments.forEach(env => {
            const environmentItem = document.createElement('div');
            environmentItem.className = 'environment-item';
            environmentItem.setAttribute('data-id', env.id);
            
            // Status indicator
            const statusClass = env.status === 'online' ? 'status-online' : 'status-offline';
            
            environmentItem.innerHTML = `
                <div class="environment-header">
                    <div class="environment-name">
                        <span class="status-indicator ${statusClass}"></span>
                        ${env.name}
                    </div>
                    <div class="environment-actions">
                        <button class="deploy-button" title="Deploy"><i class="fas fa-rocket"></i></button>
                        <button class="settings-button" title="Settings"><i class="fas fa-cog"></i></button>
                    </div>
                </div>
                <div class="environment-details">
                    <div class="environment-url"><i class="fas fa-link"></i> <a href="${env.url}" target="_blank">${env.url}</a></div>
                    <div class="environment-branch"><i class="fas fa-code-branch"></i> ${env.branch}</div>
                    <div class="environment-deploy-settings">
                        <span class="auto-deploy-indicator ${env.autoDeployEnabled ? 'enabled' : 'disabled'}">
                            <i class="fas ${env.autoDeployEnabled ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            Auto-Deploy
                        </span>
                        <span class="deploy-on-push-indicator ${env.deployOnPush ? 'enabled' : 'disabled'}">
                            <i class="fas ${env.deployOnPush ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                            Deploy on Push
                        </span>
                    </div>
                    ${env.lastDeployed ? `<div class="environment-last-deployed"><i class="fas fa-clock"></i> Last deployed: ${this.formatDate(env.lastDeployed)}</div>` : ''}
                </div>
            `;
            
            environmentsList.appendChild(environmentItem);
            
            // Add event listeners
            const deployButton = environmentItem.querySelector('.deploy-button');
            if (deployButton) {
                deployButton.addEventListener('click', () => {
                    this.deployToEnvironment(env.id);
                });
            }
            
            const settingsButton = environmentItem.querySelector('.settings-button');
            if (settingsButton) {
                settingsButton.addEventListener('click', () => {
                    this.showEnvironmentSettings(env.id);
                });
            }
        });
        
        // If no environments, show message
        if (environments.length === 0) {
            const noEnvironments = document.createElement('div');
            noEnvironments.className = 'no-environments';
            noEnvironments.innerHTML = `
                <p>No deployment environments configured.</p>
                <button class="add-environment-button"><i class="fas fa-plus"></i> Add Environment</button>
            `;
            environmentsList.appendChild(noEnvironments);
            
            // Add event listener
            const addButton = noEnvironments.querySelector('.add-environment-button');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    this.showAddEnvironmentDialog();
                });
            }
        }
    }
    
    // Update deployments list
    updateDeploymentsList() {
        const deploymentsList = document.getElementById('deployments-list');
        if (!deploymentsList) return;
        
        // Clear current list
        deploymentsList.innerHTML = '';
        
        // Get deployments
        const deployments = this.deploymentService.getDeployments();
        
        // Add deployments
        deployments.forEach(deployment => {
            const deploymentItem = document.createElement('div');
            deploymentItem.className = 'deployment-item';
            deploymentItem.setAttribute('data-id', deployment.id);
            
            // Get environment
            const environment = this.deploymentService.getEnvironment(deployment.environmentId);
            
            // Status class
            let statusClass = '';
            let statusIcon = '';
            
            switch (deployment.status) {
                case 'success':
                    statusClass = 'status-success';
                    statusIcon = 'fa-check-circle';
                    break;
                case 'in_progress':
                    statusClass = 'status-in-progress';
                    statusIcon = 'fa-spinner fa-spin';
                    break;
                case 'failed':
                    statusClass = 'status-failed';
                    statusIcon = 'fa-times-circle';
                    break;
                case 'cancelled':
                    statusClass = 'status-cancelled';
                    statusIcon = 'fa-ban';
                    break;
            }
            
            deploymentItem.innerHTML = `
                <div class="deployment-header">
                    <div class="deployment-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                    </div>
                    <div class="deployment-info">
                        <div class="deployment-environment">${environment ? environment.name : 'Unknown'}</div>
                        <div class="deployment-time">${this.formatDate(deployment.startTime)}</div>
                    </div>
                    <div class="deployment-actions">
                        <button class="view-logs-button" title="View Logs"><i class="fas fa-list"></i></button>
                        ${deployment.status === 'in_progress' ? `<button class="cancel-button" title="Cancel"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                </div>
                <div class="deployment-details">
                    <div class="deployment-commit"><i class="fas fa-code-commit"></i> ${deployment.commit}</div>
                    <div class="deployment-branch"><i class="fas fa-code-branch"></i> ${deployment.branch}</div>
                    <div class="deployment-user"><i class="fas fa-user"></i> ${deployment.user}</div>
                    ${deployment.endTime ? `<div class="deployment-duration"><i class="fas fa-clock"></i> Duration: ${this.formatDuration(new Date(deployment.startTime), new Date(deployment.endTime))}</div>` : ''}
                </div>
            `;
            
            deploymentsList.appendChild(deploymentItem);
            
            // Add event listeners
            const viewLogsButton = deploymentItem.querySelector('.view-logs-button');
            if (viewLogsButton) {
                viewLogsButton.addEventListener('click', () => {
                    this.viewDeploymentLogs(deployment.id);
                });
            }
            
            const cancelButton = deploymentItem.querySelector('.cancel-button');
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    this.cancelDeployment(deployment.id);
                });
            }
        });
        
        // If no deployments, show message
        if (deployments.length === 0) {
            const noDeployments = document.createElement('div');
            noDeployments.className = 'no-deployments';
            noDeployments.textContent = 'No deployments yet.';
            deploymentsList.appendChild(noDeployments);
        }
    }
    
    // Update deployment logs
    updateDeploymentLogs(deploymentId = null) {
        const logsContainer = document.getElementById('deployment-logs');
        if (!logsContainer) return;
        
        // If no deployment ID specified, use the current deployment or the most recent
        if (!deploymentId) {
            const currentDeployment = this.deploymentService.getCurrentDeployment();
            if (currentDeployment) {
                deploymentId = currentDeployment.id;
            } else {
                const deployments = this.deploymentService.getDeployments();
                if (deployments.length > 0) {
                    deploymentId = deployments[0].id;
                }
            }
        }
        
        // If still no deployment ID, clear logs
        if (!deploymentId) {
            logsContainer.innerHTML = '<div class="no-logs">No deployment logs available.</div>';
            return;
        }
        
        // Get deployment
        const deployment = this.deploymentService.getDeployment(deploymentId);
        if (!deployment) {
            logsContainer.innerHTML = '<div class="no-logs">Deployment not found.</div>';
            return;
        }
        
        // Get environment
        const environment = this.deploymentService.getEnvironment(deployment.environmentId);
        
        // Update logs header
        const logsHeader = document.querySelector('.deployment-logs .section-header');
        if (logsHeader) {
            logsHeader.innerHTML = `
                <span>Deployment Logs: ${environment ? environment.name : 'Unknown'} (${this.formatDate(deployment.startTime)})</span>
            `;
        }
        
        // Clear current logs
        logsContainer.innerHTML = '';
        
        // Add logs
        deployment.logs.forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = `log-item log-${log.level}`;
            logItem.innerHTML = `
                <span class="log-time">${this.formatTime(log.time)}</span>
                <span class="log-level">[${log.level.toUpperCase()}]</span>
                <span class="log-message">${log.message}</span>
            `;
            logsContainer.appendChild(logItem);
        });
        
        // Scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    // Deploy to environment
    async deployToEnvironment(environmentId) {
        try {
            const result = await this.deploymentService.deploy(environmentId);
            if (result.success) {
                this.showNotification(result.message);
                this.updateUI();
                this.viewDeploymentLogs(result.deployment.id);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error deploying: ${error.message}`, 'error');
        }
    }
    
    // Cancel deployment
    async cancelDeployment(deploymentId) {
        try {
            const result = await this.deploymentService.cancelDeployment(deploymentId);
            if (result.success) {
                this.showNotification(result.message);
                this.updateUI();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error cancelling deployment: ${error.message}`, 'error');
        }
    }
    
    // View deployment logs
    viewDeploymentLogs(deploymentId) {
        this.updateDeploymentLogs(deploymentId);
    }
    
    // Handle Git push for Pull to Deploy
    async handleGitPush(branch) {
        try {
            const result = await this.deploymentService.handleGitPush(branch);
            if (result.success && result.deployments.length > 0) {
                this.showNotification(result.message);
                this.updateUI();
                
                // Show deployment panel if auto-deploy occurred
                this.toggleDeploymentPanel(true);
                
                // View logs of the first deployment
                this.viewDeploymentLogs(result.deployments[0].id);
            }
        } catch (error) {
            this.showNotification(`Error handling Git push: ${error.message}`, 'error');
        }
    }
    
    // Show add environment dialog
    showAddEnvironmentDialog() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'deployment-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'deployment-dialog-header';
        header.innerHTML = '<i class="fas fa-plus"></i> Add Deployment Environment';
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'deployment-dialog-content';
        
        // Add form fields
        content.innerHTML = `
            <div class="form-group">
                <label for="env-name">Environment Name:</label>
                <input type="text" id="env-name" class="form-input" placeholder="e.g., Production, Staging, Development">
            </div>
            <div class="form-group">
                <label for="env-url">Environment URL:</label>
                <input type="text" id="env-url" class="form-input" placeholder="e.g., https://example.com">
            </div>
            <div class="form-group">
                <label for="env-branch">Git Branch:</label>
                <select id="env-branch" class="form-select">
                    <!-- Branches will be populated here -->
                </select>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="env-auto-deploy" class="form-checkbox">
                <label for="env-auto-deploy">Enable Auto-Deploy</label>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="env-deploy-on-push" class="form-checkbox">
                <label for="env-deploy-on-push">Deploy on Git Push</label>
            </div>
        `;
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'deployment-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const addButton = document.createElement('button');
        addButton.className = 'dialog-button add';
        addButton.textContent = 'Add Environment';
        addButton.addEventListener('click', async () => {
            const name = document.getElementById('env-name').value.trim();
            const url = document.getElementById('env-url').value.trim();
            const branch = document.getElementById('env-branch').value;
            const autoDeployEnabled = document.getElementById('env-auto-deploy').checked;
            const deployOnPush = document.getElementById('env-deploy-on-push').checked;
            
            if (!name || !url || !branch) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            try {
                const result = await this.deploymentService.createEnvironment({
                    name,
                    url,
                    branch,
                    autoDeployEnabled,
                    deployOnPush
                });
                
                if (result.success) {
                    this.showNotification(result.message);
                    this.updateUI();
                    document.body.removeChild(dialog);
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                this.showNotification(`Error creating environment: ${error.message}`, 'error');
            }
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(addButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
        
        // Populate branches
        const branchSelect = document.getElementById('env-branch');
        if (branchSelect) {
            const branches = this.gitService.getBranches();
            branches.forEach(branch => {
                if (!branch.isRemote) {
                    const option = document.createElement('option');
                    option.value = branch.name;
                    option.textContent = branch.name;
                    branchSelect.appendChild(option);
                }
            });
        }
        
        // Focus name input
        document.getElementById('env-name').focus();
    }
    
    // Show environment settings
    showEnvironmentSettings(environmentId) {
        const environment = this.deploymentService.getEnvironment(environmentId);
        if (!environment) {
            this.showNotification('Environment not found', 'error');
            return;
        }
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'deployment-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'deployment-dialog-header';
        header.innerHTML = `<i class="fas fa-cog"></i> Environment Settings: ${environment.name}`;
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'deployment-dialog-content';
        
        // Add form fields
        content.innerHTML = `
            <div class="form-group">
                <label for="env-name">Environment Name:</label>
                <input type="text" id="env-name" class="form-input" value="${environment.name}">
            </div>
            <div class="form-group">
                <label for="env-url">Environment URL:</label>
                <input type="text" id="env-url" class="form-input" value="${environment.url}">
            </div>
            <div class="form-group">
                <label for="env-branch">Git Branch:</label>
                <select id="env-branch" class="form-select">
                    <!-- Branches will be populated here -->
                </select>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="env-auto-deploy" class="form-checkbox" ${environment.autoDeployEnabled ? 'checked' : ''}>
                <label for="env-auto-deploy">Enable Auto-Deploy</label>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="env-deploy-on-push" class="form-checkbox" ${environment.deployOnPush ? 'checked' : ''}>
                <label for="env-deploy-on-push">Deploy on Git Push</label>
            </div>
        `;
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'deployment-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'dialog-button delete';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async () => {
            if (confirm(`Are you sure you want to delete the "${environment.name}" environment?`)) {
                try {
                    const result = await this.deploymentService.deleteEnvironment(environmentId);
                    if (result.success) {
                        this.showNotification(result.message);
                        this.updateUI();
                        document.body.removeChild(dialog);
                    } else {
                        this.showNotification(result.message, 'error');
                    }
                } catch (error) {
                    this.showNotification(`Error deleting environment: ${error.message}`, 'error');
                }
            }
        });
        
        const saveButton = document.createElement('button');
        saveButton.className = 'dialog-button save';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', async () => {
            const name = document.getElementById('env-name').value.trim();
            const url = document.getElementById('env-url').value.trim();
            const branch = document.getElementById('env-branch').value;
            const autoDeployEnabled = document.getElementById('env-auto-deploy').checked;
            const deployOnPush = document.getElementById('env-deploy-on-push').checked;
            
            if (!name || !url || !branch) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            try {
                const result = await this.deploymentService.updateEnvironment(environmentId, {
                    name,
                    url,
                    branch,
                    autoDeployEnabled,
                    deployOnPush
                });
                
                if (result.success) {
                    this.showNotification(result.message);
                    this.updateUI();
                    document.body.removeChild(dialog);
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                this.showNotification(`Error updating environment: ${error.message}`, 'error');
            }
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(deleteButton);
        buttons.appendChild(saveButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
        
        // Populate branches
        const branchSelect = document.getElementById('env-branch');
        if (branchSelect) {
            const branches = this.gitService.getBranches();
            branches.forEach(branch => {
                if (!branch.isRemote) {
                    const option = document.createElement('option');
                    option.value = branch.name;
                    option.textContent = branch.name;
                    option.selected = branch.name === environment.branch;
                    branchSelect.appendChild(option);
                }
            });
        }
        
        // Focus name input
        document.getElementById('env-name').focus();
    }
    
    // Show deployment settings
    showDeploymentSettings() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'deployment-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'deployment-dialog-header';
        header.innerHTML = '<i class="fas fa-cog"></i> Deployment Settings';
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'deployment-dialog-content';
        
        // Add form fields
        content.innerHTML = `
            <div class="form-group">
                <label>Pull to Deploy Settings:</label>
                <div class="info-text">
                    Configure how Git push events trigger deployments to your environments.
                    Each environment can be configured to automatically deploy when changes are pushed to its configured branch.
                </div>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="global-auto-deploy" class="form-checkbox" checked>
                <label for="global-auto-deploy">Enable Pull to Deploy globally</label>
            </div>
            <div class="form-group">
                <label>Deployment Notifications:</label>
                <div class="checkbox-group">
                    <input type="checkbox" id="notify-success" class="form-checkbox" checked>
                    <label for="notify-success">Notify on successful deployments</label>
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="notify-failure" class="form-checkbox" checked>
                    <label for="notify-failure">Notify on failed deployments</label>
                </div>
            </div>
        `;
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'deployment-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const saveButton = document.createElement('button');
        saveButton.className = 'dialog-button save';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => {
            this.showNotification('Deployment settings saved');
            document.body.removeChild(dialog);
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(saveButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
    }
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
    
    // Format time
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    }
    
    // Format duration
    formatDuration(startDate, endDate) {
        const durationMs = endDate - startDate;
        const seconds = Math.floor(durationMs / 1000);
        
        if (seconds < 60) {
            return `${seconds} seconds`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes < 60) {
            return `${minutes} min ${remainingSeconds} sec`;
        }
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return `${hours} hr ${remainingMinutes} min`;
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.deployment-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'deployment-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `deployment-notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize Deployment UI when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Deployment service to be initialized
    const checkDeploymentService = setInterval(() => {
        if (window.deploymentService) {
            clearInterval(checkDeploymentService);
            window.deploymentUI = new DeploymentUI();
        }
    }, 100);
});
