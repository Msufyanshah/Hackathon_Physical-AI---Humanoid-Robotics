# Feature Specification: Docusaurus Site Skeleton

**Feature Branch**: `1-docusaurus-site-skeleton`  
**Created**: 2025-12-05  
**Status**: Draft  
**Input**: User description: "Project: Physical AI & Humanoid Robotics – A Hands-On University Quarter Course..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Project Maintainer Initializes and Deploys the Skeleton Site (Priority: P1)

As a project maintainer, I want to initialize a new Docusaurus project from the classic template, apply the specified configuration, and deploy it to GitHub Pages, so that the basic site structure is live and ready for content.

**Why this priority**: This is the foundational step; no other development can proceed without the site skeleton being successfully created and deployed.

**Independent Test**: The Docusaurus site can be built locally (`npm run build`) and the output in the `build` directory is a valid static site. A GitHub Pages deployment workflow successfully publishes the site to the configured URL.

**Acceptance Scenarios**:

1. **Given** a clean directory, **When** the maintainer runs `npx create-docusaurus@latest website classic`, **Then** a new Docusaurus project is created successfully.
2. **Given** the Docusaurus project is created, **When** the maintainer updates `docusaurus.config.js` with the project's details and deploys to GitHub Pages, **Then** the site is accessible at the public GitHub Pages URL with the correct title and tagline.
3. **Given** the site is deployed, **When** a visitor accesses it, **Then** they see the default Docusaurus landing page and chrome.

### User Story 2 - Content Contributor Views the Hierarchical Sidebar (Priority: P2)

As a content contributor, I want to see the full, hierarchical table of contents in the sidebar, so that I understand the complete structure of the course and where to add new content.

**Why this priority**: It provides the necessary structure for all future content development and ensures the course layout is clear from the start.

**Independent Test**: The `sidebars.js` file can be validated, and when the site is run locally, the sidebar renders with all sections, subsections, and pages from the final table of contents, and is fully collapsible.

**Acceptance Scenarios**:

1. **Given** the site is running, **When** a user views any docs page, **Then** the sidebar displays all top-level categories from "00-introduction" to "09-appendix".
2. **Given** a user clicks on a category like "02-ros2-nervous-system", **Then** the category expands to show all its child pages (e.g., "01-ros2-concepts.md").
3. **Given** the site is viewed on a mobile device, **When** the user taps the menu icon, **Then** the hierarchical sidebar is displayed correctly and is usable.

### User Story 3 - New Student Visits the Custom Landing Page (Priority: P3)

As a new student, I want to see a professional and informative landing page, so that I can understand the course's purpose, what I will learn, and how to get started.

**Why this priority**: The landing page is the first impression of the course and is critical for student engagement and orientation.

**Independent Test**: The custom landing page at `src/pages/index.js` renders correctly when running the site locally. Lighthouse scores can be measured on this page.

**Acceptance Scenarios**:

1. **Given** a user navigates to the site's root URL, **Then** they are shown a custom landing page with a hero section containing an animated robot.
2. **Given** a user is on the landing page, **Then** they can view a course overview, learning outcomes, a table of hardware tiers, and a "quick-start" button that links to `docs/00-introduction/intro.md`.
3. **Given** a user audits the page with Lighthouse, **Then** the performance and accessibility scores are 95 or higher.

### Edge Cases

- **Mobile View**: How does the site respond on a device with a width less than 375px? The layout must not break or have horizontal overflow.
- **Missing Placeholders**: What happens if a link in the sidebar points to a Markdown file that doesn't exist yet? The build process should still complete, and the link should ideally render in a way that indicates it's a pending page.
- **Search Indexing**: How is the search functionality handled before Algolia is configured? The build should not fail, and the search bar should be present but can be non-functional initially.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST be initialized using the `npx create-docusaurus@latest website classic` command.
- **FR-002**: The system MUST use Docusaurus v3.
- **FR-003**: The site's `docusaurus.config.js` MUST be configured with the title "Physical AI & Humanoid Robotics" and tagline "From Digital Intelligence to Embodied Intelligence".
- **FR-004**: The blog feature MUST be disabled.
- **FR-005**: The docs-only mode MUST be enabled.
- **FR-006**: The sidebar MUST be generated from a `sidebars.js` file and match the hierarchical structure defined in the "Final Table of Contents".
- **FR-007**: The site MUST support a dark/light mode toggle.
- **FR-008**: All doc pages MUST display "Edit this page" links pointing to the corresponding file in the GitHub repository.
- **FR-009**: All doc pages MUST display the "Last updated" date in the footer.
- **FR-010**: The file structure MUST exactly match the provided "Final Table of Contents" and "Additional pages" layouts.
- **FR-011**: The site MUST include a custom landing page located at `src/pages/index.js`.
- **FR-012**: All diagrams in Markdown files MUST be rendered using Mermaid.js.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `npx create-docusaurus` command and the `npm run build` command complete with zero errors.
- **SC-002**: A Lighthouse audit of the deployed landing page scores ≥95 on both Performance and Accessibility.
- **SC-003**: 100% of the items listed in the "Final Table of Contents" are present and correctly ordered in the rendered sidebar.
- **SC-004**: The deployed site is fully functional and navigable on the latest versions of Chrome, Firefox, and Safari, on both desktop and mobile (screen width down to 360px).
- **SC-005**: The GitHub Pages deployment completes successfully and the site is available at the expected public URL.
