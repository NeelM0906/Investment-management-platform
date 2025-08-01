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

## Development Status

✅ **Task 1 Complete**: Project structure and core interfaces
- TypeScript interfaces for Project, ProjectFormData, ProjectFilters
- Basic Express server setup
- Project configuration (package.json, tsconfig.json)
- Directory structure for components, services, and repositories

✅ **Task 2 Complete**: File-based data storage and models
- JSON file-based storage system for projects data
- Data persistence using local JSON files (`data/projects.json`)
- Data validation and schema enforcement
- File I/O utilities with error handling
- Comprehensive test suite with 11 passing tests
- Sample data seeding functionality

## Next Steps

- Task 3: Create project data repository layer
- Task 4: Build project service layer with validation
- Task 5: Implement REST API endpoints