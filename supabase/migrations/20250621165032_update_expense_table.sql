-- Migration to sync expenses table with production structure
-- Add missing columns and update data types

-- Drop view that depends on expenses.date column
DROP VIEW IF EXISTS budget_insights;

-- Add missing columns
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_frequency TEXT;

-- Drop default for tags column before type change
ALTER TABLE expenses ALTER COLUMN tags DROP DEFAULT;

-- Update data types to match production
ALTER TABLE expenses 
ALTER COLUMN currency TYPE TEXT,
ALTER COLUMN description DROP NOT NULL,
ALTER COLUMN date TYPE TIMESTAMP WITH TIME ZONE,
ALTER COLUMN payment_method TYPE TEXT,
ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags),
ALTER COLUMN source TYPE TEXT;

-- Update default values to match production
ALTER TABLE expenses 
ALTER COLUMN tags SET DEFAULT '[]'::jsonb,
ALTER COLUMN source_metadata SET DEFAULT '{}'::jsonb,
ALTER COLUMN confidence_score SET DEFAULT 1.0,
ALTER COLUMN needs_review SET DEFAULT false,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Recreate the budget_insights view with updated date column
CREATE OR REPLACE VIEW budget_insights AS
SELECT 
    b.id,
    b.user_id,
    b.category_id,
    b.amount as budget_amount,
    b.period_start,
    b.period_end,
    b.allocation_percentage,
    b.rollover_amount,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    COALESCE(SUM(e.amount), 0) as spent_amount,
    b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount,
    CASE 
        WHEN b.amount > 0 THEN (COALESCE(SUM(e.amount), 0) / b.amount) * 100
        ELSE 0 
    END as spent_percentage
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN expenses e ON b.category_id = e.category_id 
    AND e.date::date BETWEEN b.period_start AND b.period_end
    AND e.user_id = b.user_id
GROUP BY b.id, b.user_id, b.category_id, b.amount, b.period_start, b.period_end, 
         b.allocation_percentage, b.rollover_amount, c.name, c.icon, c.color;

-- Add comments for documentation
COMMENT ON COLUMN expenses.type IS 'Type of expense (e.g., fixed, variable, discretionary)';
COMMENT ON COLUMN expenses.recurring IS 'Whether this is a recurring expense';
COMMENT ON COLUMN expenses.recurring_frequency IS 'Frequency of recurring expense (e.g., monthly, weekly, yearly)'; 