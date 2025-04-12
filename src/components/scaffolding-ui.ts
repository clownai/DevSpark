// DevSpark IDE - Application Scaffolding UI Components (1ClickApp)
// This file contains the UI components for application scaffolding functionality

interface ScaffoldingService {
  getTemplates(): Promise<Template[]>;
  createProject(options: {
    templateId: string;
    projectName: string;
    outputDir: string;
    variables?: Record<string, string>;
  }): Promise<{
    success: boolean;
    message: string;
    projectPath?: string;
  }>;
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

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'other';
  tags: string[];
  icon: string;
  variables?: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
  type: 'string' | 'boolean' | 'select';
  options?: string[]; // For select type
}

declare global {
  interface Window {
    scaffoldingService: ScaffoldingService;
    deploymentService: DeploymentService;
  }
}

class ScaffoldingUI {
    private scaffoldingService: ScaffoldingService;
    private deploymentService: DeploymentService;
    private scaffoldingPanel: HTMLElement | null = null;
    private templates: Template[] = [];
    private selectedTemplate: Template | null = null;
    
    constructor() {
        this.scaffoldingService = window.scaffoldingService;
        this.deploymentService = window.deploymentService;
        
        // Create scaffolding panel if it doesn't exist
        this.createScaffoldingPanel();
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the Scaffolding UI
    initialize(): ScaffoldingUI {
        console.log('Scaffolding UI initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current templates
        this.updateUI();
        
        return this;
    }
    
    // Create scaffolding panel
    private createScaffoldingPanel(): void {
        // Check if panel already exists
        let scaffoldingPanel = document.querySelector('.scaffolding-panel');
        if (scaffoldingPanel) {
            this.scaffoldingPanel = scaffoldingPanel as HTMLElement;
            return;
        }
        
        // Create panel
        scaffoldingPanel = document.createElement('div');
        scaffoldingPanel.className = 'panel scaffolding-panel hidden';
        
        // Add panel header
        const panelHeader = document.createElement('div');
        panelHeader.className = 'panel-header';
        panelHeader.innerHTML = `
            <div class="panel-title">
                <i class="fas fa-magic"></i> 1ClickApp - Application Scaffolding
            </div>
            <div class="panel-actions">
                <i class="fas fa-times" title="Close"></i>
            </div>
        `;
        scaffoldingPanel.appendChild(panelHeader);
        
        // Add panel content
        const panelContent = document.createElement('div');
        panelContent.className = 'panel-content';
        
        // Add templates container
        const templatesContainer = document.createElement('div');
        templatesContainer.className = 'templates-container';
        
        // Add template details container
        const templateDetailsContainer = document.createElement('div');
        templateDetailsContainer.className = 'template-details-container hidden';
        
        // Add templates to panel
        panelContent.appendChild(templatesContainer);
        panelContent.appendChild(templateDetailsContainer);
        
        scaffoldingPanel.appendChild(panelContent);
        
        // Add to document
        document.body.appendChild(scaffoldingPanel);
        
        this.scaffoldingPanel = scaffoldingPanel as HTMLElement;
    }
    
    // Set up event listeners
    private setupEventListeners(): void {
        if (!this.scaffoldingPanel) return;
        
        // Close button
        const closeButton = this.scaffoldingPanel.querySelector('.panel-actions .fa-times');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hidePanel();
            });
        }
        
        // Template selection
        const templatesContainer = this.scaffoldingPanel.querySelector('.templates-container');
        if (templatesContainer) {
            templatesContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const templateItem = target.closest('.template-item');
                
                if (templateItem) {
                    const templateId = templateItem.getAttribute('data-template-id');
                    if (templateId) {
                        this.selectTemplate(templateId);
                    }
                }
            });
        }
        
        // Back button in template details
        const templateDetailsContainer = this.scaffoldingPanel.querySelector('.template-details-container');
        if (templateDetailsContainer) {
            templateDetailsContainer.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                
                if (target.closest('.back-button')) {
                    this.showTemplatesList();
                }
                
                if (target.closest('.create-project-button')) {
                    this.createProject();
                }
            });
        }
    }
    
    // Update UI with current templates
    private async updateUI(): Promise<void> {
        if (!this.scaffoldingPanel) return;
        
        try {
            // Get templates
            this.templates = await this.scaffoldingService.getTemplates();
            
            // Update templates container
            this.updateTemplatesContainer();
        } catch (error) {
            console.error('Failed to get templates:', error);
            
            // Show error
            const templatesContainer = this.scaffoldingPanel.querySelector('.templates-container');
            if (templatesContainer) {
                templatesContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load templates</p>
                        <button class="retry-button">Retry</button>
                    </div>
                `;
                
                const retryButton = templatesContainer.querySelector('.retry-button');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        this.updateUI();
                    });
                }
            }
        }
    }
    
    // Update templates container
    private updateTemplatesContainer(): void {
        if (!this.scaffoldingPanel) return;
        
        const templatesContainer = this.scaffoldingPanel.querySelector('.templates-container');
        if (!templatesContainer) return;
        
        // Clear container
        templatesContainer.innerHTML = '';
        
        // Add search bar
        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <input type="text" placeholder="Search templates..." class="search-input">
            <div class="filter-buttons">
                <button class="filter-button active" data-filter="all">All</button>
                <button class="filter-button" data-filter="frontend">Frontend</button>
                <button class="filter-button" data-filter="backend">Backend</button>
                <button class="filter-button" data-filter="fullstack">Fullstack</button>
                <button class="filter-button" data-filter="mobile">Mobile</button>
            </div>
        `;
        
        templatesContainer.appendChild(searchBar);
        
        // Add templates grid
        const templatesGrid = document.createElement('div');
        templatesGrid.className = 'templates-grid';
        
        // Add templates
        this.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = `template-item ${template.type}`;
            templateItem.setAttribute('data-template-id', template.id);
            templateItem.setAttribute('data-tags', template.tags.join(','));
            
            templateItem.innerHTML = `
                <div class="template-icon">
                    <i class="${template.icon}"></i>
                </div>
                <div class="template-info">
                    <h3 class="template-name">${template.name}</h3>
                    <p class="template-description">${template.description}</p>
                    <div class="template-tags">
                        ${template.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
            
            templatesGrid.appendChild(templateItem);
        });
        
        templatesContainer.appendChild(templatesGrid);
        
        // Add event listeners for search and filter
        const searchInput = searchBar.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterTemplates(searchInput.value);
            });
        }
        
        const filterButtons = searchBar.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter templates
                const filter = button.getAttribute('data-filter') || 'all';
                this.filterTemplatesByType(filter);
            });
        });
    }
    
    // Filter templates by search query
    private filterTemplates(query: string): void {
        if (!this.scaffoldingPanel) return;
        
        const templatesGrid = this.scaffoldingPanel.querySelector('.templates-grid');
        if (!templatesGrid) return;
        
        const templateItems = templatesGrid.querySelectorAll('.template-item');
        const lowerQuery = query.toLowerCase();
        
        templateItems.forEach(item => {
            const name = item.querySelector('.template-name')?.textContent?.toLowerCase() || '';
            const description = item.querySelector('.template-description')?.textContent?.toLowerCase() || '';
            const tags = item.getAttribute('data-tags')?.toLowerCase() || '';
            
            if (name.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery)) {
                (item as HTMLElement).style.display = 'flex';
            } else {
                (item as HTMLElement).style.display = 'none';
            }
        });
    }
    
    // Filter templates by type
    private filterTemplatesByType(type: string): void {
        if (!this.scaffoldingPanel) return;
        
        const templatesGrid = this.scaffoldingPanel.querySelector('.templates-grid');
        if (!templatesGrid) return;
        
        const templateItems = templatesGrid.querySelectorAll('.template-item');
        
        templateItems.forEach(item => {
            if (type === 'all' || item.classList.contains(type)) {
                (item as HTMLElement).style.display = 'flex';
            } else {
                (item as HTMLElement).style.display = 'none';
            }
        });
    }
    
    // Select template
    private selectTemplate(templateId: string): void {
        // Find template
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        this.selectedTemplate = template;
        
        // Show template details
        this.showTemplateDetails();
    }
    
    // Show template details
    private showTemplateDetails(): void {
        if (!this.scaffoldingPanel || !this.selectedTemplate) return;
        
        const templatesContainer = this.scaffoldingPanel.querySelector('.templates-container');
        const templateDetailsContainer = this.scaffoldingPanel.querySelector('.template-details-container');
        
        if (!templatesContainer || !templateDetailsContainer) return;
        
        // Hide templates container
        templatesContainer.classList.add('hidden');
        
        // Show template details container
        templateDetailsContainer.classList.remove('hidden');
        
        // Update template details
        templateDetailsContainer.innerHTML = `
            <div class="template-details-header">
                <button class="back-button"><i class="fas fa-arrow-left"></i> Back to Templates</button>
                <h2 class="template-name">${this.selectedTemplate.name}</h2>
            </div>
            <div class="template-details-content">
                <div class="template-info">
                    <div class="template-icon large">
                        <i class="${this.selectedTemplate.icon}"></i>
                    </div>
                    <p class="template-description">${this.selectedTemplate.description}</p>
                    <div class="template-tags">
                        ${this.selectedTemplate.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="template-form">
                    <h3>Project Configuration</h3>
                    <div class="form-group">
                        <label for="project-name">Project Name</label>
                        <input type="text" id="project-name" placeholder="my-awesome-project">
                    </div>
                    <div class="form-group">
                        <label for="output-dir">Output Directory</label>
                        <input type="text" id="output-dir" placeholder="/path/to/projects">
                    </div>
                    ${this.selectedTemplate.variables ? `
                        <h3>Template Variables</h3>
                        ${this.selectedTemplate.variables.map(variable => `
                            <div class="form-group">
                                <label for="var-${variable.name}">${variable.description}</label>
                                ${this.renderVariableInput(variable)}
                            </div>
                        `).join('')}
                    ` : ''}
                    <div class="form-actions">
                        <button class="create-project-button primary-button">Create Project</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render variable input based on type
    private renderVariableInput(variable: TemplateVariable): string {
        switch (variable.type) {
            case 'boolean':
                return `
                    <div class="toggle-switch">
                        <input type="checkbox" id="var-${variable.name}" ${variable.defaultValue === 'true' ? 'checked' : ''}>
                        <label for="var-${variable.name}"></label>
                    </div>
                `;
            case 'select':
                return `
                    <select id="var-${variable.name}">
                        ${variable.options?.map(option => `
                            <option value="${option}" ${variable.defaultValue === option ? 'selected' : ''}>${option}</option>
                        `).join('')}
                    </select>
                `;
            default:
                return `
                    <input type="text" id="var-${variable.name}" placeholder="${variable.defaultValue || ''}" ${variable.required ? 'required' : ''}>
                `;
        }
    }
    
    // Show templates list
    private showTemplatesList(): void {
        if (!this.scaffoldingPanel) return;
        
        const templatesContainer = this.scaffoldingPanel.querySelector('.templates-container');
        const templateDetailsContainer = this.scaffoldingPanel.querySelector('.template-details-container');
        
        if (!templatesContainer || !templateDetailsContainer) return;
        
        // Show templates container
        templatesContainer.classList.remove('hidden');
        
        // Hide template details container
        templateDetailsContainer.classList.add('hidden');
        
        // Clear selected template
        this.selectedTemplate = null;
    }
    
    // Create project
    private async createProject(): Promise<void> {
        if (!this.scaffoldingPanel || !this.selectedTemplate) return;
        
        const projectNameInput = this.scaffoldingPanel.querySelector('#project-name') as HTMLInputElement;
        const outputDirInput = this.scaffoldingPanel.querySelector('#output-dir') as HTMLInputElement;
        
        if (!projectNameInput || !outputDirInput) return;
        
        const projectName = projectNameInput.value.trim();
        const outputDir = outputDirInput.value.trim();
        
        if (!projectName || !outputDir) {
            // Show error
            return;
        }
        
        // Collect variables
        const variables: Record<string, string> = {};
        
        if (this.selectedTemplate.variables) {
            for (const variable of this.selectedTemplate.variables) {
                const input = this.scaffoldingPanel.querySelector(`#var-${variable.name}`) as HTMLInputElement | HTMLSelectElement;
                
                if (input) {
                    if (variable.type === 'boolean') {
                        variables[variable.name] = (input as HTMLInputElement).checked ? 'true' : 'false';
                    } else {
                        variables[variable.name] = input.value;
                    }
                }
            }
        }
        
        // Show loading state
        const createButton = this.scaffoldingPanel.querySelector('.create-project-button') as HTMLButtonElement;
        if (createButton) {
            createButton.disabled = true;
            createButton.textContent = 'Creating...';
        }
        
        try {
            // Create project
            const result = await this.scaffoldingService.createProject({
                templateId: this.selectedTemplate.id,
                projectName,
                outputDir,
                variables
            });
            
            if (result.success) {
                // Show success message
                this.showSuccessMessage(result.projectPath || '');
            } else {
                // Show error message
                this.showErrorMessage(result.message);
            }
        } catch (error) {
            // Show error message
            this.showErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            // Reset button
            if (createButton) {
                createButton.disabled = false;
                createButton.textContent = 'Create Project';
            }
        }
    }
    
    // Show success message
    private showSuccessMessage(projectPath: string): void {
        if (!this.scaffoldingPanel) return;
        
        const templateDetailsContainer = this.scaffoldingPanel.querySelector('.template-details-container');
        if (!templateDetailsContainer) return;
        
        templateDetailsContainer.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                <h2>Project Created Successfully!</h2>
                <p>Your project has been created at:</p>
                <div class="project-path">${projectPath}</div>
                <div class="action-buttons">
                    <button class="open-project-button primary-button">Open Project</button>
                    <button class="deploy-project-button">Deploy Project</button>
                    <button class="back-to-templates-button">Back to Templates</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const openProjectButton = templateDetailsContainer.querySelector('.open-project-button');
        if (openProjectButton) {
            openProjectButton.addEventListener('click', () => {
                // Open project in IDE
                console.log('Open project:', projectPath);
            });
        }
        
        const deployProjectButton = templateDetailsContainer.querySelector('.deploy-project-button');
        if (deployProjectButton) {
            deployProjectButton.addEventListener('click', () => {
                // Deploy project
                this.deployProject(projectPath);
            });
        }
        
        const backToTemplatesButton = templateDetailsContainer.querySelector('.back-to-templates-button');
        if (backToTemplatesButton) {
            backToTemplatesButton.addEventListener('click', () => {
                this.showTemplatesList();
            });
        }
    }
    
    // Show error message
    private showErrorMessage(message: string): void {
        if (!this.scaffoldingPanel) return;
        
        const templateDetailsContainer = this.scaffoldingPanel.querySelector('.template-details-container');
        if (!templateDetailsContainer) return;
        
        // Add error message to form
        const formActions = templateDetailsContainer.querySelector('.form-actions');
        if (formActions) {
            // Remove existing error message
            const existingError = formActions.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            `;
            
            formActions.insertBefore(errorMessage, formActions.firstChild);
        }
    }
    
    // Deploy project
    private async deployProject(projectPath: string): Promise<void> {
        if (!this.scaffoldingPanel) return;
        
        // Show deployment modal
        const modal = document.createElement('div');
        modal.className = 'modal deployment-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Deploy Project</h2>
                    <button class="close-button"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="deployment-type">Deployment Type</label>
                        <select id="deployment-type">
                            <option value="static">Static Website</option>
                            <option value="node">Node.js Application</option>
                            <option value="docker">Docker Container</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="build-command">Build Command (Optional)</label>
                        <input type="text" id="build-command" placeholder="npm run build">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-button">Cancel</button>
                    <button class="deploy-button primary-button">Deploy</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        const cancelButton = modal.querySelector('.cancel-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        const deployButton = modal.querySelector('.deploy-button');
        if (deployButton) {
            deployButton.addEventListener('click', async () => {
                const deploymentTypeSelect = modal.querySelector('#deployment-type') as HTMLSelectElement;
                const buildCommandInput = modal.querySelector('#build-command') as HTMLInputElement;
                
                if (!deploymentTypeSelect) return;
                
                const deploymentType = deploymentTypeSelect.value as 'static' | 'node' | 'docker';
                const buildCommand = buildCommandInput?.value.trim();
                
                // Update button state
                deployButton.textContent = 'Deploying...';
                deployButton.setAttribute('disabled', 'true');
                
                try {
                    // Deploy project
                    const result = await this.deploymentService.deployProject({
                        projectDir: projectPath,
                        deploymentType,
                        buildCommand: buildCommand || undefined
                    });
                    
                    if (result.success) {
                        // Show success message
                        modal.querySelector('.modal-body')!.innerHTML = `
                            <div class="success-message">
                                <i class="fas fa-check-circle"></i>
                                <h3>Deployment Successful!</h3>
                                ${result.deploymentUrl ? `
                                    <p>Your project is now available at:</p>
                                    <div class="deployment-url">
                                        <a href="${result.deploymentUrl}" target="_blank">${result.deploymentUrl}</a>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                        
                        modal.querySelector('.modal-footer')!.innerHTML = `
                            <button class="close-button primary-button">Close</button>
                        `;
                        
                        const newCloseButton = modal.querySelector('.modal-footer .close-button');
                        if (newCloseButton) {
                            newCloseButton.addEventListener('click', () => {
                                modal.remove();
                            });
                        }
                    } else {
                        // Show error message
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'error-message';
                        errorMessage.innerHTML = `
                            <i class="fas fa-exclamation-circle"></i>
                            <span>${result.error || 'Deployment failed'}</span>
                        `;
                        
                        modal.querySelector('.modal-body')!.appendChild(errorMessage);
                        
                        // Reset button
                        deployButton.textContent = 'Deploy';
                        deployButton.removeAttribute('disabled');
                    }
                } catch (error) {
                    // Show error message
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i>
                        <span>${error instanceof Error ? error.message : 'Deployment failed'}</span>
                    `;
                    
                    modal.querySelector('.modal-body')!.appendChild(errorMessage);
                    
                    // Reset button
                    deployButton.textContent = 'Deploy';
                    deployButton.removeAttribute('disabled');
                }
            });
        }
    }
    
    // Show scaffolding panel
    showPanel(): void {
        if (this.scaffoldingPanel) {
            this.scaffoldingPanel.classList.remove('hidden');
        }
    }
    
    // Hide scaffolding panel
    hidePanel(): void {
        if (this.scaffoldingPanel) {
            this.scaffoldingPanel.classList.add('hidden');
        }
    }
}

export default ScaffoldingUI;
