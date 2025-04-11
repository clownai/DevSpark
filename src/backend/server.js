// DevSpark IDE - Backend Server
// This file contains the Node.js/Express server implementation for DevSpark IDE

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const axios = require('axios');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
// File Operations
app.get('/api/files', (req, res) => {
    const dirPath = req.query.path || process.cwd();
    
    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        const fileList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            path: path.join(dirPath, file.name),
            extension: file.isDirectory() ? null : path.extname(file.name).slice(1)
        }));
        
        res.json({ success: true, files: fileList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/files/:filePath(*)', (req, res) => {
    const filePath = req.params.filePath;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/files/:filePath(*)', (req, res) => {
    const filePath = req.params.filePath;
    const { content } = req.body;
    
    try {
        // Create directory if it doesn't exist
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content);
        res.json({ success: true, message: 'File saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/files/:filePath(*)', (req, res) => {
    const filePath = req.params.filePath;
    
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                fs.rmdirSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
            
            res.json({ success: true, message: 'File deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// AI Services
app.post('/api/ai/chat', async (req, res) => {
    const { message, context } = req.body;
    
    try {
        // In a real implementation, this would call an AI API like OpenAI
        // For now, we'll return a simulated response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = {
            type: 'text',
            message: `I received your message: "${message}". In a real implementation, this would be processed by an AI service.`
        };
        
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/ai/inline', async (req, res) => {
    const { prefix, context } = req.body;
    
    try {
        // In a real implementation, this would call an AI API for code completion
        // For now, we'll return simulated suggestions
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const suggestions = [
            {
                label: 'function example',
                insertText: 'function example() {\n\t// TODO: Implement\n}',
                documentation: 'Create a new function'
            },
            {
                label: 'console.log',
                insertText: 'console.log(${1:message});',
                documentation: 'Log a message to the console'
            }
        ];
        
        res.json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/ai/command', async (req, res) => {
    const { command, context } = req.body;
    
    try {
        // In a real implementation, this would process natural language commands
        // For now, we'll return a simulated response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = {
            type: 'text',
            message: `I received your command: "${command}". In a real implementation, this would be processed by an AI service.`
        };
        
        res.json({ success: true, response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Git Operations
app.get('/api/git/status', (req, res) => {
    const repoPath = req.query.path || process.cwd();
    
    exec('git status --porcelain', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: stderr });
        }
        
        const status = {
            modified: [],
            added: [],
            deleted: [],
            untracked: []
        };
        
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            if (!line) return;
            
            const statusCode = line.substring(0, 2);
            const filePath = line.substring(3);
            
            if (statusCode.includes('M')) {
                status.modified.push(filePath);
            } else if (statusCode.includes('A')) {
                status.added.push(filePath);
            } else if (statusCode.includes('D')) {
                status.deleted.push(filePath);
            } else if (statusCode.includes('??')) {
                status.untracked.push(filePath);
            }
        });
        
        res.json({ success: true, status });
    });
});

app.get('/api/git/branches', (req, res) => {
    const repoPath = req.query.path || process.cwd();
    
    exec('git branch', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: stderr });
        }
        
        const branches = [];
        const lines = stdout.trim().split('\n');
        let currentBranch = '';
        
        lines.forEach(line => {
            if (!line) return;
            
            const isCurrent = line.startsWith('*');
            const branchName = line.replace('*', '').trim();
            
            branches.push({
                name: branchName,
                isCurrent
            });
            
            if (isCurrent) {
                currentBranch = branchName;
            }
        });
        
        res.json({ success: true, branches, currentBranch });
    });
});

app.post('/api/git/commit', (req, res) => {
    const { message, repoPath } = req.body;
    const cwd = repoPath || process.cwd();
    
    if (!message) {
        return res.status(400).json({ success: false, message: 'Commit message is required' });
    }
    
    exec(`git commit -m "${message}"`, { cwd }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: stderr });
        }
        
        res.json({ success: true, message: 'Changes committed successfully', output: stdout });
    });
});

app.post('/api/git/push', (req, res) => {
    const { remote, branch, repoPath } = req.body;
    const cwd = repoPath || process.cwd();
    const remoteName = remote || 'origin';
    const branchName = branch || 'main';
    
    exec(`git push ${remoteName} ${branchName}`, { cwd }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: stderr });
        }
        
        res.json({ success: true, message: 'Changes pushed successfully', output: stdout });
    });
});

// Deployment
app.post('/api/deploy/trigger', (req, res) => {
    const { environmentId, options } = req.body;
    
    // In a real implementation, this would trigger a deployment process
    // For now, we'll simulate a deployment
    
    const deployment = {
        id: `deploy-${Date.now()}`,
        environmentId,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        endTime: null,
        logs: [
            { time: new Date().toISOString(), level: 'info', message: 'Starting deployment process' }
        ]
    };
    
    // Simulate deployment process
    setTimeout(() => {
        deployment.logs.push({ time: new Date().toISOString(), level: 'info', message: 'Building application...' });
    }, 1000);
    
    setTimeout(() => {
        deployment.logs.push({ time: new Date().toISOString(), level: 'info', message: 'Build successful' });
    }, 3000);
    
    setTimeout(() => {
        deployment.logs.push({ time: new Date().toISOString(), level: 'info', message: 'Deploying to server...' });
    }, 4000);
    
    setTimeout(() => {
        deployment.logs.push({ time: new Date().toISOString(), level: 'success', message: 'Deployment successful' });
        deployment.status = 'success';
        deployment.endTime = new Date().toISOString();
    }, 6000);
    
    res.json({ success: true, message: 'Deployment triggered', deployment });
});

app.get('/api/deploy/status/:id', (req, res) => {
    const deploymentId = req.params.id;
    
    // In a real implementation, this would fetch the deployment status from a database
    // For now, we'll return a simulated status
    
    res.json({
        success: true,
        status: 'in_progress',
        message: 'Deployment in progress'
    });
});

app.get('/api/deploy/logs/:id', (req, res) => {
    const deploymentId = req.params.id;
    
    // In a real implementation, this would fetch the deployment logs from a database
    // For now, we'll return simulated logs
    
    const logs = [
        { time: new Date(Date.now() - 5000).toISOString(), level: 'info', message: 'Starting deployment process' },
        { time: new Date(Date.now() - 4000).toISOString(), level: 'info', message: 'Building application...' },
        { time: new Date(Date.now() - 2000).toISOString(), level: 'info', message: 'Build successful' },
        { time: new Date(Date.now() - 1000).toISOString(), level: 'info', message: 'Deploying to server...' }
    ];
    
    res.json({ success: true, logs });
});

// Application Scaffolding
app.get('/api/templates', (req, res) => {
    // In a real implementation, this would fetch templates from a database
    // For now, we'll return simulated templates
    
    const templates = [
        {
            id: 'react-app',
            name: 'React Application',
            description: 'Modern React application with TypeScript, React Router, and styled-components',
            category: 'frontend',
            popularity: 4.8,
            tags: ['react', 'typescript', 'frontend']
        },
        {
            id: 'node-api',
            name: 'Node.js API',
            description: 'RESTful API with Express, MongoDB, and JWT authentication',
            category: 'backend',
            popularity: 4.6,
            tags: ['node', 'express', 'api', 'backend']
        },
        {
            id: 'nextjs-app',
            name: 'Next.js Application',
            description: 'Full-stack React framework with server-side rendering and API routes',
            category: 'fullstack',
            popularity: 4.9,
            tags: ['react', 'nextjs', 'fullstack']
        }
    ];
    
    res.json({ success: true, templates });
});

app.post('/api/templates/generate', (req, res) => {
    const { templateId, parameters } = req.body;
    
    // In a real implementation, this would generate a project from a template
    // For now, we'll simulate the generation process
    
    const template = {
        id: templateId,
        status: 'generating',
        startTime: new Date().toISOString(),
        parameters
    };
    
    // Simulate generation process
    setTimeout(() => {
        template.status = 'completed';
        template.endTime = new Date().toISOString();
    }, 5000);
    
    res.json({ success: true, message: 'Project generation started', template });
});

// Terminal
app.post('/api/terminal/execute', (req, res) => {
    const { command, cwd } = req.body;
    
    exec(command, { cwd: cwd || process.cwd() }, (error, stdout, stderr) => {
        res.json({
            success: !error,
            stdout,
            stderr,
            error: error ? error.message : null
        });
    });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`DevSpark IDE backend server running on port ${port}`);
});

module.exports = app;
