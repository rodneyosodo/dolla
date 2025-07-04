<img src="apps/dashboard/public/logo-black.png" alt="Logo" width="200" style="display: block; margin: 0 auto; padding: 20px 0;">

Personal finance platform. Track, optimize and manage your money through every
stage of life

Currently, this platfrom is in early development and is not ready for production use.

## Development

This platform consists of three main services:

- Dashboard app (next.js)
- Backend API service (golang)
- PDF extractor service (python)

### Prerequisites

- [Node.js](https://nodejs.org/en)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)
- [GNU Make](https://www.gnu.org/software/make/)
- [Go](https://go.dev/)
- [Python](https://www.python.org/)

### Getting started

1. Build the docker images

   ```bash
   make all
   ```

2. Populate the environment variables in the `.env` file. [Clerk](https://clerk.com/) secrets are required for the dashboard app.

   ```bash
   cp example.env .env
   ```

3. Start the services:

   ```bash
   docker compose up
   ```
