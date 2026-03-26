# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Flow Client frontend application.

## Project Overview

Flow Client is a modern Next.js/React frontend application that provides an intuitive interface for the Fireplace productivity system, enabling users to manage development projects, learning goals, and daily tasks through a clean, responsive UI with real-time updates and AI-powered assistance.

**Core Features:**
- Dynamic plan management for development and learning projects
- Dual-mode task system with daily resets and persistent long-term goals
- Real-time task scheduling with calendar integration
- AI-powered task suggestions and daily focus recommendations
- Progress visualization and achievement tracking
- Archived task history with search capabilities
- Dark/light theme support with consistent design system
- GitHub integration panel for development workflows
- Learning resource suggestions with video recommendations

**User Experience:**
- Seamless task creation and management with inline editing
- Drag-and-drop task organization (planned)
- Responsive design optimized for desktop and tablet use
- Instant feedback with loading states and error handling
- Keyboard shortcuts for power users
- Persistent state management across sessions

**Backend Repository:** `~/Documents/Code/Go/fireplace` (Go + Gin + PostgreSQL). When features include backend work, spec updates and implementation should target that repo for BE changes and this repo for FE changes.

**Backend Integration**: Connects to the Go-based Fireplace API running on port 6060, providing real-time synchronization of all productivity data.

## Architecture & Tech Stack

- **Framework**: Next.js 15.3.1 with App Router
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Date Handling**: react-datepicker
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Native fetch API with custom service layer

## Project Structure

```
flow-client/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── myplans/            # Plans listing page
│   │   ├── plan/[planId]/      # Individual plan detail page
│   │   ├── create-plan/        # Plan creation page
│   │   └── learning/           # Learning resources pages
│   ├── components/             # React components
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── Todo.tsx            # Main todo/checklist component
│   │   ├── GitHub.tsx          # GitHub integration component
│   │   ├── Header.tsx          # App header
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── UserProfile.tsx     # User profile component
│   ├── services/               # API service layer
│   │   └── api.ts              # All API endpoints and types
│   ├── config/                 # Configuration
│   │   └── environment.ts      # Environment variables
│   └── lib/                    # Utilities
│       └── utils.ts            # Helper functions
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 3010)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Key Features & Components

### 1. Plan Management (`/myplans`)
- Lists all user plans (development and learning types)
- Create new plans
- Delete existing plans
- Navigation to individual plan details

### 2. Todo/Checklist System (`Todo.tsx`)
- **Daily Tasks**: Reset daily, scheduled items
- **Long-term Tasks**: Persistent project goals
- **Archived Tasks**: Completed/archived items history
- Features:
  - Create, update, delete tasks
  - Mark tasks as complete
  - Schedule tasks with date/time
  - Archive completed tasks
  - AI-powered task suggestions
  - Daily insights from long-term goals
  - Progress tracking

### 3. Plan Detail View (`/plan/[planId]`)
- Displays plan information (name, description, focus)
- Integrates Todo component for task management
- Shows AI-suggested learning videos
- Progress visualization
- GitHub integration panel

## API Integration

The frontend communicates with the Go backend at `http://localhost:6060`. Key endpoints:

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/{id}` - Get plan details
- `POST /api/plans` - Create new plan
- `DELETE /api/plans/{id}` - Delete plan
- `PATCH /api/plans/{id}/toggle-daily-reset` - Toggle daily reset

### Checklists
- `GET /api/plans/{planId}/checklists?scope={daily|longterm}&archived={bool}` - Get tasks
- `POST /api/plans/{planId}/checklists` - Create task
- `PATCH /api/plans/{planId}/checklists/{id}` - Update task
- `DELETE /api/plans/{planId}/checklists/{id}` - Delete task
- `PATCH /api/plans/{planId}/checklists/{id}/schedule` - Schedule task
- `PATCH /api/plans/{planId}/checklists/{id}/archive` - Archive task
- `GET /api/plans/{planId}/checklists/archived` - Get archived tasks

### AI Insights
- `GET /api/insights/checklist-suggestion` - Get AI task suggestion
- `GET /api/insights/checklist-suggestion-daily` - Get daily insights
- `GET /api/insights/suggest-videos` - Get learning video suggestions

## Code Conventions

### TypeScript Patterns
- Use interfaces for data models (e.g., `ChecklistItem`, `Plan`, `ApiResponse`)
- Explicit typing for function parameters and returns
- Enum-like objects with `as const` for fixed values

### Component Structure
- Functional components with hooks
- Custom hooks for complex logic
- Props interfaces defined above components
- Destructured props in function parameters

### State Management
- Local state with useState for component-specific data
- useEffect for data fetching and side effects
- Loading and error states for async operations

### API Service Layer
- All API calls centralized in `src/services/api.ts`
- Typed request/response interfaces
- Error handling with try/catch blocks
- Consistent response format

### Styling
- Tailwind utility classes for styling
- Custom CSS variables in globals.css
- Dark mode support via CSS media queries
- Component-specific styles using cn() utility
- Consistent color scheme:
  - Primary: rgb(247, 111, 83) - Orange/coral
  - Background Light: rgb(242, 240, 227)
  - Background Dark: #1f1f1f
  - Text Light: rgb(46, 46, 46)
  - Text Dark: rgb(209, 207, 192)

## Environment Configuration

Environment variables are managed in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:6060
NEXT_PUBLIC_API_URL=http://localhost:6060
```

Configuration is centralized in `src/config/environment.ts`.

## Testing & Validation

Before committing changes:
1. Run `npm run lint` to check for linting errors
2. Run `npm run build` to ensure production build works
3. Test in development with `npm run dev`
4. Verify API integration with backend running on port 6060
5. Check both light and dark mode appearances
6. Test core functionality:
   - Plan CRUD operations
   - Task management (create, update, delete, archive)
   - Task scheduling
   - AI suggestions
   - Progress tracking

## Common Development Tasks

### Adding a New Page
1. Create new folder in `src/app/`
2. Add `page.tsx` file with default export
3. Follow existing page structure patterns
4. Update navigation if needed

### Creating a New Component
1. Add to `src/components/`
2. Use TypeScript with proper interfaces
3. Follow existing component patterns
4. Import shadcn/ui components as needed

### Adding API Endpoints
1. Add interface types to `src/services/api.ts`
2. Create async function following existing patterns
3. Handle errors consistently
4. Update relevant components to use new endpoint

### Modifying Styles
1. Use Tailwind utilities first
2. Update CSS variables in globals.css for theme changes
3. Ensure dark mode compatibility
4. Test responsive design

## Important Notes

- The app uses a fixed test plan ID for development: `22222222-2222-2222-2222-222222222222`
- API base URL can be overridden via environment variables
- The backend must be running for full functionality
- Date/time handling uses ISO format strings
- All API responses follow consistent format with statusCode, message, and result fields

## Troubleshooting

### Common Issues
1. **API Connection Failed**: Ensure backend is running on port 6060
2. **Build Errors**: Check TypeScript types and imports
3. **Styling Issues**: Verify Tailwind classes and CSS variables
4. **State Not Updating**: Check useEffect dependencies
5. **Dark Mode Issues**: Test with system preference changes

### Debug Tips
- Use browser DevTools Network tab to inspect API calls
- Check console for error messages
- Verify environment variables are loaded
- Test with different plan IDs and task states