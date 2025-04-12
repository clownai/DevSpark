// DevSpark IDE - Backend Server
// This file contains the Node.js/Express server implementation for DevSpark IDE
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import { FileEntry, FileOperation, ApiResponse } from '../types';

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
app.get('/api/files', (req: Request, res: Response) => {
    const dirPath = req.query.path as string || process.cwd();
    
    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        const fileList: FileEntry[] = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            path: path.join(dirPath, file.name),
            extension: file.isDirectory() ? null : path.extname(file.name).slice(1)
        }));
        
        res.json({ success: true, files: fileList });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

app.get('/api/files/:filePath(*)', (req: Request, res: Response) => {
    const filePath = req.params.filePath;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({ success: true, content });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

app.post('/api/files/:filePath(*)', (req: Request, res: Response) => {
    const filePath = req.params.filePath;
    const { content } = req.body;
    
    try {
        // Ensure the directory exists
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        res.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

app.delete('/api/files/:filePath(*)', (req: Request, res: Response) => {
    const filePath = req.params.filePath;
    
    try {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                fs.rmdirSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
            
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'File or directory not found' });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

// Git Operations
app.post('/api/git/clone', (req: Request, res: Response) => {
    const { repoUrl, targetDir } = req.body;
    
    if (!repoUrl || !targetDir) {
        return res.status(400).json({ success: false, message: 'Repository URL and target directory are required' });
    }
    
    exec(`git clone ${repoUrl} ${targetDir}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.json({ success: true, output: stdout });
    });
});

app.post('/api/git/pull', (req: Request, res: Response) => {
    const { repoDir } = req.body;
    
    if (!repoDir) {
        return res.status(400).json({ success: false, message: 'Repository directory is required' });
    }
    
    exec(`cd ${repoDir} && git pull`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.json({ success: true, output: stdout });
    });
});

// Deployment Operations
app.post('/api/deploy', (req: Request, res: Response) => {
    const { projectDir, deploymentType } = req.body;
    
    if (!projectDir || !deploymentType) {
        return res.status(400).json({ success: false, message: 'Project directory and deployment type are required' });
    }
    
    // Simple deployment script - in a real app, this would be more sophisticated
    let deployCmd = '';
    
    switch (deploymentType) {
        case 'static':
            deployCmd = `cd ${projectDir} && npm run build`;
            break;
        case 'node':
            deployCmd = `cd ${projectDir} && npm run build && pm2 restart app || pm2 start npm --name "app" -- start`;
            break;
        default:
            return res.status(400).json({ success: false, message: 'Unsupported deployment type' });
    }
    
    exec(deployCmd, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        
        res.json({ success: true, output: stdout });
    });
});

// AI Integration
app.post('/api/ai/complete', async (req: Request, res: Response) => {
    const { prompt, context } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    
    try {
        // This is a placeholder for actual AI integration
        // In a real app, this would call an AI service API
        const completion = `// AI-generated code for: ${prompt}\n\nfunction example() {\n  console.log("This is a placeholder for AI-generated code");\n  // Add your implementation here\n}\n`;
        
        res.json({ success: true, completion });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, message: errorMessage });
    }
});

// Catch-all route to serve the frontend
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`DevSpark IDE server running on port ${port}`);
});

export default app;
