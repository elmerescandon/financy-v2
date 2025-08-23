CREATE OR REPLACE FUNCTION get_expense_total(
    p_user_id UUID,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_category_ids UUID[] DEFAULT NULL
)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(amount), 0)
        FROM expenses
        WHERE user_id = p_user_id 
        AND type = 'expense'
        AND (p_date_from IS NULL OR date >= p_date_from)
        AND (p_date_to IS NULL OR date <= p_date_to)
        AND (p_category_ids IS NULL OR category_id = ANY(p_category_ids))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;