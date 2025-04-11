// DevSpark IDE - Git Integration UI Components
// This file contains the UI components for Git integration and project management

class GitIntegrationUI {
    constructor() {
        this.gitService = window.gitService;
        this.sourceControlPanel = document.querySelector('#source-control');
        this.branchDisplay = document.querySelector('.git-branch');
        this.changesContainer = document.querySelector('.git-changes');
        this.statusBarBranch = document.querySelector('.status-bar .status-item:first-child');
        
        // Initialize UI
        this.initialize();
    }
    
    // Initialize the Git Integration UI
    initialize() {
        console.log('Git Integration UI initialized');
        
        // Update UI with current Git status
        this.updateUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        return this;
    }
    
    // Update UI with current Git status
    updateUI() {
        this.updateBranchDisplay();
        this.updateChangesDisplay();
        this.updateStatusBar();
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Add context menu for source control panel
        if (this.sourceControlPanel) {
            this.sourceControlPanel.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showSourceControlContextMenu(e.clientX, e.clientY);
            });
        }
        
        // Add click event for branch display
        if (this.branchDisplay) {
            this.branchDisplay.addEventListener('click', () => {
                this.showBranchSelector();
            });
        }
        
        // Add event delegation for changes container
        if (this.changesContainer) {
            this.changesContainer.addEventListener('click', (e) => {
                const changeElement = e.target.closest('.git-change');
                if (changeElement) {
                    const filePath = changeElement.getAttribute('data-path');
                    const status = changeElement.getAttribute('data-status');
                    
                    if (status === 'modified' || status === 'untracked') {
                        this.stageFile(filePath);
                    } else if (status === 'added') {
                        this.unstageFile(filePath);
                    }
                }
            });
            
            this.changesContainer.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const changeElement = e.target.closest('.git-change');
                if (changeElement) {
                    const filePath = changeElement.getAttribute('data-path');
                    const status = changeElement.getAttribute('data-status');
                    this.showFileContextMenu(e.clientX, e.clientY, filePath, status);
                }
            });
        }
        
        // Add commit button to source control panel
        this.addCommitButton();
    }
    
    // Update branch display
    updateBranchDisplay() {
        if (this.branchDisplay) {
            const currentBranch = this.gitService.getCurrentBranch();
            this.branchDisplay.innerHTML = `<i class="fas fa-code-branch"></i> ${currentBranch}`;
        }
    }
    
    // Update changes display
    updateChangesDisplay() {
        if (this.changesContainer) {
            // Clear current changes
            this.changesContainer.innerHTML = '';
            
            // Get current status
            const status = this.gitService.getStatus();
            
            // Create sections
            const sections = [
                { title: 'Staged Changes', files: status.added, status: 'added', icon: 'fa-plus' },
                { title: 'Changes', files: status.modified, status: 'modified', icon: 'fa-pencil-alt' },
                { title: 'Untracked Files', files: status.untracked, status: 'untracked', icon: 'fa-question' },
                { title: 'Deleted Files', files: status.deleted, status: 'deleted', icon: 'fa-trash-alt' }
            ];
            
            // Add sections with files
            sections.forEach(section => {
                if (section.files.length > 0) {
                    // Add section header
                    const sectionHeader = document.createElement('div');
                    sectionHeader.className = 'git-section-header';
                    sectionHeader.textContent = section.title;
                    this.changesContainer.appendChild(sectionHeader);
                    
                    // Add files
                    section.files.forEach(file => {
                        const fileElement = document.createElement('div');
                        fileElement.className = `git-change ${section.status}`;
                        fileElement.setAttribute('data-path', file);
                        fileElement.setAttribute('data-status', section.status);
                        fileElement.innerHTML = `<i class="fas ${section.icon}"></i> ${file}`;
                        this.changesContainer.appendChild(fileElement);
                    });
                }
            });
            
            // If no changes, show message
            if (this.changesContainer.children.length === 0) {
                const noChanges = document.createElement('div');
                noChanges.className = 'git-no-changes';
                noChanges.textContent = 'No changes detected';
                this.changesContainer.appendChild(noChanges);
            }
        }
    }
    
    // Update status bar
    updateStatusBar() {
        if (this.statusBarBranch) {
            const currentBranch = this.gitService.getCurrentBranch();
            this.statusBarBranch.innerHTML = `<i class="fas fa-code-branch"></i> ${currentBranch}`;
        }
    }
    
    // Add commit button
    addCommitButton() {
        if (this.sourceControlPanel) {
            // Check if button already exists
            let commitButton = this.sourceControlPanel.querySelector('.git-commit-button');
            if (!commitButton) {
                // Create commit section
                const commitSection = document.createElement('div');
                commitSection.className = 'git-commit-section';
                
                // Create commit message input
                const commitMessage = document.createElement('input');
                commitMessage.type = 'text';
                commitMessage.className = 'git-commit-message';
                commitMessage.placeholder = 'Commit message';
                
                // Create commit button
                commitButton = document.createElement('button');
                commitButton.className = 'git-commit-button';
                commitButton.innerHTML = '<i class="fas fa-check"></i> Commit';
                
                // Add event listener
                commitButton.addEventListener('click', () => {
                    const message = commitMessage.value.trim();
                    if (message) {
                        this.commit(message);
                        commitMessage.value = '';
                    } else {
                        this.showNotification('Please enter a commit message', 'error');
                    }
                });
                
                // Add to commit section
                commitSection.appendChild(commitMessage);
                commitSection.appendChild(commitButton);
                
                // Add to source control panel
                this.sourceControlPanel.appendChild(commitSection);
            }
        }
    }
    
    // Show source control context menu
    showSourceControlContextMenu(x, y) {
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Add menu items
        const menuItems = [
            { label: 'Refresh', icon: 'fa-sync-alt', action: () => this.updateUI() },
            { label: 'Commit', icon: 'fa-check', action: () => this.showCommitDialog() },
            { label: 'Push', icon: 'fa-upload', action: () => this.push() },
            { label: 'Pull', icon: 'fa-download', action: () => this.pull() },
            { label: 'Branch', icon: 'fa-code-branch', action: () => this.showBranchSelector() },
            { label: 'Stash', icon: 'fa-layer-group', action: () => this.stash() },
            { label: 'Reset', icon: 'fa-undo', action: () => this.reset() }
        ];
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}`;
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(contextMenu);
            });
            contextMenu.appendChild(menuItem);
        });
        
        // Add to body
        document.body.appendChild(contextMenu);
        
        // Add click outside listener
        const handleClickOutside = (e) => {
            if (!contextMenu.contains(e.target)) {
                document.body.removeChild(contextMenu);
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        // Delay adding the event listener to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }
    
    // Show file context menu
    showFileContextMenu(x, y, filePath, status) {
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        
        // Add menu items based on status
        const menuItems = [];
        
        if (status === 'modified' || status === 'untracked') {
            menuItems.push({ label: 'Stage Changes', icon: 'fa-plus', action: () => this.stageFile(filePath) });
        } else if (status === 'added') {
            menuItems.push({ label: 'Unstage Changes', icon: 'fa-minus', action: () => this.unstageFile(filePath) });
        }
        
        menuItems.push({ label: 'View Diff', icon: 'fa-exchange-alt', action: () => this.viewDiff(filePath) });
        menuItems.push({ label: 'Open File', icon: 'fa-file-code', action: () => this.openFile(filePath) });
        
        if (status === 'modified' || status === 'added' || status === 'deleted') {
            menuItems.push({ label: 'Discard Changes', icon: 'fa-trash-alt', action: () => this.discardChanges(filePath) });
        }
        
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.innerHTML = `<i class="fas ${item.icon}"></i> ${item.label}`;
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(contextMenu);
            });
            contextMenu.appendChild(menuItem);
        });
        
        // Add to body
        document.body.appendChild(contextMenu);
        
        // Add click outside listener
        const handleClickOutside = (e) => {
            if (!contextMenu.contains(e.target)) {
                document.body.removeChild(contextMenu);
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        // Delay adding the event listener to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
    }
    
    // Show branch selector
    showBranchSelector() {
        // Create branch selector
        const branchSelector = document.createElement('div');
        branchSelector.className = 'branch-selector';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'branch-selector-header';
        header.innerHTML = '<i class="fas fa-code-branch"></i> Branches';
        branchSelector.appendChild(header);
        
        // Add search input
        const search = document.createElement('input');
        search.type = 'text';
        search.className = 'branch-selector-search';
        search.placeholder = 'Search branches';
        branchSelector.appendChild(search);
        
        // Add branches list
        const branchesList = document.createElement('div');
        branchesList.className = 'branch-selector-list';
        
        // Get branches
        const branches = this.gitService.getBranches();
        const currentBranch = this.gitService.getCurrentBranch();
        
        // Add local branches
        const localBranches = branches.filter(branch => !branch.isRemote);
        
        if (localBranches.length > 0) {
            const localHeader = document.createElement('div');
            localHeader.className = 'branch-selector-section-header';
            localHeader.textContent = 'Local Branches';
            branchesList.appendChild(localHeader);
            
            localBranches.forEach(branch => {
                const branchItem = document.createElement('div');
                branchItem.className = 'branch-selector-item';
                if (branch.name === currentBranch) {
                    branchItem.classList.add('active');
                }
                branchItem.innerHTML = `<i class="fas fa-code-branch"></i> ${branch.name}`;
                branchItem.addEventListener('click', () => {
                    this.switchBranch(branch.name);
                    document.body.removeChild(branchSelector);
                });
                branchesList.appendChild(branchItem);
            });
        }
        
        // Add remote branches
        const remoteBranches = branches.filter(branch => branch.isRemote);
        
        if (remoteBranches.length > 0) {
            const remoteHeader = document.createElement('div');
            remoteHeader.className = 'branch-selector-section-header';
            remoteHeader.textContent = 'Remote Branches';
            branchesList.appendChild(remoteHeader);
            
            remoteBranches.forEach(branch => {
                const branchItem = document.createElement('div');
                branchItem.className = 'branch-selector-item';
                branchItem.innerHTML = `<i class="fas fa-cloud"></i> ${branch.name}`;
                branchItem.addEventListener('click', () => {
                    this.checkoutRemoteBranch(branch.name);
                    document.body.removeChild(branchSelector);
                });
                branchesList.appendChild(branchItem);
            });
        }
        
        // Add create new branch button
        const createButton = document.createElement('button');
        createButton.className = 'branch-selector-create';
        createButton.innerHTML = '<i class="fas fa-plus"></i> Create New Branch';
        createButton.addEventListener('click', () => {
            this.showCreateBranchDialog();
            document.body.removeChild(branchSelector);
        });
        
        branchSelector.appendChild(branchesList);
        branchSelector.appendChild(createButton);
        
        // Add to body
        document.body.appendChild(branchSelector);
        
        // Position near branch display
        if (this.branchDisplay) {
            const rect = this.branchDisplay.getBoundingClientRect();
            branchSelector.style.left = `${rect.left}px`;
            branchSelector.style.top = `${rect.bottom + 5}px`;
        } else {
            branchSelector.style.left = '250px';
            branchSelector.style.top = '100px';
        }
        
        // Add click outside listener
        const handleClickOutside = (e) => {
            if (!branchSelector.contains(e.target) && !this.branchDisplay.contains(e.target)) {
                document.body.removeChild(branchSelector);
                document.removeEventListener('click', handleClickOutside);
            }
        };
        
        // Delay adding the event listener to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);
        
        // Focus search input
        search.focus();
        
        // Add search functionality
        search.addEventListener('input', () => {
            const searchText = search.value.toLowerCase();
            const branchItems = branchesList.querySelectorAll('.branch-selector-item');
            
            branchItems.forEach(item => {
                const branchName = item.textContent.trim().toLowerCase();
                if (branchName.includes(searchText)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Show create branch dialog
    showCreateBranchDialog() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'git-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'git-dialog-header';
        header.innerHTML = '<i class="fas fa-code-branch"></i> Create New Branch';
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'git-dialog-content';
        
        // Add branch name input
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Branch Name:';
        content.appendChild(nameLabel);
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'git-dialog-input';
        nameInput.placeholder = 'Enter branch name';
        content.appendChild(nameInput);
        
        // Add source branch selector
        const sourceLabel = document.createElement('label');
        sourceLabel.textContent = 'Create from:';
        content.appendChild(sourceLabel);
        
        const sourceSelect = document.createElement('select');
        sourceSelect.className = 'git-dialog-select';
        
        // Add current branch as default
        const currentBranch = this.gitService.getCurrentBranch();
        const currentOption = document.createElement('option');
        currentOption.value = currentBranch;
        currentOption.textContent = currentBranch + ' (current)';
        currentOption.selected = true;
        sourceSelect.appendChild(currentOption);
        
        // Add other branches
        const branches = this.gitService.getBranches();
        branches.forEach(branch => {
            if (branch.name !== currentBranch && !branch.isRemote) {
                const option = document.createElement('option');
                option.value = branch.name;
                option.textContent = branch.name;
                sourceSelect.appendChild(option);
            }
        });
        
        content.appendChild(sourceSelect);
        
        // Add checkbox for checkout
        const checkoutContainer = document.createElement('div');
        checkoutContainer.className = 'git-dialog-checkbox-container';
        
        const checkoutCheckbox = document.createElement('input');
        checkoutCheckbox.type = 'checkbox';
        checkoutCheckbox.id = 'checkout-checkbox';
        checkoutCheckbox.checked = true;
        
        const checkoutLabel = document.createElement('label');
        checkoutLabel.htmlFor = 'checkout-checkbox';
        checkoutLabel.textContent = 'Checkout after creation';
        
        checkoutContainer.appendChild(checkoutCheckbox);
        checkoutContainer.appendChild(checkoutLabel);
        content.appendChild(checkoutContainer);
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'git-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'git-dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const createButton = document.createElement('button');
        createButton.className = 'git-dialog-button create';
        createButton.textContent = 'Create';
        createButton.addEventListener('click', async () => {
            const branchName = nameInput.value.trim();
            if (branchName) {
                const result = await this.gitService.createBranch(branchName);
                if (result.success) {
                    this.showNotification(result.message);
                    
                    // Checkout if checkbox is checked
                    if (checkoutCheckbox.checked) {
                        await this.switchBranch(branchName);
                    }
                    
                    this.updateUI();
                } else {
                    this.showNotification(result.message, 'error');
                }
                document.body.removeChild(dialog);
            } else {
                this.showNotification('Please enter a branch name', 'error');
            }
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(createButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
        
        // Focus input
        nameInput.focus();
    }
    
    // Show commit dialog
    showCommitDialog() {
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'git-dialog';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'git-dialog-header';
        header.innerHTML = '<i class="fas fa-check"></i> Commit Changes';
        dialog.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'git-dialog-content';
        
        // Add commit message input
        const messageLabel = document.createElement('label');
        messageLabel.textContent = 'Commit Message:';
        content.appendChild(messageLabel);
        
        const messageInput = document.createElement('textarea');
        messageInput.className = 'git-dialog-textarea';
        messageInput.placeholder = 'Enter commit message';
        content.appendChild(messageInput);
        
        // Add staged files list
        const filesLabel = document.createElement('label');
        filesLabel.textContent = 'Staged Files:';
        content.appendChild(filesLabel);
        
        const filesList = document.createElement('div');
        filesList.className = 'git-dialog-files-list';
        
        // Get staged files
        const status = this.gitService.getStatus();
        status.added.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'git-dialog-file-item';
            fileItem.innerHTML = `<i class="fas fa-plus"></i> ${file}`;
            filesList.appendChild(fileItem);
        });
        
        // If no staged files, show message
        if (status.added.length === 0) {
            const noFiles = document.createElement('div');
            noFiles.className = 'git-dialog-no-files';
            noFiles.textContent = 'No files staged for commit';
            filesList.appendChild(noFiles);
        }
        
        content.appendChild(filesList);
        
        dialog.appendChild(content);
        
        // Add buttons
        const buttons = document.createElement('div');
        buttons.className = 'git-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'git-dialog-button cancel';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        const commitButton = document.createElement('button');
        commitButton.className = 'git-dialog-button commit';
        commitButton.textContent = 'Commit';
        commitButton.addEventListener('click', async () => {
            const message = messageInput.value.trim();
            if (message) {
                if (status.added.length > 0) {
                    await this.commit(message);
                    document.body.removeChild(dialog);
                } else {
                    this.showNotification('No files staged for commit', 'error');
                }
            } else {
                this.showNotification('Please enter a commit message', 'error');
            }
        });
        
        buttons.appendChild(cancelButton);
        buttons.appendChild(commitButton);
        dialog.appendChild(buttons);
        
        // Add to body
        document.body.appendChild(dialog);
        
        // Center dialog
        dialog.style.left = `calc(50% - ${dialog.offsetWidth / 2}px)`;
        dialog.style.top = `calc(50% - ${dialog.offsetHeight / 2}px)`;
        
        // Focus input
        messageInput.focus();
    }
    
    // Stage a file
    async stageFile(filePath) {
        try {
            const result = await this.gitService.stageFile(filePath);
            if (result) {
                this.updateUI();
                this.showNotification(`Staged ${filePath}`);
            }
        } catch (error) {
            this.showNotification(`Error staging ${filePath}: ${error.message}`, 'error');
        }
    }
    
    // Unstage a file
    async unstageFile(filePath) {
        try {
            const result = await this.gitService.unstageFile(filePath);
            if (result) {
                this.updateUI();
                this.showNotification(`Unstaged ${filePath}`);
            }
        } catch (error) {
            this.showNotification(`Error unstaging ${filePath}: ${error.message}`, 'error');
        }
    }
    
    // Commit changes
    async commit(message) {
        try {
            const result = await this.gitService.commit(message);
            if (result) {
                this.updateUI();
                this.showNotification(`Committed changes: ${message}`);
            }
        } catch (error) {
            this.showNotification(`Error committing changes: ${error.message}`, 'error');
        }
    }
    
    // Push changes
    async push() {
        try {
            const result = await this.gitService.push();
            if (result.success) {
                this.updateUI();
                this.showNotification(result.message);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error pushing changes: ${error.message}`, 'error');
        }
    }
    
    // Pull changes
    async pull() {
        try {
            const result = await this.gitService.pull();
            if (result.success) {
                this.updateUI();
                this.showNotification(result.message);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error pulling changes: ${error.message}`, 'error');
        }
    }
    
    // Switch branch
    async switchBranch(branchName) {
        try {
            const result = await this.gitService.switchBranch(branchName);
            if (result.success) {
                this.updateUI();
                this.showNotification(result.message);
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification(`Error switching to branch ${branchName}: ${error.message}`, 'error');
        }
    }
    
    // Checkout remote branch
    async checkoutRemoteBranch(branchName) {
        // In a real implementation, this would create a local branch tracking the remote
        this.showNotification(`Checking out remote branch ${branchName} is not implemented in this demo`);
    }
    
    // View diff
    async viewDiff(filePath) {
        try {
            const diff = await this.gitService.getFileDiff(filePath);
            this.showDiffViewer(diff);
        } catch (error) {
            this.showNotification(`Error viewing diff for ${filePath}: ${error.message}`, 'error');
        }
    }
    
    // Show diff viewer
    showDiffViewer(diff) {
        // Create diff viewer
        const diffViewer = document.createElement('div');
        diffViewer.className = 'diff-viewer';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'diff-viewer-header';
        header.innerHTML = `<i class="fas fa-exchange-alt"></i> Diff: ${diff.filePath}`;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'diff-viewer-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(diffViewer);
        });
        
        header.appendChild(closeButton);
        diffViewer.appendChild(header);
        
        // Add content
        const content = document.createElement('div');
        content.className = 'diff-viewer-content';
        
        // Parse diff and create HTML
        const diffLines = diff.diff.split('\n');
        let diffHtml = '';
        
        diffLines.forEach(line => {
            let lineClass = '';
            if (line.startsWith('+')) {
                lineClass = 'diff-addition';
            } else if (line.startsWith('-')) {
                lineClass = 'diff-deletion';
            } else if (line.startsWith('@')) {
                lineClass = 'diff-info';
            }
            
            diffHtml += `<div class="diff-line ${lineClass}">${this.escapeHtml(line)}</div>`;
        });
        
        content.innerHTML = diffHtml;
        diffViewer.appendChild(content);
        
        // Add to body
        document.body.appendChild(diffViewer);
        
        // Center viewer
        diffViewer.style.left = `calc(50% - ${diffViewer.offsetWidth / 2}px)`;
        diffViewer.style.top = `calc(50% - ${diffViewer.offsetHeight / 2}px)`;
    }
    
    // Open file
    openFile(filePath) {
        // In a real implementation, this would open the file in the editor
        // For now, we'll simulate opening the file
        createOrActivateTab(filePath.split('/').pop());
        loadFile(filePath.split('/').pop());
    }
    
    // Discard changes
    discardChanges(filePath) {
        // In a real implementation, this would discard changes to the file
        this.showNotification(`Discarding changes for ${filePath} is not implemented in this demo`);
    }
    
    // Stash changes
    stash() {
        // In a real implementation, this would stash changes
        this.showNotification('Stashing changes is not implemented in this demo');
    }
    
    // Reset changes
    reset() {
        // In a real implementation, this would reset changes
        this.showNotification('Resetting changes is not implemented in this demo');
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.git-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'git-notification';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `git-notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Escape HTML special characters
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize Git Integration UI when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Git service to be initialized
    const checkGitService = setInterval(() => {
        if (window.gitService) {
            clearInterval(checkGitService);
            window.gitIntegrationUI = new GitIntegrationUI();
        }
    }, 100);
});
