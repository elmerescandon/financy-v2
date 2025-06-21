-- Create goal_entries table
CREATE TABLE goal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy
ALTER TABLE goal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own goal entries
CREATE POLICY "Users can manage their own goal entries" ON goal_entries
    FOR ALL USING (
        goal_id IN (
            SELECT id FROM savings_goals WHERE user_id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX idx_goal_entries_goal_id ON goal_entries(goal_id);
CREATE INDEX idx_goal_entries_date ON goal_entries(date);
CREATE INDEX idx_goal_entries_created_at ON goal_entries(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goal_entries_updated_at
    BEFORE UPDATE ON goal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();