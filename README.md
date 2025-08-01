# Investment Management Portal

A comprehensive platform for investment managers to create customizable dashboards and manage key business operations.

## Features

- **Projects Management**: Create, edit, delete, and manage investment projects
- **Customizable Dashboards**: Logo, name, background, and welcome images
- Future features: Contacts, Accounts, Fundraising, Tasks, Documents, Reports

## Project Structure

```
investment-management-portal/
├── backend/
│   ├── src/
│   │   ├── routes/      # Express.js API routes
│   │   ├── services/    # Business logic services
│   │   ├── repositories/# Data access layer
│   │   ├── models/      # Data models
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── server.js        # Backend entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Frontend utilities
│   ├── package.json
│   └── public/          # Static assets
├── data/                # JSON file storage
└── uploads/             # File uploads
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start both backend and frontend:
   ```bash
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Backend only (port 3001)
   npm run backend:dev
   
   # Frontend only (port 3000)
   npm run frontend:dev
   ```

### API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/projects` - Projects API (placeholder)

### Testing

Run tests with:
```bash
npm test
```
