# Frontend Architecture Documentation

## Architecture Overview

**Application Type**: React 19 + Next.js 15 Personal Finance Tracker
**State Management**: React Context API with custom hooks
**UI System**: Shadcn/ui + Radix UI primitives
**Styling**: Tailwind CSS with CSS variables theming
**Form Management**: React Hook Form + Zod validation
**Data Visualization**: Recharts library
**Animation**: Framer Motion

## Component Architecture Hierarchy

### Application Structure Tree

```
app/layout.tsx (Root Layout)
├── ThemeProvider (Theme context)
├── NavWrapper (Authentication boundary)
│   └── Navigation (Sidebar + User interface)
└── Context Provider Stack
    ├── ExpenseProvider (Expense state)
    ├── IncomeProvider (Income state)
    ├── BudgetProvider (Budget state)
    └── GoalProvider (Goal state)
```

### Component Organization Structure

```
src/components/
├── ui/                     # Base design system components
├── authentication/        # Auth flow components
├── expenses/              # Expense management components
├── expense-table/         # Table system components
├── budgets/               # Budget management components
├── budget/                # Budget wizard components
├── category-overview/     # Category analysis components
├── nav-bar/               # Navigation components
├── incomes/               # Income management components
├── goals/                 # Goal tracking components
└── onboarding/            # User onboarding flow
```

## State Management System

### Context Provider Specifications

#### ExpenseContext (`lib/context/ExpenseContext.tsx`)

**State Schema:**

```typescript
interface ExpenseContextState {
  expenses: PaginatedExpense[]; // Current page expenses
  allFilteredExpenses: Expense[]; // Complete filtered dataset
  loading: boolean; // UI loading state
  error: string | null; // Error messages
  pagination: PaginationInfo; // Page metadata
  filters: ExpenseFilters; // Active filter state
}
```

**Core Methods:**

- `createExpense(data: ExpenseData): Promise<void>`
- `updateExpense(id: string, data: Partial<ExpenseData>): Promise<void>`
- `deleteExpense(id: string): Promise<void>`
- `updateFilters(filters: ExpenseFilters): void`
- `setPage(page: number): void`

**Usage Pattern:**

```typescript
const { expenses, createExpense, loading, updateFilters } = useExpenseContext();
```

#### BudgetContext (`lib/context/BudgetContext.tsx`)

**State Schema:**

```typescript
interface BudgetContextState {
  budgets: BudgetInsight[]; // Budget data with spending
  categories: Category[]; // Available categories
  loading: boolean; // Loading state
  stats: BudgetStatistics; // Aggregated statistics
}
```

**Core Methods:**

- `createBudget(data: BudgetData): Promise<void>`
- `getBudgetAlerts(): BudgetAlert[]`
- `previewAssignment(allocation: BudgetAllocation): BudgetPreview`
- `getBudgetExpenses(budgetId: string): Promise<Expense[]>`

#### GoalContext (`lib/context/GoalContext.tsx`)

**State Schema:**

```typescript
interface GoalContextState {
  goals: GoalWithProgress[]; // Goals with progress data
  loading: boolean; // Loading state
  stats: GoalStatistics; // Goal statistics
}
```

**Core Methods:**

- `createGoal(data: GoalData): Promise<void>`
- `addGoalEntry(goalId: string, amount: number): Promise<void>`
- `getGoalEntries(goalId: string): Promise<GoalEntry[]>`

#### IncomeContext (`lib/context/IncomeContext.tsx`)

**State Schema:**

```typescript
interface IncomeContextState {
  incomes: Income[]; // Income entries
  loading: boolean; // Loading state
}
```

**Core Methods:**

- `createIncome(data: IncomeData): Promise<void>`
- `getIncomeStats(dateRange: DateRange): Promise<IncomeStats>`

## Component System Architecture

### Base UI Components (`components/ui/`)

**Form Components:**

- `input.tsx` - Text input with validation states
- `select.tsx` - Dropdown selection component
- `button.tsx` - Button variants and sizes
- `checkbox.tsx` - Checkbox with form integration
- `textarea.tsx` - Multi-line text input

**Layout Components:**

- `card.tsx` - Content container with variants
- `sheet.tsx` - Slide-out panel component (right/left/top/bottom sides)
- `sidebar.tsx` - Navigation sidebar
- `separator.tsx` - Visual content divider

**Sheet Component Architecture:**

- Built on Radix Dialog primitives
- Responsive sliding animations
- Overlay backdrop with click-outside-to-close
- Customizable side positioning (right, left, top, bottom)
- Mobile-optimized responsive widths
- Keyboard accessibility (ESC to close)

```typescript
// Sheet usage pattern
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-full sm:max-w-md">
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
    </SheetHeader>
    <div className="py-4">{/* Sheet content */}</div>
  </SheetContent>
</Sheet>
```

**Navigation Components:**

- `dropdown-menu.tsx` - Context menus
- `tabs.tsx` - Tab navigation
- `pagination.tsx` - Data pagination

**Data Display Components:**

- `table.tsx` - Data table with sorting
- `badge.tsx` - Status indicators
- `progress.tsx` - Progress bars
- `chart.tsx` - Chart container

**Feedback Components:**

- `toast.tsx` - Notification system
- `alert-dialog.tsx` - Modal confirmations
- `skeleton.tsx` - Loading placeholders

**Design System Integration:**

- CSS variables: `--primary`, `--secondary`, `--background`, `--foreground`
- Theme switching via `next-themes`
- Consistent spacing using Tailwind utilities
- Radix UI primitives for accessibility

### Authentication System (`components/authentication/`)

#### Authentication Component (`authentication.tsx`)

**State Management:**

```typescript
interface AuthState {
  currentView: "tabs" | "password-recovery" | "email-confirmation";
  signupEmail: string | null;
}
```

**Component Flow:**

```
Authentication
├── Login (login.tsx) - Email/password authentication
├── Signup (signup.tsx) - User registration
├── PasswordRecovery (password-recovery.tsx) - Password reset
└── EmailConfirmation (email-confirmation.tsx) - Email verification
```

**Integration Pattern:**

- Supabase authentication via server actions
- React Hook Form validation
- Loading state management
- Automatic redirection on success

### Expense Management System (`components/expenses/`)

#### AddExpenseSheet Component (`AddExpenseSheet.tsx`)

**ForwardRef Architecture:**

```typescript
interface AddExpenseSheetRef {
  open: () => void;
}

interface AddExpenseSheetProps {
  showTrigger?: boolean;
}

const AddExpenseSheet = forwardRef<AddExpenseSheetRef, AddExpenseSheetProps>();
```

**State Management:**

- Sheet open/close state management
- Context integration for expense creation
- Toast notification handling
- Form validation and submission

**Integration Patterns:**

```typescript
// Main usage with trigger button
<AddExpenseSheet ref={sheetRef} />;

// Programmatic opening from other components
const sheetRef = useRef<AddExpenseSheetRef>(null);
const handleOpenSheet = () => sheetRef.current?.open();

// Without trigger button for external control
<AddExpenseSheet ref={sheetRef} showTrigger={false} />;
```

**Features:**

- ShadCN Sheet component integration
- Responsive slide-out panel (right side)
- Mobile-optimized layout
- Form validation with ExpenseForm component
- Automatic context updates on success

#### ExpenseForm Component (`ExpenseForm.tsx`)

**Props Interface:**

```typescript
interface ExpenseFormProps {
  categories: CategoryWithSubcategories[];
  initialData?: Partial<ExpenseData>;
  onSubmit: (data: ExpenseData) => Promise<void>;
  onCancel: () => void;
}
```

**Form State:**

- React Hook Form with Zod validation
- Dynamic subcategory filtering
- Date/time selection
- Currency formatting

**Context Integration:**

```typescript
const { createExpense } = useExpenseContext()

<ExpenseForm
  categories={categories}
  onSubmit={createExpense}
  onCancel={() => setShowForm(false)}
/>
```

#### ExpenseItem Component (`ExpenseItem.tsx`)

**Display Patterns:**

- Responsive card layout
- Category visualization
- Action menu integration
- Status indicators

#### ExpenseSummary Component (`ExpenseSummary.tsx`)

**Data Processing:**

- Period-based calculations
- Category breakdowns
- Trend analysis
- Visual summaries

**Privacy Features:**

- Amount hiding functionality with \*\*\*\* masking
- Individual toggle controls for Total and Monthly amounts
- Eye/EyeOff icon toggle buttons
- Independent visibility state management
- Persistent state during context updates

### Expense Table System (`components/expense-table/`)

#### ExpenseTable Architecture

**Component Structure:**

```
ExpenseTable (ExpenseTable.tsx)
├── ExpenseFilters (ExpenseFilters.tsx)
├── Table Body with ExpenseActions (ExpenseActions.tsx)
└── ExpensePagination (ExpensePagination.tsx)
```

**Props Interface:**

```typescript
interface ExpenseTableProps {
  onAddExpense?: () => void;
}
```

**State Integration:**

- Reads from `ExpenseContext` for data and pagination
- Calls `updateFilters()` on filter changes
- Manages bulk operations on selected rows
- Integrates with external AddExpenseSheet via callback

**Feature Implementation:**

- Server-side pagination
- Advanced filtering (date, categories, merchants)
- Bulk operations (delete, export)
- Responsive mobile layout
- Sort functionality
- Empty state with "Add first expense" button integration

**Integration with AddExpenseSheet:**

```typescript
// Parent component integration
const sheetRef = useRef<AddExpenseSheetRef>(null);
const handleOpenSheet = () => sheetRef.current?.open();

return (
  <>
    <ExpenseTable onAddExpense={handleOpenSheet} />
    <AddExpenseSheet ref={sheetRef} showTrigger={false} />
  </>
);
```

### Budget Management System (`components/budgets/`)

#### SmartBudgetWizard (`budget/SmartBudgetWizard.tsx`)

**Multi-Step Architecture:**

```
SmartBudgetWizard
├── FinancialSummaryStep (Income analysis)
├── SpendingInsightsStep (Historical patterns)
├── BudgetAllocatorStep (Allocation interface)
├── ConflictResolutionStep (Conflict handling)
└── ConfirmationStep (Final review)
```

**State Management:**

```typescript
interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  financialSummary: FinancialSummary;
  spendingInsights: SpendingInsights;
  allocations: BudgetAllocation[];
  conflicts: BudgetConflict[];
}
```

**Data Flow:**

1. Eligibility verification (sufficient data check)
2. Financial analysis (income and spending data)
3. AI-powered recommendations
4. Conflict resolution interface
5. Bulk budget creation via `BudgetContext`

#### BudgetForm Component (`BudgetForm.tsx`)

**Features:**

- Category selection with visual indicators
- Date range picker for budget periods
- Amount allocation with percentage calculations
- Preview mode for budget assignment

#### BudgetCard Component (`BudgetCard.tsx`)

**Display Elements:**

- Budget vs actual spending
- Progress visualization
- Alert indicators
- Action menu

### Category Overview System (`components/category-overview/`)

#### CategoryOverview Architecture

**Component Composition:**

```
CategoryOverview (CategoryOverview.tsx)
├── CategorySummaryCards (Aggregate statistics)
├── CategoryPieChart (Visual breakdown)
├── WeeklySpendingChart (Trend analysis)
└── CategoryBreakdownCard[] (Detailed per category)
```

**Data Processing Functions:**

- `processExpensesByCategory()` - Groups expenses by category
- `processWeeklySpending()` - Calculates weekly trends
- Real-time updates from `ExpenseContext`

**Chart Integration:**

- Recharts library for data visualization
- Responsive chart layouts
- Interactive tooltips
- Theme-aware color schemes

### Navigation System (`components/nav-bar/`)

#### NavWrapper Component (`nav-wrapper.tsx`)

**Authentication Integration:**

```typescript
// Listens to Supabase auth state changes
// Shows skeleton during auth verification
// Conditionally renders Navigation or children
```

#### Navigation Component (`navigation.tsx`)

**State Management:**

```typescript
interface NavigationState {
  isLoggingOut: boolean;
  currentTheme: "light" | "dark" | "system";
}
```

**Features:**

- Sidebar navigation with route icons
- User profile dropdown with avatar
- Theme switcher integration
- Logout confirmation flow

## Page Integration Patterns

### Layout Architecture

#### Private Layout (`app/(private)/layout.tsx`)

**Provider Stack:**

```typescript
export default function PrivateLayout({ children }) {
  return (
    <ExpenseProvider>
      <IncomeProvider>
        <BudgetProvider>
          <GoalProvider>
            <SidebarProvider>
              <Navigation>{children}</Navigation>
            </SidebarProvider>
          </GoalProvider>
        </BudgetProvider>
      </IncomeProvider>
    </ExpenseProvider>
  );
}
```

### Page Component Integration Example

#### Expense Page (`app/(private)/gastos/page.tsx`)

**Implementation Pattern:**

```typescript
export default function ExpensesPage() {
  const { updateFilters } = useExpenseContext();
  const { categories } = useCategories();
  const addExpenseSheetRef = useRef<AddExpenseSheetRef>(null);

  const [uiFilters, setUiFilters] = useState<UIExpenseFilters>({
    dateRange: "all",
  });

  const handleFiltersChange = async (filters: UIExpenseFilters) => {
    setUiFilters(filters);
    const dbFilters = convertToDatabaseFilters(filters);
    await updateFilters(dbFilters);
  };

  const handleOpenAddExpense = () => {
    addExpenseSheetRef.current?.open();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Gastos
          </h1>
          <AddExpenseSheet ref={addExpenseSheetRef} />
        </div>

        <div className="space-y-6">
          <ExpenseSummary />

          <ExpenseFilters
            categories={categories}
            filters={uiFilters}
            onFiltersChange={handleFiltersChange}
          />

          <ExpenseTable onAddExpense={handleOpenAddExpense} />
        </div>
      </div>
    </div>
  );
}
```

## Design System Implementation

### Theme System

**CSS Variable Structure:**

```css
:root {
  --primary: hsl(
    var(--primary-hue) var(--primary-saturation) var(--primary-lightness)
  );
  --secondary: hsl(
    var(--secondary-hue) var(--secondary-saturation) var(--secondary-lightness)
  );
  --background: hsl(
    var(--background-hue) var(--background-saturation) var(--background-lightness)
  );
  --foreground: hsl(
    var(--foreground-hue) var(--foreground-saturation) var(--foreground-lightness)
  );
}
```

**Theme Integration:**

- `next-themes` provider for mode switching
- Automatic system preference detection
- Persistent theme selection
- CSS variable updates on theme change

### Component Design Patterns

**1. Compound Components:**
Complex UI components split into focused sub-components for maintainability

**2. Render Props Pattern:**
Flexible component composition for reusable logic

**3. Custom Hook Extraction:**
Business logic separated from UI components

**4. Context Injection:**
Automatic state availability without prop drilling

**5. ForwardRef Pattern:**
Imperative component control through ref objects for programmatic access

```typescript
// ForwardRef implementation for external control
interface ComponentRef {
  open: () => void;
  close: () => void;
  reset: () => void;
}

const Component = forwardRef<ComponentRef, ComponentProps>((props, ref) => {
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
    reset: () => setFormData(initialData),
  }));

  return <div>Component JSX</div>;
});

// Usage in parent component
const componentRef = useRef<ComponentRef>(null);
const handleAction = () => componentRef.current?.open();
```

### Responsive Design Implementation

**Mobile-First Approach:**

- Tailwind breakpoint system: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Collapsible sidebar on mobile devices
- Touch-friendly interface elements
- Progressive enhancement patterns

**Responsive Patterns:**

- Tables transform to card layouts on mobile
- Forms adapt to smaller screens
- Navigation collapses to overlay
- Charts resize automatically
- Sheets adapt width responsively (`w-full sm:max-w-md`)
- Sheet content includes overflow scrolling for mobile

## Data Flow Architecture

### Primary Data Flow Patterns

**1. User Input → Context → Database:**

```
Form Component → Context Provider → Service Class → Supabase
```

**2. Real-time Updates:**

```
Database Change → Context Refresh → Component Re-render
```

**3. Cross-Component Communication:**

```
Component A → Context Update → Component B Auto-update
```

### State Synchronization

**Context Update Patterns:**

- Optimistic updates for immediate UI feedback
- Error handling with rollback capabilities
- Loading states during async operations
- Automatic refresh on navigation

## Testing Architecture

### Component Testing Strategy

**Unit Testing:**

- Jest + Testing Library for component isolation
- Mock context providers for controlled testing
- Snapshot testing for UI consistency
- Accessibility testing with jest-axe

**Integration Testing:**

- Full context provider testing
- User interaction flows
- API integration scenarios
- Cross-component communication

### Testing Patterns

**Component Test Structure:**

```typescript
describe("ComponentName", () => {
  const mockContextValue = {
    // Mock context methods and state
  };

  const renderWithContext = (props = {}) => {
    return render(
      <MockProvider value={mockContextValue}>
        <ComponentName {...props} />
      </MockProvider>
    );
  };

  test("renders correctly", () => {
    renderWithContext();
    // Assertions
  });
});
```

## Mobile Responsiveness Patterns

### Responsive Component Behavior

**Sidebar Navigation:**

- Desktop: Fixed sidebar with navigation links
- Mobile: Collapsible overlay with hamburger menu

**Data Tables:**

- Desktop: Full table with all columns
- Mobile: Card layout with essential information

**Forms:**

- Desktop: Multi-column layouts
- Mobile: Single-column stacked layouts

**Charts:**

- Desktop: Full-size interactive charts
- Mobile: Simplified touch-friendly charts

### Progressive Enhancement

**Core Functionality:**

- Base functionality without JavaScript
- Enhanced UX with React hydration
- Offline-friendly design patterns
- Performance-optimized loading

---

This documentation provides comprehensive frontend architecture information optimized for systematic development and LLM-assisted implementation.
