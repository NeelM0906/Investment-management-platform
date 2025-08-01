# Implementation Plan

- [x] 1. Set up project structure and core interfaces
  - Create directory structure for components, services, types, and API routes
  - Define TypeScript interfaces for Project, ProjectFormData, and ProjectFilters
  - Set up basic project configuration files (package.json, tsconfig.json)
  - _Requirements: 1.1, 2.1_

- [x] 2. Implement file-based data storage and models
  - Create JSON file-based storage system for projects data
  - Implement data persistence using local JSON files
  - Add data validation and schema enforcement
  - Write file I/O utilities and error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4_

- [x] 3. Create project data repository layer
  - Implement ProjectRepository class with CRUD operations
  - Write methods for create, read, update, delete, and search functionality
  - Add pagination support for project listing
  - Implement search and filter query building
  - Write unit tests for repository methods
  - _Requirements: 1.1, 3.1, 4.1, 6.1, 6.2, 6.3_

- [x] 4. Build project service layer with validation
  - Create ProjectService class with business logic
  - Implement input validation using schema validation library
  - Add data transformation and formatting logic
  - Write error handling and validation error mapping
  - Create unit tests for service layer methods
  - _Requirements: 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement REST API endpoints
  - Create Express.js routes for all project CRUD operations
  - Implement GET /api/projects with pagination and filtering
  - Implement POST /api/projects for project creation
  - Implement GET /api/projects/:id for project details
  - Implement PUT /api/projects/:id for project updates
  - Implement DELETE /api/projects/:id for project deletion
  - Add proper error handling and HTTP status codes
  - Write integration tests for all API endpoints
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

- [x] 6. Create reusable UI components and pages
  - Build ProjectForm component with form validation (completed in CreateProjectPage)
  - Create SearchAndFilter component with debounced search (completed in ProjectsPage)
  - Implement LoadingSpinner and ErrorMessage components (completed in CSS)
  - Build project management pages with routing (Dashboard, ProjectsPage, CreateProjectPage, ProjectDetailsPage)
  - Add responsive styling and accessibility features
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.5, 6.1, 6.2, 6.4_

- [x] 7. Create API client service for frontend integration
  - Create API client service for project operations (integrated directly in components)
  - Implement error handling and loading states
  - Add form submission with success/error feedback
  - Integrate search and filter functionality with API
  - Handle network errors and retry mechanisms
  - Add toast notifications for user feedback (using browser alerts for now)
  - _Requirements: 1.2, 1.3, 1.4, 3.2, 3.3, 4.2, 4.3, 5.5, 6.1, 6.2_

- [x] 8. Implement EditProjectPage component
  - Create EditProjectPage with pre-populated form
  - Add form validation and error handling
  - Implement update functionality with API integration
  - Add navigation and cancel functionality
  - Write component tests for edit functionality
  - _Requirements: 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Implement delete functionality with confirmation
  - Add delete confirmation dialog component
  - Implement safe deletion with proper error handling
  - Add warning messages for projects with associated data
  - Handle deletion success and error states
  - Update project list after successful deletion
  - Write tests for delete confirmation and execution flows
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Extend data models for commitment and reservation tracking
  - Update Project interface to include commitments and reservations fields
  - Modify file storage system to handle new commitment and reservation data
  - Update ProjectRepository to support commitment and reservation operations
  - Add validation for commitment and reservation data (positive numbers, valid counts)
  - Update existing projects in JSON file with default commitment/reservation values
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.3, 9.4_

- [x] 11. Implement commitment and reservation API endpoints
  - Create PUT /api/projects/:id/commitments endpoint for updating commitment data
  - Create PUT /api/projects/:id/reservations endpoint for updating reservation data
  - Create GET /api/projects/:id/kpis endpoint for calculated KPIs
  - Add validation for commitment and reservation update requests
  - Implement proper error handling for invalid commitment/reservation data
  - Write integration tests for new API endpoints
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.5_

- [x] 12. Build enhanced ProjectDetails page with KPI dashboard
  - Redesign ProjectDetails page with left sidebar for project info and main area for KPIs
  - Create ProjectKPIPanel component showing total commitments, committed amount, funding percentage, and days remaining
  - Implement CommitmentTracker component with inline editing capabilities
  - Implement ReservationTracker component with inline editing capabilities
  - Add real-time KPI calculation and updates when commitment/reservation data changes
  - Ensure all commitment and reservation fields are easily editable by users
  - _Requirements: 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.5_

- [x] 13. Implement inline editing for commitments and reservations
  - Add inline editing functionality for commitment amounts and investor counts
  - Add inline editing functionality for reservation amounts and investor counts
  - Implement real-time validation for edited values (positive numbers, valid counts)
  - Add save/cancel functionality for inline edits
  - Update KPIs immediately when commitment or reservation data is saved
  - Add loading states and success/error feedback for inline edits
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 14. Create Company Profile data models and storage
  - Define CompanyProfile interface with fields: name, email, address, city, state, country, zipCode, phoneNumber
  - Create file-based storage system for company profile data
  - Implement CompanyProfileRepository with CRUD operations
  - Add validation for company profile fields (email format, phone format, required fields)
  - Create CompanyProfileService with business logic and validation
  - _Requirements: Company profile data management_

- [x] 15. Implement Company Profile management page
  - Create CompanyProfilePage component with editable form
  - Implement inline editing for all company profile fields
  - Add form validation with real-time feedback
  - Implement save/cancel functionality with loading states
  - Add success/error notifications for profile updates
  - Create responsive design for company profile management
  - _Requirements: Company profile editing interface_

- [x] 16. Create Investor Portal data models and storage
  - Define InvestorPortal interface with login page assets, branding, welcome message, and metrics
  - Create file upload system for logo and background images
  - Implement image storage and retrieval with proper file handling
  - Create InvestorPortalRepository for portal configuration data
  - Add validation for image uploads (file types, sizes, dimensions)
  - Create InvestorPortalService with business logic
  - _Requirements: Investor portal configuration management_

- [x] 17. Build Investor Portal configuration interface
  - Create InvestorPortalPage with tabbed navigation (Login Page, Branding, Welcome Message, Metrics)
  - Implement Login Page tab with logo and background image upload functionality
  - Add image preview and crop/resize capabilities
  - Create Branding tab with logo selection and background color picker
  - Implement Welcome Message tab with rich text editor
  - Build Metrics tab with predefined metrics selection and custom metrics creation
  - _Requirements: Investor portal customization interface_

- [ ] 18. Implement file upload and image management system
  - Create secure file upload API endpoints for images
  - Implement image processing (resize, compress, format conversion)
  - Add file validation and security checks
  - Create image gallery component for asset management
  - Implement drag-and-drop upload functionality
  - Add progress indicators and error handling for uploads
  - _Requirements: File upload and image management_

- [ ] 19. Build investor-facing portal dashboard
  - Create beautiful, professional InvestorDashboard component
  - Implement responsive design optimized for investor viewing
  - Display company profile information elegantly
  - Show selected metrics with professional data visualization
  - Apply custom branding (logo, colors, background)
  - Display welcome message prominently
  - Add project showcase with key metrics and progress indicators
  - _Requirements: Professional investor-facing dashboard_

- [ ] 20. Create portal preview and publishing system
  - Implement "View Portal" functionality to preview investor dashboard
  - Create portal URL generation and sharing capabilities
  - Add portal publishing workflow with validation checks
  - Implement portal versioning and rollback functionality
  - Create portal analytics and visitor tracking
  - Add portal customization preview in real-time
  - _Requirements: Portal preview and publishing_

- [ ] 21. Integrate Company Profile and Investor Portal with existing project data
  - Connect investor portal metrics with real project data
  - Implement dynamic KPI calculations for investor dashboard
  - Create project filtering and selection for portal display
  - Add project progress visualization for investors
  - Implement real-time data updates for investor metrics
  - Create comprehensive data aggregation for investor insights
  - _Requirements: Data integration and real-time metrics_

- [x] 22. Create Debt & Equity Classes data models and storage
  - Define DebtEquityClass interface with all required fields (unitClass, unitPrice, isOpenToInvestments, etc.)
  - Define CustomUnitClass interface for managing custom class names
  - Create file-based storage system for debt/equity classes data
  - Implement data persistence using local JSON files with project association
  - Add data validation and schema enforcement for all numerical fields
  - Write file I/O utilities and error handling for class data
  - _Requirements: 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 10.11, 10.12_

- [x] 23. Implement Debt & Equity Classes repository layer
  - Create DebtEquityClassRepository with CRUD operations
  - Implement methods to retrieve classes by project ID
  - Create CustomUnitClassRepository for managing custom class names
  - Add validation for investment amount constraints (min <= max, increment <= min)
  - Write methods for creating, updating, and deleting classes
  - Write unit tests for repository methods
  - _Requirements: 10.1, 10.2, 10.11, 10.12, 10.13, 10.14, 10.15_

- [x] 24. Build Debt & Equity Classes service layer
  - Create DebtEquityClassService with business logic and validation
  - Implement CustomUnitClassService for managing custom class names
  - Add input validation for all numerical fields (positive numbers)
  - Implement business rules for investment amount relationships
  - Add error handling and validation error mapping
  - Create unit tests for service layer methods
  - _Requirements: 10.11, 10.12, 10.13, 10.14_

- [x] 25. Implement Debt & Equity Classes API endpoints
  - Create GET /api/projects/:id/debt-equity-classes endpoint
  - Create POST /api/projects/:id/debt-equity-classes endpoint for class creation
  - Create PUT /api/debt-equity-classes/:classId endpoint for class updates
  - Create DELETE /api/debt-equity-classes/:classId endpoint for class deletion
  - Create GET /api/custom-unit-classes endpoint for retrieving custom class names
  - Create POST /api/custom-unit-classes endpoint for creating custom class names
  - Add proper error handling and HTTP status codes
  - Write integration tests for all new API endpoints
  - _Requirements: 10.3, 10.4, 10.5, 10.12, 10.13, 10.14, 10.15_

- [x] 26. Create Debt & Equity Classes UI components
  - Build DebtEquityClassesList component to display all classes for a project
  - Implement empty state message when no classes exist for a project
  - Create DebtEquityClassForm component with all required fields
  - Implement Unit Class dropdown with "Class A" and "Create your own" options
  - Add CustomClassManager component for creating and managing custom class names
  - Implement toggle switch for investment availability
  - Add form validation with real-time feedback for all numerical inputs
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

- [x] 27. Integrate Debt & Equity Classes with Project Details page
  - Add "Debt & Equity Classes" section to ProjectDetails page
  - Implement navigation between project details and class management
  - Add "Add New Class" button with proper routing
  - Integrate class list display with project-specific data
  - Add edit and delete functionality for existing classes
  - Implement confirmation dialog for class deletion
  - _Requirements: 10.1, 10.2, 10.3, 10.13, 10.14, 10.15_

- [x] 28. Implement custom unit class creation workflow
  - Create modal or inline form for custom class name entry
  - Add validation for custom class name uniqueness and format
  - Implement persistence of custom class names for reuse
  - Add custom class names to Unit Class dropdown dynamically
  - Handle custom class creation within the main class creation flow
  - Add success feedback when custom classes are created
  - _Requirements: 10.4, 10.5, 10.12_

- [x] 29. Create Deal Room data models and storage system
  - Define DealRoom interface with all required fields (showcasePhoto, investmentBlurb, investmentSummary, keyInfo, externalLinks)
  - Define KeyInfoItem and ExternalLink interfaces for structured data
  - Create file-based storage system for deal room data with project association
  - Implement image storage system for showcase photos with proper file handling
  - Add data validation and schema enforcement for all deal room fields
  - Write file I/O utilities and error handling for deal room data
  - _Requirements: 11.1, 11.2, 11.5, 12.1, 12.6_

- [x] 30. Implement Deal Room repository and service layers
  - Create DealRoomRepository with CRUD operations for deal room data
  - Implement methods for managing key info items and external links
  - Create image upload and management utilities for showcase photos
  - Add validation for URLs in key info and external links
  - Implement DealRoomService with business logic and validation
  - Write unit tests for repository and service methods
  - _Requirements: 11.3, 11.4, 12.3, 12.4, 15.2, 15.3, 16.2, 16.3_

- [x] 31. Build Deal Room API endpoints
  - Create GET /api/projects/:id/deal-room endpoint for retrieving deal room data
  - Create PUT /api/projects/:id/deal-room endpoint for updating deal room content
  - Create POST /api/projects/:id/deal-room/showcase-photo endpoint for image upload
  - Create DELETE /api/projects/:id/deal-room/showcase-photo endpoint for image removal
  - Create GET /api/projects/:id/investor-dashboard endpoint for complete investor data
  - Add proper error handling, validation, and HTTP status codes
  - Write integration tests for all deal room API endpoints
  - _Requirements: 11.5, 12.6, 12.7, 15.6, 16.6_

- [x] 32. Create Deal Room management interface
  - Build DealRoomPage component with left sidebar navigation
  - Create ShowcasePhotoManager component with drag-and-drop upload
  - Implement InvestmentBlurbEditor with character count and validation
  - Build InvestmentSummaryEditor with rich text editing capabilities
  - Create KeyInfoManager for managing info name/link pairs with reordering
  - Build ExternalLinksManager for managing link name/URL pairs with validation
  - Add responsive design and professional styling
  - _Requirements: 11.2, 11.3, 11.4, 12.1, 12.2, 13.1, 14.1, 15.1, 16.1_

- [x] 33. Implement Deal Room content editors
  - Add rich text editor for Investment Summary with formatting options
  - Implement auto-save functionality for all deal room content
  - Add character count and validation for Investment Blurb
  - Create section templates for Investment Summary
  - Add URL validation for Key Info and External Links
  - Implement drag-and-drop reordering for lists
  - Add confirmation dialogs for deletion operations
  - _Requirements: 13.2, 13.3, 13.4, 14.2, 14.3, 14.4, 15.4, 15.5, 16.4, 16.5_

- [x] 34. Build image upload and management system
  - Implement secure image upload with file type validation
  - Add image preview, crop, and resize functionality
  - Create image optimization and compression pipeline
  - Add support for multiple image formats (JPEG, PNG, WebP)
  - Implement image replacement and removal functionality
  - Add progress indicators and error handling for uploads
  - Create image gallery for asset management
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 35. Integrate Deal Room with Project Details page
  - Add "Deal Room" button to ProjectDetails page
  - Implement navigation to deal room management interface
  - Create breadcrumb navigation between project and deal room
  - Add deal room completion status indicators
  - Integrate deal room data with project overview
  - Add quick access to deal room sections from project details
  - _Requirements: 11.1, 11.2_

- [x] 36. Create Deal Room preview and investor dashboard integration
  - Build DealRoomPreview component showing investor view
  - Implement real-time preview updates as content changes
  - Create responsive preview for mobile and desktop layouts
  - Integrate deal room data with investor dashboard "Offerings" tab
  - Add preview mode toggle for different investor portal themes
  - Implement data aggregation for complete investor dashboard
  - _Requirements: 11.5, 17.1, 17.2, 17.3, 17.4, 17.5_

- [x] 37. Implement auto-save and draft management
  - Add auto-save functionality for all deal room content
  - Implement draft management with version history
  - Create conflict resolution for concurrent editing
  - Add save status indicators and manual save options
  - Implement data recovery for unsaved changes
  - Add validation before saving and publishing
  - _Requirements: 13.4, 13.5, 14.4, 14.5_

- [x] 38. Add comprehensive Deal Room testing
  - Write unit tests for all deal room components
  - Create integration tests for deal room API endpoints
  - Add end-to-end tests for deal room creation and editing workflows
  - Test image upload, preview, and management functionality
  - Write validation tests for all deal room content types
  - Test auto-save and draft management features
  - Add performance tests for image processing and large content
  - _Requirements: All deal room requirements for comprehensive testing coverage_

- [ ] 39. Add comprehensive testing suite
  - Write unit tests for repository methods including debt/equity class operations
  - Create unit tests for service layer methods including validation logic
  - Add component unit tests with React Testing Library for new components
  - Write integration tests for all API endpoints including debt/equity class endpoints
  - Add end-to-end tests for class creation, editing, and deletion flows
  - Write validation tests for all edge cases including investment amount constraints
  - Test custom unit class creation and persistence
  - Test file upload functionality and image processing
  - Test investor portal configuration and preview functionality
  - _Requirements: All requirements for comprehensive testing coverage_