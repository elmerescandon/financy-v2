# Backend Architecture Documentation

## Database Schema Architecture

### Core Entity Tables

#### `expenses` Table Schema

**Purpose**: Primary transaction table supporting expenses, income, and transfers

**Column Specifications**:

```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  budget_id UUID REFERENCES budgets(id),
  merchant TEXT,
  payment_method TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  source TEXT DEFAULT 'manual',
  confidence_score DECIMAL(3,2),
  needs_review BOOLEAN DEFAULT FALSE,
  transaction_hash VARCHAR(64),
  receipt_url TEXT,
  tags JSONB,
  source_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `categories` Table Schema

**Purpose**: Expense categorization system

**Column Specifications**:

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `subcategories` Table Schema

**Purpose**: Detailed expense categorization

**Column Specifications**:

```sql
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `budgets` Table Schema

**Purpose**: Budget management and allocation

**Column Specifications**:

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  rollover_amount DECIMAL(12,2) DEFAULT 0,
  allocation_percentage DECIMAL(5,2),
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `savings_goals` Table Schema

**Purpose**: Goal-oriented savings tracking

**Column Specifications**:

```sql
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  target_date DATE,
  category_id UUID REFERENCES categories(id),
  budget_id UUID REFERENCES budgets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `goal_entries` Table Schema

**Purpose**: Individual contributions to savings goals

**Column Specifications**:

```sql
CREATE TABLE goal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Views

#### `budget_insights` View

**Purpose**: Comprehensive budget analysis combining multiple data sources

**View Definition**:

```sql
CREATE VIEW budget_insights AS
SELECT
  b.*,
  c.name as category_name,
  c.color as category_color,
  COALESCE(spent.total_spent, 0) as total_spent,
  (b.amount - COALESCE(spent.total_spent, 0)) as remaining_amount,
  CASE
    WHEN b.amount > 0 THEN (COALESCE(spent.total_spent, 0) / b.amount * 100)
    ELSE 0
  END as spent_percentage
FROM budgets b
JOIN categories c ON b.category_id = c.id
LEFT JOIN (
  SELECT
    budget_id,
    SUM(amount) as total_spent
  FROM expenses
  WHERE type = 'expense'
  GROUP BY budget_id
) spent ON b.id = spent.budget_id;
```

### Foreign Key Relationship Matrix

| Source Table  | Source Column  | Target Table  | Target Column | Delete Action | Purpose                 |
| ------------- | -------------- | ------------- | ------------- | ------------- | ----------------------- |
| subcategories | category_id    | categories    | id            | CASCADE       | Category hierarchy      |
| expenses      | category_id    | categories    | id            | SET NULL      | Expense categorization  |
| expenses      | subcategory_id | subcategories | id            | SET NULL      | Detailed categorization |
| expenses      | budget_id      | budgets       | id            | SET NULL      | Budget tracking         |
| budgets       | category_id    | categories    | id            | CASCADE       | Budget allocation       |
| savings_goals | category_id    | categories    | id            | NO ACTION     | Goal categorization     |
| savings_goals | budget_id      | budgets       | id            | NO ACTION     | Budget-goal linkage     |
| goal_entries  | goal_id        | savings_goals | id            | CASCADE       | Goal contributions      |

### Database Index Strategy

**Performance Optimization Indexes**:

```sql
-- User-scoped query optimization
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX idx_expenses_user_type_date ON expenses(user_id, type, date DESC);

-- Date range filtering
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_goal_entries_date ON goal_entries(goal_id, date DESC);

-- Transaction deduplication
CREATE INDEX idx_expenses_hash ON expenses(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Review workflow optimization
CREATE INDEX idx_expenses_review ON expenses(user_id, needs_review) WHERE needs_review = true;

-- Source-based filtering
CREATE INDEX idx_expenses_source ON expenses(user_id, source);

-- Foreign key performance
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_subcategory_id ON expenses(subcategory_id);
```

## API Endpoint Architecture

### Authentication System

#### Authentication Provider Configuration

**Provider**: Supabase Auth with JWT tokens
**Session Management**: HTTP-only cookies with automatic refresh
**Security Layer**: Row Level Security (RLS) enforcement
**External API Authentication**: JWT tokens as API keys

#### API Authentication Flow

```typescript
// API key validation pattern
Authorization: Bearer <jwt-token>

// Validation sequence
validateApiKey(request) → extractJWT() → verifyWithSupabase() → returnUser()
```

### Core API Route Specifications

#### Authentication Endpoints

| Endpoint        | Method | Purpose                    | Authentication |
| --------------- | ------ | -------------------------- | -------------- |
| `/auth/confirm` | GET    | Email confirmation handler | Public         |

#### Gmail Integration Endpoints (`/api/gmail/`)

| Endpoint                | Method | Purpose                      | Parameters |
| ----------------------- | ------ | ---------------------------- | ---------- |
| `/api/gmail/auth`       | GET    | OAuth flow initialization    | None       |
| `/api/gmail/sync`       | POST   | Sync transactions from Gmail | JWT token  |
| `/api/gmail/status`     | GET    | Check connection status      | JWT token  |
| `/api/gmail/disconnect` | DELETE | Remove Gmail integration     | JWT token  |

**OAuth Implementation Flow**:

1. User initiates connection → `GET /api/gmail/auth`
2. Redirect to Google OAuth consent screen
3. Google callback with authorization code
4. Exchange code for access/refresh tokens
5. Store tokens in `user_gmail_tokens` table
6. Subsequent API calls use stored tokens with automatic refresh

#### External Integration Endpoints (`/api/integrations/`)

##### iPhone Shortcuts Integration

```http
POST /api/integrations/expenses
Authorization: Bearer <jwt-token>
Content-Type: application/json

Request Body Schema:
{
  "amount": number,              // Required: Transaction amount
  "description": string,         // Required: Transaction description
  "source": "iphone",           // Required: Source identifier
  "merchant": string,           // Optional: Merchant name
  "category": string,           // Optional: Category name
  "payment_method": enum,       // Optional: Payment method type
  "date": string               // Optional: ISO date string
}

Response Schema:
{
  "success": boolean,
  "data": ExpenseObject,
  "message": string
}
```

##### Email Parser Integration

```http
POST /api/integrations/expenses
Authorization: Bearer <jwt-token>
Content-Type: application/json

Request Body Schema:
{
  "amount": number,              // Required: Parsed amount
  "description": string,         // Required: Transaction description
  "source": "email",            // Required: Source identifier
  "merchant": string,           // Optional: Extracted merchant
  "category": string,           // Optional: Auto-categorized
  "confidence_score": number,   // Optional: AI confidence (0-1)
  "raw_data": object,          // Optional: Original email data
  "needs_review": boolean      // Optional: Requires manual review
}
```

**Auto-categorization Logic**:

1. Extract category from request body
2. Perform fuzzy matching against user categories
3. Auto-assign subcategory if provided
4. Set `needs_review: true` for confidence_score < 0.8

##### API Documentation Endpoint

```http
GET /api/integrations
Content-Type: application/json

Response: Complete API documentation with request/response examples
```

## Service Layer Architecture

### Service Class Specifications

#### ExpenseService (`lib/supabase/expenses.ts`)

**Class Interface**:

```typescript
class ExpenseService {
  constructor(userId: string);

  // Core CRUD operations
  async create(expense: CreateExpenseData): Promise<ExpenseWithDetails>;
  async getById(id: string): Promise<ExpenseWithDetails>;
  async update(
    id: string,
    data: UpdateExpenseData
  ): Promise<ExpenseWithDetails>;
  async delete(id: string): Promise<void>;

  // Advanced querying
  async getFilteredWithPagination(
    filters: ExpenseFilters,
    page: number,
    limit: number
  ): Promise<{ data: ExpenseWithDetails[]; pagination: PaginationResult }>;

  async getAllFiltered(filters: ExpenseFilters): Promise<Expense[]>;

  // Business logic methods
  async calculateCategorySpending(
    categoryId: string,
    startDate: string,
    endDate: string
  ): Promise<number>;

  async getBudgetSuggestion(
    categoryId: string,
    date: string
  ): Promise<string | null>;
}
```

**Advanced Filtering Support**:

- Date range filtering (`date_from`, `date_to`)
- Category/subcategory filtering (`category_ids`, `subcategory_ids`)
- Amount range filtering (`amount_min`, `amount_max`)
- Merchant name search (`merchant`)
- Description text search (`description_contains`)
- Payment method filtering (`payment_methods`)
- Source filtering (`sources`)

#### BudgetService (`lib/supabase/budgets.ts`)

**Class Interface**:

```typescript
class BudgetService {
  // Core operations (static methods for service-wide functionality)
  static async create(budget: CreateBudgetData): Promise<Budget>;
  static async getInsights(filters?: BudgetFilters): Promise<BudgetInsight[]>;
  static async getActive(): Promise<Budget[]>;
  static async delete(id: string): Promise<void>;

  // Smart budget features
  static async getAlerts(): Promise<BudgetAlert[]>;
  static async previewAssignment(
    categoryId: string,
    startDate: string,
    endDate: string
  ): Promise<BudgetPreview>;

  static async assignToExistingExpenses(
    budgetId: string,
    categoryId: string,
    periodStart: string,
    periodEnd: string
  ): Promise<{ assigned: number; skipped: number }>;
}
```

**Budget Insights Data Structure**:

```typescript
interface BudgetInsight {
  id: string;
  category_id: string;
  category_name: string;
  category_color: string;
  amount: number;
  period_start: string;
  period_end: string;
  total_spent: number;
  remaining_amount: number;
  spent_percentage: number;
  status: "under_budget" | "over_budget" | "at_limit";
  alert_level: "none" | "warning" | "critical";
}
```

#### GoalService (`lib/supabase/goals.ts`)

**Class Interface**:

```typescript
class GoalService {
  static async getGoals(): Promise<GoalInsight[]>;
  static async createGoal(data: CreateGoalData): Promise<Goal>;
  static async updateGoal(id: string, data: UpdateGoalData): Promise<Goal>;
  static async deleteGoal(id: string): Promise<void>;

  // Goal entry management
  static async createGoalEntry(data: CreateGoalEntryData): Promise<GoalEntry>;
  static async getGoalEntries(goalId: string): Promise<GoalEntry[]>;
  static async deleteGoalEntry(id: string): Promise<void>;

  // Analytics and insights
  static async getGoalStats(): Promise<GoalStatistics>;
  static async getGoalProgress(goalId: string): Promise<GoalProgress>;
}
```

**Goal Progress Calculation**:

```typescript
interface GoalProgress {
  current_amount: number;
  target_amount: number;
  progress_percentage: number;
  days_remaining: number;
  daily_target: number;
  monthly_target: number;
  status: "not_started" | "in_progress" | "achieved" | "overdue";
  recent_entries: GoalEntry[];
}
```

#### CategoryService (`lib/supabase/categories.ts`)

**Class Interface**:

```typescript
class CategoryService {
  constructor(userId: string);

  // Category management
  async getAll(): Promise<CategoryWithSubcategories[]>;
  async getById(id: string): Promise<CategoryWithSubcategories>;
  async create(category: CreateCategoryData): Promise<Category>;
  async update(id: string, updates: UpdateCategoryData): Promise<Category>;
  async delete(id: string): Promise<void>;
}

class SubcategoryService {
  constructor(userId: string);

  // Subcategory management
  async getByCategory(categoryId: string): Promise<Subcategory[]>;
  async create(subcategory: CreateSubcategoryData): Promise<Subcategory>;
  async update(
    id: string,
    updates: UpdateSubcategoryData
  ): Promise<Subcategory>;
  async delete(id: string): Promise<void>;
}
```

#### IncomeService (`lib/supabase/incomes.ts`)

**Class Interface**:

```typescript
class IncomeService {
  constructor(userId: string);

  // Income management (uses expenses table with type='income')
  async create(income: CreateIncomeData): Promise<Income>;
  async getAll(
    limit?: number,
    offset?: number,
    filters?: IncomeFilters,
    sort?: SortOptions
  ): Promise<Income[]>;

  async getByDateRange(startDate: string, endDate: string): Promise<Income[]>;
  async update(id: string, data: UpdateIncomeData): Promise<Income>;
  async delete(id: string): Promise<void>;

  // Analytics
  async getStats(startDate?: string, endDate?: string): Promise<IncomeStats>;
}
```

**Income Data Mapping**:

```typescript
// Maps income-specific fields to expenses table
interface IncomeToExpenseMapping {
  amount: "amount"; // Direct mapping
  description: "description"; // Direct mapping
  date: "date"; // Direct mapping
  source: "source"; // Direct mapping
  type: "income"; // Fixed value
  category_id: "category_id"; // Optional income categorization
  tags: "tags"; // Additional metadata
  recurring: "recurring"; // Recurring income support
  recurring_frequency: "recurring_frequency";
}
```

### Advanced Service Features

#### Smart Budget Wizard (`lib/supabase/budgetWizard.ts`)

**Wizard Function Specifications**:

```typescript
// Financial analysis functions
async function getFinancialSummary(
  userId: string,
  month?: number,
  year?: number
): Promise<FinancialSummary>;

async function getSpendingInsights(
  userId: string,
  months: number = 3
): Promise<SpendingInsights>;

async function getEligibleCategories(userId: string): Promise<Category[]>;

async function detectBudgetConflicts(
  userId: string,
  allocations: BudgetAllocation[],
  targetMonth: number,
  targetYear: number
): Promise<BudgetConflict[]>;

async function generateBudgets(
  userId: string,
  allocations: BudgetAllocation[],
  conflicts: BudgetConflict[],
  targetMonth: number,
  targetYear: number
): Promise<Budget[]>;
```

**Wizard Process Flow**:

1. **Financial Summary Step**: Calculate available budget from income vs expenses
2. **Spending Insights Step**: Analyze historical spending patterns by category
3. **Budget Allocation Step**: AI-powered percentage recommendations
4. **Conflict Resolution Step**: Handle existing budget overlaps
5. **Confirmation Step**: Bulk create budgets with automatic expense assignment

#### Gmail Integration Service (`lib/gmail.ts`)

**OAuth2 Implementation**:

```typescript
interface GmailService {
  // OAuth flow methods
  getAuthUrl(): string;
  getTokens(code: string): Promise<GmailTokens>;
  refreshTokens(refreshToken: string): Promise<GmailTokens>;

  // Gmail API methods
  getGmailWithRefresh(tokens: GmailTokens): Promise<gmail_v1.Gmail>;
  validateGmailAccess(tokens: GmailTokens): Promise<boolean>;

  // Email processing
  fetchTransactionEmails(daysBack: number): Promise<EmailData[]>;
  parseEmailToExpense(emailData: EmailData): Promise<ParsedExpense>;
}
```

**Email Processing Pipeline**:

1. Fetch emails with financial keywords using Gmail API
2. Parse transaction data using `parseEmailToExpense()`
3. Extract amount, merchant, date from email content
4. Auto-categorize based on merchant and subject patterns
5. Calculate confidence score for manual review threshold
6. Generate transaction hash for deduplication
7. Create expense entry with `source: 'email'`

#### Expense Parser (`lib/expense-parser.ts`)

**Email-to-Expense Conversion Functions**:

```typescript
interface ExpenseParser {
  parseEmailToExpense(emailData: EmailData): Promise<ParsedExpense>;
  extractAmount(text: string): number | null;
  extractMerchant(body: string, subject: string, sender: string): string | null;
  extractDate(emailData: EmailData): string;
  categorizeExpense(
    merchant: string,
    subject: string,
    body: string
  ): string | null;
  calculateConfidenceScore(parsedData: ParsedExpense): number;
  generateTransactionHash(parsedData: ParsedExpense): string;
}
```

## Security Architecture

### Row Level Security (RLS) Implementation

**RLS Policy Patterns**:

```sql
-- User data isolation
CREATE POLICY "users_own_data_only" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_categories_only" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_own_budgets_only" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Admin access patterns (if needed)
CREATE POLICY "admin_full_access" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### API Security Implementation

**Security Layer Stack**:

1. **JWT Token Validation**: All protected routes validate Supabase JWT tokens
2. **Input Validation**: Zod schema validation for all request bodies
3. **SQL Injection Prevention**: Parameterized queries via Supabase client
4. **Rate Limiting**: Request throttling on external API endpoints
5. **Data Sanitization**: XSS prevention through input sanitization

**API Security Headers**:

```typescript
// Security headers for all API responses
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

### Data Protection Mechanisms

**User Data Isolation**:

- RLS policies enforce user_id filtering on all queries
- Service classes require userId parameter for instantiation
- All database operations scoped to authenticated user

**Token Security**:

- HTTP-only cookies for session management
- Automatic token refresh for expired sessions
- Secure token storage with encryption at rest

**Environment Protection**:

- Sensitive configuration via environment variables
- API keys and secrets never exposed to client
- Production environment variable validation

## Error Handling Architecture

### Service Layer Error Patterns

**Standardized Error Handling**:

```typescript
try {
  const { data, error } = await supabase.operation();
  if (error) throw error;
  return data;
} catch (err) {
  console.error(`${serviceName} error:`, err);
  throw new Error(err instanceof Error ? err.message : "Operation failed");
}
```

### API Error Response Standards

**Error Response Schema**:

```typescript
// Validation errors
interface ValidationErrorResponse {
  error: "Validation failed";
  details: ZodError[];
  field_errors: Record<string, string[]>;
}

// Authentication errors
interface AuthErrorResponse {
  error: "Unauthorized";
  message: string;
  error_code: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "MISSING_TOKEN";
}

// Service errors
interface ServiceErrorResponse {
  error: "Internal server error";
  message: string;
  request_id?: string;
}
```

## Performance Optimization

### Database Performance Strategy

**Query Optimization Techniques**:

- Composite indexes on frequent query patterns
- Partial indexes for conditional queries (e.g., `needs_review = true`)
- Foreign key indexes for join performance
- User-scoped indexes to leverage RLS filtering

**Pagination Implementation**:

- Offset-based pagination for small datasets
- Cursor-based pagination for large datasets
- Count optimization with estimated totals

### Caching Implementation

**Multi-Layer Caching Strategy**:

1. **React Context**: Client-side state caching
2. **Supabase Real-time**: Live data synchronization
3. **Server-side Caching**: Redis for frequent queries (production)
4. **CDN Caching**: Static asset optimization

**Cache Invalidation Patterns**:

- Context state updates on mutations
- Real-time subscriptions for live updates
- Manual cache invalidation for critical updates

### Query Performance Optimization

**Optimized Query Patterns**:

- Selective field querying with explicit `select()` clauses
- Aggregation queries for statistical calculations
- Batch operations for bulk data modifications
- Connection pooling for concurrent requests

---

This backend documentation provides systematic coverage of database architecture, API specifications, service implementations, security patterns, and performance optimizations for LLM-assisted development.
