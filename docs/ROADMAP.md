# ElmiClan Portal - Development Roadmap

This document outlines the major features and development milestones for the ElmiClan Portal.

## Q3 2024: Foundation & Core Features (In Progress)

- **[DONE]** **Project Setup**: Initialize Next.js project, configure TypeScript, and set up essential libraries (Shadcn, Supabase, Genkit).
- **[DONE]** **User Authentication**: Secure user login and registration using Supabase, including an invite code system to restrict registration.
- **[IN PROGRESS]** **Secure Messaging**:
    - **[DONE]** Set up Matrix server for E2EE communication.
    - **[IN PROGRESS]** Develop UI for clan-wide and direct messaging.
    - **[TODO]** Implement message history and conversation management.
- **[IN PROGRESS]** **AI-Powered Rank Advisor**:
    - **[DONE]** Create Genkit flow for personalized rank advice.
    - **[IN PROGRESS]** Design and build the user interface for the Rank Advisor page.
- **[TODO]** **Dashboard & UI**:
    - **[DONE]** Create the main dashboard layout.
    - **[IN PROGRESS]** Develop rank-specific dashboard widgets.
    - **[TODO]** Refine the overall UI/UX for consistency and ease of use.

## Q4 2024: Mission System & Admin Tools

- **[TODO]** **Mission System**:
    - A feature where users can complete tasks to earn rewards and advance in rank.
    - Design the data model for missions, tasks, and rewards.
    - Implement Genkit flows for managing mission logic.
    - Build the UI for users to view, accept, and complete missions.
- **[TODO]** **Clan Administration**:
    - Tools for clan leaders to manage members, ranks, and permissions.
    - Develop a UI for administrators to manage user ranks and permissions.
    - Implement secure flows for updating user claims.
- **[TODO]** **Real-time Notifications**:
    - Inform users of important events and messages.
    - Integrate a notification system (e.g., using Supabase Realtime) to alert users of new messages or mission updates.

## 2025 & Beyond: Community & Gamification

- **[TODO]** **User Profiles**: Public profiles for users to showcase their achievements.
- **[TODO]** **Leaderboards**: Track user progress and rank.
- **[TODO]** **Achievements System**: Reward users for completing specific tasks and milestones.
- **[TODO]** **Mobile App**: Explore the possibility of a native mobile application.
