# Requirements Document

## Introduction

The Investment Management Portal is a comprehensive platform designed to help investment managers create customizable dashboards for potential investors and manage key business operations. The platform will include seven core features: Projects, Contacts, Accounts, Fundraising, Tasks, Documents, and Reports. This initial phase focuses on the Projects feature, which allows administrators to manage all project-related information including project details, legal names, unit calculations, target amounts, and timeframes.

## Requirements

### Requirement 1

**User Story:** As an investment manager, I want to create and manage investment projects, so that I can organize and track all project-related information in one centralized location.

#### Acceptance Criteria

1. WHEN an admin accesses the projects section THEN the system SHALL display a list of all existing projects
2. WHEN an admin clicks "Add Project" THEN the system SHALL display a project creation form
3. WHEN an admin submits a valid project form THEN the system SHALL save the project and display a success confirmation
4. IF required fields are missing THEN the system SHALL display validation errors and prevent form submission

### Requirement 2

**User Story:** As an investment manager, I want to specify detailed project information, so that I can maintain accurate records for each investment opportunity.

#### Acceptance Criteria

1. WHEN creating or editing a project THEN the system SHALL require a project name field
2. WHEN creating or editing a project THEN the system SHALL require a legal project name field
3. WHEN creating or editing a project THEN the system SHALL allow specification of unit calculation precision
4. WHEN creating or editing a project THEN the system SHALL require a target amount field with currency formatting
5. WHEN creating or editing a project THEN the system SHALL require a timeframe specification

### Requirement 3

**User Story:** As an investment manager, I want to edit existing project information, so that I can keep project details current and accurate.

#### Acceptance Criteria

1. WHEN an admin clicks on a project from the list THEN the system SHALL display the project details
2. WHEN an admin clicks "Edit" on a project THEN the system SHALL display the project editing form with current values pre-populated
3. WHEN an admin saves edited project information THEN the system SHALL update the project and display a success confirmation
4. WHEN an admin cancels editing THEN the system SHALL return to the project list without saving changes

### Requirement 4

**User Story:** As an investment manager, I want to delete projects that are no longer needed, so that I can maintain a clean and organized project list.

#### Acceptance Criteria

1. WHEN an admin clicks "Delete" on a project THEN the system SHALL display a confirmation dialog
2. WHEN an admin confirms deletion THEN the system SHALL permanently remove the project and display a success message
3. WHEN an admin cancels deletion THEN the system SHALL return to the project list without deleting the project
4. IF a project has associated data THEN the system SHALL warn the admin before allowing deletion

### Requirement 5

**User Story:** As an investment manager, I want to validate project data entry, so that I can ensure data integrity and prevent errors.

#### Acceptance Criteria

1. WHEN entering a target amount THEN the system SHALL validate that it is a positive number
2. WHEN entering unit calculation precision THEN the system SHALL validate that it is a valid decimal precision value
3. WHEN entering project names THEN the system SHALL validate that they are not empty and within character limits
4. WHEN entering timeframe information THEN the system SHALL validate that dates are in the future and logically consistent
5. IF validation fails THEN the system SHALL display clear error messages next to the relevant fields

### Requirement 6

**User Story:** As an investment manager, I want to search and filter projects, so that I can quickly find specific projects in a large list.

#### Acceptance Criteria

1. WHEN an admin enters text in the search field THEN the system SHALL filter projects by project name or legal name
2. WHEN an admin applies filters THEN the system SHALL display only projects matching the filter criteria
3. WHEN an admin clears search or filters THEN the system SHALL display all projects
4. WHEN no projects match the search criteria THEN the system SHALL display a "no results found" message

### Requirement 7

**User Story:** As an investment manager, I want to track investor commitments and reservations for each project, so that I can monitor funding progress and manage investor relationships.

#### Acceptance Criteria

1. WHEN viewing a project details page THEN the system SHALL display commitment tracking information including total committed amount and number of committed investors
2. WHEN viewing a project details page THEN the system SHALL display reservation tracking information including total reserved amount and number of potential investors
3. WHEN an admin adds or edits commitment data THEN the system SHALL update the project's funding metrics in real-time
4. WHEN an admin adds or edits reservation data THEN the system SHALL update the project's potential funding metrics in real-time
5. WHEN viewing project details THEN the system SHALL display editable fields for commitment and reservation amounts and investor counts

### Requirement 8

**User Story:** As an investment manager, I want to view key performance indicators for project funding, so that I can quickly assess project status and progress.

#### Acceptance Criteria

1. WHEN viewing a project details page THEN the system SHALL display total number of commitments as a KPI
2. WHEN viewing a project details page THEN the system SHALL display total committed amount in USD as a KPI
3. WHEN viewing a project details page THEN the system SHALL display percentage of funding goal completed as a KPI
4. WHEN viewing a project details page THEN the system SHALL display days remaining until project end date as a KPI
5. WHEN project data changes THEN the system SHALL automatically recalculate and update all KPIs

### Requirement 9

**User Story:** As an investment manager, I want to easily edit commitment and reservation data, so that I can keep investor information current and accurate.

#### Acceptance Criteria

1. WHEN viewing project details THEN the system SHALL provide inline editing capabilities for commitment amounts and investor counts
2. WHEN viewing project details THEN the system SHALL provide inline editing capabilities for reservation amounts and investor counts
3. WHEN editing commitment or reservation data THEN the system SHALL validate that amounts are positive numbers
4. WHEN editing commitment or reservation data THEN the system SHALL validate that investor counts are positive integers
5. WHEN saving edited data THEN the system SHALL immediately update all related KPIs and display success confirmation

### Requirement 10

**User Story:** As an investment manager, I want to manage debt and equity classes for each project, so that I can define different investment structures and terms for potential investors.

#### Acceptance Criteria

1. WHEN viewing a project details page THEN the system SHALL display a "Debt & Equity Classes" section with a list of all classes for that project
2. WHEN no debt or equity classes exist for a project THEN the system SHALL display a message indicating no classes are available
3. WHEN an admin clicks "Add New Class" THEN the system SHALL display a form to create a new debt or equity class
4. WHEN creating a new class THEN the system SHALL require selection of a Unit Class from a dropdown menu containing "Class A" and "Create your own" options
5. WHEN an admin selects "Create your own" for Unit Class THEN the system SHALL allow entry of a custom class name and save it for future use
6. WHEN creating a new class THEN the system SHALL require a Unit Price as a numerical value
7. WHEN creating a new class THEN the system SHALL provide a toggle switch to set whether the class is open to investments
8. WHEN creating a new class THEN the system SHALL allow entry of Investment Increment Amount as a numerical value
9. WHEN creating a new class THEN the system SHALL allow entry of Minimum Investment Amount as a numerical value
10. WHEN creating a new class THEN the system SHALL allow entry of Maximum Investment Amount as a numerical value
11. WHEN saving a debt or equity class THEN the system SHALL validate all numerical fields are positive numbers
12. WHEN saving a debt or equity class THEN the system SHALL persist the class data and associate it with the specific project
13. WHEN viewing existing debt or equity classes THEN the system SHALL allow editing of all class attributes
14. WHEN editing a class THEN the system SHALL preserve the same validation rules as creation
15. WHEN deleting a class THEN the system SHALL display a confirmation dialog before permanent removal

### Requirement 11

**User Story:** As an investment manager, I want to create and manage a Deal Room for each project, so that I can provide comprehensive investment information to potential investors in a professional format.

#### Acceptance Criteria

1. WHEN viewing a project details page THEN the system SHALL display a "Deal Room" button or link
2. WHEN an admin clicks "Deal Room" THEN the system SHALL navigate to the deal room management page for that project
3. WHEN accessing a deal room page THEN the system SHALL display a left sidebar with five navigation options: Showcase Photo, Investment Blurb, Investment Summary, Key Info, and External Links
4. WHEN selecting any navigation option THEN the system SHALL display the corresponding content management interface in the main content area
5. WHEN deal room data is saved THEN the system SHALL make it available for display in the investor dashboard under the "Offerings" tab

### Requirement 12

**User Story:** As an investment manager, I want to upload and manage a showcase photo for each project's deal room, so that I can visually represent the investment opportunity to potential investors.

#### Acceptance Criteria

1. WHEN accessing the Showcase Photo section THEN the system SHALL display an image upload interface
2. WHEN no photo is uploaded THEN the system SHALL display a placeholder with upload instructions
3. WHEN uploading an image THEN the system SHALL validate file type (JPEG, PNG, WebP) and size constraints
4. WHEN an image is uploaded THEN the system SHALL display a preview of the image
5. WHEN an image exists THEN the system SHALL provide options to replace or remove the current image
6. WHEN saving showcase photo changes THEN the system SHALL optimize and store the image securely
7. WHEN an image upload fails THEN the system SHALL display clear error messages with resolution guidance

### Requirement 13

**User Story:** As an investment manager, I want to create and edit an investment blurb for each project, so that I can provide a concise summary of the investment opportunity.

#### Acceptance Criteria

1. WHEN accessing the Investment Blurb section THEN the system SHALL display a text editor interface
2. WHEN editing the investment blurb THEN the system SHALL provide a character count indicator
3. WHEN the investment blurb exceeds recommended length THEN the system SHALL display a warning message
4. WHEN typing in the investment blurb THEN the system SHALL auto-save changes periodically
5. WHEN saving investment blurb changes THEN the system SHALL validate content and display success confirmation
6. WHEN the investment blurb is empty THEN the system SHALL display placeholder text with guidance

### Requirement 14

**User Story:** As an investment manager, I want to create and edit a comprehensive investment summary for each project, so that I can provide detailed information about the investment opportunity.

#### Acceptance Criteria

1. WHEN accessing the Investment Summary section THEN the system SHALL display a rich text editor interface
2. WHEN editing the investment summary THEN the system SHALL support text formatting (bold, italic, lists, links)
3. WHEN editing the investment summary THEN the system SHALL provide section templates for common investment summary structures
4. WHEN typing in the investment summary THEN the system SHALL auto-save changes periodically
5. WHEN saving investment summary changes THEN the system SHALL validate content and display success confirmation
6. WHEN the investment summary is empty THEN the system SHALL display placeholder text with guidance

### Requirement 15

**User Story:** As an investment manager, I want to manage key information items for each project's deal room, so that I can provide important links and resources to potential investors.

#### Acceptance Criteria

1. WHEN accessing the Key Info section THEN the system SHALL display a list of existing key info items and an "Add New" button
2. WHEN adding a new key info item THEN the system SHALL require both an info name and info link
3. WHEN editing key info items THEN the system SHALL validate that the info link is a valid URL
4. WHEN managing key info items THEN the system SHALL allow reordering through drag-and-drop functionality
5. WHEN deleting a key info item THEN the system SHALL display a confirmation dialog
6. WHEN saving key info changes THEN the system SHALL validate all entries and display success confirmation
7. WHEN no key info items exist THEN the system SHALL display an empty state with guidance

### Requirement 16

**User Story:** As an investment manager, I want to manage external links for each project's deal room, so that I can direct potential investors to relevant external resources and websites.

#### Acceptance Criteria

1. WHEN accessing the External Links section THEN the system SHALL display a list of existing external links and an "Add New" button
2. WHEN adding a new external link THEN the system SHALL require both a link name and URL
3. WHEN editing external links THEN the system SHALL validate that the URL is properly formatted and accessible
4. WHEN managing external links THEN the system SHALL allow reordering through drag-and-drop functionality
5. WHEN deleting an external link THEN the system SHALL display a confirmation dialog
6. WHEN saving external link changes THEN the system SHALL validate all URLs and display success confirmation
7. WHEN no external links exist THEN the system SHALL display an empty state with guidance

### Requirement 17

**User Story:** As an investment manager, I want to preview how the deal room content appears to investors, so that I can ensure the presentation is professional and complete before sharing with potential investors.

#### Acceptance Criteria

1. WHEN managing deal room content THEN the system SHALL provide a preview functionality
2. WHEN accessing the preview THEN the system SHALL display deal room content as it appears in the investor dashboard
3. WHEN deal room content is updated THEN the system SHALL reflect changes in the preview in real-time
4. WHEN viewing the preview THEN the system SHALL show both mobile and desktop layouts
5. WHEN deal room data is saved THEN the system SHALL automatically update the investor dashboard "Offerings" tab with the new content