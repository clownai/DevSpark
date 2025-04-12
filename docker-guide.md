# Docker Development Guide for DevSpark IDE

This guide explains how to use Docker for development and production deployment of the DevSpark IDE.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine
- Git for version control

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/clownai/DevSpark.git
   cd DevSpark
   ```

2. Start the development environment:
   ```bash
   docker-compose up
   ```

   This will:
   - Build the Docker image for the application
   - Start the application in development mode with hot-reloading
   - Start a PostgreSQL database container for local development

3. Access the application:
   - The application will be available at http://localhost:3000

4. Development workflow:
   - Changes to the source code will automatically trigger a rebuild
   - The application will restart with your changes

## Production Deployment

To build and run the application for production:

1. Build the production Docker image:
   ```bash
   docker build -t devspark-ide:production .
   ```

2. Run the production container:
   ```bash
   docker run -p 3000:3000 -e NODE_ENV=production devspark-ide:production
   ```

## Docker Compose Configuration

The `docker-compose.yml` file includes:

- Application service with volume mounts for development
- Database service for local development
- Network configuration
- Volume definitions for persistent data

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `development` or `production`
- `PORT`: The port the application will listen on (default: 3000)
- `SUPABASE_URL`: URL for your Supabase instance
- `SUPABASE_KEY`: API key for your Supabase instance

## Troubleshooting

- If you encounter permission issues with volumes, try running:
  ```bash
  docker-compose down -v
  docker-compose up --build
  ```

- To view logs:
  ```bash
  docker-compose logs -f app
  ```

- To access a shell in the container:
  ```bash
  docker-compose exec app sh
  ```
