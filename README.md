# Investment Management Portal

A comprehensive platform for investment managers to create customizable dashboards and manage key business operations.

## Features

- **Projects Management**: Create, edit, delete, and manage investment projects
- **Customizable Dashboards**: Logo, name, background, and welcome images
- Future features: Contacts, Accounts, Fundraising, Tasks, Documents, Reports

## Project Structure

```
investment-management-portal/
├── src/
│   ├── types/           # TypeScript interfaces and types
│   ├── services/        # Business logic services
│   └── repositories/    # Data access layer
├── server/              # Express.js backend
├── client/              # React frontend (to be created)
└── docs/                # Documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/projects` - Projects API (placeholder)

### Testing

Run tests with:
```bash
npm test
```
