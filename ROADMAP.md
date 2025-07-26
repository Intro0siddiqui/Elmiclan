# Project Vision
An exclusive, gamified portal for clan members with role-based access and AI-powered advancement guidance.

# Phase Legend
- Phase 0 – Scaffolding & Core Libraries (Done)
- Phase 1 – User Authentication & Role-Based Dashboards (In Progress)
- Phase 2 – Advanced AI-Powered Features
- Phase 3 – Admin Tooling & User Management
- Phase N – Pre-Launch Polish

## Current Phase – Phase 1
- **Phase ID**: P1
- **Title**: User Authentication & Role-Based Dashboards
- **User Story**: "As a clan member, I want to securely log in and see a dashboard tailored to my rank, so that I only see relevant information and options."
- **Core Acceptance Criteria**:
  - [x] Users can log in using a mock authentication system.
  - [x] The UI displays different dashboard components based on user rank (Errante, Scout, Conquistador, Admin).
  - [x] A basic navigation sidebar exists that shows/hides items based on rank.
  - [x] The system uses a global state manager (Zustand) to hold user information.
- **File / Module Touches**: `src/hooks/use-auth.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/`, `src/store/userStore.ts`, `src/lib/constants.ts`
- **Status**: In Progress
- **Notes / Open Questions**: Invite code validation logic is currently basic and needs to be secured via a backend flow.

## All Phases (Full List)

- [x] **Phase ID**: P0
- **Title**: Scaffolding & Core Libraries
- **User Story**: "As a developer, I want a Next.js project scaffolded with core libraries for state management, data fetching, and permissions, so that I can build features efficiently."
- **Core Acceptance Criteria**:
  - [x] Next.js project is initialized.
  - [x] Tailwind CSS is configured for styling.
  - [x] ShadCN UI components are available.
  - [x] Dependencies for Zustand, TanStack Query, CASL, and Framer Motion are added.
  - [x] A `CODEBASE_MAP.md` exists to document the architecture.
- **File / Module Touches**: `package.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/lib/`, `src/hooks/`, `CODEBASE_MAP.md`
- **Status**: Done
- **Notes / Open Questions**: None.

---

- [ ] **Phase ID**: P1
- **Title**: User Authentication & Role-Based Dashboards
- **User Story**: "As a clan member, I want to securely log in and see a dashboard tailored to my rank, so that I only see relevant information and options."
- **Core Acceptance Criteria**:
  - [x] Users can log in using a mock authentication system.
  - [x] The UI displays different dashboard components based on user rank (Errante, Scout, Conquistador, Admin).
  - [x] A basic navigation sidebar exists that shows/hides items based on rank.
  - [x] The system uses a global state manager (Zustand) to hold user information.
  - [ ] A secure middleware protects all `/dashboard` routes.
- **File / Module Touches**: `src/hooks/use-auth.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/`, `src/store/userStore.ts`, `src/lib/constants.ts`, `src/middleware.ts`
- **Status**: In Progress
- **Notes / Open Questions**: Invite code validation logic needs to be secured via a backend flow.

---

- [ ] **Phase ID**: P2
- **Title**: Advanced AI-Powered Features
- **User Story**: "As a user, I want to receive AI-powered advice on how to advance my rank, so that I have a clear path for progression."
- **Core Acceptance Criteria**:
  - [ ] A dedicated "Rank Advisor" page exists.
  - [ ] The page uses a Genkit flow to send user profile data to an AI model.
  - [ ] The AI's recommendations are displayed to the user on the page.
- **File / Module Touches**: `src/app/dashboard/rank-advisor/page.tsx`, `src/ai/flows/rank-advisor.ts`
- **Status**: Not Started
- **Notes / Open Questions**: Will the AI need access to more data sources to give better advice?

---

- [ ] **Phase ID**: P3
- **Title**: Admin Tooling & User Management
- **User Story**: "As an Admin, I want to manage users and system settings from a secure panel, so that I can maintain the health of the portal."
- **Core Acceptance Criteria**:
  - [ ] An admin dashboard provides an overview of system health and user activity.
  - [ ] Admins can securely change a user's rank using a backend flow.
  - [ ] Admins can view a list of all users.
- **File / Module Touches**: `src/components/dashboard/rank-specific/admin-dashboard.tsx`, `src/ai/flows/set-custom-claim.ts`
- **Status**: Not Started
- **Notes / Open Questions**: What other management tools will admins need?

---

- [ ] **Phase ID**: P-N
- **Title**: Pre-Launch Polish
- **User Story**: "As the project owner, I want to polish the UI, optimize performance, and ensure all features are robust, so that the portal is ready for its first users."
- **Core Acceptance Criteria**:
  - [ ] Review and refine all UI elements for consistency and aesthetics.
  - [ ] Replace all placeholder images and content.
  - [ ] Conduct performance testing and optimize loading times.
  - [ ] Ensure the CI/CD pipeline is fully operational.
- **File / Module Touches**: Entire codebase.
- **Status**: Not Started
- **Notes / Open Questions**: None.

# Done Log
- **P0 - Scaffolding & Core Libraries**: Completed during initial setup. (Commit: initial)
