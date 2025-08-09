# ElmiClan Portal - Codebase Map & Architectural Guide

This document serves as a high-level guide to the ElmiClan Portal codebase. It maps core features and modules to the specific files and directories responsible for them, providing a clear overview of the project's architecture.

## 1. Overall Project Setup & Entry Points

- **`next.config.ts`**: The Next.js configuration file, which governs how the application is built and run.
- **`package.json`**: Lists all project dependencies (e.g., React, Next.js, Supabase, Genkit, Shadcn) and defines the scripts for running, building, and developing the application.
- **`tsconfig.json`**: The TypeScript configuration file, defining compiler options, path aliases (`@/*`), and type checking rules.
- **`src/app/layout.tsx`**: The root layout of the application. It sets up the HTML shell, applies global styles, and wraps the entire app in necessary context providers.
- **`src/app/page.tsx`**: The main landing page for unauthenticated users, typically containing a login or welcome screen.
- **`src/app/signup/page.tsx`**: The user registration page. It likely integrates with backend flows for validating invite codes and creating new users.
- **`src/middleware.ts`**: The Next.js middleware file, used for handling requests before they reach a page. This is often used for route protection, authentication checks, and redirects.

## 2. Application Structure (`src/app`)

- **`src/app/globals.css`**: Defines the global styles and CSS variables for the application's theme.
- **`src/app/dashboard/`**: The primary directory for all authenticated user-facing pages.
    - **`layout.tsx`**: A shared layout for the dashboard, likely including the main sidebar and user navigation.
    - **`page.tsx`**: The main dashboard page that users see after logging in.
    - **`messenger/[mode]/page.tsx`**: The user-facing page for both clan-wide chat and direct messages. It uses a dynamic `[mode]` parameter to switch between different chat interfaces.
    - **`rank-advisor/page.tsx`**: The page dedicated to the AI-powered Rank Advisor feature.

## 3. UI & Components (`src/components`)

- **`src/components/ui/`**: Contains all the reusable, low-level UI components from `shadcn/ui` (e.g., `Button.tsx`, `Card.tsx`, `Input.tsx`). These are the foundational building blocks of the interface.
- **`src/components/dashboard/`**: Components specifically designed for the main user dashboard.
    - **`sidebar.tsx`**: The main navigation sidebar, which may dynamically render items based on user rank.
    - **`user-nav.tsx`**: The user navigation element, typically in the header, for accessing profile settings and logging out.
    - **`rank-specific/*.tsx`**: These files (`admin-dashboard.tsx`, `scout-dashboard.tsx`, etc.) contain the unique UI widgets and layouts for each specific user rank.
- **`src/components/messenger/`**: Components used to build the secure messaging interface.
    - **`ClanMessageForm.tsx`**: The form for sending messages to the main clan chat.
    - **`ConversationList.tsx`**: Displays the list of active private conversations.
    - **`MessageHistory.tsx`**: Renders the messages within a selected conversation.
    - **`PartnerFinder.tsx`**: A UI for searching for and starting new conversations with other users.
    - **`PrivateChatInterface.tsx`**: The main component that orchestrates the private direct messaging view.
- **`src/components/providers.tsx`**: A component for wrapping the application in context providers (e.g., for TanStack Query, theme management).
- **`src/components/AnimatedPage.tsx`**: A wrapper component that uses `framer-motion` to apply consistent animations to pages.

## 4. State Management & Hooks

- **`src/store/userStore.ts`**: A **Zustand store** for managing global client-side state, such as the current user's profile, rank, and permissions.
- **`src/hooks/`**: Contains custom React hooks for managing complex state and side effects.
    - **`use-supabase-auth.tsx`**: A hook for managing the user's authentication state with Supabase.
    - **`use-missions.ts` / `useMissions.ts`**: Hooks for fetching and managing server state related to "missions" using a library like TanStack Query.
    - **`use-mobile.tsx`**: A hook to detect if the application is being viewed on a mobile device.
    - **`use-toast.ts`**: A hook for triggering toast notifications.

## 5. Core Logic & Libraries (`src/lib`)

- **`src/lib/supabase.ts`**: Initializes and exports the Supabase client, making it available throughout the application for database and auth interactions.
- **`src/lib/permissions.ts`**: The central file for the permission system (likely using a library like CASL). It defines the rules and abilities for each user rank.
- **`src/lib/constants.ts`**: Defines application-wide constants, such as navigation items (`NAV_ITEMS`) and other static data.
- **`src/lib/types.ts`**: Contains core TypeScript type definitions used across the project (e.g., `User`, `Rank`, `Message`).
- **`src/lib/utils.ts`**: A collection of utility functions used throughout the application.

## 6. Backend Logic & AI Flows (`src/ai`)

- **`src/ai/genkit.ts`**: Initializes and configures the core Genkit instance, setting up the connection to the AI provider (e.g., Google AI).
- **`src/ai/dev.ts`**: The development entry point for Genkit, which imports and registers all active flows for local testing.
- **`src/ai/matrix-client.ts`**: Contains the logic for interacting with the Matrix chat server, likely using the `matrix-js-sdk`.
- **`src/ai/flows/`**: Contains all the server-side Genkit flows that power the application's secure backend logic.
    - **`validate-invite-code.ts`**: Securely validates user invite codes against a database.
    - **`set-custom-claim.ts`**: Allows administrators to assign ranks to users.
    - **`rank-advisor.ts`**: The AI-powered flow that provides personalized rank advancement advice.
    - **`send-secure-message.ts`**: Securely sends end-to-end encrypted messages via the Matrix server.
    - **`fetch-messages.ts`**: Securely fetches end-to-end encrypted messages.
    - **`text-to-speech.ts`**: A flow for converting text messages to speech (if implemented).
    - **`get-user-rank.ts`**: A flow to retrieve a user's rank.

## 7. Deployment & Environment

- **`.github/workflows/deploy.yml`**: The **GitHub Actions** workflow file that defines the CI/CD pipeline for automatically building and deploying the application.
- **`apphosting.yaml`**: Configuration file for the hosting environment (e.g., Google App Hosting), specifying runtime settings.
- **`.env.example`**: An example file showing the required environment variables for the project.
- **`src/env.mjs`**: A file for validating and parsing environment variables to ensure they are correctly loaded and typed.