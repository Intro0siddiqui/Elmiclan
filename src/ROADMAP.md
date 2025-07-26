# Project Vision
An exclusive, gamified portal for clan members with role-based access and AI-powered advancement guidance.

# Phase Legend
- Phase 0 – Scaffolding & Core Libraries (Done)
- Phase 1 – User Authentication & Role-Based Dashboards (Done)
- Phase 2 – Secure E2EE Messaging (Done)
- Phase 2.5 – Unified Group Chat (In Progress)
- Phase 3 – Advanced AI-Powered Features
- Phase 4 – Admin Tooling & User Management
- Phase N – Pre-Launch Polish

## Current Phase – Phase 2.5
- **Phase ID**: P2.5
- **Title**: Unified Group Chat & DM
- **User Story**: "As a clan member, I want to communicate with everyone in a single group chat, but also be able to send private direct messages, so that I can have both public and private conversations."
- **Core Acceptance Criteria**:
  - [ ] The messenger page has a tabbed interface for "Clan Chat" and "Direct Message".
  - [ ] The "Clan Chat" tab sends messages to a single, hardcoded clan chat room.
  - [ ] The "Direct Message" tab preserves the original functionality of sending a private message to a specific user.
  - [ ] The backend flow handles both sending to a group and creating a new DM room.
- **File / Module Touches**: `src/app/dashboard/messenger/page.tsx`, `src/ai/flows/send-secure-message.ts`
- **Status**: In Progress
- **Notes / Open Questions**: An admin must create the clan chat room in Matrix and set the `MATRIX_CLAN_ROOM_ID` environment variable.

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

- [x] **Phase ID**: P1
- **Title**: User Authentication & Role-Based Dashboards
- **User Story**: "As a clan member, I want to securely log in and see a dashboard tailored to my rank, so that I only see relevant information and options."
- **Core Acceptance Criteria**:
  - [x] Users can log in using a mock authentication system.
  - [x] The UI displays different dashboard components based on user rank (Errante, Scout, Conquistador, Admin).
  - [x] A basic navigation sidebar exists that shows/hides items based on rank.
  - [x] The system uses a global state manager (Zustand) to hold user information.
- **File / Module Touches**: `src/hooks/use-auth.tsx`, `src/app/dashboard/page.tsx`, `src/components/dashboard/`, `src/store/userStore.ts`, `src/lib/constants.ts`
- **Status**: Done
- **Notes / Open Questions**: Invite code validation logic needs to be secured via a backend flow.

---

- [x] **Phase ID**: P2
- **Title**: Secure E2EE Messaging
- **User Story**: "As a clan member, I want to send end-to-end encrypted messages to other members, so that our communications remain private and secure."
- **Core Acceptance Criteria**:
  - [x] A new "Messenger" page is available in the dashboard.
  - [x] Users can enter a recipient's Matrix ID and a message.
  - [x] Clicking "Send" successfully sends an E2EE message via the Matrix protocol.
  - [x] The backend logic is handled by a secure Genkit flow.
- **File / Module Touches**: `src/app/dashboard/messenger/page.tsx`, `src/ai/flows/send-secure-message.ts`, `src/lib/constants.ts`, `package.json`, `CODEBASE_MAP.md`
- **Status**: Done
- **Notes / Open Questions**: The initial implementation focused on 1-to-1 chats.

---

- [ ] **Phase ID**: P2.5
- **Title**: Unified Group Chat & DM
- **User Story**: "As a clan member, I want to communicate with everyone in a single group chat, but also be able to send private direct messages, so that I can have both public and private conversations."
- **Core Acceptance Criteria**:
  - [ ] The messenger page has a tabbed interface for "Clan Chat" and "Direct Message".
  - [ ] The "Clan Chat" tab sends messages to a single, hardcoded clan chat room.
  - [ ] The "Direct Message" tab preserves the original functionality of sending a private message to a specific user.
  - [ ] The backend flow handles both sending to a group and creating a new DM room.
- **File / Module Touches**: `src/app/dashboard/messenger/page.tsx`, `src/ai/flows/send-secure-message.ts`
- **Status**: In Progress
- **Notes / Open Questions**: An admin must create the clan chat room in Matrix and set the `MATRIX_CLAN_ROOM_ID` environment variable.

---

- [ ] **Phase ID**: P3
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

- [ ] **Phase ID**: P4
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

- [ ] **Phase ID**: P-Future
- **Title**: AI-Powered Audio Messages
- **User Story**: "As a user, I want to be able to send my messages as audible voice notes, so that I can communicate in a more expressive way."
- **Core Acceptance Criteria**:
  - [ ] Add a Text-to-Speech (TTS) Genkit flow.
  - [ ] Add a "Send as Voice" button to the messenger.
  - [ ] Display an audio player for sent/received voice messages.
- **File / Module Touches**: `src/app/dashboard/messenger/page.tsx`, `src/ai/flows/text-to-speech.ts`
- **Status**: Not Started
- **Notes / Open Questions**: Requires `wav` package.

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
- **P2 - Secure E2EE Messaging**: Completed.
- **P1 - User Authentication & Role-Based Dashboards**: Completed.
- **P0 - Scaffolding & Core Libraries**: Completed during initial setup.
