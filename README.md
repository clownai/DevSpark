# DevSpark IDE

An AI-integrated development environment that combines modern code editor features with AI assistance and streamlined deployment capabilities.

## Features

- **Modern Code Editor**: Built on Monaco Editor with syntax highlighting, code completion, and multi-language support
- **AI Integration**: Context-aware code suggestions, natural language commands, and AI chat assistant
- **Git Integration**: Source control panel, branch management, commit history, and diff viewer
- **Pull to Deploy**: Automatic deployment when changes are pushed to configured branches
- **1ClickApp**: Template-based application scaffolding for quick project creation
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/devspark-ide.git
cd devspark-ide

# Install dependencies
npm install

# Start the development server
npm run dev
```

Access the IDE at `http://localhost:3000`

## Usage

### Editor
- Open files from the file explorer
- Edit code in the Monaco Editor
- Use tabs to switch between open files
- Use the terminal for command-line operations

### AI Features
- Use the AI chat panel for assistance
- Type `/` in the editor for AI commands
- Receive inline code suggestions as you type

### Git Operations
- View changed files in the source control panel
- Stage and commit changes
- Switch branches
- View commit history

### Deployment
- Configure deployment environments
- Use "Pull to Deploy" for automatic deployments
- View deployment history and logs

### Application Scaffolding
- Browse available templates
- Configure project parameters
- Generate new applications
- Deploy generated applications

## Documentation

For detailed documentation, see the [Documentation](docs/documentation.md) file.

## Architecture

DevSpark IDE follows a client-server architecture:

- **Frontend**: HTML/CSS/JavaScript-based UI with Monaco Editor
- **Backend**: Node.js/Express server with RESTful API endpoints

## Development

### Project Structure
```
DevSpark/
├── docs/
│   ├── architecture.md
│   └── documentation.md
├── src/
│   ├── components/
│   │   ├── ai-integration-ui.js
│   │   ├── git-integration-ui.js
│   │   ├── deployment-ui.js
│   │   └── scaffolding-ui.js
│   ├── services/
│   │   ├── api-service.js
│   │   ├── ai-service.js
│   │   ├── git-service.js
│   │   ├── deployment-service.js
│   │   └── scaffolding-service.js
│   ├── styles/
│   │   └── main.css
│   ├── backend/
│   │   └── server.js
│   ├── scripts/
│   │   └── main.js
│   └── index.html
└── package.json
```

### Building

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For support or inquiries, please contact the DevSpark team.
