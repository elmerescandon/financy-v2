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

## Environment Configuration

**Required Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Optional Integrations**:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/auth
```

## Development Commands

**Core Development**:

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm test` - Execute Jest test suite
- `npm run lint` - ESLint validation

**Database Operations**:

- `npx supabase db push` - Apply database migrations
- `npx supabase db reset` - Reset database to migration state

## Implementation Workflows

### Adding New Functionality

**New Component Workflow**:

1. Consult `README_FRONT.md` for architecture patterns
2. Follow `README_DEV_FRONT.md` for implementation standards
3. Implement: `src/components/[feature]/ComponentName.tsx`
4. Test: `src/components/[feature]/__tests__/ComponentName.test.tsx`

**New API Endpoint Workflow**:

1. Review database schema in `README_BACK.md`
2. Follow service patterns in `README_DEV_BACK.md`
3. Implement: `src/app/api/[endpoint]/route.ts`
4. Create service: `src/lib/supabase/[Feature]Service.ts`

**New Database Table Workflow**:

1. Create migration: `supabase/migrations/[timestamp]_[description].sql`
2. Define types: `src/types/[feature].ts`
3. Implement service: `src/lib/supabase/[Feature]Service.ts`
4. Update documentation: `README_BACK.md`

### Debugging Context Resolution

**Frontend Issues**:

- Component state problems → `README_FRONT.md` state management section
- UI/styling inconsistencies → `README_FRONT.md` design system section
- Test failures → `README_DEV_FRONT.md` testing standards section

**Backend Issues**:

- API response errors → `README_BACK.md` API endpoints section
- Database query problems → `README_BACK.md` schema section
- Service layer errors → `README_DEV_BACK.md` service patterns section

**Integration Issues**:

- Gmail synchronization → `README_BACK.md` Gmail integration section
- iPhone Shortcuts connectivity → `README_BACK.md` external integrations section
- Authentication failures → `README_BACK.md` authentication section

## Key Development Locations

**Frontend Components**: `src/components/` - Organized by feature domain
**Backend Services**: `src/lib/supabase/` - Database service classes with business logic
**Type Definitions**: `src/types/` - TypeScript interfaces for all entities
**State Management**: `src/lib/context/` - React context providers and reducers
**API Endpoints**: `src/app/api/` - Next.js route handlers
**Test Files**: `**/__tests__/` - Co-located with source files

## Context-Aware Development Guide

**For LLM Implementation**: When implementing features, first determine the development context (frontend, backend, or full-stack), then consult the appropriate documentation files for architecture patterns, implementation standards, and testing requirements. Each documentation file contains specific implementation templates and code examples for its domain.
