# ElmiClan Portal - Codebase Map & Architectural Guide

This document serves as a high-level guide to the ElmiClan Portal codebase. It maps core features and modules to the specific files and directories responsible for them, providing a clear overview of the project's architecture.

## 1. Overall Project Setup & Entry Points

- **`src/app/layout.tsx`**: The root layout of the application. It sets up the HTML shell, applies global CSS, includes the font (`Inter`), and wraps the entire app in the `AuthProvider` and TanStack Query `Providers`.
- **`src/app/page.tsx`**: The main landing page for unauthenticated users, containing the Login form.
- **`src/app/signup/page.tsx`**: The registration page, which uses a secure Genkit flow to validate invite codes before allowing a user to create an account.
- **`src/components/providers.tsx`**: Sets up the `QueryClientProvider` for TanStack Query, making server state management available across the entire app.

## 2. Front-End UI & Components

- **`src/components/ui/`**: Contains all the reusable, low-level UI components from `shadcn/ui` (e.g., `Button`, `Card`, `Input`). These are the building blocks of the interface.
- **`src/app/globals.css`**: Defines the global styles and the CSS variables for the application's dark theme, including the primary, background, and accent colors.
- **`src/app/dashboard/messenger/[mode]/page.tsx`**: The user-facing page for both the clan-wide chat and direct messages. It uses a dynamic `[mode]` parameter to switch between the two. For DMs, it implements a robust, state-driven UI to handle listing conversations, finding new chat partners, and sending messages in a private view.
- **`src/components/dashboard/sidebar.tsx`**: The main navigation sidebar for the dashboard. It dynamically renders navigation items based on the user's rank.
- **`src/components/dashboard/rank-specific/*.tsx`**: These files (`admin-dashboard.tsx`, `scout-dashboard.tsx`, etc.) contain the unique dashboard UI for each specific user rank.
- **`src/components/AnimatedPage.tsx`**: A wrapper component using `framer-motion` to apply consistent fade-in and slide-up animations to pages, enhancing the user experience.

## 3. State Management

- **`src/store/userStore.ts`**: The global **Zustand store**. It is designed to hold client-side user state like `userRank` and `permissions` to make them easily accessible throughout the UI without prop drilling.
- **`src/hooks/use-auth.tsx`**: The primary authentication hook. It manages the current user's state (login, logout, signup) using Supabase Auth, and stores the user object in `localStorage` to persist the session.
- **`src/hooks/use-missions.ts`**: An example **TanStack Query** hook. It demonstrates how to fetch, cache, and manage server state for a 'missions' collection from Firestore.

## 4. Access Control & Permissions

- **`src/lib/permissions.ts`**: The central file for **CASL**. It defines the `AppAbility` and the `defineRulesFor` function, which creates permission sets based on user rank (e.g., a 'Scout' can 'read' 'Mission' subjects).
- **`src/lib/types.ts`**: Defines the core TypeScript types for the application, including `User`, `Rank`, and the `rankHierarchy` that assigns a numerical value to each rank for permission checks.

## 5. Routing & Navigation

- **`src/lib/constants.ts`**: Defines application-wide constants, most importantly `NAV_ITEMS`, which an-configures the labels, icons, and minimum required rank for each item in the dashboard sidebar.

## 6. Backend Logic & AI Flows (Genkit)

- **`src/ai/genkit.ts`**: Initializes and configures the core Genkit `ai` instance, setting up the connection to the Google AI provider.
- **`src/ai/dev.ts`**: The development entry point for Genkit, which imports and registers all active flows.
- **`src/ai/flows/validate-invite-code.ts`**: A secure, server-side Genkit flow for validating user invite codes from Firestore. This is the backend logic for the signup process.
- **`src/ai/flows/set-custom-claim.ts`**: A secure, server-side Genkit flow for administrators to assign ranks to users. This is a critical piece of the access control system.
- **`src/ai/flows/rank-advisor.ts`**: An AI-powered Genkit flow that provides personalized recommendations to users on how to advance in rank.
- **`src/ai/flows/send-secure-message.ts`**: A secure, server-side Genkit flow that uses the `matrix-js-sdk` to send E2EE messages. This keeps all sensitive credentials and logic off the client.
- **`src/ai/flows/fetch-messages.ts`**: A secure, server-side Genkit flow that uses the `matrix-js-sdk` to fetch E2EE messages. This keeps all sensitive credentials and logic off the client.

## 7. Deployment & CI/CD

- **`.github/workflows/deploy.yml`**: The **GitHub Actions** workflow file. It defines the CI/CD pipeline that automatically builds and deploys the application to Firebase Hosting whenever new code is pushed to the `main` branch.
- **`apphosting.yaml`**: Configuration file for Firebase App Hosting, specifying runtime settings like the maximum number of instances.
- **`next.config.ts`**: The Next.js configuration file.
- **`package.json`**: Lists all project dependencies, including `matrix-js-sdk`, and defines the scripts for running, building, and developing the application.
- **`tsconfig.json`**: The TypeScript configuration file, defining compiler options and path aliases.
