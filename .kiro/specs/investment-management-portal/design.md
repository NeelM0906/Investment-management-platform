# Design Document

## Overview

The Projects feature is the foundational component of the Investment Management Portal, providing administrators with comprehensive project management capabilities. The design follows a modern web application architecture with a clean separation of concerns, focusing on usability, data integrity, and scalability for future features.

## Architecture

The Projects feature will be implemented using a three-tier architecture:

- **Presentation Layer**: React-based user interface with responsive design
- **Business Logic Layer**: Service layer handling validation, business rules, and data transformation
- **Data Layer**: Repository pattern with database abstraction for project persistence

### Technology Stack
- Frontend: React with TypeScript for type safety
- State Management: React Context API or Redux Toolkit for complex state
- Styling: CSS Modules or Styled Components for component-scoped styling
- Backend: Node.js with Express.js framework
- Database: PostgreSQL for relational data with proper indexing
- Validation: Joi or Yup for schema validation

## Components and Interfaces

### Core Components

#### ProjectList Component
- Displays paginated list of projects in a table format
- Includes search and filter functionality
- Provides action buttons for each project (View, Edit, Delete)
- Handles loading states and empty states

#### ProjectForm Component
- Reusable form for both creating and editing projects
- Implements real-time validation with error display
- Handles form submission and loading states
- Supports both create and update modes

#### ProjectDetails Component
- Enhanced project information view with commitment and reservation tracking
- Displays all project fields in a structured layout with KPI dashboard
- Provides inline editing capabilities for commitment and reservation data
- Shows real-time funding progress and investor metrics
- Provides navigation to edit mode

#### CommitmentTracker Component
- Manages investor commitment data (amounts and counts)
- Provides inline editing with validation
- Updates KPIs in real-time when data changes
- Handles commitment addition, editing, and removal

#### ReservationTracker Component
- Manages investor reservation data (amounts and counts)
- Provides inline editing with validation
- Updates potential funding metrics in real-time
- Handles reservation addition, editing, and removal

#### ProjectKPIPanel Component
- Displays key performance indicators in a dashboard format
- Shows total commitments, committed amount, funding percentage, and days remaining
- Auto-updates when underlying data changes
- Provides visual progress indicators and charts

#### DebtEquityClassesList Component
- Displays all debt and equity classes for a specific project
- Shows empty state message when no classes exist
- Provides action buttons for each class (Edit, Delete)
- Includes "Add New Class" button to create new classes

#### DebtEquityClassForm Component
- Reusable form for creating and editing debt/equity classes
- Implements Unit Class dropdown with "Class A" and "Create your own" options
- Handles custom class name creation and persistence
- Provides toggle switch for investment availability
- Validates all numerical inputs (Unit Price, Investment Increment, Min/Max Investment)
- Supports both create and update modes

#### CustomClassManager Component
- Manages creation and storage of custom unit class names
- Provides interface for entering new class names
- Validates class name uniqueness and format
- Persists custom classes for reuse across projects

#### SearchAndFilter Component
- Search input with debounced search functionality
- Filter dropdowns for project status and timeframe
- Clear filters functionality

### Deal Room Components

#### DealRoomPage Component
- Main container for deal room management interface
- Left sidebar navigation with five sections: Showcase Photo, Investment Blurb, Investment Summary, Key Info, External Links
- Content area displaying the selected section's form
- Real-time preview integration with investor dashboard
- Auto-save functionality for seamless user experience

#### ShowcasePhotoManager Component
- Image upload interface with drag-and-drop functionality
- Image preview with crop and resize capabilities
- Support for multiple image formats (JPEG, PNG, WebP)
- Image optimization and compression
- Replace/remove existing showcase photo functionality

#### InvestmentBlurbEditor Component
- Rich text editor for short investment summary
- Character limit enforcement (recommended 150-300 characters)
- Real-time preview of formatted text
- Auto-save functionality with draft management
- Validation for required content

#### InvestmentSummaryEditor Component
- Comprehensive rich text editor for detailed investment information
- Support for formatting (bold, italic, lists, links)
- Section templates for common investment summary structures
- Document-style editing with headings and paragraphs
- Auto-save with version history

#### KeyInfoManager Component
- Dynamic list management for key information items
- Add/edit/delete functionality for info name and link pairs
- URL validation for info links
- Drag-and-drop reordering of key info items
- Support for various link types (documents, websites, videos)

#### ExternalLinksManager Component
- Dynamic list management for external links
- Add/edit/delete functionality for link name and URL pairs
- URL validation and link testing
- Link categorization (optional)
- Preview functionality for external links

#### DealRoomPreview Component
- Real-time preview of deal room content as it appears to investors
- Responsive preview showing mobile and desktop layouts
- Integration with investor dashboard styling
- Preview mode toggle for different investor portal themes

### Data Interfaces

```typescript
interface Project {
  id: string;
  projectName: string;
  legalProjectName: string;
  unitCalculationPrecision: number;
  targetAmount: number;
  currency: string;
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  commitments: {
    totalAmount: number;
    investorCount: number;
  };
  reservations: {
    totalAmount: number;
    investorCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectFormData {
  projectName: string;
  legalProjectName: string;
  unitCalculationPrecision: number;
  targetAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
}

interface CommitmentReservationData {
  commitments: {
    totalAmount: number;
    investorCount: number;
  };
  reservations: {
    totalAmount: number;
    investorCount: number;
  };
}

interface ProjectKPIs {
  totalCommitments: number;
  totalCommittedAmount: number;
  fundingPercentage: number;
  daysRemaining: number;
  currency: string;
}

interface ProjectFilters {
  searchTerm: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fundingStatus?: 'all' | 'funded' | 'partial' | 'unfunded';
}

interface DebtEquityClass {
  id: string;
  projectId: string;
  unitClass: string;
  unitPrice: number;
  isOpenToInvestments: boolean;
  investmentIncrementAmount: number;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DebtEquityClassFormData {
  unitClass: string;
  unitPrice: number;
  isOpenToInvestments: boolean;
  investmentIncrementAmount: number;
  minInvestmentAmount: number;
  maxInvestmentAmount: number;
}

interface CustomUnitClass {
  id: string;
  name: string;
  createdAt: Date;
}

interface DealRoom {
  id: string;
  projectId: string;
  showcasePhoto?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  };
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: KeyInfoItem[];
  externalLinks: ExternalLink[];
  createdAt: Date;
  updatedAt: Date;
}

interface KeyInfoItem {
  id: string;
  name: string;
  link: string;
  order: number;
}

interface ExternalLink {
  id: string;
  name: string;
  url: string;
  order: number;
}

interface DealRoomFormData {
  showcasePhoto?: File;
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: Omit<KeyInfoItem, 'id'>[];
  externalLinks: Omit<ExternalLink, 'id'>[];
}

interface InvestorDashboardData {
  project: Project;
  dealRoom: DealRoom;
  companyProfile: CompanyProfile;
  investorPortal: InvestorPortal;
  debtEquityClasses: DebtEquityClass[];
  kpis: ProjectKPIs;
}
```

### API Endpoints

- `GET /api/projects` - Retrieve paginated list of projects with optional filters
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Retrieve specific project details
- `PUT /api/projects/:id` - Update existing project
- `DELETE /api/projects/:id` - Delete project
- `PUT /api/projects/:id/commitments` - Update project commitment data (amount and investor count)
- `PUT /api/projects/:id/reservations` - Update project reservation data (amount and investor count)
- `GET /api/projects/:id/kpis` - Retrieve calculated KPIs for a specific project
- `GET /api/projects/:id/debt-equity-classes` - Retrieve all debt and equity classes for a specific project
- `POST /api/projects/:id/debt-equity-classes` - Create a new debt or equity class for a project
- `PUT /api/debt-equity-classes/:classId` - Update an existing debt or equity class
- `DELETE /api/debt-equity-classes/:classId` - Delete a debt or equity class
- `GET /api/custom-unit-classes` - Retrieve all custom unit class names
- `POST /api/custom-unit-classes` - Create a new custom unit class name
- `GET /api/projects/:id/deal-room` - Retrieve deal room data for a specific project
- `PUT /api/projects/:id/deal-room` - Update deal room data for a project
- `POST /api/projects/:id/deal-room/showcase-photo` - Upload showcase photo for deal room
- `DELETE /api/projects/:id/deal-room/showcase-photo` - Remove showcase photo from deal room
- `GET /api/projects/:id/investor-dashboard` - Retrieve complete investor dashboard data
- `GET /api/deal-room/:id/preview` - Get deal room preview data for investor dashboard

## Data Models

### Project Entity
- **id**: UUID primary key
- **project_name**: VARCHAR(255), NOT NULL, indexed for search
- **legal_project_name**: VARCHAR(255), NOT NULL
- **unit_calculation_precision**: INTEGER, DEFAULT 2, CHECK (value >= 0 AND value <= 10)
- **target_amount**: DECIMAL(15,2), NOT NULL, CHECK (value > 0)
- **currency**: VARCHAR(3), DEFAULT 'USD'
- **start_date**: DATE, NOT NULL
- **end_date**: DATE, NOT NULL, CHECK (end_date > start_date)
- **commitments_total_amount**: DECIMAL(15,2), DEFAULT 0, CHECK (value >= 0)
- **commitments_investor_count**: INTEGER, DEFAULT 0, CHECK (value >= 0)
- **reservations_total_amount**: DECIMAL(15,2), DEFAULT 0, CHECK (value >= 0)
- **reservations_investor_count**: INTEGER, DEFAULT 0, CHECK (value >= 0)
- **created_at**: TIMESTAMP, DEFAULT NOW()
- **updated_at**: TIMESTAMP, DEFAULT NOW()

### Debt & Equity Class Entity
- **id**: UUID primary key
- **project_id**: UUID, NOT NULL, foreign key to projects table
- **unit_class**: VARCHAR(100), NOT NULL
- **unit_price**: DECIMAL(15,2), NOT NULL, CHECK (value > 0)
- **is_open_to_investments**: BOOLEAN, DEFAULT true
- **investment_increment_amount**: DECIMAL(15,2), NOT NULL, CHECK (value > 0)
- **min_investment_amount**: DECIMAL(15,2), NOT NULL, CHECK (value > 0)
- **max_investment_amount**: DECIMAL(15,2), NOT NULL, CHECK (value > 0)
- **created_at**: TIMESTAMP, DEFAULT NOW()
- **updated_at**: TIMESTAMP, DEFAULT NOW()

### Custom Unit Class Entity
- **id**: UUID primary key
- **name**: VARCHAR(100), NOT NULL, UNIQUE
- **created_at**: TIMESTAMP, DEFAULT NOW()

### Deal Room Entity
- **id**: UUID primary key
- **project_id**: UUID, NOT NULL, foreign key to projects table, UNIQUE
- **showcase_photo_filename**: VARCHAR(255), NULL
- **showcase_photo_original_name**: VARCHAR(255), NULL
- **showcase_photo_mime_type**: VARCHAR(100), NULL
- **showcase_photo_size**: INTEGER, NULL
- **showcase_photo_uploaded_at**: TIMESTAMP, NULL
- **investment_blurb**: TEXT, DEFAULT ''
- **investment_summary**: TEXT, DEFAULT ''
- **created_at**: TIMESTAMP, DEFAULT NOW()
- **updated_at**: TIMESTAMP, DEFAULT NOW()

### Deal Room Key Info Entity
- **id**: UUID primary key
- **deal_room_id**: UUID, NOT NULL, foreign key to deal_rooms table
- **name**: VARCHAR(255), NOT NULL
- **link**: TEXT, NOT NULL
- **order_index**: INTEGER, NOT NULL, DEFAULT 0
- **created_at**: TIMESTAMP, DEFAULT NOW()

### Deal Room External Links Entity
- **id**: UUID primary key
- **deal_room_id**: UUID, NOT NULL, foreign key to deal_rooms table
- **name**: VARCHAR(255), NOT NULL
- **url**: TEXT, NOT NULL
- **order_index**: INTEGER, NOT NULL, DEFAULT 0
- **created_at**: TIMESTAMP, DEFAULT NOW()

### Database Constraints
- Unique constraint on project_name to prevent duplicates
- Check constraint ensuring end_date is after start_date
- Check constraint ensuring min_investment_amount <= max_investment_amount for debt/equity classes
- Check constraint ensuring investment_increment_amount <= min_investment_amount for debt/equity classes
- Index on project_name and legal_project_name for search performance
- Index on created_at for sorting
- Index on project_id for debt/equity classes for efficient project-based queries
- Foreign key constraint on debt_equity_classes.project_id referencing projects.id

## Error Handling

### Client-Side Error Handling
- Form validation errors displayed inline with specific field context
- Network errors shown with retry mechanisms
- Loading states with skeleton screens for better UX
- Toast notifications for success/error feedback

### Server-Side Error Handling
- Input validation using schema validation library
- Database constraint violations mapped to user-friendly messages
- Proper HTTP status codes (400 for validation, 404 for not found, 500 for server errors)
- Structured error responses with error codes and messages

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

## Testing Strategy

### Unit Testing
- Component testing using React Testing Library
- Service layer testing with mocked dependencies
- Validation logic testing with edge cases
- Database repository testing with test database

### Integration Testing
- API endpoint testing with supertest
- Database integration testing
- Form submission end-to-end flows

### Test Coverage Goals
- Minimum 80% code coverage for business logic
- 100% coverage for validation functions
- Critical path testing for CRUD operations

### Testing Tools
- Jest for unit testing framework
- React Testing Library for component testing
- Supertest for API testing
- Test containers for database testing

## Security Considerations

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention through parameterized queries
- XSS prevention through proper output encoding

### Authentication & Authorization
- Admin role verification for all project operations
- Session-based authentication with secure cookies
- CSRF protection for state-changing operations

### Data Protection
- Sensitive project data encrypted at rest
- Audit logging for all project modifications
- Backup and recovery procedures for project data