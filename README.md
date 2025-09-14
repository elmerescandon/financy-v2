# Financy v2 - Personal Finance Tracker

## Project Overview

**Type**: Next.js Personal Finance Application
**Purpose**: Expense tracking with intelligent automation (iPhone Shortcuts, email parsing)
**Architecture**: Full-stack web application with external integrations

## Technology Stack

**Frontend Stack**:

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + Shadcn/ui + Radix UI
- React Context + Custom Hooks (state management)
- React Hook Form + Zod (forms/validation)
- Recharts (data visualization)
- Jest + Testing Library (testing)
- Privacy controls (amount hiding/showing with toggle buttons)

**Backend Stack**:

- Supabase (PostgreSQL + Authentication + Row Level Security)
- Next.js API Routes
- Google Gmail API (email integration)
- iPhone Shortcuts (external automation)

## Project Structure Context

```
src/
├── app/                    # Next.js App Router
│   ├── (private)/         # Authentication-protected routes
│   ├── api/               # Backend API endpoints
│   └── auth/              # Authentication flow handlers
├── components/            # React UI components
│   ├── ui/               # Base design system components
│   └── [feature-name]/   # Feature-specific components
├── lib/                   # Core business logic
│   ├── supabase/         # Database service layer
│   ├── context/          # React state management
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── middleware.ts         # Authentication middleware
```

## Documentation System

This README serves as the **central navigation hub** for development documentation. Each documentation file has a specific purpose:

### Documentation File Mapping

| File                  | Target Audience     | Content Type                                                | Usage Context                                                                           |
| --------------------- | ------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `README_FRONT.md`     | Frontend developers | Component architecture, state patterns, UI system           | When implementing UI components, managing state, or understanding frontend architecture |
| `README_DEV_FRONT.md` | Frontend developers | Development guidelines, testing standards, code patterns    | When writing new components, implementing tests, or following code standards            |
| `README_BACK.md`      | Backend developers  | Database schema, API endpoints, services, integrations      | When working with database, implementing APIs, or integrating external services         |
| `README_DEV_BACK.md`  | Backend developers  | Development guidelines, security patterns, SOLID principles | When creating services, implementing security, or following backend standards           |

## Development Context Resolution

### Frontend Development Contexts

**Component Implementation**:

- Architecture patterns → `README_FRONT.md`
- Development standards → `README_DEV_FRONT.md`
- Testing implementation → `README_DEV_FRONT.md`

**State Management**:

- Context patterns → `README_FRONT.md`
- Hook usage → `README_FRONT.md`
- Data flow → `README_FRONT.md`

**UI Development**:

- Design system → `README_FRONT.md`
- Component standards → `README_DEV_FRONT.md`
- Form patterns → `README_DEV_FRONT.md`

### Backend Development Contexts

**API Development**:

- Endpoint documentation → `README_BACK.md`
- Implementation patterns → `README_DEV_BACK.md`
- Security implementation → `README_DEV_BACK.md`

**Database Operations**:

- Schema reference → `README_BACK.md`
- Service patterns → `README_DEV_BACK.md`
- Migration procedures → `README_BACK.md`

**External Integrations**:

- Gmail API implementation → `README_BACK.md`
- iPhone Shortcuts setup → `README_BACK.md`
- Authentication flows → `README_BACK.md`

### Full-Stack Development Contexts

**Feature Implementation Workflow**:

1. Database schema → `README_BACK.md`
2. Service layer → `README_DEV_BACK.md`
3. API endpoints → `README_BACK.md` + `README_DEV_BACK.md`
4. Frontend components → `README_FRONT.md` + `README_DEV_FRONT.md`
5. Integration testing → Both DEV files

