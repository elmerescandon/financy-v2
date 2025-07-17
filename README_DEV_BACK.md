# Backend Development Guidelines

## Architecture Principles

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)

- Each service class manages one domain entity exclusively
- API routes handle single endpoint functionality
- Database operations are atomic and focused
- Utility functions serve single purposes

#### Open/Closed Principle (OCP)

- Services extensible via inheritance and composition
- Closed for modification through interface contracts
- Plugin architecture for external integrations
- Configuration-driven behavior changes

#### Liskov Substitution Principle (LSP)

- Service interfaces are substitutable across implementations
- Mock implementations maintain behavioral contracts
- Consistent error handling patterns across services
- Uniform method signatures within service families

#### Interface Segregation Principle (ISP)

- Specific interfaces over monolithic contracts
- Client-specific service method groupings
- Minimal API surface area exposure
- Focused responsibility boundaries

#### Dependency Inversion Principle (DIP)

- Services depend on abstractions, not concretions
- Database layer abstracted via Supabase client
- External APIs behind service interface contracts
- Dependency injection for testability

### Service Layer Architecture

**Directory Structure**:

```
lib/supabase/
├── client.ts              # Database client configuration
├── server.ts              # Server-side client instance
├── middleware.ts          # Authentication middleware layer
├── entities/              # Domain-specific service classes
│   ├── ExpenseService.ts   # Expense domain operations
│   ├── BudgetService.ts    # Budget domain operations
│   ├── GoalService.ts      # Goal domain operations
│   └── CategoryService.ts  # Category domain operations
├── shared/                # Shared utility classes
│   ├── BaseService.ts     # Abstract service foundation
│   ├── QueryBuilder.ts    # Query construction utilities
│   └── ValidationService.ts # Input validation services
└── integrations/          # External service integrations
    ├── GmailService.ts    # Gmail API integration
    ├── EmailParser.ts     # Email parsing logic
    └── ApiKeyService.ts   # API key management
```

## Service Development Standards

### Base Service Pattern

**Abstract Service Foundation**:

```typescript
// BaseService.ts - Foundation for all domain services
import { createClient } from "./client";
import type { SupabaseClient } from "@supabase/supabase-js";

export abstract class BaseService {
  protected supabase: SupabaseClient;
  protected userId: string;
  protected tableName: string;

  constructor(userId: string, tableName: string) {
    if (!userId || !tableName) {
      throw new Error(
        `${this.constructor.name} requires valid userId and tableName`
      );
    }
    this.supabase = createClient();
    this.userId = userId;
    this.tableName = tableName;
  }

  // Template method pattern for database operations
  protected async executeQuery<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await operation();

      if (error) {
        this.logError("Database operation failed", error);
        throw new Error(this.formatError(error));
      }

      if (!data) {
        throw new Error("No data returned from operation");
      }

      return data;
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Unknown database error occurred");
    }
  }

  // Logging with structured metadata
  protected logError(message: string, error: any): void {
    console.error(`[${this.constructor.name}] ${message}:`, {
      userId: this.userId,
      tableName: this.tableName,
      error: error.message || error,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    });
  }

  // Database error translation
  protected formatError(error: any): string {
    const errorMap: Record<string, string> = {
      "23505": "This record already exists",
      "23503": "Referenced record not found",
      "23502": "Required field is missing",
      PGRST116: "Record not found",
      PGRST301: "Permission denied",
    };

    return errorMap[error.code] || error.message || "Database operation failed";
  }

  // Abstract methods for service implementation
  abstract validateCreateData(data: any): void;
  abstract validateUpdateData(data: any): void;

  // Common CRUD operations template
  protected async createRecord<T>(data: any): Promise<T> {
    this.validateCreateData(data);

    const recordData = {
      ...data,
      user_id: this.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.executeQuery(async () =>
      this.supabase.from(this.tableName).insert(recordData).select().single()
    );
  }

  protected async updateRecord<T>(id: string, data: any): Promise<T> {
    this.validateUpdateData(data);

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    return this.executeQuery(async () =>
      this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .eq("user_id", this.userId)
        .select()
        .single()
    );
  }

  protected async deleteRecord(id: string): Promise<void> {
    await this.executeQuery(async () =>
      this.supabase
        .from(this.tableName)
        .delete()
        .eq("id", id)
        .eq("user_id", this.userId)
    );
  }
}
```

### Domain Service Implementation Template

**Expense Service Implementation**:

```typescript
// ExpenseService.ts - Domain service implementation
import { BaseService } from "./BaseService";
import type {
  ExpenseWithDetails,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseFilters,
  PaginationResult,
} from "@/types/expense";
import { z } from "zod";

// Validation schemas using Zod
const CreateExpenseSchema = z.object({
  amount: z.number().min(0.01).max(999999999.99),
  description: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category_id: z.string().uuid().optional(),
  subcategory_id: z.string().uuid().optional(),
  merchant: z.string().max(200).optional(),
  payment_method: z.enum([
    "efectivo",
    "tarjeta_debito",
    "tarjeta_credito",
    "transferencia",
    "otro",
  ]),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  recurring: z.boolean().default(false),
  recurring_frequency: z
    .enum(["daily", "weekly", "monthly", "yearly"])
    .optional(),
});

const UpdateExpenseSchema = CreateExpenseSchema.partial();

export class ExpenseService extends BaseService {
  private readonly SELECT_FIELDS = `
    *,
    category:categories(id, name, color, icon),
    subcategory:subcategories(id, name, category_id)
  `;

  constructor(userId: string) {
    super(userId, "expenses");
  }

  // Core CRUD operations
  async create(data: CreateExpenseData): Promise<ExpenseWithDetails> {
    const expenseData = {
      ...data,
      type: "expense",
      source: data.source || "manual",
    };

    return this.executeQuery(async () =>
      this.supabase
        .from(this.tableName)
        .insert({ ...expenseData, user_id: this.userId })
        .select(this.SELECT_FIELDS)
        .single()
    );
  }

  async getById(id: string): Promise<ExpenseWithDetails> {
    if (!z.string().uuid().safeParse(id).success) {
      throw new Error("Invalid expense ID format");
    }

    return this.executeQuery(async () =>
      this.supabase
        .from(this.tableName)
        .select(this.SELECT_FIELDS)
        .eq("id", id)
        .eq("user_id", this.userId)
        .eq("type", "expense")
        .single()
    );
  }

  async getFilteredWithPagination(
    filters: ExpenseFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ExpenseWithDetails[]; pagination: PaginationResult }> {
    const query = this.buildFilteredQuery(filters);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      this.supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("user_id", this.userId)
        .eq("type", "expense"),
      query.range(from, to).order("date", { ascending: false }),
    ]);

    if (dataResult.error) throw dataResult.error;

    return {
      data: dataResult.data || [],
      pagination: {
        page,
        limit,
        total: countResult.count || 0,
        total_pages: Math.ceil((countResult.count || 0) / limit),
      },
    };
  }

  // Query building with filter application
  private buildFilteredQuery(filters: ExpenseFilters) {
    let query = this.supabase
      .from(this.tableName)
      .select(this.SELECT_FIELDS)
      .eq("user_id", this.userId)
      .eq("type", "expense");

    // Apply filters conditionally
    if (filters.date_from) query = query.gte("date", filters.date_from);
    if (filters.date_to) query = query.lte("date", filters.date_to);
    if (filters.category_ids?.length)
      query = query.in("category_id", filters.category_ids);
    if (filters.amount_min) query = query.gte("amount", filters.amount_min);
    if (filters.amount_max) query = query.lte("amount", filters.amount_max);
    if (filters.merchant)
      query = query.ilike("merchant", `%${filters.merchant}%`);
    if (filters.description_contains) {
      query = query.ilike("description", `%${filters.description_contains}%`);
    }

    return query;
  }

  // Business logic methods
  async calculateCategorySpending(
    categoryId: string,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const { data } = await this.supabase
      .from(this.tableName)
      .select("amount")
      .eq("user_id", this.userId)
      .eq("category_id", categoryId)
      .eq("type", "expense")
      .gte("date", startDate)
      .lte("date", endDate);

    return data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  }

  async getBudgetSuggestion(
    categoryId: string,
    date: string
  ): Promise<string | null> {
    try {
      const { data } = await this.supabase
        .from("budgets")
        .select("id")
        .eq("category_id", categoryId)
        .eq("user_id", this.userId)
        .lte("period_start", date)
        .gte("period_end", date)
        .order("priority", { ascending: false })
        .limit(1)
        .single();

      return data?.id || null;
    } catch {
      return null;
    }
  }

  // Validation implementation (required by BaseService)
  validateCreateData(data: CreateExpenseData): void {
    const result = CreateExpenseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
  }

  validateUpdateData(data: UpdateExpenseData): void {
    const result = UpdateExpenseSchema.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Validation failed: ${result.error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
  }
}
```

### API Route Development Standards

**RESTful API Implementation Pattern**:

```typescript
// app/api/expenses/route.ts - Standard API route implementation
import { NextRequest, NextResponse } from "next/server";
import { ExpenseService } from "@/lib/supabase/expenses";
import { validateApiKey } from "@/lib/api/auth";
import { validateRequestBody } from "@/lib/api/validation";
import { CreateExpenseSchema } from "@/lib/validation/expense";

// GET /api/expenses - List expenses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication validation
    const authResult = await validateApiKey(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: authResult.error,
          error_code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }

    // 2. Query parameter extraction and validation
    const { searchParams } = new URL(request.url);
    const filters = {
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      category_id: searchParams.get("category_id") || undefined,
      amount_min: searchParams.get("amount_min")
        ? parseFloat(searchParams.get("amount_min")!)
        : undefined,
      amount_max: searchParams.get("amount_max")
        ? parseFloat(searchParams.get("amount_max")!)
        : undefined,
    };

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20"))
    );

    // 3. Business logic execution
    const expenseService = new ExpenseService(authResult.user.id);
    const result = await expenseService.getFilteredWithPagination(
      filters,
      page,
      limit
    );

    // 4. Structured response
    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      request_id: crypto.randomUUID(),
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication validation
    const authResult = await validateApiKey(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized", message: authResult.error },
        { status: 401 }
      );
    }

    // 2. Request body validation
    const body = await request.json();
    const validationResult = validateRequestBody(CreateExpenseSchema, body);

    // 3. Business logic execution
    const expenseService = new ExpenseService(authResult.user.id);
    const expense = await expenseService.create(validationResult);

    // 4. Success response
    return NextResponse.json(
      {
        success: true,
        data: expense,
        message: "Expense created successfully",
        request_id: crypto.randomUUID(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/expenses error:", error);

    // Error classification and response
    if (error instanceof Error && error.message.includes("Validation failed")) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: error.message,
          request_id: crypto.randomUUID(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
```

### External Integration Service Pattern

**Gmail Service Implementation**:

```typescript
// GmailService.ts - External integration service
import { OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";
import { BaseService } from "./BaseService";

interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: Date;
}

interface EmailProcessingResult {
  processed: number;
  created: number;
  duplicates: number;
  errors: number;
}

export class GmailService extends BaseService {
  private oauth2Client: OAuth2Client;
  private gmail: gmail_v1.Gmail | null = null;

  constructor(userId: string) {
    super(userId, "user_gmail_tokens");
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // OAuth flow implementation
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      prompt: "consent",
      state: this.userId, // Include user ID for security
    });
  }

  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error("Incomplete token response from Google");
      }

      const tokenData: GmailTokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      };

      // Store tokens securely
      await this.storeTokens(tokenData);

      return tokenData;
    } catch (error) {
      this.logError("Failed to exchange code for tokens", error);
      throw new Error("OAuth token exchange failed");
    }
  }

  // Gmail API operations
  async initializeWithTokens(tokens: GmailTokens): Promise<void> {
    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    try {
      this.gmail = google.gmail({ version: "v1", auth: this.oauth2Client });

      // Validate connection
      await this.gmail.users.getProfile({ userId: "me" });
    } catch (error) {
      if (error.code === 401 && tokens.refresh_token) {
        await this.refreshTokens(tokens.refresh_token);
      } else {
        throw new Error("Failed to initialize Gmail API");
      }
    }
  }

  async fetchTransactionEmails(
    daysBack: number = 7
  ): Promise<EmailProcessingResult> {
    if (!this.gmail) {
      throw new Error("Gmail service not initialized");
    }

    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysBack);
      const dateQuery = `after:${Math.floor(fromDate.getTime() / 1000)}`;

      // Search query for financial emails
      const query = [
        `subject:(transaction OR receipt OR payment OR charge OR compra)`,
        `from:(bank OR banco OR visa OR mastercard OR paypal)`,
        dateQuery,
      ].join(" ");

      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: 50,
      });

      const messages = response.data.messages || [];
      let processed = 0,
        created = 0,
        duplicates = 0,
        errors = 0;

      // Process emails in batches
      for (const message of messages) {
        try {
          const emailDetails = await this.gmail.users.messages.get({
            userId: "me",
            id: message.id!,
          });

          const result = await this.processEmail(emailDetails.data);
          processed++;

          if (result.created) created++;
          if (result.duplicate) duplicates++;
        } catch (error) {
          errors++;
          this.logError(`Failed to process email ${message.id}`, error);
        }
      }

      return { processed, created, duplicates, errors };
    } catch (error) {
      this.logError("Failed to fetch transaction emails", error);
      throw new Error("Gmail fetch operation failed");
    }
  }

  private async processEmail(
    emailData: any
  ): Promise<{ created: boolean; duplicate: boolean }> {
    // Implementation for email processing
    // Extract transaction data, create expense record, handle duplicates
    return { created: true, duplicate: false };
  }

  private async refreshTokens(refreshToken: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);

      const updatedTokens: GmailTokens = {
        access_token: credentials.access_token!,
        refresh_token: credentials.refresh_token || refreshToken,
        expires_at: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : undefined,
      };

      await this.updateStoredTokens(updatedTokens);
    } catch (error) {
      this.logError("Token refresh failed", error);
      throw new Error("Failed to refresh Gmail tokens");
    }
  }

  private async storeTokens(tokens: GmailTokens): Promise<void> {
    await this.executeQuery(async () =>
      this.supabase.from("user_gmail_tokens").upsert({
        user_id: this.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_at?.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );
  }

  private async updateStoredTokens(tokens: GmailTokens): Promise<void> {
    await this.executeQuery(async () =>
      this.supabase
        .from("user_gmail_tokens")
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_at?.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", this.userId)
    );
  }

  // Required abstract method implementations
  validateCreateData(data: any): void {
    // Gmail service doesn't create standard records
  }

  validateUpdateData(data: any): void {
    // Gmail service doesn't update standard records
  }
}
```

## Security Implementation

### Row Level Security (RLS) Patterns

**Comprehensive RLS Policy Implementation**:

```sql
-- Enable RLS on all user tables
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_entries ENABLE ROW LEVEL SECURITY;

-- User data isolation policies
CREATE POLICY "users_access_own_expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_access_own_categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_access_own_budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "users_access_own_goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);

-- Cascade policies for related data
CREATE POLICY "users_access_goal_entries" ON goal_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM savings_goals
      WHERE id = goal_entries.goal_id
      AND user_id = auth.uid()
    )
  );

-- Admin access policies (optional)
CREATE POLICY "admin_full_access_expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
```

### Input Validation & Sanitization Service

**Centralized Validation Implementation**:

```typescript
// ValidationService.ts - Comprehensive input validation
import { z } from "zod";

export class ValidationService {
  // Common validation schemas
  static readonly UUIDSchema = z.string().uuid("Invalid UUID format");
  static readonly DateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");
  static readonly AmountSchema = z.number().min(0.01).max(999999999.99);
  static readonly EmailSchema = z.string().email("Invalid email format");
  static readonly URLSchema = z.string().url("Invalid URL format");

  // Comprehensive sanitization methods
  static sanitizeString(input: string): string {
    return input
      .replace(/['"\\]/g, "") // Remove quotes and backslashes
      .replace(/[<>]/g, "") // Remove HTML brackets
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
      .substring(0, 1000); // Limit length
  }

  static sanitizeHtml(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .replace(/data:/gi, "")
      .trim();
  }

  // SQL injection prevention
  static validateSqlIdentifier(identifier: string): boolean {
    const sqlIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return sqlIdentifierRegex.test(identifier) && identifier.length <= 63;
  }

  // Rate limiting validation
  static validateRateLimit(
    requests: number,
    windowMs: number,
    maxRequests: number
  ): { allowed: boolean; resetTime: number } {
    const allowed = requests <= maxRequests;
    const resetTime = Date.now() + windowMs;
    return { allowed, resetTime };
  }

  // File upload validation
  static validateFileUpload(
    file: { type: string; size: number; name: string },
    options: {
      allowedTypes: string[];
      maxSize: number;
      allowedExtensions?: string[];
    }
  ): void {
    // MIME type validation
    if (!options.allowedTypes.includes(file.type)) {
      throw new Error(
        `File type not allowed. Allowed types: ${options.allowedTypes.join(
          ", "
        )}`
      );
    }

    // File size validation
    if (file.size > options.maxSize) {
      throw new Error(`File too large. Maximum size: ${options.maxSize} bytes`);
    }

    // Extension validation (if provided)
    if (options.allowedExtensions) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (
        !fileExtension ||
        !options.allowedExtensions.includes(fileExtension)
      ) {
        throw new Error(
          `File extension not allowed. Allowed extensions: ${options.allowedExtensions.join(
            ", "
          )}`
        );
      }
    }
  }

  // Request body validation with detailed errors
  static validateRequestBody<T>(schema: z.ZodSchema<T>, body: any): T {
    const result = schema.safeParse(body);

    if (!result.success) {
      const fieldErrors = result.error.errors.reduce((acc, error) => {
        const field = error.path.join(".");
        if (!acc[field]) acc[field] = [];
        acc[field].push(error.message);
        return acc;
      }, {} as Record<string, string[]>);

      throw new ValidationError("Request validation failed", fieldErrors);
    }

    return result.data;
  }
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(message: string, public fieldErrors: Record<string, string[]>) {
    super(message);
    this.name = "ValidationError";
  }
}
```

### API Security Middleware

**Comprehensive Security Middleware Implementation**:

```typescript
// middleware.ts - Application security middleware
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security configuration
const SECURITY_CONFIG = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  headers: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Permissions-Policy": "camera=(), microphone=(), location=()",
  },
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Rate limiting implementation
  const clientIp =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const rateLimitKey = `${clientIp}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const current = rateLimitStore.get(rateLimitKey);
  if (current && current.resetTime > now) {
    if (current.count >= SECURITY_CONFIG.rateLimit.maxRequests) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests, please try again later",
          resetTime: current.resetTime,
        },
        { status: 429 }
      );
    }
    current.count++;
  } else {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
    });
  }

  // 2. Apply security headers
  Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 3. CORS handling for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Add CORS headers to API responses
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.ALLOWED_ORIGINS || "*"
    );
    return response;
  }

  // 4. Authentication middleware for protected routes
  if (request.nextUrl.pathname.startsWith("/(private)")) {
    return await updateSession(request);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## Performance Optimization

### Database Query Optimization

**Advanced Query Builder Implementation**:

```typescript
// QueryBuilder.ts - Optimized query construction
export class QueryBuilder {
  private query: any;
  private tableName: string;
  private selectFields: string[] = [];
  private conditions: Array<{ column: string; operator: string; value: any }> =
    [];
  private joins: Array<{ table: string; condition: string }> = [];
  private orderClauses: Array<{ column: string; ascending: boolean }> = [];

  constructor(private supabase: any, tableName: string) {
    this.tableName = tableName;
    this.query = supabase.from(tableName);
  }

  // Optimized field selection
  select(fields: string | string[]): this {
    if (Array.isArray(fields)) {
      this.selectFields = fields;
      this.query = this.query.select(fields.join(", "));
    } else {
      this.selectFields = [fields];
      this.query = this.query.select(fields);
    }
    return this;
  }

  // Indexed filtering with operator support
  where(column: string, operator: string, value: any): this {
    this.conditions.push({ column, operator, value });

    switch (operator.toLowerCase()) {
      case "=":
      case "eq":
        this.query = this.query.eq(column, value);
        break;
      case ">":
      case "gt":
        this.query = this.query.gt(column, value);
        break;
      case ">=":
      case "gte":
        this.query = this.query.gte(column, value);
        break;
      case "<":
      case "lt":
        this.query = this.query.lt(column, value);
        break;
      case "<=":
      case "lte":
        this.query = this.query.lte(column, value);
        break;
      case "in":
        this.query = this.query.in(
          column,
          Array.isArray(value) ? value : [value]
        );
        break;
      case "like":
      case "ilike":
        this.query = this.query.ilike(column, value);
        break;
      case "is":
        this.query = this.query.is(column, value);
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
    return this;
  }

  // Join optimization with explicit conditions
  join(table: string, condition: string): this {
    this.joins.push({ table, condition });
    // Note: Supabase handles joins via select with foreign key syntax
    return this;
  }

  // Index-aware ordering
  orderBy(column: string, ascending: boolean = true): this {
    this.orderClauses.push({ column, ascending });
    this.query = this.query.order(column, { ascending });
    return this;
  }

  // Efficient pagination with range
  paginate(page: number, limit: number): this {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    this.query = this.query.range(from, to);
    return this;
  }

  // Count optimization for pagination
  count(exact: boolean = false): this {
    this.query = this.query.select("*", {
      count: exact ? "exact" : "estimated",
      head: true,
    });
    return this;
  }

  // Execute with comprehensive error handling
  async execute<T>(): Promise<T> {
    try {
      const startTime = Date.now();
      const { data, error, count } = await this.query;
      const endTime = Date.now();

      if (error) {
        this.logQueryError(error, endTime - startTime);
        throw error;
      }

      this.logQueryPerformance(endTime - startTime, data?.length || 0);
      return data;
    } catch (error) {
      this.logQueryError(error, 0);
      throw error;
    }
  }

  private logQueryPerformance(duration: number, resultCount: number): void {
    console.info(`[QueryBuilder] Query executed:`, {
      table: this.tableName,
      fields: this.selectFields,
      conditions: this.conditions.length,
      joins: this.joins.length,
      order: this.orderClauses,
      duration_ms: duration,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    });
  }

  private logQueryError(error: any, duration: number): void {
    console.error(`[QueryBuilder] Query failed:`, {
      table: this.tableName,
      fields: this.selectFields,
      conditions: this.conditions,
      joins: this.joins,
      order: this.orderClauses,
      duration_ms: duration,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// Usage example with type safety
async function getExpensesOptimized(
  userId: string,
  filters: ExpenseFilters,
  page: number,
  limit: number
): Promise<ExpenseWithDetails[]> {
  return await new QueryBuilder(supabase, "expenses")
    .select([
      "id",
      "amount",
      "description",
      "date",
      "category:categories(id, name, color)",
      "subcategory:subcategories(id, name)",
    ])
    .where("user_id", "=", userId)
    .where("type", "=", "expense")
    .where("date", ">=", filters.date_from)
    .where("date", "<=", filters.date_to)
    .where("category_id", "in", filters.category_ids)
    .orderBy("date", false)
    .paginate(page, limit)
    .execute<ExpenseWithDetails[]>();
}
```

### Caching Implementation Strategy

**Multi-Layer Caching Service**:

```typescript
// CacheService.ts - Comprehensive caching implementation
import { LRUCache } from "lru-cache";

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  tags?: string[];
}

export class CacheService {
  private cache: LRUCache<string, any>;
  private tagIndex: Map<string, Set<string>>;

  // Cache TTL constants
  private readonly TTL_SHORT = 5 * 60 * 1000; // 5 minutes
  private readonly TTL_MEDIUM = 30 * 60 * 1000; // 30 minutes
  private readonly TTL_LONG = 2 * 60 * 60 * 1000; // 2 hours
  private readonly TTL_VERY_LONG = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cache = new LRUCache({
      max: 1000, // Maximum number of items
      ttl: this.TTL_MEDIUM, // Default TTL
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    this.tagIndex = new Map();
  }

  // Get with automatic cache population
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const fresh = await fetchFn();
    this.set(key, fresh, options);
    return fresh;
  }

  // Set with tag indexing
  set(key: string, value: any, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.TTL_MEDIUM;

    this.cache.set(key, value, { ttl });

    // Index by tags for invalidation
    if (options.tags) {
      options.tags.forEach((tag) => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(key);
      });
    }
  }

  // Pattern-based invalidation
  invalidatePattern(pattern: string): number {
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  // Tag-based invalidation
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let invalidated = 0;
    for (const key of keys) {
      this.cache.delete(key);
      invalidated++;
    }

    this.tagIndex.delete(tag);
    return invalidated;
  }

  // Cache warming for frequently accessed data
  async warmCache(userId: string): Promise<void> {
    const warmingTasks = [
      this.warmUserCategories(userId),
      this.warmRecentExpenses(userId),
      this.warmBudgetInsights(userId),
    ];

    await Promise.allSettled(warmingTasks);
  }

  private async warmUserCategories(userId: string): Promise<void> {
    const key = `categories:${userId}`;
    await this.get(key, () => this.fetchUserCategories(userId), {
      ttl: this.TTL_LONG,
      tags: [`user:${userId}`, "categories"],
    });
  }

  private async warmRecentExpenses(userId: string): Promise<void> {
    const key = `expenses:recent:${userId}`;
    await this.get(key, () => this.fetchRecentExpenses(userId), {
      ttl: this.TTL_SHORT,
      tags: [`user:${userId}`, "expenses"],
    });
  }

  private async warmBudgetInsights(userId: string): Promise<void> {
    const key = `budgets:insights:${userId}`;
    await this.get(key, () => this.fetchBudgetInsights(userId), {
      ttl: this.TTL_MEDIUM,
      tags: [`user:${userId}`, "budgets"],
    });
  }

  // Cache statistics
  getStats(): {
    size: number;
    calculatedSize: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      maxSize: this.cache.max,
      hitRate:
        this.cache.size > 0 ? this.cache.calculatedSize / this.cache.size : 0,
    };
  }

  // Placeholder fetch methods (implement with actual service calls)
  private async fetchUserCategories(userId: string): Promise<any> {
    // Implementation
    return [];
  }

  private async fetchRecentExpenses(userId: string): Promise<any> {
    // Implementation
    return [];
  }

  private async fetchBudgetInsights(userId: string): Promise<any> {
    // Implementation
    return [];
  }
}

// Global cache instance
export const cacheService = new CacheService();
```

## Testing Standards

### Service Testing Implementation

**Comprehensive Service Test Template**:

```typescript
// ExpenseService.test.ts - Complete service testing
import { ExpenseService } from "../ExpenseService";
import { createClient } from "../client";
import { mockExpenseData, mockUser, mockCategories } from "./__mocks__/data";

// Mock Supabase client with full method coverage
jest.mock("../client", () => ({
  createClient: jest.fn(),
}));

describe("ExpenseService", () => {
  let expenseService: ExpenseService;
  let mockSupabase: jest.Mocked<any>;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      count: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    expenseService = new ExpenseService(mockUser.id);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates expense successfully with all required fields", async () => {
      const expenseData = { ...mockExpenseData };
      const expectedResponse = {
        ...expenseData,
        id: "test-uuid",
        user_id: mockUser.id,
      };

      mockSupabase.single.mockResolvedValue({
        data: expectedResponse,
        error: null,
      });

      const result = await expenseService.create(expenseData);

      expect(mockSupabase.from).toHaveBeenCalledWith("expenses");
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...expenseData,
          user_id: mockUser.id,
          type: "expense",
          source: "manual",
        })
      );
      expect(result).toEqual(expectedResponse);
    });

    it("handles validation errors with detailed messages", async () => {
      const invalidData = {
        amount: -100,
        description: "",
        date: "invalid-date",
      };

      await expect(expenseService.create(invalidData as any)).rejects.toThrow(
        "Validation failed"
      );
    });

    it("handles database constraint errors", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: "23503", message: "Foreign key constraint violation" },
      });

      await expect(expenseService.create(mockExpenseData)).rejects.toThrow(
        "Referenced record not found"
      );
    });

    it("handles network errors gracefully", async () => {
      mockSupabase.single.mockRejectedValue(new Error("Network error"));

      await expect(expenseService.create(mockExpenseData)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getFilteredWithPagination", () => {
    beforeEach(() => {
      mockSupabase.count = jest
        .fn()
        .mockResolvedValue({ count: 150, error: null });
    });

    it("applies all filters correctly", async () => {
      const filters = {
        date_from: "2024-01-01",
        date_to: "2024-01-31",
        category_ids: ["cat-1", "cat-2"],
        amount_min: 10,
        amount_max: 1000,
        merchant: "Test Store",
        description_contains: "groceries",
      };

      mockSupabase.single.mockResolvedValue({ data: [], error: null });

      await expenseService.getFilteredWithPagination(filters, 1, 20);

      expect(mockSupabase.gte).toHaveBeenCalledWith("date", "2024-01-01");
      expect(mockSupabase.lte).toHaveBeenCalledWith("date", "2024-01-31");
      expect(mockSupabase.in).toHaveBeenCalledWith("category_id", [
        "cat-1",
        "cat-2",
      ]);
      expect(mockSupabase.gte).toHaveBeenCalledWith("amount", 10);
      expect(mockSupabase.lte).toHaveBeenCalledWith("amount", 1000);
      expect(mockSupabase.ilike).toHaveBeenCalledWith(
        "merchant",
        "%Test Store%"
      );
      expect(mockSupabase.ilike).toHaveBeenCalledWith(
        "description",
        "%groceries%"
      );
    });

    it("handles pagination correctly", async () => {
      mockSupabase.single.mockResolvedValue({ data: [], error: null });

      const result = await expenseService.getFilteredWithPagination({}, 3, 25);

      expect(mockSupabase.range).toHaveBeenCalledWith(50, 74); // (3-1)*25 to ((3-1)*25)+25-1
      expect(result.pagination).toEqual({
        page: 3,
        limit: 25,
        total: 150,
        total_pages: 6,
      });
    });

    it("returns empty results when no data found", async () => {
      mockSupabase.count.mockResolvedValue({ count: 0, error: null });
      mockSupabase.single.mockResolvedValue({ data: [], error: null });

      const result = await expenseService.getFilteredWithPagination({}, 1, 20);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("business logic methods", () => {
    describe("calculateCategorySpending", () => {
      it("calculates spending correctly for date range", async () => {
        const mockExpenses = [{ amount: 100 }, { amount: 250 }, { amount: 50 }];

        mockSupabase.single.mockResolvedValue({
          data: mockExpenses,
          error: null,
        });

        const result = await expenseService.calculateCategorySpending(
          "cat-1",
          "2024-01-01",
          "2024-01-31"
        );

        expect(result).toBe(400);
        expect(mockSupabase.eq).toHaveBeenCalledWith("category_id", "cat-1");
        expect(mockSupabase.gte).toHaveBeenCalledWith("date", "2024-01-01");
        expect(mockSupabase.lte).toHaveBeenCalledWith("date", "2024-01-31");
      });

      it("returns 0 for categories with no expenses", async () => {
        mockSupabase.single.mockResolvedValue({ data: [], error: null });

        const result = await expenseService.calculateCategorySpending(
          "empty-cat",
          "2024-01-01",
          "2024-01-31"
        );

        expect(result).toBe(0);
      });
    });

    describe("getBudgetSuggestion", () => {
      it("returns budget ID when active budget exists", async () => {
        mockSupabase.single.mockResolvedValue({
          data: { id: "budget-123" },
          error: null,
        });

        const result = await expenseService.getBudgetSuggestion(
          "cat-1",
          "2024-01-15"
        );

        expect(result).toBe("budget-123");
        expect(mockSupabase.lte).toHaveBeenCalledWith(
          "period_start",
          "2024-01-15"
        );
        expect(mockSupabase.gte).toHaveBeenCalledWith(
          "period_end",
          "2024-01-15"
        );
      });

      it("returns null when no active budget exists", async () => {
        mockSupabase.single.mockRejectedValue(new Error("No rows returned"));

        const result = await expenseService.getBudgetSuggestion(
          "cat-1",
          "2024-01-15"
        );

        expect(result).toBeNull();
      });
    });
  });

  describe("error handling", () => {
    it("logs errors with structured metadata", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "Database error", code: "500" },
      });

      await expect(expenseService.create(mockExpenseData)).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ExpenseService] Database operation failed:"),
        expect.objectContaining({
          userId: mockUser.id,
          tableName: "expenses",
          error: "Database error",
          timestamp: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it("formats database errors consistently", async () => {
      const testCases = [
        { code: "23505", expected: "This record already exists" },
        { code: "23503", expected: "Referenced record not found" },
        { code: "PGRST116", expected: "Record not found" },
        { code: "unknown", message: "Custom error", expected: "Custom error" },
      ];

      for (const testCase of testCases) {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { code: testCase.code, message: testCase.message },
        });

        await expect(expenseService.create(mockExpenseData)).rejects.toThrow(
          testCase.expected
        );
      }
    });
  });
});
```

### API Route Testing

**Complete API Route Testing**:

```typescript
// expenses/route.test.ts - API endpoint testing
import { GET, POST } from "../route";
import { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/api/auth";
import { ExpenseService } from "@/lib/supabase/expenses";

jest.mock("@/lib/api/auth");
jest.mock("@/lib/supabase/expenses");

describe("/api/expenses", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns expenses with valid authentication and filters", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const mockExpenseService = {
        getFilteredWithPagination: jest.fn().mockResolvedValue({
          data: [{ id: "exp-1", amount: 100 }],
          pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
        }),
      };

      (ExpenseService as jest.Mock).mockImplementation(
        () => mockExpenseService
      );

      const url =
        "http://localhost/api/expenses?page=1&limit=20&category_id=cat-1";
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(mockExpenseService.getFilteredWithPagination).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: "cat-1" }),
        1,
        20
      );
    });

    it("handles invalid query parameters gracefully", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const mockExpenseService = {
        getFilteredWithPagination: jest.fn().mockResolvedValue({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
        }),
      };

      (ExpenseService as jest.Mock).mockImplementation(
        () => mockExpenseService
      );

      const url = "http://localhost/api/expenses?page=invalid&limit=999";
      const request = new NextRequest(url);
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockExpenseService.getFilteredWithPagination).toHaveBeenCalledWith(
        {},
        1, // Invalid page defaults to 1
        100 // Limit capped at 100
      );
    });

    it("returns 401 for invalid authentication", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: false,
        error: "Invalid token",
      });

      const request = new NextRequest("http://localhost/api/expenses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(data.error_code).toBe("INVALID_TOKEN");
    });

    it("handles service errors with proper error responses", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const mockExpenseService = {
        getFilteredWithPagination: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };

      (ExpenseService as jest.Mock).mockImplementation(
        () => mockExpenseService
      );

      const request = new NextRequest("http://localhost/api/expenses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.message).toBe("Database connection failed");
      expect(data.request_id).toBeDefined();
    });
  });

  describe("POST", () => {
    const validExpenseData = {
      amount: 100,
      description: "Test expense",
      date: "2024-01-01",
      payment_method: "tarjeta_credito",
    };

    it("creates expense with valid data", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const mockExpenseService = {
        create: jest.fn().mockResolvedValue({
          id: "exp-123",
          ...validExpenseData,
          user_id: mockUser.id,
        }),
      };

      (ExpenseService as jest.Mock).mockImplementation(
        () => mockExpenseService
      );

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify(validExpenseData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("exp-123");
      expect(mockExpenseService.create).toHaveBeenCalledWith(validExpenseData);
    });

    it("returns 400 for validation errors", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const invalidData = {
        amount: -100, // Invalid negative amount
        description: "", // Empty description
        date: "invalid-date", // Invalid date format
      };

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("handles malformed JSON gracefully", async () => {
      (validateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const request = new NextRequest("http://localhost/api/expenses", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
```

## Deployment & Monitoring

### Environment Configuration

**Comprehensive Environment Setup**:

```typescript
// config/environment.ts - Environment validation and configuration
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),

  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase anon key required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase service role key required"),

  // Google OAuth configuration
  GOOGLE_CLIENT_ID: z.string().min(1, "Google client ID required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "Google client secret required"),
  GOOGLE_REDIRECT_URI: z.string().url("Invalid Google redirect URI"),

  // Application configuration
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  CACHE_TTL: z.coerce.number().min(1000).default(300000), // 5 minutes
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().min(1000).default(60000), // 1 minute

  // Security configuration
  ALLOWED_ORIGINS: z.string().default("*"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT secret must be at least 32 characters")
    .optional(),
  ENCRYPTION_KEY: z
    .string()
    .length(32, "Encryption key must be exactly 32 characters")
    .optional(),

  // Database configuration
  DB_POOL_SIZE: z.coerce.number().min(1).max(100).default(10),
  DB_TIMEOUT: z.coerce.number().min(1000).default(30000), // 30 seconds

  // Monitoring configuration
  SENTRY_DSN: z.string().url().optional(),
  ANALYTICS_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export const isDevelopment = env.NODE_ENV === "development";
export const isStaging = env.NODE_ENV === "staging";
export const isProduction = env.NODE_ENV === "production";

// Environment-specific configurations
export const config = {
  database: {
    poolSize: env.DB_POOL_SIZE,
    timeout: env.DB_TIMEOUT,
  },
  cache: {
    ttl: env.CACHE_TTL,
    enabled: isProduction,
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW,
    enabled: isProduction || isStaging,
  },
  logging: {
    level: env.LOG_LEVEL,
    structured: isProduction,
  },
  security: {
    cors: {
      origin: env.ALLOWED_ORIGINS.split(","),
      credentials: true,
    },
    headers: {
      hsts: isProduction,
      contentSecurityPolicy: isProduction,
    },
  },
};
```

### Logging & Monitoring System

**Production-Ready Logging Implementation**:

```typescript
// utils/logger.ts - Structured logging system
interface LogMetadata {
  userId?: string;
  requestId?: string;
  service?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  environment: string;
  meta?: LogMetadata;
  stack?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: string;
  private environment: string;

  private constructor() {
    this.logLevel = process.env.LOG_LEVEL || "info";
    this.environment = process.env.NODE_ENV || "development";
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Structured logging methods
  error(message: string, meta?: LogMetadata): void {
    this.log("error", message, meta);
  }

  warn(message: string, meta?: LogMetadata): void {
    if (this.shouldLog("warn")) {
      this.log("warn", message, meta);
    }
  }

  info(message: string, meta?: LogMetadata): void {
    if (this.shouldLog("info")) {
      this.log("info", message, meta);
    }
  }

  debug(message: string, meta?: LogMetadata): void {
    if (this.shouldLog("debug")) {
      this.log("debug", message, meta);
    }
  }

  // Performance logging
  time(operation: string, meta?: LogMetadata): () => void {
    const start = Date.now();

    return () => {
      const duration = Date.now() - start;
      this.info(`Operation completed: ${operation}`, {
        ...meta,
        operation,
        duration,
      });
    };
  }

  // Request logging
  request(method: string, url: string, meta?: LogMetadata): void {
    this.info(`${method} ${url}`, {
      ...meta,
      type: "request",
      method,
      url,
    });
  }

  // Database operation logging
  database(operation: string, table: string, meta?: LogMetadata): void {
    this.debug(`Database ${operation} on ${table}`, {
      ...meta,
      type: "database",
      operation,
      table,
    });
  }

  private log(level: string, message: string, meta?: LogMetadata): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      meta,
    };

    // Include stack trace for errors
    if (level === "error" && meta?.error instanceof Error) {
      logEntry.stack = meta.error.stack;
    }

    // Output format based on environment
    if (this.environment === "production") {
      console.log(JSON.stringify(logEntry));
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, meta || "");
    }

    // Send to external monitoring (if configured)
    this.sendToMonitoring(logEntry);
  }

  private shouldLog(level: string): boolean {
    const levels = ["error", "warn", "info", "debug"];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private sendToMonitoring(logEntry: LogEntry): void {
    // Integration with external monitoring services
    if (process.env.SENTRY_DSN && logEntry.level === "error") {
      // Send to Sentry
    }

    if (process.env.DATADOG_API_KEY) {
      // Send to DataDog
    }
  }
}

export const logger = Logger.getInstance();

// Express middleware for request logging
export function requestLoggingMiddleware(req: any, res: any, next: any): void {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  const startTime = Date.now();

  logger.request(req.method, req.url, {
    requestId,
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info(`Request completed`, {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
```

---

## Quick Reference Checklist

### Service Development Checklist:

- [ ] Extends BaseService for consistency
- [ ] Implements validation methods with Zod schemas
- [ ] Uses TypeScript interfaces for all parameters
- [ ] Follows single responsibility principle
- [ ] Includes comprehensive error handling
- [ ] Implements proper logging with metadata

### API Route Checklist:

- [ ] Authentication validation implemented
- [ ] Input validation with detailed error responses
- [ ] Proper HTTP status codes used
- [ ] Structured JSON responses
- [ ] Request ID included for tracing
- [ ] Rate limiting considered

### Security Checklist:

- [ ] RLS policies implemented and tested
- [ ] All inputs validated and sanitized
- [ ] Authentication verified on all protected routes
- [ ] SQL injection prevention measures
- [ ] Error messages don't leak sensitive information

### Performance Checklist:

- [ ] Database queries optimized with proper indexes
- [ ] Pagination implemented for large datasets
- [ ] Caching strategy implemented where appropriate
- [ ] Query performance logged and monitored
- [ ] Connection pooling configured

### Testing Checklist:

- [ ] Unit tests cover all public methods
- [ ] Integration tests with database
- [ ] Error scenarios tested
- [ ] Performance benchmarks validated
- [ ] Mock implementations for external dependencies

---

This comprehensive backend development guide ensures secure, scalable, and maintainable services following SOLID principles and industry best practices.
