# Financy v2 - Personal Finance Tracker

A comprehensive expense tracking application with intelligent automation features including iPhone Shortcuts integration and email-based transaction parsing.

## 🎯 Project Overview

Financy v2 is designed to provide a seamless expense tracking experience with focus on:

- **iPhone Shortcuts Integration**: Quick expense entry via Siri and shortcuts
- **Email Transaction Parsing**: Automatic expense detection from bank/card notifications
- **Smart Budget Management**: Dynamic budget allocation and spending recommendations
- **Savings Goals Tracking**: Goal-oriented financial planning

## 🏗️ Database Schema

### Core Tables

#### `expenses`

Primary transaction table supporting expenses, income, and transfers:

- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): References auth.users
- `amount` (DECIMAL): Transaction amount
- `type` (TEXT): 'expense', 'income', or 'transfer'
- `description` (TEXT): Transaction description
- `date` (DATE): Transaction date
- `category_id` (UUID, FK): References categories
- `subcategory_id` (UUID, FK): References subcategories
- `budget_id` (UUID, FK): References budgets
- `merchant` (TEXT): Merchant name
- `payment_method` (TEXT): Payment method used
- `recurring` (BOOLEAN): Is recurring transaction
- `recurring_frequency` (TEXT): Frequency if recurring
- `source` (TEXT): Data source (manual, email, shortcut)
- `confidence_score` (DECIMAL): AI confidence for auto-imported
- `needs_review` (BOOLEAN): Requires user review
- `transaction_hash` (VARCHAR): Duplicate detection hash
- `receipt_url` (TEXT): Receipt image URL
- `tags` (JSONB): Flexible tagging system
- `source_metadata` (JSONB): Source-specific data

#### `categories`

Expense categorization system:

- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): References auth.users
- `name` (VARCHAR): Category name
- `icon` (VARCHAR): Display icon
- `color` (VARCHAR): Display color
- `is_default` (BOOLEAN): System default category

#### `subcategories`

Detailed categorization:

- `id` (UUID, PK): Unique identifier
- `category_id` (UUID, FK): References categories
- `name` (VARCHAR): Subcategory name

#### `budgets`

Budget management and allocation:

- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): References auth.users
- `category_id` (UUID, FK): References categories
- `amount` (DECIMAL): Budget amount
- `period_start` (DATE): Budget period start
- `period_end` (DATE): Budget period end
- `rollover_amount` (DECIMAL): Unused budget from previous period
- `allocation_percentage` (DECIMAL): Percentage of total income
- `priority` (INTEGER): Priority for smart recommendations

#### `savings_goals`

Goal-oriented savings tracking:

- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK): References auth.users
- `name` (TEXT): Goal name
- `target_amount` (DECIMAL): Target amount
- `current_amount` (DECIMAL): Current progress
- `target_date` (DATE): Target completion date
- `category_id` (UUID, FK): Optional category link
- `budget_id` (UUID, FK): Optional budget link

#### `goal_entries`

Individual contributions to savings goals:

- `id` (UUID, PK): Unique identifier
- `goal_id` (UUID, FK): References savings_goals
- `amount` (DECIMAL): Contribution amount
- `description` (TEXT): Entry description
- `date` (DATE): Contribution date
- `created_at` (TIMESTAMP): Entry creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### Views

#### `budget_insights`

Comprehensive budget analysis view combining:

- Budget allocations and spending
- Income and expense summaries
- Savings goal progress
- Category-wise breakdowns
- Smart recommendation data

### Foreign Key Constraints

| From Table    | From Column    | To Table      | To Column | Delete Rule |
| ------------- | -------------- | ------------- | --------- | ----------- |
| subcategories | category_id    | categories    | id        | CASCADE     |
| expenses      | category_id    | categories    | id        | SET NULL    |
| expenses      | subcategory_id | subcategories | id        | SET NULL    |
| budgets       | category_id    | categories    | id        | CASCADE     |
| expenses      | budget_id      | budgets       | id        | SET NULL    |
| savings_goals | category_id    | categories    | id        | NO ACTION   |
| savings_goals | budget_id      | budgets       | id        | NO ACTION   |
| goal_entries  | goal_id        | savings_goals | id        | CASCADE     |

**Key Relationships:**

- Categories can have multiple subcategories (1:many)
- Expenses link to categories and subcategories (optional)
- Budgets are tied to specific categories
- Expenses can be associated with budgets
- Savings goals can link to categories or budgets (optional)
- Goal entries track individual contributions to savings goals

### Database Indexes

**Performance Optimizations:**

- **User-scoped queries**: All tables indexed on `user_id` for fast RLS filtering
- **Expense lookups**: Composite indexes on `user_id + category_id` and `user_id + date` for dashboard queries
- **Budget periods**: Composite index on `period_start + period_end` for date range filtering
- **Transaction deduplication**: Index on `transaction_hash` (non-null values only)
- **Review workflow**: Partial index on `needs_review = true` for admin tasks
- **Data sources**: Index on `source` field for filtering by import method
- **Type filtering**: Indexes on `type` and `recurring` fields for expense categorization
- **Foreign key performance**: All FK columns indexed for join optimization
- **Goal tracking**: Indexes on `goal_id`, `date`, and `created_at` for goal entry queries

## 📱 Key Features

### iPhone Shortcuts Integration

- Voice-activated expense entry
- Receipt photo processing
- Quick category selection
- Offline capability with sync

### Email Transaction Parsing

- Bank notification processing
- Credit card statement parsing
- Merchant recognition
- Duplicate detection
- Confidence scoring

### Smart Budget Management

- Dynamic budget allocation
- Spending pattern analysis
- Rollover budget handling
- Priority-based recommendations

### Savings Goals

- Multiple goal tracking
- Progress visualization
- Budget integration
- Target date management

## 🚀 Implementation Phases

### Phase 1: Database Foundation ✅

- Core table creation
- RLS policies implementation
- Index optimization
- Seed data setup

### Phase 2: Basic CRUD & Categories ✅

- Expense management functions
- Category system
- Form validation
- Basic operations testing

### Phase 3: Minimal UI ✅

- Expense entry forms
- List/table views
- Category interfaces
- Mobile responsiveness

### Phase 4: Integration Infrastructure ✅

- iPhone Shortcuts API
- Email parsing system
- Receipt processing
- Authentication for integrations

### Phase 5: Integration Polish 📋

- Advanced OCR
- Smart categorization
- Confidence scoring
- Batch processing

## 🔐 Security Features

- Row Level Security (RLS) on all tables
- User-scoped data access
- Secure API endpoints
- Authentication middleware
- Input validation and sanitization

## 📊 Data Flow

1. **Manual Entry**: Direct user input via web interface
2. **iPhone Shortcuts**: API endpoints for mobile integration
3. **Email Parsing**: Automated transaction detection
4. **Budget Analysis**: Real-time budget vs. spending calculations
5. **Savings Tracking**: Goal progress updates
6. **Smart Recommendations**: AI-driven spending insights

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run database migrations
npx supabase db push
```

## 🔗 Database Relations

## 📈 Future Enhancements

- Machine learning for better categorization
- Bank API integrations
- Advanced reporting and analytics
- Multi-currency support
- Family/shared budget features
- Investment tracking integration
