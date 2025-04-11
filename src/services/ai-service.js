// DevSpark IDE - AI Service
// This service handles AI integration for code assistance, chat, and inline suggestions

class AIService {
    constructor() {
        this.contextWindow = [];
        this.maxContextItems = 20;
        this.apiEndpoint = 'https://api.example.com/ai'; // Would be a real API endpoint in production
        this.isProcessing = false;
        this.contextCollectors = [];
        
        // Register context collectors
        this.registerContextCollectors();
    }
    
    // Initialize the AI service
    initialize() {
        console.log('AI Service initialized');
        
        // Set up event listeners for context collection
        this.setupEventListeners();
        
        return this;
    }
    
    // Register context collectors for different sources
    registerContextCollectors() {
        // Add collector for editor content
        this.contextCollectors.push({
            name: 'editor',
            priority: 10,
            collect: () => this.collectEditorContext()
        });
        
        // Add collector for file structure
        this.contextCollectors.push({
            name: 'fileStructure',
            priority: 5,
            collect: () => this.collectFileStructureContext()
        });
        
        // Add collector for current file metadata
        this.contextCollectors.push({
            name: 'fileMetadata',
            priority: 8,
            collect: () => this.collectFileMetadataContext()
        });
        
        // Add collector for recent user actions
        this.contextCollectors.push({
            name: 'userActions',
            priority: 3,
            collect: () => this.collectUserActionsContext()
        });
    }
    
    // Set up event listeners for context collection
    setupEventListeners() {
        // Listen for editor changes
        if (window.editor) {
            window.editor.onDidChangeModelContent(() => {
                this.updateContext('editor', this.collectEditorContext());
            });
        }
        
        // Listen for file selection changes
        document.addEventListener('file-selected', (event) => {
            this.updateContext('fileMetadata', this.collectFileMetadataContext());
        });
        
        // Listen for user actions
        document.addEventListener('user-action', (event) => {
            this.addUserAction(event.detail.action, event.detail.data);
        });
    }
    
    // Collect context from the editor
    collectEditorContext() {
        if (!window.editor) return null;
        
        const model = window.editor.getModel();
        if (!model) return null;
        
        const content = window.editor.getValue();
        const language = model.getLanguageId();
        const selection = window.editor.getSelection();
        
        // Get the current line and surrounding lines for context
        let currentLine = selection ? selection.startLineNumber : 1;
        let contextLines = this.getContextLines(content, currentLine, 5);
        
        return {
            type: 'editor',
            content: content.length > 5000 ? content.substring(0, 5000) + '...' : content,
            language,
            selection: selection ? {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn
            } : null,
            contextLines,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get context lines around a specific line
    getContextLines(content, lineNumber, lineCount) {
        const lines = content.split('\n');
        const startLine = Math.max(0, lineNumber - lineCount);
        const endLine = Math.min(lines.length, lineNumber + lineCount);
        
        return lines.slice(startLine, endLine).join('\n');
    }
    
    // Collect context from the file structure
    collectFileStructureContext() {
        // In a real implementation, this would get the actual file structure
        // For now, we'll return a simulated file structure
        return {
            type: 'fileStructure',
            structure: {
                name: 'project',
                type: 'folder',
                children: [
                    {
                        name: 'src',
                        type: 'folder',
                        children: [
                            { name: 'index.js', type: 'file' },
                            { name: 'app.js', type: 'file' },
                            { name: 'styles.css', type: 'file' }
                        ]
                    },
                    { name: 'README.md', type: 'file' },
                    { name: 'package.json', type: 'file' }
                ]
            },
            timestamp: new Date().toISOString()
        };
    }
    
    // Collect context from the current file metadata
    collectFileMetadataContext() {
        // Get the active tab to determine current file
        const activeTab = document.querySelector('.tab.active');
        if (!activeTab) return null;
        
        const fileName = activeTab.querySelector('span').textContent;
        
        // In a real implementation, this would get actual file metadata
        return {
            type: 'fileMetadata',
            fileName,
            fileType: fileName.split('.').pop(),
            lastModified: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };
    }
    
    // Collect context from recent user actions
    collectUserActionsContext() {
        return {
            type: 'userActions',
            actions: this.userActions || [],
            timestamp: new Date().toISOString()
        };
    }
    
    // Add a user action to the context
    addUserAction(action, data) {
        if (!this.userActions) {
            this.userActions = [];
        }
        
        // Add the action to the beginning of the array
        this.userActions.unshift({
            action,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Limit the number of stored actions
        if (this.userActions.length > 10) {
            this.userActions.pop();
        }
        
        // Update the context
        this.updateContext('userActions', this.collectUserActionsContext());
    }
    
    // Update a specific context type
    updateContext(type, data) {
        if (!data) return;
        
        // Find existing context of this type
        const existingIndex = this.contextWindow.findIndex(item => item.type === type);
        
        if (existingIndex >= 0) {
            // Update existing context
            this.contextWindow[existingIndex] = data;
        } else {
            // Add new context
            this.contextWindow.push(data);
            
            // Sort by priority
            this.contextWindow.sort((a, b) => {
                const priorityA = this.getContextPriority(a.type);
                const priorityB = this.getContextPriority(b.type);
                return priorityB - priorityA;
            });
            
            // Limit context window size
            if (this.contextWindow.length > this.maxContextItems) {
                this.contextWindow.pop();
            }
        }
    }
    
    // Get priority for a context type
    getContextPriority(type) {
        const collector = this.contextCollectors.find(c => c.name === type);
        return collector ? collector.priority : 0;
    }
    
    // Collect all context
    collectAllContext() {
        // Collect context from all registered collectors
        this.contextCollectors.forEach(collector => {
            const context = collector.collect();
            if (context) {
                this.updateContext(collector.name, context);
            }
        });
        
        return this.contextWindow;
    }
    
    // Process a chat message
    async processChatMessage(message) {
        if (this.isProcessing) {
            return {
                type: 'error',
                message: 'Already processing a request. Please wait.'
            };
        }
        
        this.isProcessing = true;
        
        try {
            // Collect current context
            const context = this.collectAllContext();
            
            // In a real implementation, this would call an AI API
            // For now, we'll simulate a response
            const response = await this.simulateAIResponse(message, context);
            
            this.isProcessing = false;
            return response;
        } catch (error) {
            this.isProcessing = false;
            return {
                type: 'error',
                message: 'Error processing request: ' + error.message
            };
        }
    }
    
    // Get inline code suggestions
    async getInlineSuggestions(prefix) {
        if (this.isProcessing) {
            return {
                type: 'error',
                message: 'Already processing a request. Please wait.'
            };
        }
        
        this.isProcessing = true;
        
        try {
            // Collect current context
            const context = this.collectAllContext();
            
            // In a real implementation, this would call an AI API
            // For now, we'll simulate suggestions
            const suggestions = await this.simulateInlineSuggestions(prefix, context);
            
            this.isProcessing = false;
            return suggestions;
        } catch (error) {
            this.isProcessing = false;
            return {
                type: 'error',
                message: 'Error getting suggestions: ' + error.message
            };
        }
    }
    
    // Get code explanations
    async getCodeExplanation(code) {
        if (this.isProcessing) {
            return {
                type: 'error',
                message: 'Already processing a request. Please wait.'
            };
        }
        
        this.isProcessing = true;
        
        try {
            // In a real implementation, this would call an AI API
            // For now, we'll simulate an explanation
            const explanation = await this.simulateCodeExplanation(code);
            
            this.isProcessing = false;
            return explanation;
        } catch (error) {
            this.isProcessing = false;
            return {
                type: 'error',
                message: 'Error getting explanation: ' + error.message
            };
        }
    }
    
    // Get refactoring suggestions
    async getRefactoringSuggestions(code) {
        if (this.isProcessing) {
            return {
                type: 'error',
                message: 'Already processing a request. Please wait.'
            };
        }
        
        this.isProcessing = true;
        
        try {
            // Collect current context
            const context = this.collectAllContext();
            
            // In a real implementation, this would call an AI API
            // For now, we'll simulate suggestions
            const suggestions = await this.simulateRefactoringSuggestions(code, context);
            
            this.isProcessing = false;
            return suggestions;
        } catch (error) {
            this.isProcessing = false;
            return {
                type: 'error',
                message: 'Error getting refactoring suggestions: ' + error.message
            };
        }
    }
    
    // Simulate AI response (for demo purposes)
    async simulateAIResponse(message, context) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        message = message.toLowerCase();
        
        // Get current file and language from context
        let currentFile = 'unknown';
        let currentLanguage = 'unknown';
        
        const fileMetadata = context.find(item => item.type === 'fileMetadata');
        if (fileMetadata) {
            currentFile = fileMetadata.fileName;
            currentLanguage = fileMetadata.fileType;
        }
        
        // Generate response based on message and context
        if (message.includes('hello') || message.includes('hi')) {
            return {
                type: 'text',
                message: `Hello! I see you're working on ${currentFile}. How can I assist you with your ${currentLanguage} code today?`
            };
        } else if (message.includes('help')) {
            return {
                type: 'text',
                message: "I'm here to help! You can ask me about coding problems, request code examples, or get explanations about programming concepts. I can also help with refactoring suggestions and debugging."
            };
        } else if (message.includes('example') || message.includes('sample')) {
            // Return different examples based on the current language
            if (currentLanguage === 'js' || currentLanguage === 'javascript') {
                return {
                    type: 'code',
                    language: 'javascript',
                    message: "Here's a sample JavaScript function:",
                    code: `function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Example usage
const cart = [
  { name: 'Widget', price: 9.99, quantity: 2 },
  { name: 'Gadget', price: 14.95, quantity: 1 }
];
const total = calculateTotal(cart);
console.log(\`Total: $\${total.toFixed(2)}\`);`
                };
            } else if (currentLanguage === 'css') {
                return {
                    type: 'code',
                    language: 'css',
                    message: "Here's a sample CSS snippet for a responsive card design:",
                    code: `.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .card {
    padding: 12px;
  }
}`
                };
            } else if (currentLanguage === 'html') {
                return {
                    type: 'code',
                    language: 'html',
                    message: "Here's a sample HTML structure for a contact form:",
                    code: `<form class="contact-form">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  
  <button type="submit" class="submit-button">Send Message</button>
</form>`
                };
            } else {
                return {
                    type: 'text',
                    message: `I'd be happy to provide an example. What kind of ${currentLanguage} code would you like to see?`
                };
            }
        } else if (message.includes('explain') || message.includes('how does')) {
            // Get editor context to explain current code
            const editorContext = context.find(item => item.type === 'editor');
            if (editorContext && editorContext.contextLines) {
                return {
                    type: 'explanation',
                    message: "Here's an explanation of your current code:",
                    explanation: `The code you're looking at appears to be ${currentLanguage} code that ${this.getGenericExplanation(currentLanguage)}. 
                    
In a real implementation, I would analyze your specific code and provide a detailed explanation of what it does, how it works, and any potential issues or improvements.`
                };
            } else {
                return {
                    type: 'text',
                    message: "What specific code or concept would you like me to explain?"
                };
            }
        } else if (message.includes('refactor') || message.includes('improve')) {
            return {
                type: 'text',
                message: "I'd be happy to suggest some refactoring improvements for your code. In a real implementation, I would analyze your code and provide specific suggestions for making it more efficient, readable, or maintainable."
            };
        } else if (message.includes('error') || message.includes('bug') || message.includes('fix')) {
            return {
                type: 'text',
                message: "To help debug your code, I'd need to see the error message or understand the issue you're facing. In a real implementation, I would analyze your code and error messages to suggest potential fixes."
            };
        } else if (message.includes('thank')) {
            return {
                type: 'text',
                message: "You're welcome! Feel free to ask if you need any more assistance with your coding."
            };
        } else {
            return {
                type: 'text',
                message: `I understand you're asking about '${message}'. In a real implementation, I would provide a detailed response based on your specific question and the context of your project.`
            };
        }
    }
    
    // Get a generic explanation based on language
    getGenericExplanation(language) {
        switch (language) {
            case 'javascript':
            case 'js':
                return "likely involves manipulating data, handling events, or updating the DOM";
            case 'css':
                return "defines styles for HTML elements, including layout, colors, and responsive behavior";
            case 'html':
                return "structures content for web pages, defining elements and their relationships";
            case 'python':
                return "processes data, performs calculations, or implements algorithms";
            case 'java':
                return "defines classes and methods for object-oriented programming";
            default:
                return "implements functionality specific to your application";
        }
    }
    
    // Simulate inline suggestions (for demo purposes)
    async simulateInlineSuggestions(prefix, context) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get current language from context
        let currentLanguage = 'javascript';
        
        const fileMetadata = context.find(item => item.type === 'fileMetadata');
        if (fileMetadata) {
            currentLanguage = fileMetadata.fileType;
        }
        
        // Generate suggestions based on prefix and language
        const suggestions = [];
        
        if (currentLanguage === 'javascript' || currentLanguage === 'js') {
            suggestions.push({
                label: 'function',
                insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
                documentation: 'Create a new function'
            });
            
            suggestions.push({
                label: 'arrow function',
                insertText: '(${1:params}) => {\n\t${2}\n}',
                documentation: 'Create a new arrow function'
            });
            
            suggestions.push({
                label: 'class',
                insertText: 'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n\n\t${4}\n}',
                documentation: 'Create a new class'
            });
            
            suggestions.push({
                label: 'async function',
                insertText: 'async function ${1:name}(${2:params}) {\n\t${3}\n}',
                documentation: 'Create a new async function'
            });
            
            suggestions.push({
                label: 'try/catch',
                insertText: 'try {\n\t${1}\n} catch (error) {\n\t${2}\n}',
                documentation: 'Create a try/catch block'
            });
        } else if (currentLanguage === 'css') {
            suggestions.push({
                label: 'flexbox',
                insertText: 'display: flex;\njustify-content: ${1:center};\nalign-items: ${2:center};',
                documentation: 'Create a flexbox container'
            });
            
            suggestions.push({
                label: 'media query',
                insertText: '@media (max-width: ${1:768px}) {\n\t${2}\n}',
                documentation: 'Create a media query for responsive design'
            });
            
            suggestions.push({
                label: 'animation',
                insertText: '@keyframes ${1:animationName} {\n\t0% {\n\t\t${2}\n\t}\n\t100% {\n\t\t${3}\n\t}\n}\n\n.${4:element} {\n\tanimation: ${1:animationName} ${5:1s} ease infinite;\n}',
                documentation: 'Create a CSS animation'
            });
        } else if (currentLanguage === 'html') {
            suggestions.push({
                label: 'form',
                insertText: '<form>\n\t<div>\n\t\t<label for="${1:input}">${2:Label}</label>\n\t\t<input type="${3:text}" id="${1:input}" name="${1:input}">\n\t</div>\n\t<button type="submit">${4:Submit}</button>\n</form>',
                documentation: 'Create an HTML form'
            });
            
            suggestions.push({
                label: 'table',
                insertText: '<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${1:Header 1}</th>\n\t\t\t<th>${2:Header 2}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>${3:Data 1}</td>\n\t\t\t<td>${4:Data 2}</td>\n\t\t</tr>\n\t</tbody>\n</table>',
                documentation: 'Create an HTML table'
            });
        }
        
        return suggestions;
    }
    
    // Simulate code explanation (for demo purposes)
    async simulateCodeExplanation(code) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, this would analyze the code and provide a detailed explanation
        return {
            type: 'explanation',
            explanation: `This code appears to ${this.getRandomExplanation()}.
            
In a real implementation, I would provide a detailed line-by-line explanation of what the code does, how it works, and any potential issues or improvements.`
        };
    }
    
    // Get a random explanation for demo purposes
    getRandomExplanation() {
        const explanations = [
            "define a function that processes data and returns a transformed result",
            "create a class that encapsulates related functionality and state",
            "implement an algorithm for sorting or searching data efficiently",
            "handle user events and update the UI accordingly",
            "fetch data from an API and process the response",
            "validate user input and provide feedback on errors",
            "manage application state using a pattern like Redux or Context API",
            "optimize performance by memoizing expensive calculations"
        ];
        
        return explanations[Math.floor(Math.random() * explanations.length)];
    }
    
    // Simulate refactoring suggestions (for demo purposes)
    async simulateRefactoringSuggestions(code, context) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // In a real implementation, this would analyze the code and provide specific refactoring suggestions
        return {
            type: 'refactoring',
            suggestions: [
                {
                    title: 'Extract Function',
                    description: 'Extract this code block into a separate function to improve readability and reusability.',
                    before: 'const result = items.map(item => {\n  const price = item.price * (1 - item.discount);\n  const tax = price * 0.08;\n  return price + tax;\n});',
                    after: 'function calculatePriceWithTax(item) {\n  const price = item.price * (1 - item.discount);\n  const tax = price * 0.08;\n  return price + tax;\n}\n\nconst result = items.map(item => calculatePriceWithTax(item));'
                },
                {
                    title: 'Use Destructuring',
                    description: 'Use object destructuring to make the code more concise and readable.',
                    before: 'function processUser(user) {\n  const name = user.name;\n  const email = user.email;\n  const age = user.age;\n  // ...\n}',
                    after: 'function processUser(user) {\n  const { name, email, age } = user;\n  // ...\n}'
                },
                {
                    title: 'Replace Loop with Array Method',
                    description: 'Replace imperative loop with declarative array method for cleaner code.',
                    before: 'const results = [];\nfor (let i = 0; i < items.length; i++) {\n  if (items[i].active) {\n    results.push(items[i].value);\n  }\n}',
                    after: 'const results = items\n  .filter(item => item.active)\n  .map(item => item.value);'
                }
            ]
        };
    }
}

// Export the AI service
window.aiService = new AIService().initialize();
