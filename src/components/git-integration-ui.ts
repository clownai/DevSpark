// DevSpark IDE - Git Integration UI Components
// This file contains the UI components for Git integration and project management

interface GitService {
  getCurrentBranch(repoPath: string): Promise<string>;
  getBranches(repoPath: string): Promise<string[]>;
  getStatus(repoPath: string): Promise<GitStatus>;
  checkout(repoPath: string, branch: string): Promise<{
    success: boolean;
    message: string;
  }>;
  commit(repoPath: string, message: string, files: string[]): Promise<{
    success: boolean;
    commitId: string;
    message: string;
  }>;
  push(repoPath: string, remote?: string, branch?: string): Promise<{
    success: boolean;
    message: string;
  }>;
  pull(repoPath: string, remote?: string, branch?: string): Promise<{
    success: boolean;
    message: string;
  }>;
  createBranch(repoPath: string, branchName: string): Promise<{
    success: boolean;
    message: string;
  }>;
  stageFile(repoPath: string, filePath: string): Promise<{
    success: boolean;
    message: string;
  }>;
  unstageFile(repoPath: string, filePath: string): Promise<{
    success: boolean;
    message: string;
  }>;
}

interface GitStatus {
  isRepo: boolean;
  currentBranch: string;
  changes: GitChange[];
  staged: GitChange[];
  ahead: number;
  behind: number;
}

interface GitChange {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
  staged: boolean;
}

interface ContextMenuItem {
  label: string;
  action: () => void;
  icon?: string;
  separator?: boolean;
  disabled?: boolean;
}

declare global {
  interface Window {
    gitService: GitService;
  }
}

class GitIntegrationUI {
    private gitService: GitService;
    private sourceControlPanel: HTMLElement | null;
    private branchDisplay: HTMLElement | null;
    private changesContainer: HTMLElement | null;
    private statusBarBranch: HTMLElement | null;
    private currentRepo: string = '';
    private currentStatus: GitStatus | null = null;
    
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
    initialize(): GitIntegrationUI {
        console.log('Git Integration UI initialized');
        
        // Update UI with current Git status
        this.updateUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        return this;
    }
    
    // Update UI with current Git status
    private async updateUI(): Promise<void> {
        await this.updateBranchDisplay();
        await this.updateChangesDisplay();
        this.updateStatusBar();
    }
    
    // Set up event listeners
    private setupEventListeners(): void {
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
        
        // Add click events for changes
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            // Check if clicked on a change item
            if (target.closest('.change-item')) {
                const changeItem = target.closest('.change-item') as HTMLElement;
                const filePath = changeItem.dataset.path;
                
                if (filePath) {
                    if (target.closest('.stage-button')) {
                        this.stageFile(filePath);
                    } else if (target.closest('.unstage-button')) {
                        this.unstageFile(filePath);
                    } else {
                        this.openDiff(filePath);
                    }
                }
            }
            
            // Check if clicked on commit button
            if (target.closest('#commit-button')) {
                this.commitChanges();
            }
            
            // Check if clicked on push button
            if (target.closest('#push-button')) {
                this.pushChanges();
            }
            
            // Check if clicked on pull button
            if (target.closest('#pull-button')) {
                this.pullChanges();
            }
        });
    }
    
    // Update branch display
    private async updateBranchDisplay(): Promise<void> {
        if (!this.branchDisplay || !this.currentRepo) return;
        
        try {
            const branch = await this.gitService.getCurrentBranch(this.currentRepo);
            this.branchDisplay.textContent = branch;
            this.branchDisplay.title = `Current Branch: ${branch}`;
        } catch (error) {
            console.error('Failed to get current branch:', error);
            this.branchDisplay.textContent = 'No Branch';
            this.branchDisplay.title = 'Not a Git repository';
        }
    }
    
    // Update changes display
    private async updateChangesDisplay(): Promise<void> {
        if (!this.changesContainer || !this.currentRepo) return;
        
        try {
            this.currentStatus = await this.gitService.getStatus(this.currentRepo);
            
            // Clear container
            this.changesContainer.innerHTML = '';
            
            // Create staged changes section
            if (this.currentStatus.staged.length > 0) {
                const stagedSection = document.createElement('div');
                stagedSection.className = 'changes-section staged-changes';
                
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'section-header';
                sectionHeader.innerHTML = `
                    <span>Staged Changes</span>
                    <span class="count">${this.currentStatus.staged.length}</span>
                `;
                
                stagedSection.appendChild(sectionHeader);
                
                // Add staged changes
                this.currentStatus.staged.forEach(change => {
                    const changeItem = this.createChangeItem(change, true);
                    stagedSection.appendChild(changeItem);
                });
                
                this.changesContainer.appendChild(stagedSection);
            }
            
            // Create changes section
            if (this.currentStatus.changes.length > 0) {
                const changesSection = document.createElement('div');
                changesSection.className = 'changes-section unstaged-changes';
                
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'section-header';
                sectionHeader.innerHTML = `
                    <span>Changes</span>
                    <span class="count">${this.currentStatus.changes.length}</span>
                `;
                
                changesSection.appendChild(sectionHeader);
                
                // Add changes
                this.currentStatus.changes.forEach(change => {
                    const changeItem = this.createChangeItem(change, false);
                    changesSection.appendChild(changeItem);
                });
                
                this.changesContainer.appendChild(changesSection);
            }
            
            // Add commit section
            const commitSection = document.createElement('div');
            commitSection.className = 'commit-section';
            commitSection.innerHTML = `
                <textarea id="commit-message" placeholder="Commit message"></textarea>
                <button id="commit-button" class="primary-button" ${this.currentStatus.staged.length === 0 ? 'disabled' : ''}>
                    Commit
                </button>
                <div class="button-group">
                    <button id="push-button" class="secondary-button" ${!this.currentStatus.ahead ? 'disabled' : ''}>
                        Push
                    </button>
                    <button id="pull-button" class="secondary-button">
                        Pull
                    </button>
                </div>
            `;
            
            this.changesContainer.appendChild(commitSection);
            
        } catch (error) {
            console.error('Failed to get Git status:', error);
            this.changesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load Git status</p>
                </div>
            `;
        }
    }
    
    // Create change item element
    private createChangeItem(change: GitChange, isStaged: boolean): HTMLElement {
        const changeItem = document.createElement('div');
        changeItem.className = `change-item ${change.status}`;
        changeItem.dataset.path = change.path;
        
        // Get file name from path
        const fileName = change.path.split('/').pop() || change.path;
        
        // Get status icon
        let statusIcon = '';
        switch (change.status) {
            case 'modified':
                statusIcon = 'fa-pencil-alt';
                break;
            case 'added':
                statusIcon = 'fa-plus';
                break;
            case 'deleted':
                statusIcon = 'fa-trash';
                break;
            case 'renamed':
                statusIcon = 'fa-exchange-alt';
                break;
            case 'untracked':
                statusIcon = 'fa-question';
                break;
        }
        
        changeItem.innerHTML = `
            <div class="change-info">
                <i class="fas ${statusIcon} status-icon"></i>
                <span class="file-name">${fileName}</span>
            </div>
            <div class="change-actions">
                ${isStaged ? 
                    '<button class="unstage-button" title="Unstage"><i class="fas fa-minus"></i></button>' : 
                    '<button class="stage-button" title="Stage"><i class="fas fa-plus"></i></button>'}
            </div>
        `;
        
        return changeItem;
    }
    
    // Update status bar
    private updateStatusBar(): void {
        if (!this.statusBarBranch || !this.currentStatus) return;
        
        if (this.currentStatus.isRepo) {
            this.statusBarBranch.innerHTML = `
                <i class="fas fa-code-branch"></i>
                ${this.currentStatus.currentBranch}
                ${this.currentStatus.ahead > 0 ? `<span class="ahead">↑${this.currentStatus.ahead}</span>` : ''}
                ${this.currentStatus.behind > 0 ? `<span class="behind">↓${this.currentStatus.behind}</span>` : ''}
            `;
            this.statusBarBranch.style.display = 'flex';
        } else {
            this.statusBarBranch.style.display = 'none';
        }
    }
    
    // Show source control context menu
    private showSourceControlContextMenu(x: number, y: number): void {
        const menuItems: ContextMenuItem[] = [
            {
                label: 'Initialize Repository',
                action: () => this.initRepo(),
                icon: 'fa-plus-circle'
            },
            {
                label: 'Clone Repository',
                action: () => this.cloneRepo(),
                icon: 'fa-clone'
            },
            { separator: true },
            {
                label: 'Create Branch',
                action: () => this.createBranch(),
                icon: 'fa-code-branch',
                disabled: !this.currentStatus?.isRepo
            },
            {
                label: 'Fetch',
                action: () => this.fetch(),
                icon: 'fa-download',
                disabled: !this.currentStatus?.isRepo
            },
            { separator: true },
            {
                label: 'Refresh',
                action: () => this.updateUI(),
                icon: 'fa-sync'
            }
        ];
        
        this.showContextMenu(x, y, menuItems);
    }
    
    // Show context menu
    private showContextMenu(x: number, y: number, items: ContextMenuItem[]): void {
        // Remove existing context menus
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        // Add items
        items.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.className = 'separator';
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = `menu-item ${item.disabled ? 'disabled' : ''}`;
                
                menuItem.innerHTML = `
                    ${item.icon ? `<i class="fas ${item.icon}"></i>` : ''}
                    <span>${item.label}</span>
                `;
                
                if (!item.disabled) {
                    menuItem.addEventListener('click', () => {
                        menu.remove();
                        item.action();
                    });
                }
                
                menu.appendChild(menuItem);
            }
        });
        
        // Add to document
        document.body.appendChild(menu);
        
        // Add click outside listener
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target as Node)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
    
    // Show branch selector
    private async showBranchSelector(): Promise<void> {
        if (!this.currentRepo) return;
        
        try {
            const branches = await this.gitService.getBranches(this.currentRepo);
            const currentBranch = await this.gitService.getCurrentBranch(this.currentRepo);
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal branch-selector-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Switch Branch</h2>
                        <button class="close-button"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="search-container">
                            <input type="text" class="search-input" placeholder="Search branches...">
                        </div>
                        <div class="branches-list">
                            ${branches.map(branch => `
                                <div class="branch-item ${branch === currentBranch ? 'current' : ''}" data-branch="${branch}">
                                    <i class="fas fa-code-branch"></i>
                                    <span>${branch}</span>
                                    ${branch === currentBranch ? '<span class="current-indicator">current</span>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="create-branch-button">Create New Branch</button>
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
            
            const searchInput = modal.querySelector('.search-input') as HTMLInputElement;
            if (searchInput) {
                searchInput.addEventListener('input', () => {
                    const query = searchInput.value.toLowerCase();
                    const branchItems = modal.querySelectorAll('.branch-item');
                    
                    branchItems.forEach(item => {
                        const branchName = (item as HTMLElement).dataset.branch?.toLowerCase() || '';
                        if (branchName.includes(query)) {
                            (item as HTMLElement).style.display = 'flex';
                        } else {
                            (item as HTMLElement).style.display = 'none';
                        }
                    });
                });
            }
            
            const branchItems = modal.querySelectorAll('.branch-item');
            branchItems.forEach(item => {
                item.addEventListener('click', async () => {
                    const branch = (item as HTMLElement).dataset.branch;
                    if (branch && branch !== currentBranch) {
                        try {
                            const result = await this.gitService.checkout(this.currentRepo, branch);
                            if (result.success) {
                                modal.remove();
                                this.updateUI();
                            } else {
                                // Show error
                                console.error('Failed to checkout branch:', result.message);
                            }
                        } catch (error) {
                            console.error('Failed to checkout branch:', error);
                        }
                    }
                });
            });
            
            const createBranchButton = modal.querySelector('.create-branch-button');
            if (createBranchButton) {
                createBranchButton.addEventListener('click', () => {
                    modal.remove();
                    this.createBranch();
                });
            }
            
        } catch (error) {
            console.error('Failed to get branches:', error);
        }
    }
    
    // Initialize repository
    private async initRepo(): Promise<void> {
        // Implementation would go here
        console.log('Initialize repository');
    }
    
    // Clone repository
    private async cloneRepo(): Promise<void> {
        // Implementation would go here
        console.log('Clone repository');
    }
    
    // Create branch
    private async createBranch(): Promise<void> {
        if (!this.currentRepo) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal create-branch-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Create New Branch</h2>
                    <button class="close-button"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="branch-name">Branch Name</label>
                        <input type="text" id="branch-name" placeholder="feature/my-feature">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-button">Cancel</button>
                    <button class="create-button primary-button">Create</button>
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
        
        const createButton = modal.querySelector('.create-button');
        const branchNameInput = modal.querySelector('#branch-name') as HTMLInputElement;
        
        if (createButton && branchNameInput) {
            createButton.addEventListener('click', async () => {
                const branchName = branchNameInput.value.trim();
                
                if (!branchName) {
                    // Show error
                    return;
                }
                
                try {
                    const result = await this.gitService.createBranch(this.currentRepo, branchName);
                    
                    if (result.success) {
                        modal.remove();
                        this.updateUI();
                    } else {
                        // Show error
                        console.error('Failed to create branch:', result.message);
                    }
                } catch (error) {
                    console.error('Failed to create branch:', error);
                }
            });
        }
    }
    
    // Fetch
    private async fetch(): Promise<void> {
        // Implementation would go here
        console.log('Fetch');
    }
    
    // Stage file
    private async stageFile(filePath: string): Promise<void> {
        if (!this.currentRepo) return;
        
        try {
            const result = await this.gitService.stageFile(this.currentRepo, filePath);
            
            if (result.success) {
                this.updateUI();
            } else {
                console.error('Failed to stage file:', result.message);
            }
        } catch (error) {
            console.error('Failed to stage file:', error);
        }
    }
    
    // Unstage file
    private async unstageFile(filePath: string): Promise<void> {
        if (!this.currentRepo) return;
        
        try {
            const result = await this.gitService.unstageFile(this.currentRepo, filePath);
            
            if (result.success) {
                this.updateUI();
            } else {
                console.error('Failed to unstage file:', result.message);
            }
        } catch (error) {
            console.error('Failed to unstage file:', error);
        }
    }
    
    // Open diff
    private openDiff(filePath: string): void {
        // Implementation would go here
        console.log('Open diff for', filePath);
    }
    
    // Commit changes
    private async commitChanges(): Promise<void> {
        if (!this.currentRepo || !this.currentStatus) return;
        
        const commitMessageInput = document.querySelector('#commit-message') as HTMLTextAreaElement;
        if (!commitMessageInput) return;
        
        const commitMessage = commitMessageInput.value.trim();
        if (!commitMessage) {
            // Show error
            return;
        }
        
        try {
            const stagedFiles = this.currentStatus.staged.map(change => change.path);
            
            const result = await this.gitService.commit(this.currentRepo, commitMessage, stagedFiles);
            
            if (result.success) {
                commitMessageInput.value = '';
                this.updateUI();
            } else {
                console.error('Failed to commit changes:', result.message);
            }
        } catch (error) {
            console.error('Failed to commit changes:', error);
        }
    }
    
    // Push changes
    private async pushChanges(): Promise<void> {
        if (!this.currentRepo) return;
        
        try {
            const result = await this.gitService.push(this.currentRepo);
            
            if (result.success) {
                this.updateUI();
            } else {
                console.error('Failed to push changes:', result.message);
            }
        } catch (error) {
            console.error('Failed to push changes:', error);
        }
    }
    
    // Pull changes
    private async pullChanges(): Promise<void> {
        if (!this.currentRepo) return;
        
        try {
            const result = await this.gitService.pull(this.currentRepo);
            
            if (result.success) {
                this.updateUI();
            } else {
                console.error('Failed to pull changes:', result.message);
            }
        } catch (error) {
            console.error('Failed to pull changes:', error);
        }
    }
    
    // Set current repository
    setCurrentRepo(repoPath: string): void {
        this.currentRepo = repoPath;
        this.updateUI();
    }
}

export default GitIntegrationUI;
