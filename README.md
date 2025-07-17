# Financy v2 - Personal Finance Tracker

## 🚀 Complete Developer Guide

A comprehensive Next.js expense tracking application with intelligent automation features including iPhone Shortcuts integration and email-based transaction parsing.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **UI**: Tailwind CSS + Shadcn/ui + Radix UI
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Testing**: Jest + Testing Library
- **Animations**: Framer Motion

## 📁 Project Architecture

### Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (private)/         # Protected routes (requires auth)
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication flows
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── authentication/   # Auth-related components
│   ├── expenses/         # Expense management
│   ├── budgets/          # Budget management
│   ├── goals/            # Savings goals
│   └── nav-bar/          # Navigation
├── lib/                   # Business logic & utilities
│   ├── supabase/         # Database services
│   ├── context/          # React context providers
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
└── types/                 # Global type definitions
```

### Authentication Flow

- **Provider**: Supabase Auth
- **Middleware**: Automatic session refresh
- **Security**: Row Level Security (RLS) on all tables
- **Onboarding**: Category setup for new users
- **Protected Routes**: All routes under `(private)/` require authentication

## 🗄️ Database Schema

**For detailed table structures, columns, relationships, and indexes see:** `README_BACK.md`

**Core Tables:** `expenses`, `categories`, `subcategories`, `budgets`, `savings_goals`, `goal_entries`
**Key Features:** RLS on all tables, user-scoped data, optimized indexes, foreign key constraints

## 🌐 API Endpoints

### Authentication Routes

- `GET /auth/confirm` - Email confirmation handler

### Gmail Integration

- `GET /api/gmail/auth` - OAuth flow initialization
- `POST /api/gmail/sync` - Sync transactions from Gmail
- `GET /api/gmail/status` - Check connection status
- `DELETE /api/gmail/disconnect` - Remove Gmail integration

### External Integrations

- `GET /api/integrations` - API documentation
- `POST /api/integrations/expenses` - Create expense from external sources
- `GET /api/integrations/expenses` - Health check

### Integration API Usage

#### iPhone Shortcuts

```json
POST /api/integrations/expenses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 15.50,
  "description": "Café con leche",
  "source": "iphone",
  "merchant": "Starbucks",
  "category": "Food & Dining",
  "payment_method": "tarjeta_credito"
}
```

#### Email Parsing

```json
POST /api/integrations/expenses
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 85.00,
  "description": "Compra en supermercado",
  "source": "email",
  "merchant": "Mercadona",
  "category": "Shopping",
  "confidence_score": 0.92,
  "raw_data": {
    "email_subject": "Compra realizada - Mercadona"
  }
}
```

## 🔄 State Management

### Context Providers

#### ExpenseContext

- **Location**: `src/lib/context/ExpenseContext.tsx`
- **Purpose**: Manages expense data, pagination, and filtering
- **Key Methods**:
  - `createExpense()` - Add new expense
  - `updateExpense()` - Update existing expense
  - `deleteExpense()` - Remove expense
  - `updateFilters()` - Apply filters and reset pagination
  - `setPage()` - Navigate pagination

#### BudgetContext

- **Location**: `src/lib/context/BudgetContext.tsx`
- **Purpose**: Handles budget management and insights
- **Key Methods**:
  - `createBudget()` - Create new budget
  - `getBudgetAlerts()` - Get overspending alerts
  - `previewAssignment()` - Preview budget allocation
  - `getBudgetExpenses()` - Get expenses for specific budget

#### GoalContext

- **Location**: `src/lib/context/GoalContext.tsx`
- **Purpose**: Manages savings goals and progress tracking
- **Key Methods**:
  - `createGoal()` - Create new savings goal
  - `addGoalEntry()` - Add contribution to goal
  - `getGoalEntries()` - Get goal contribution history

#### IncomeContext

- **Location**: `src/lib/context/IncomeContext.tsx`
- **Purpose**: Handles income tracking and statistics
- **Key Methods**:
  - `createIncome()` - Add new income entry
  - `getIncomeStats()` - Get income statistics for date range

### Usage Pattern

```tsx
// In layout.tsx
<ExpenseProvider>
  <IncomeProvider>
    <GoalProvider>{children}</GoalProvider>
  </IncomeProvider>
</ExpenseProvider>;

// In components
const { expenses, createExpense, loading } = useExpenseContext();
```

## 🧩 Component Structure

### UI Components (`/components/ui/`)

- Base components from Shadcn/ui
- Radix UI primitives with custom styling
- Consistent design system

### Feature Components

- `expenses/` - Expense forms, lists, summaries
- `budgets/` - Budget wizard, cards, forms
- `goals/` - Goal tracking, progress displays
- `category-overview/` - Spending breakdowns, charts
- `authentication/` - Login, signup, recovery forms
- `nav-bar/` - Sidebar navigation with theme switching

### Key Components

#### SmartBudgetWizard

- **Purpose**: Multi-step budget creation with AI assistance
- **Features**: Financial analysis, conflict resolution, percentage allocation
- **Location**: `components/budget/SmartBudgetWizard.tsx`

#### ExpenseTable

- **Purpose**: Paginated expense management with filtering
- **Features**: Sorting, filtering, bulk actions, pagination
- **Location**: `components/expense-table/ExpenseTable.tsx`

#### CategoryOverview

- **Purpose**: Visual spending analysis by category
- **Features**: Pie charts, weekly trends, spending summaries
- **Location**: `components/category-overview/CategoryOverview.tsx`

## 🛠️ Development Setup

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gmail Integration (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/auth
```

### Installation

```bash
# Install dependencies
npm install

# Run database migrations
npx supabase db push

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

## ✨ Feature Development Guide

### Adding a New Page

1. **Create page component** in `src/app/(private)/feature/page.tsx`
2. **Add to navigation** in `components/nav-bar/navigation.tsx`
3. **Create context provider** if needed in `lib/context/`
4. **Add to layout** if context is required

Example:

```tsx
// src/app/(private)/reports/page.tsx
export default function ReportsPage() {
  return <div>Reports Content</div>
}

// Add to navigation.tsx
{
  title: "Reports",
  url: "/reports",
  icon: BarChart3
}
```

### Adding New API Endpoint

1. **Create route handler** in `src/app/api/feature/route.ts`
2. **Add validation schema** in `lib/api/validation.ts`
3. **Add to API documentation** in integration endpoint
4. **Create service class** in `lib/supabase/` if needed

Example:

```tsx
// src/app/api/reports/route.ts
export async function GET(request: NextRequest) {
  const authResult = await validateApiKey(request);
  if (!authResult.success) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Implementation
}
```

### Adding Database Table

1. **Create migration** in `supabase/migrations/`
2. **Add RLS policies** for user data isolation
3. **Create TypeScript types** in `src/types/`
4. **Create service class** in `lib/supabase/`
5. **Add to context provider** if needed

### Creating New Component

1. **Create component file** in appropriate `components/` subdirectory
2. **Export from index.ts** if part of a module
3. **Add stories** for complex components
4. **Write tests** in `__tests__` directory

## 🔐 Security Features

- **Row Level Security (RLS)** on all Supabase tables
- **User-scoped data access** - users only see their own data
- **API key authentication** for external integrations
- **Input validation** with Zod schemas
- **CSRF protection** through Supabase Auth
- **Secure token storage** in httpOnly cookies

## 🔄 Data Flow

1. **Manual Entry**: Web interface → Context → Service → Supabase
2. **iPhone Shortcuts**: Siri → API endpoint → Validation → Database
3. **Email Parsing**: Gmail API → Parser → Confidence scoring → Database
4. **Budget Analysis**: Database → Insights calculation → Context → UI
5. **Real-time Updates**: Supabase subscriptions → Context → Component re-render

**Quick Reference:**

- Database details: `README_BACK.md`
- Type definitions: `src/types/`
- Service classes: `src/lib/supabase/`
- API validation: `src/lib/api/validation.ts`
