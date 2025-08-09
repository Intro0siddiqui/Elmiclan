# ElmiClan Portal - Application Blueprint

This document outlines the core features, user experience goals, and visual identity of the ElmiClan Portal.

## 1. Core Features

- **Invite-Only Registration**: New user registration is restricted via a secure invite code system. The `validateInviteCode` Genkit flow ensures that only users with a valid code (stored in the Supabase database) can create an account.

- **Rank-Based Dashboards**: The user interface dynamically adapts to the authenticated user's rank. Each rank (Errante, Scout, Conquistador, Admin) is presented with a unique dashboard layout and a specific set of tools and information, controlled by components in `src/components/dashboard/rank-specific/`.

- **Secure E2EE Messaging**: The portal features a fully functional, end-to-end encrypted messaging system for both clan-wide and direct (1-on-1) communication. All message sending and fetching is handled by secure, server-side Genkit flows (`send-secure-message.ts`, `fetch-messages.ts`) that interface with a Matrix chat server, ensuring no sensitive credentials are exposed on the client.

- **Dynamic Navigation**: The main sidebar navigation is generated dynamically based on the user's permissions. The `NAV_ITEMS` constant in `src/lib/constants.ts` defines the available links and the minimum rank required to view them, ensuring users only see links to pages they are authorized to access.

- **AI-Powered Rank Advisor**: A key feature where users can receive personalized guidance on how to advance to the next rank. This is powered by the `rank-advisor.ts` Genkit flow, which leverages a Google AI model to generate tailored recommendations based on the user's current status.

## 2. Style Guidelines & Visual Identity

- **Primary Color**: Deep purple (`#673AB7`) - Used for primary actions and to evoke a sense of exclusivity and importance.
- **Background Color**: Dark gray (`#212121`) - Creates a modern, focused, and premium dark-theme environment.
- **Accent Color**: Violet (`#9FA8DA`) - A contrasting color used to highlight interactive elements, selections, and important notifications.
- **Typography**: `Inter` (sans-serif) is used for all text, providing excellent readability for both headlines and body copy.
- **Iconography**: Modern, clean, line-based icons are used to maintain a consistent and minimalist aesthetic.
- **Layout**: The layout is modular, using cards and distinct sections to organize information. This design allows content to be dynamically arranged and prioritized based on user rank and context.
- **Animation**: Subtle and professional animations using `framer-motion` are employed for page transitions and key interactions to enhance the user experience without being distracting.
