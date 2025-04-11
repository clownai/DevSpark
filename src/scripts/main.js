// DevSpark IDE Main JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Monaco Editor
    initMonacoEditor();
    
    // Initialize UI event listeners
    initUIEventListeners();
    
    // Initialize file explorer functionality
    initFileExplorer();
    
    // Initialize terminal functionality
    initTerminal();
    
    // Initialize AI assistant
    initAIAssistant();
});

// Monaco Editor initialization
function initMonacoEditor() {
    // Load Monaco Editor using AMD loader
    require(['vs/editor/editor.main'], function() {
        // Create Monaco editor instance
        window.editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
            value: [
                '// Welcome to DevSpark IDE',
                '',
                'function helloWorld() {',
                '    console.log("Hello, world!");',
                '}',
                '',
                'helloWorld();'
            ].join('\n'),
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: {
                enabled: true
            },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollbar: {
                useShadows: false,
                verticalHasArrows: true,
                horizontalHasArrows: true,
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 12,
                horizontalScrollbarSize: 12
            }
        });
        
        // Add editor commands and keybindings
        setupEditorCommands();
        
        // Set up language features
        setupLanguageFeatures();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            editor.layout();
        });
    });
}

// Set up editor commands and keybindings
function setupEditorCommands() {
    // Add custom commands if needed
    if (window.editor) {
        // Example: Add a command to toggle the terminal panel
        window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, function() {
            toggleTerminalPanel();
        });
        
        // Example: Add a command to trigger AI assistance
        window.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, function() {
            toggleAIPanel();
        });
    }
}

// Set up language features like IntelliSense
function setupLanguageFeatures() {
    // Example: Add custom completions for JavaScript
    if (monaco.languages) {
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: function(model, position) {
                const suggestions = [
                    {
                        label: 'devsparkLog',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'devsparkLog(${1:message})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Log a message to the DevSpark console'
                    },
                    {
                        label: 'devsparkComponent',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: [
                            'class ${1:ComponentName} extends Component {',
                            '\tconstructor() {',
                            '\t\tsuper();',
                            '\t\tthis.state = {',
                            '\t\t\t${2:property}: ${3:value}',
                            '\t\t};',
                            '\t}',
                            '',
                            '\trender() {',
                            '\t\treturn (',
                            '\t\t\t<div>',
                            '\t\t\t\t${4:content}',
                            '\t\t\t</div>',
                            '\t\t);',
                            '\t}',
                            '}'
                        ].join('\n'),
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a new React component'
                    }
                ];
                
                return { suggestions: suggestions };
            }
        });
    }
}

// Initialize UI event listeners
function initUIEventListeners() {
    // Tab click event
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // In a real implementation, this would load the file content
            const fileName = this.querySelector('span').textContent;
            loadFile(fileName);
        });
        
        // Close tab button
        const closeBtn = tab.querySelector('i.fa-times');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent tab activation
                closeTab(tab);
            });
        }
    });
    
    // AI Assistant button
    const aiChatButton = document.querySelector('.ai-chat-button');
    if (aiChatButton) {
        aiChatButton.addEventListener('click', function() {
            toggleAIPanel();
        });
    }
    
    // AI Panel close button
    const aiPanelCloseBtn = document.querySelector('.ai-chat-panel .panel-actions i.fa-times');
    if (aiPanelCloseBtn) {
        aiPanelCloseBtn.addEventListener('click', function() {
            toggleAIPanel(false);
        });
    }
    
    // Chat input handling
    const chatInput = document.querySelector('.chat-input input');
    const chatSendBtn = document.querySelector('.chat-input button');
    
    if (chatInput && chatSendBtn) {
        // Send message on button click
        chatSendBtn.addEventListener('click', function() {
            sendChatMessage(chatInput.value);
            chatInput.value = '';
        });
        
        // Send message on Enter key
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage(chatInput.value);
                chatInput.value = '';
            }
        });
    }
    
    // Sidebar toggle for responsive design
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
        });
    }
}

// Initialize file explorer functionality
function initFileExplorer() {
    // Add click event listeners to folders and files
    const folders = document.querySelectorAll('.folder-name');
    folders.forEach(folder => {
        folder.addEventListener('click', function() {
            // Toggle folder open/closed
            const folderContents = this.nextElementSibling;
            if (folderContents) {
                folderContents.style.display = folderContents.style.display === 'none' ? 'block' : 'none';
                
                // Toggle folder icon
                const icon = this.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('fa-folder')) {
                        icon.classList.remove('fa-folder');
                        icon.classList.add('fa-folder-open');
                    } else {
                        icon.classList.remove('fa-folder-open');
                        icon.classList.add('fa-folder');
                    }
                }
            }
        });
    });
    
    const files = document.querySelectorAll('.file');
    files.forEach(file => {
        file.addEventListener('click', function() {
            // Get file name
            const fileName = this.textContent.trim();
            
            // Create or activate tab for this file
            createOrActivateTab(fileName);
            
            // Load file content
            loadFile(fileName);
        });
    });
}

// Initialize terminal functionality
function initTerminal() {
    // In a real implementation, this would connect to a real terminal
    // For now, we'll just simulate some basic functionality
    
    // Add a blinking cursor effect
    const terminal = document.getElementById('terminal');
    if (terminal) {
        // Get the last line
        const lines = terminal.querySelectorAll('.terminal-line');
        const lastLine = lines[lines.length - 1];
        
        // Add blinking cursor
        setInterval(function() {
            if (lastLine.textContent.endsWith('_')) {
                lastLine.textContent = lastLine.textContent.slice(0, -1) + ' ';
            } else if (lastLine.textContent.endsWith(' ')) {
                lastLine.textContent = lastLine.textContent.slice(0, -1) + '_';
            }
        }, 500);
    }
}

// Initialize AI assistant
function initAIAssistant() {
    // In a real implementation, this would connect to an AI service
    // For now, we'll just simulate some basic functionality
    
    // Nothing to initialize for the demo
}

// Helper Functions

// Load file content into the editor
function loadFile(fileName) {
    // In a real implementation, this would load the file from the server
    // For now, we'll just simulate loading different files
    
    let content = '';
    let language = 'javascript';
    
    if (fileName === 'index.js') {
        content = [
            '// Main entry point for the application',
            '',
            'import App from "./app.js";',
            '',
            'document.addEventListener("DOMContentLoaded", function() {',
            '    const app = new App();',
            '    app.initialize();',
            '});'
        ].join('\n');
        language = 'javascript';
    } else if (fileName === 'app.js') {
        content = [
            '// Application class definition',
            '',
            'export default class App {',
            '    constructor() {',
            '        this.initialized = false;',
            '    }',
            '',
            '    initialize() {',
            '        console.log("Application initialized");',
            '        this.initialized = true;',
            '        ',
            '        // Set up event listeners',
            '        this.setupEventListeners();',
            '    }',
            '',
            '    setupEventListeners() {',
            '        // Add event listeners here',
            '    }',
            '}'
        ].join('\n');
        language = 'javascript';
    } else if (fileName === 'styles.css') {
        content = [
            '/* Application styles */',
            '',
            'body {',
            '    font-family: Arial, sans-serif;',
            '    margin: 0;',
            '    padding: 0;',
            '}',
            '',
            '.container {',
            '    max-width: 1200px;',
            '    margin: 0 auto;',
            '    padding: 20px;',
            '}',
            '',
            '.button {',
            '    background-color: #0e639c;',
            '    color: white;',
            '    border: none;',
            '    padding: 8px 16px;',
            '    border-radius: 4px;',
            '    cursor: pointer;',
            '}',
            '',
            '.button:hover {',
            '    background-color: #1177bb;',
            '}'
        ].join('\n');
        language = 'css';
    } else if (fileName === 'README.md') {
        content = [
            '# Project Title',
            '',
            '## Description',
            '',
            'A brief description of what this project does and who it\'s for.',
            '',
            '## Installation',
            '',
            '```bash',
            'npm install',
            '```',
            '',
            '## Usage',
            '',
            '```javascript',
            'import { myFunction } from \'./myModule\';',
            '',
            'myFunction();',
            '```',
            '',
            '## Features',
            '',
            '- Feature 1',
            '- Feature 2',
            '- Feature 3',
            '',
            '## License',
            '',
            'MIT'
        ].join('\n');
        language = 'markdown';
    } else if (fileName === 'package.json') {
        content = [
            '{',
            '  "name": "my-project",',
            '  "version": "1.0.0",',
            '  "description": "A sample project",',
            '  "main": "index.js",',
            '  "scripts": {',
            '    "start": "node index.js",',
            '    "test": "jest"',
            '  },',
            '  "dependencies": {',
            '    "express": "^4.17.1",',
            '    "react": "^17.0.2",',
            '    "react-dom": "^17.0.2"',
            '  },',
            '  "devDependencies": {',
            '    "jest": "^27.0.6",',
            '    "webpack": "^5.44.0"',
            '  },',
            '  "license": "MIT"',
            '}'
        ].join('\n');
        language = 'json';
    } else {
        content = '// No content available for ' + fileName;
    }
    
    // Update editor content and language
    if (window.editor) {
        window.editor.setValue(content);
        monaco.editor.setModelLanguage(window.editor.getModel(), language);
    }
    
    // Update status bar
    updateStatusBar(fileName, language);
}

// Create or activate a tab for a file
function createOrActivateTab(fileName) {
    // Check if tab already exists
    const tabs = document.querySelectorAll('.tab');
    let tabExists = false;
    
    tabs.forEach(tab => {
        const tabName = tab.querySelector('span').textContent;
        if (tabName === fileName) {
            // Activate this tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabExists = true;
        }
    });
    
    // If tab doesn't exist, create it
    if (!tabExists) {
        const tabBar = document.querySelector('.tab-bar');
        const newTab = document.createElement('div');
        newTab.className = 'tab active';
        newTab.innerHTML = `<span>${fileName}</span><i class="fas fa-times"></i>`;
        
        // Remove active class from all other tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add the new tab
        tabBar.appendChild(newTab);
        
        // Add event listeners to the new tab
        newTab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadFile(fileName);
        });
        
        const closeBtn = newTab.querySelector('i.fa-times');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeTab(newTab);
            });
        }
    }
}

// Close a tab
function closeTab(tab) {
    // Check if this is the active tab
    const isActive = tab.classList.contains('active');
    
    // Remove the tab
    tab.remove();
    
    // If this was the active tab, activate another tab
    if (isActive) {
        const remainingTabs = document.querySelectorAll('.tab');
        if (remainingTabs.length > 0) {
            remainingTabs[0].classList.add('active');
            const fileName = remainingTabs[0].querySelector('span').textContent;
            loadFile(fileName);
        }
    }
}

// Toggle the AI panel
function toggleAIPanel(show) {
    const aiPanel = document.querySelector('.ai-chat-panel');
    if (aiPanel) {
        if (show === undefined) {
            // Toggle
            aiPanel.classList.toggle('hidden');
        } else if (show) {
            // Show
            aiPanel.classList.remove('hidden');
        } else {
            // Hide
            aiPanel.classList.add('hidden');
        }
    }
}

// Toggle the terminal panel
function toggleTerminalPanel() {
    const terminalPanel = document.querySelector('.terminal-panel');
    if (terminalPanel) {
        terminalPanel.classList.toggle('hidden');
    }
}

// Send a chat message to the AI assistant
function sendChatMessage(message) {
    if (!message.trim()) return;
    
    // Add user message to chat
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.innerHTML = `
            <div class="message-content">
                <div class="message-text">${message}</div>
            </div>
        `;
        chatMessages.appendChild(userMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate AI response (in a real implementation, this would call an AI service)
        setTimeout(function() {
            const aiResponse = getAIResponse(message);
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai';
            aiMessage.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${aiResponse}</div>
                </div>
            `;
            chatMessages.appendChild(aiMessage);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
}

// Get a simulated AI response
function getAIResponse(message) {
    // In a real implementation, this would call an AI service
    // For now, we'll just return some canned responses
    
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello! How can I assist you with your code today?";
    } else if (message.includes('help')) {
        return "I'm here to help! You can ask me about coding problems, request code examples, or get explanations about programming concepts.";
    } else if (message.includes('javascript') || message.includes('js')) {
        return "JavaScript is a versatile programming language primarily used for web development. What specific aspect of JavaScript would you like to know more about?";
    } else if (message.includes('react')) {
        return "React is a popular JavaScript library for building user interfaces. It uses a component-based architecture and a virtual DOM for efficient rendering.";
    } else if (message.includes('code') || message.includes('example')) {
        return "Here's a simple example of a React component:<br><br><code>function Welcome(props) {<br>  return &lt;h1&gt;Hello, {props.name}&lt;/h1&gt;;<br>}</code>";
    } else if (message.includes('error') || message.includes('bug')) {
        return "To debug your code effectively, try using console.log statements to trace execution flow, or use the browser's developer tools to set breakpoints.";
    } else if (message.includes('thank')) {
        return "You're welcome! Feel free to ask if you need any more assistance.";
    } else {
        return "I understand you're asking about '" + message + "'. Could you provide more details or context so I can give you a more specific answer?";
    }
}

// Update the status bar
function updateStatusBar(fileName, language) {
    const statusItems = document.querySelectorAll('.status-item');
    
    // Update language indicator
    if (statusItems[2]) {
        statusItems[2].innerHTML = `<i class="fas fa-code"></i> ${language.charAt(0).toUpperCase() + language.slice(1)}`;
    }
    
    // Update last saved time
    if (statusItems[3]) {
        statusItems[3].innerHTML = `<i class="fas fa-clock"></i> Last saved: just now`;
    }
}
