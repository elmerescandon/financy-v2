# 🗃️ Database Update for Integration Features

## Issue

The API integration endpoint is failing because the database is missing columns needed for iPhone shortcuts and email scraping.

## Solution

Run the migration to add the missing columns.

## 📋 Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**

   - Navigate to your project dashboard
   - Go to SQL Editor

2. **Run Migration SQL**
   - Copy the content from `supabase/migrations/add_integration_columns.sql`
   - Paste it into the SQL Editor
   - Click "Run"

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## 🔍 Migration Details

The migration adds these columns to the `expenses` table:

- `source` - Source of expense (manual, iphone, email, import, api)
- `source_metadata` - JSON metadata from source system
- `confidence_score` - AI confidence score (0.0 to 1.0)
- `needs_review` - Boolean flag for manual review
- `transaction_hash` - Unique hash for duplicate prevention
- `raw_data` - Original raw data for debugging

## ✅ Verify Migration

After running the migration, test the API:

1. Go to **Settings → API Keys** in your app
2. Click **"Probar API"** button
3. Should see success message: "API key funciona correctamente"

## 🚨 Alternative: Manual Column Addition

If you prefer to add columns manually in Supabase dashboard:

```sql
-- Add source enum type
CREATE TYPE expense_source AS ENUM ('manual', 'iphone', 'email', 'import', 'api');

-- Add columns one by one
ALTER TABLE expenses ADD COLUMN source expense_source DEFAULT 'manual';
ALTER TABLE expenses ADD COLUMN source_metadata JSONB DEFAULT '{}';
ALTER TABLE expenses ADD COLUMN confidence_score DECIMAL(3,2);
ALTER TABLE expenses ADD COLUMN needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN transaction_hash TEXT;
ALTER TABLE expenses ADD COLUMN raw_data JSONB;

-- Add constraints
ALTER TABLE expenses ADD CONSTRAINT check_confidence_score
  CHECK (confidence_score >= 0 AND confidence_score <= 1);
```

Once completed, your integration API will work correctly! 🎉
