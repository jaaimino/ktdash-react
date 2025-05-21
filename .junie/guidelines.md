# KTDash Development Guidelines

This document provides essential information for developers working on the KTDash project. It includes build/configuration instructions and development best practices specific to this project.

## Project Overview

KTDash is a comprehensive dashboard application for managing Kill Team (Warhammer 40k tabletop game) rosters and resources. It's built with:

- Next.js 15.3.1
- React 19.1
- Prisma 6.6.0 (MySQL database)
- Mantine UI components (v7.17.5)
- SWR for data fetching

## Build and Configuration

### Environment Setup

1. Create a `.env` file in the project root with your database connection:
   ```
   DATABASE_URL=mysql://[user]:[password]@[host]:[port]/[dbname]?connect_timeout=300
   ```

2. For local development with HTTPS, the project uses Next.js experimental HTTPS feature. SSL certificates should be placed in the `certificates` directory.

### Database Setup

1. The project uses MySQL 8.0 as its database. You can run it locally using Docker:
   ```bash
   docker-compose up -d
   ```

2. Generate Prisma client and push the schema to the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Development Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. For HTTPS development:
   ```bash
   npm run dev
   ```

   The development server uses the `--experimental-https` flag, which enables HTTPS while maintaining hot reloading functionality. Note that there are currently only scripts setup to run dev with the `--experimental-https` flag. There is no script configured to run dev with just HTTP.

3. Hot Reloading Troubleshooting:
   - Ensure you're using the development server (`npm run dev`) and not the production server
   - Some changes (like modifying `next.config.mjs`) require a full server restart
   - If hot reloading stops working, try restarting the development server
   - For changes to global CSS files, you may need to refresh the browser manually

### Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   # Or with HTTPS
   npm run start-https
   ```

## Development Guidelines

### Project Structure

- `src/app`: Next.js App Router components
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/page`: Page components (Pages Router)
- `src/utils`: Utility functions
- `src/data`: Data-related files
- `src/assets`: Static assets
- `src/generated`: Generated files from Prisma

### Code Style and Conventions

1. **Component Structure**:
   - Use 'use client' directive at the top of client components
   - Use functional components with React hooks
   - Use props destructuring with default values
   - Export components as default exports when appropriate
   - Keep related components in the same file if they're tightly coupled

2. **UI Framework**:
   - Use Mantine UI components consistently
   - Follow Mantine's props system for styling
   - Use the modals system from @mantine/modals for dialogs

3. **State Management**:
   - Use local component state with useState for component-specific state
   - Use custom hooks for shared logic
   - Pass data and callbacks through props

4. **Code Quality**:
   - Follow ESLint rules (project extends Next.js core web vitals)
   - Use Prettier for code formatting
   - Write meaningful component and function names
   - Use camelCase for variables and functions, PascalCase for components

### Database Schema

The database schema is defined in `prisma/schema.prisma` and includes models for:
- Factions, Killteams, Fireteams, and Operatives (game units)
- Equipment, Weapons, and WeaponProfiles (items and stats)
- Users and Sessions (user management)
- Rosters and RosterOperatives (user's game rosters)

When making changes to the database schema, always update the Prisma schema and run `npx prisma generate` to update the client.

### Special Considerations

1. **Game Editions**: The application supports multiple editions of Kill Team (kt21, kt24). Code should handle edition-specific differences gracefully.

2. **Image Handling**: Operative portraits can be stored on the server or referenced from external URLs. The code should handle both cases.

3. **HTML Content**: Game data often includes formatted text that is rendered using dangerouslySetInnerHTML. Be careful when handling this data to avoid XSS vulnerabilities.

4. **Responsive Design**: The application should work well on both desktop and mobile devices. Use Mantine's responsive props (like SimpleGrid's cols prop) to adjust layouts for different screen sizes.

## Dashboard and Operative Management

The dashboard is a central feature of KTDash, providing real-time management of operatives and game stats during gameplay.

### Dashboard Structure

The dashboard (`src/page/dashboard/index.jsx`) is organized into several key sections:

1. **Game Stats Tracking**:
   - Command Points (CP): Used for strategic ploys and abilities
   - Turn Points (TP): Tracks the current turn number
   - Victory Points (VP): Tracks the player's score

2. **Tabbed Interface**:
   - **Operatives**: Displays active operatives with their stats and abilities
   - **Ploys**: Shows available strategic and tactical ploys
   - **Equipment**: Displays available equipment (KT24 edition only)
   - **TacOps**: Shows tactical objectives and allows tracking their completion

### Operative Management

The dashboard provides several features for managing operatives during gameplay:

1. **Operative Selection**:
   - Use the "Select Operatives" button to choose which operatives to display
   - The SelectOperativesModal (`src/page/dashboard/modals/index.jsx`) allows toggling visibility of operatives

2. **Wound Tracking**:
   - Click on an operative's wound counter to update their current wounds
   - The UpdateWoundsModal (`src/components/operative-card/modals/index.jsx`) provides a simple interface to adjust wounds
   - Wound status is visually indicated by color (red for critically wounded)

3. **Order Management**:
   - Click on an operative's order icon to change their order (engage/conceal)
   - The OrderPicker component (`src/components/operative-card/index.jsx`) allows selecting both order type and activation status
   - Orders are visually indicated by different icons (orange for active, white for activated)

4. **Operative Details**:
   - Each operative is displayed using the OperativeCard component (`src/components/operative-card/index.jsx`)
   - Cards show key stats (APL, Move, Save, Wounds)
   - Weapons, abilities, and equipment are displayed with interactive tooltips
   - Custom portraits can be uploaded for each operative

### Dashboard Reset and Navigation

1. **Reset Dashboard**:
   - Use the "Reset" button to return all stats to their initial values
   - This resets CP, TP, VP, and operative activation status

2. **Edit Roster**:
   - Use the "Edit" button to navigate to the roster editing page
   - Changes made to the roster will be reflected in the dashboard

### Best Practices for Dashboard Development

1. **State Management**:
   - The dashboard uses SWR for data fetching and optimistic updates
   - Changes to operative stats should update the UI immediately before server confirmation
   - Use the provided callback functions for updating operative stats

2. **Performance Considerations**:
   - The dashboard may display many operatives with complex stats
   - Use memoization and callback optimization to prevent unnecessary re-renders
   - Consider the mobile experience when adding new features

## Best Practices

1. Always follow the established code patterns in the project
2. Keep components focused on a single responsibility
3. Use TypeScript types/interfaces for better code safety
4. Test your changes thoroughly before submitting
5. Document complex logic or non-obvious decisions
6. Keep dependencies updated regularly
7. Follow security best practices, especially when handling user data
8. Optimize performance for large datasets (the game can have many operatives and equipment items)
