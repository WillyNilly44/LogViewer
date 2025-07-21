# LogViewer

A web application for viewing and analyzing data from AWS databases, deployable on Render.

## Features

- Connect to AWS RDS databases
- Real-time data visualization
- Responsive web interface
- Cloud deployment ready

## Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **Database**: AWS RDS (PostgreSQL/MySQL)
- **Deployment**: Render

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- AWS RDS database instance
- Render account for deployment

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd LogViewer
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Fill in your AWS database credentials

4. Run the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the `server` directory with:

```
NODE_ENV=development
PORT=5000
DB_HOST=your-aws-rds-endpoint
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_SSL=true
```

## Deployment

This application is configured for deployment on Render. The build script will automatically:
1. Build the React frontend
2. Serve static files through Express
3. Connect to your AWS RDS instance

## Project Structure

```
LogViewer/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package.json
└── README.md
```
