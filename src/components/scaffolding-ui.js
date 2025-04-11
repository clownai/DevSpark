// DevSpark IDE - Application Scaffolding UI Components (1ClickApp)
// This file contains the UI components for application scaffolding functionality

class ScaffoldingUI {
    constructor() {
        this.scaffoldingService = window.scaffoldingService;
        this.deploymentService = window.deploymentService;
        
        // Create scaffolding panel if it doesn't exist
        this.createScaffoldingPanel();
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the Scaffolding UI
    initialize() {
        console.log('Scaffolding UI initialized');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current templates
        this.updateUI();
        
        return this;
    }
    
    // Create scaffolding panel
    createScaffoldingPanel() {
        // Check if panel already exists
        let scaffoldingPanel = document.querySelector('.scaffolding-panel');
        if (scaffoldingPanel) return;
        
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
        panelContent.className = 'scaffolding-content';
        
        // Add templates section
        const templatesSection = document.createElement('div');
        templatesSection.className = 'scaffolding-templates';
        templatesSection.innerHTML = `
            <div class="section-header">
                <span>Application Templates</span>
                <div class="search-container">
                    <input type="text" class="template-search" placeholder="Search templates...">
                    <i class="fas fa-search"></i>
                </div>
            </div>
            <div class="templates-categories">
                <button class="category-button active" data-category="all">All</button>
                <button class="category-button" data-category="frontend">Frontend</button>
                <button class="category-button" data-category="backend">Backend</button>
                <button class="category-button" data-category="fullstack">Full Stack</button>
            </div>
            <div class="templates-list" id="templates-list">
                <!-- Templates will be populated here -->
            </div>
        `;
        panelContent.appendChild(templatesSection);
        
        // Add template details section
        const templateDetailsSection = document.createElement('div');
        templateDetailsSection.className = 'template-details hidden';
        templateDetailsSection.innerHTML = `
            <div class="template-details-header">
                <button class="back-button"><i class="fas fa-arrow-left"></i> Back to Templates</button>
                <h2 class="template-name">Template Name</h2>
            </div>
            <div class="template-details-content">
                <div class="template-info">
                    <div class="template-icon"><i class="fab fa-react"></i></div>
                    <div class="template-description">Template description goes here.</div>
                    <div class="template-tags">
                        <!-- Tags will be populated here -->
                    </div>
                </div>
                <div class="template-parameters">
                    <h3>Configuration</h3>
                    <form id="template-parameters-form">
                        <!-- Parameters will be populated here -->
                    </form>
                </div>
                <div class="template-actions">
                    <button class="generate-button">Generate Application</button>
                </div>
            </div>
        `;
        panelContent.appendChild(templateDetailsSection);
        
        // Add generation logs section
        const generationLogsSection = document.createElement('div');
        generationLogsSection.className = 'generation-logs hidden';
        generationLogsSection.innerHTML = `
            <div class="generation-logs-header">
                <h2>Generating Application</h2>
            </div>
            <div class="logs-container" id="generation-logs">
                <!-- Logs will be populated here -->
            </div>
            <div class="generation-actions">
                <button class="deploy-generated-button hidden">Deploy Application</button>
                <button class="back-to-templates-button hidden">Back to Templates</button>
            </div>
        `;
        panelContent.appendChild(generationLogsSection);
        
        scaffoldingPanel.appendChild(panelContent);
        
        // Add to IDE container
        const ideContainer = document.querySelector('.ide-container');
        ideContainer.appendChild(scaffoldingPanel);
        
        // Add scaffolding button to sidebar
        this.addScaffoldingButton();
    }
    
    // Add scaffolding button to sidebar
    addScaffoldingButton() {
        // Check if sidebar exists
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        // Check if button already exists
        let scaffoldingSection = sidebar.querySelector('.sidebar-section:nth-child(5)');
        if (!scaffoldingSection) {
            // Create scaffolding section
            scaffoldingSection = document.createElement('div');
            scaffoldingSection.className = 'sidebar-section';
            scaffoldingSection.innerHTML = `
                <div class="section-header">
                    <i class="fas fa-magic"></i> 1ClickApp
                </div>
                <div class="scaffolding-button-container">
                    <div class="scaffolding-button">
                        <i class="fas fa-magic"></i> Create New Application
                    </div>
                </div>
            `;
            
            // Add to sidebar after deployment
            const deploymentSection = sidebar.querySelector('.sidebar-section:nth-child(4)');
            if (deploymentSection) {
                sidebar.insertBefore(scaffoldingSection, deploymentSection.nextSibling);
            } else {
                sidebar.appendChild(scaffoldingSection);
            }
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Scaffolding panel toggle
        const scaffoldingButton = document.querySelector('.scaffolding-button');
        if (scaffoldingButton) {
            scaffoldingButton.addEventListener('click', () => {
                this.toggleScaffoldingPanel();
            });
        }
        
        // Scaffolding panel close button
        const closeButton = document.querySelector('.scaffolding-panel .panel-actions i.fa-times');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleScaffoldingPanel(false);
            });
        }
        
        // Category buttons
        const categoryButtons = document.querySelectorAll('.category-button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.filterTemplatesByCategory(button.getAttribute('data-category'));
            });
        });
        
        // Template search
        const searchInput = document.querySelector('.template-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.searchTemplates(searchInput.value);
            });
        }
        
        // Back button in template details
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showTemplatesList();
            });
        }
        
        // Generate button
        const generateButton = document.querySelector('.generate-button');
        if (generateButton) {
            generateButton.addEventListener('click', () => {
                this.generateApplication();
            });
        }
        
        // Deploy generated button
        const deployButton = document.querySelector('.deploy-generated-button');
        if (deployButton) {
            deployButton.addEventListener('click', () => {
                this.showDeployDialog();
            });
        }
        
        // Back to templates button
        const backToTemplatesButton = document.querySelector('.back-to-templates-button');
        if (backToTemplatesButton) {
            backToTemplatesButton.addEventListener('click', () => {
                this.showTemplatesList();
            });
        }
        
        // Listen for generation log added events
        document.addEventListener('generation-log-added', (event) => {
            this.updateGenerationLogs();
        });
        
        // Listen for application generated events
        document.addEventListener('application-generated', (event) => {
            this.onApplicationGenerated();
        });
    }
    
    // Toggle scaffolding panel
    toggleScaffoldingPanel(show) {
        const scaffoldingPanel = document.querySelector('.scaffolding-panel');
        if (!scaffoldingPanel) return;
        
        if (show === undefined) {
            // Toggle
            scaffoldingPanel.classList.toggle('hidden');
        } else if (show) {
            // Show
            scaffoldingPanel.classList.remove('hidden');
        } else {
            // Hide
            scaffoldingPanel.classList.add('hidden');
        }
        
        // Update UI when showing
        if (!scaffoldingPanel.classList.contains('hidden')) {
            this.updateUI();
        }
    }
    
    // Update UI with current templates
    updateUI() {
        this.updateTemplatesList();
    }
    
    // Update templates list
    updateTemplatesList() {
        const templatesList = document.getElementById('templates-list');
        if (!templatesList) return;
        
        // Clear current list
        templatesList.innerHTML = '';
        
        // Get templates
        const templates = this.scaffoldingService.getTemplates();
        
        // Add templates
        templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.setAttribute('data-id', template.id);
            templateItem.setAttribute('data-category', template.category);
            
            templateItem.innerHTML = `
                <div class="template-icon"><i class="${template.icon}"></i></div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-meta">
                        <span class="template-category">${this.getCategoryLabel(template.category)}</span>
                        <span class="template-popularity">
                            <i class="fas fa-star"></i> ${template.popularity.toFixed(1)}
                        </span>
                    </div>
                </div>
            `;
            
            templatesList.appendChild(templateItem);
            
            // Add click event
            templateItem.addEventListener('click', () => {
                this.showTemplateDetails(template.id);
            });
        });
        
        // If no templates, show message
        if (templates.length === 0) {
            const noTemplates = document.createElement('div');
            noTemplates.className = 'no-templates';
            noTemplates.textContent = 'No templates available.';
            templatesList.appendChild(noTemplates);
        }
    }
    
    // Filter templates by category
    filterTemplatesByCategory(category) {
        const templateItems = document.querySelectorAll('.template-item');
        
        if (category === 'all') {
            templateItems.forEach(item => {
                item.style.display = 'flex';
            });
        } else {
            templateItems.forEach(item => {
                if (item.getAttribute('data-category') === category) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    }
    
    // Search templates
    searchTemplates(query) {
        if (!query) {
            // Reset to current category filter
            const activeCategory = document.querySelector('.category-button.active');
            if (activeCategory) {
                this.filterTemplatesByCategory(activeCategory.getAttribute('data-category'));
            }
            return;
        }
        
        // Search templates
        const templates = this.scaffoldingService.searchTemplates(query);
        const templateIds = templates.map(t => t.id);
        
        // Update UI
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            if (templateIds.includes(item.getAttribute('data-id'))) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Show template details
    showTemplateDetails(templateId) {
        const template = this.scaffoldingService.getTemplate(templateId);
        if (!template) return;
        
        // Hide templates list
        const templatesSection = document.querySelector('.scaffolding-templates');
        const templateDetailsSection = document.querySelector('.template-details');
        const generationLogsSection = document.querySelector('.generation-logs');
        
        if (templatesSection) templatesSection.classList.add('hidden');
        if (templateDetailsSection) templateDetailsSection.classList.remove('hidden');
        if (generationLogsSection) generationLogsSection.classList.add('hidden');
        
        // Update template details
        const templateName = document.querySelector('.template-name');
        const templateIcon = document.querySelector('.template-icon');
        const templateDescription = document.querySelector('.template-description');
        const templateTags = document.querySelector('.template-tags');
        const templateParametersForm = document.getElementById('template-parameters-form');
        
        if (templateName) templateName.textContent = template.name;
        if (templateIcon) templateIcon.innerHTML = `<i class="${template.icon}"></i>`;
        if (templateDescription) templateDescription.textContent = template.description;
        
        // Update tags
        if (templateTags) {
            templateTags.innerHTML = '';
            template.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'template-tag';
                tagElement.textContent = tag;
                templateTags.appendChild(tagElement);
            });
        }
        
        // Update parameters form
        if (templateParametersForm) {
            templateParametersForm.innerHTML = '';
            template.parameters.forEach(param => {
                const paramGroup = document.createElement('div');
                paramGroup.className = 'parameter-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', param.id);
                label.textContent = param.name;
                if (param.required) {
                    const required = document.createElement('span');
                    required.className = 'required';
                    required.textContent = ' *';
                    label.appendChild(required);
                }
                paramGroup.appendChild(label);
                
                let input;
                
                if (param.type === 'text') {
                    input = document.createElement('input');
                    input.type = 'text';
                    input.id = param.id;
                    input.name = param.id;
                    input.className = 'parameter-input';
                    input.value = param.default || '';
                    input.required = param.required;
                } else if (param.type === 'boolean') {
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'checkbox-container';
                    
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = param.id;
                    input.name = param.id;
                    input.className = 'parameter-checkbox';
                    input.checked = param.default || false;
                    
                    checkboxContainer.appendChild(input);
                    paramGroup.appendChild(checkboxContainer);
                } else if (param.type === 'select') {
                    input = document.createElement('select');
                    input.id = param.id;
                    input.name = param.id;
                    input.className = 'parameter-select';
                    input.required = param.required;
                    
                    param.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        optionElement.selected = option.value === param.default;
                        input.appendChild(optionElement);
                    });
                }
                
                if (param.type !== 'boolean') {
                    paramGroup.appendChild(input);
                }
                
                templateParametersForm.appendChild(paramGroup);
            });
        }
        
        // Store current template ID
        templateParametersForm.setAttribute('data-template-id', template.id);
    }
    
    // Show templates list
    showTemplatesList() {
        const templatesSection = document.querySelector('.scaffolding-templates');
        const templateDetailsSection = document.querySelector('.template-details');
        const generationLogsSection = document.querySelector('.generation-logs');
        
        if (templatesSection) templatesSection.classList.remove('hidden');
        if (templateDetailsSection) templateDetailsSection.classList.add('hidden');
        if (generationLogsSection) generationLogsSection.classList.add('hidden');
        
        // Update templates list
        this.updateTemplatesList();
    }
    
    // Generate application
    async generateApplication() {
        const templateParametersForm = document.getElementById('template-parameters-form');
        if (!templateParametersForm) return;
        
        const templateId = templateParametersForm.getAttribute('data-template-id');
        if (!templateId) return;
        
        // Collect parameters
        const parameters = {};
        const inputs = templateParametersForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                parameters[input.name] = input.checked;
            } else {
                parameters[input.name] = input.value;
            }
        });
        
        try {
            // Generate application
            const result = await this.scaffoldingService.generateApplication(templateId, parameters);
            
            if (result.success) {
                this.showNotification(result.message);
                this.showGenerationLogs();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error generating application: ${error.message}`, 'error');
        }
    }
    
    // Show generation logs
    showGenerationLogs() {
        const templatesSection = document.querySelector('.scaffolding-templates');
        const templateDetailsSection = document.querySelector('.template-details');
        const generationLogsSection = document.querySelector('.generation-logs');
        
        if (templatesSection) templatesSection.classList.add('hidden');
        if (templateDetailsSection) templateDetailsSection.classList.add('hidden');
        if (generationLogsSection) generationLogsSection.classList.remove('hidden');
        
        // Update logs
        this.updateGenerationLogs();
    }
    
    // Update generation logs
    updateGenerationLogs() {
        const logsContainer = document.getElementById('generation-logs');
        if (!logsContainer) return;
        
        // Get current template
        const currentTemplate = this.scaffoldingService.getCurrentTemplate();
        if (!currentTemplate) {
            logsContainer.innerHTML = '<div class="no-logs">No generation logs available.</div>';
            return;
        }
        
        // Update logs header
        const logsHeader = document.querySelector('.generation-logs-header h2');
        if (logsHeader) {
            logsHeader.textContent = `Generating ${currentTemplate.template.name}`;
        }
        
        // Clear current logs
        logsContainer.innerHTML = '';
        
        // Add logs
        currentTemplate.logs.forEach(log => {
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
    
    // Handle application generated event
    onApplicationGenerated() {
        // Show deploy button
        const deployButton = document.querySelector('.deploy-generated-button');
        const backButton = document.querySelector('.back-to-templates-button');
        
        if (deployButton) deployButton.classList.remove('hidden');
        if (backButton) backButton.classList.remove('hidden');
    }
    
    // Show deploy dialog
    showDeployDialog() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'scaffolding-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'scaffolding-dialog-header';
        header.innerHTML = '<i class="fas fa-rocket"></i> Deploy Generated Application';
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'scaffolding-dialog-content';
        
        // Get environments
        const environments = this.deploymentService.getEnvironments();
        
        // Add environment selector
        content.innerHTML = `
            <p>Select an environment to deploy your generated application:</p>
            <div class="form-group">
                <select id="deploy-environment" class="form-select">
                    ${environments.map(env => `<option value="${env.id}">${env.name}</option>`).join('')}
                </select>
            </div>
        `;
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'scaffolding-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const deployButton = document.createElement('button');
        deployButton.className = 'dialog-button deploy';
        deployButton.textContent = 'Deploy';
        deployButton.addEventListener('click', async () => {
            const environmentSelect = document.getElementById('deploy-environment');
            if (!environmentSelect) return;
            
            const environmentId = environmentSelect.value;
            if (!environmentId) {
                this.showNotification('Please select an environment', 'error');
                return;
            }
            
            try {
                const result = await this.scaffoldingService.deployGeneratedApplication(environmentId);
                
                if (result.success) {
                    this.showNotification(result.message);
                    document.body.removeChild(dialog);
                    
                    // Show deployment panel
                    if (window.deploymentUI) {
                        window.deploymentUI.toggleDeploymentPanel(true);
                        if (result.deployment) {
                            window.deploymentUI.viewDeploymentLogs(result.deployment.id);
                        }
                    }
                } else {
                    this.showNotification(result.message, 'error');
                }
            } catch (error) {
                this.showNotification(`Error deploying application: ${error.message}`, 'error');
            }
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(deployButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
    }
    
    // Get category label
    getCategoryLabel(category) {
        switch (category) {
            case 'frontend':
                return 'Frontend';
            case 'backend':
                return 'Backend';
            case 'fullstack':
                return 'Full Stack';
            default:
                return category;
        }
    }
    
    // Format time
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.scaffolding-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'scaffolding-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `scaffolding-notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize Scaffolding UI when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Scaffolding service to be initialized
    const checkScaffoldingService = setInterval(() => {
        if (window.scaffoldingService) {
            clearInterval(checkScaffoldingService);
            window.scaffoldingUI = new ScaffoldingUI();
        }
    }, 100);
});
