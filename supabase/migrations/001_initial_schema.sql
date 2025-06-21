-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enums
CREATE TYPE payment_method AS ENUM (
    'efectivo',
    'tarjeta_debito', 
    'tarjeta_credito',
    'transferencia',
    'paypal',
    'bizum',
    'otro'
);

CREATE TYPE expense_source AS ENUM (
    'manual',
    'iphone',
    'email',
    'import',
    'api'
);

CREATE TYPE currency AS ENUM (
    'USD', 'EUR', 'GBP', 'MXN', 'CAD', 'AUD', 'JPY', 'PEN'
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    rollover_amount DECIMAL(12,2) DEFAULT 0,
    allocation_percentage DECIMAL(5,2),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency currency DEFAULT 'USD',
    description TEXT NOT NULL,
    date DATE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    merchant VARCHAR(200),
    payment_method payment_method NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    source expense_source DEFAULT 'manual',
    source_metadata JSONB DEFAULT '{}',
    confidence_score DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    needs_review BOOLEAN DEFAULT false,
    transaction_hash VARCHAR(64),
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings_goals table
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12,2) DEFAULT 0,
    target_date DATE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_is_default ON categories(is_default) WHERE is_default = true;

CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_budgets_priority ON budgets(priority);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_subcategory_id ON expenses(subcategory_id);
CREATE INDEX idx_expenses_budget_id ON expenses(budget_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX idx_expenses_source ON expenses(source);
CREATE INDEX idx_expenses_needs_review ON expenses(needs_review) WHERE needs_review = true;
CREATE INDEX idx_expenses_transaction_hash ON expenses(transaction_hash) WHERE transaction_hash IS NOT NULL;
CREATE INDEX idx_expenses_payment_method ON expenses(payment_method);
CREATE INDEX idx_expenses_merchant ON expenses(merchant);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_category_id ON savings_goals(category_id);
CREATE INDEX idx_savings_goals_budget_id ON savings_goals(budget_id);

-- Create budget_insights view
-- CREATE OR REPLACE VIEW budget_insights AS
-- SELECT 
--     b.id,
--     b.user_id,
--     b.category_id,
--     b.amount as budget_amount,
--     b.period_start,
--     b.period_end,
--     b.allocation_percentage,
--     b.rollover_amount,
--     c.name as category_name,
--     c.icon as category_icon,
--     c.color as category_color,
--     COALESCE(SUM(e.amount), 0) as spent_amount,
--     b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount,
--     CASE 
--         WHEN b.amount > 0 THEN (COALESCE(SUM(e.amount), 0) / b.amount) * 100
--         ELSE 0 
--     END as spent_percentage
-- FROM budgets b
-- LEFT JOIN categories c ON b.category_id = c.id
-- LEFT JOIN expenses e ON b.category_id = e.category_id 
--     AND e.date BETWEEN b.period_start AND b.period_end
--     AND e.user_id = b.user_id
-- GROUP BY b.id, b.user_id, b.category_id, b.amount, b.period_start, b.period_end, 
--          b.allocation_percentage, b.rollover_amount, c.name, c.icon, c.color;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subcategories
CREATE POLICY "Users can view subcategories of their categories" ON subcategories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM categories 
            WHERE categories.id = subcategories.category_id 
            AND categories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subcategories for their categories" ON subcategories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM categories 
            WHERE categories.id = subcategories.category_id 
            AND categories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update subcategories of their categories" ON subcategories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM categories 
            WHERE categories.id = subcategories.category_id 
            AND categories.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subcategories of their categories" ON subcategories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM categories 
            WHERE categories.id = subcategories.category_id 
            AND categories.user_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- -- Grant specific permissions for the view
-- GRANT SELECT ON budget_insights TO anon, authenticated;

-- -- Create indexes for the view (if needed)
-- CREATE INDEX idx_budget_insights_user_id ON budget_insights(user_id);
-- CREATE INDEX idx_budget_insights_category_id ON budget_insights(category_id); 