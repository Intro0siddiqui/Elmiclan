# ElmiClan Portal - Project Roadmap

## Project Vision
An exclusive, gamified portal for clan members with role-based access, secure E2EE messaging, and AI-powered advancement guidance.

## Phase Legend
- **Phase 0**: Scaffolding & Core Libraries
- **Phase 1**: User Authentication & Role-Based Dashboards
- **Phase 2**: Secure E2EE Messaging
- **Phase 3**: Advanced AI-Powered Features
- **Phase 4**: Admin Tooling & User Management
- **Phase N**: Pre-Launch Polish
- **Post-Launch**: Future Enhancements

---

## Current Phase: Pre-Launch Polish (In Progress)

- **Phase ID**: P-N
- **Title**: Pre-Launch Polish
- **User Story**: "As the project owner, I want to polish the UI, optimize performance, and ensure all features are robust, so that the portal is ready for its first users."
- **Core Acceptance Criteria**:
  - [x] Implement the private chat interface for viewing conversation history. *(Verified: `PrivateChatInterface.tsx` and `MessageHistory.tsx` are implemented)*
  - [x] Verify that the Direct Message UI correctly displays recent chats. *(Verified: `ConversationList.tsx` is implemented)*
  - [x] Ensure the CI/CD pipeline is fully operational. *(Verified: `.github/workflows/deploy.yml` is configured)*
  - [x] Remove all hardcoded secrets and use environment variables exclusively. *(Verified: `src/env.mjs` and `.env.example` are in use)*
  - [x] Implement singleton pattern for Matrix client to optimize performance. *(Verified: `matrix-client.ts` is designed as a singleton)*
  - [x] Move invite codes to a database and enforce validation via a Genkit flow. *(Verified: `validate-invite-code.ts` flow is implemented)*
  - [x] Replace mock user data with a real database implementation. *(Verified: Supabase is integrated for user management)*
  - [ ] Review and refine all UI elements for consistency and aesthetics.
  - [ ] Replace all placeholder images and content.
  - [ ] Conduct performance testing and optimize loading times.

---

## Future & Completed Phases

### Post-Launch
- **Phase ID**: P-Future-TTS
- **Title**: AI-Powered Audio Messages
- **User Story**: "As a user, I want to be able to send my messages as audible voice notes, so that I can communicate in a more expressive way."
- **Status**: **Not Started**

### Completed Log

- **Phase ID**: P4
- **Title**: Admin Tooling & User Management
- **User Story**: "As an Admin, I want to manage users and system settings from a secure panel, so that I can maintain the health of the portal."
- **Status**: **Done**

- **Phase ID**: P3
- **Title**: Advanced AI-Powered Features
- **User Story**: "As a user, I want to receive AI-powered advice on how to advance my rank, so that I have a clear path for progression."
- **Status**: **Done**

- **Phase ID**: P2.5
- **Title**: Unified Group Chat & DM
- **User Story**: "As a clan member, I want to communicate with everyone in a single group chat, but also be able to send private direct messages, so that I can have both public and private conversations."
- **Status**: **Done**

- **Phase ID**: P2
- **Title**: Secure E2EE Messaging
- **User Story**: "As a clan member, I want to send end-to-end encrypted messages to other members, so that our communications remain private and secure."
- **Status**: **Done**

- **Phase ID**: P1
- **Title**: User Authentication & Role-Based Dashboards
- **User Story**: "As a clan member, I want to securely log in and see a dashboard tailored to my rank, so that I only see relevant information and options."
- **Status**: **Done**

- **Phase ID**: P0
- **Title**: Scaffolding & Core Libraries
- **User Story**: "As a developer, I want a Next.js project scaffolded with core libraries for state management, data fetching, and permissions, so that I can build features efficiently."
- **Status**: **Done**