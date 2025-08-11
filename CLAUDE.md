# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint validation (Note: ESLint errors don't fail builds)
- `npm test` - Execute Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

**Database Commands:**
- `npx supabase db push` - Apply database migrations
- `npx supabase db reset` - Reset database to migration state

**Single Test Execution:**
```bash
npm test -- --testPathPattern=ComponentName.test.tsx
npm test -- --testNamePattern="specific test description"
```

## Project Architecture

**Tech Stack:**
- Next.js 15 + React 19 + TypeScript (App Router)
- Supabase (PostgreSQL + Authentication + RLS)
- Tailwind CSS + shadcn/ui + Radix UI
- React Context for state management
- Jest + Testing Library for testing

**Key Patterns:**
- Feature-based component organization (`src/components/[feature]/`)
- Service layer pattern (`src/lib/supabase/[entity]Service.ts`)
- React Context providers for state (`src/lib/context/`)
- Co-located tests (`**/__tests__/`)
- Type-first development (`src/types/`)

## Documentation System

This project uses a specialized documentation approach:

**When implementing features, always consult:**
1. `README.md` - Project overview and navigation hub
2. `README_FRONT.md` - Component architecture and UI patterns
3. `README_DEV_FRONT.md` - Frontend development standards and testing
4. `README_BACK.md` - Database schema, APIs, and integrations
5. `README_DEV_BACK.md` - Backend development patterns and SOLID principles

**Cursor Rules Integration:**
The project includes Cursor IDE rules in `.cursor/rules/financy-rules.mdc` that require:
1. Reading README.md first
2. Consulting appropriate DEV documentation
3. Asking users about test requirements before implementation
4. Following established guidelines
5. Updating documentation after feature implementation

## Authentication & Security

**Authentication:**
- Supabase Auth with Row Level Security (RLS)
- Protected routes under `(private)` directory
- Authentication middleware in `src/middleware.ts`
- Auth context via `src/hooks/useAuth.ts`

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## External Integrations

**Gmail API Integration:**
- OAuth flow: `/api/gmail/auth`
- Email parsing for expense extraction
- Endpoints: `/api/gmail/{auth,disconnect,status,sync}`

**iPhone Shortcuts:**
- Automated expense entry via shortcuts
- Integration endpoint: `/api/integrations/expenses`

## Component Development

**Component Structure:**
```
src/components/[feature]/
├── ComponentName.tsx      # Main component
├── index.ts              # Barrel exports
├── utils.ts              # Helper functions
├── __tests__/           # Co-located tests
└── types.ts             # Local type definitions
```

**State Management:**
- React Context providers in `src/lib/context/`
- Custom hooks in `src/hooks/`
- No external state libraries (Redux, Zustand, etc.)

## Database Operations

**Service Layer Pattern:**
- Database operations in `src/lib/supabase/[entity].ts`
- Type-safe operations with TypeScript
- Consistent error handling across services
- RLS policies enforce data security

**Database Schema:**
- Migrations in `supabase/migrations/`
- Type definitions mirror database schema
- Expense parsing with confidence scoring
- Multi-user support with user_id foreign keys

## Testing Standards

**Test Structure:**
- Jest + Testing Library + jsdom environment
- Co-located tests in `__tests__/` directories
- Alias support: `@/` maps to `src/`
- Coverage collection from all `src/` files

**Test Types:**
- Unit tests for individual components
- Integration tests for feature workflows
- Existing test examples in `src/components/expenses/__tests__/`

## Key Development Notes

- ESLint errors don't prevent production builds (configured in `next.config.ts`)
- Development server uses Turbopack for faster builds
- Comprehensive type system with runtime type guards
- Privacy-focused UI with amount hiding/showing toggles
- Multi-format data export capabilities