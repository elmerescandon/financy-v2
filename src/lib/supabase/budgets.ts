import { createClient } from './client'
import type {
    Budget,
    BudgetWithDetails,
    BudgetInsight,
    CreateBudgetData,
    UpdateBudgetData,
    BudgetStats,
    BudgetFilters,
    BudgetAssignmentPreview,
    BudgetAssignmentResult,
    ExpenseConflict
} from '@/types/budget'

const supabase = createClient()

export class BudgetService {
    // Create budget
    static async create(budget: CreateBudgetData) {
        const { assignToExisting, previewData, ...budgetData } = budget

        const { data, error } = await supabase
            .from('budgets')
            .insert(budgetData)
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .single()

        if (error) throw error

        const newBudget = data as BudgetWithDetails

        // If assignToExisting is true, assign existing expenses to this budget
        if (assignToExisting) {
            await this.assignToExistingExpenses(
                newBudget.id,
                newBudget.category_id,
                newBudget.period_start,
                newBudget.period_end
            )
        }

        return newBudget
    }

    // Get all budgets for current user
    static async getAll(limit = 50, offset = 0) {
        const { data, error } = await supabase
            .from('budgets')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .order('period_start', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error
        return data as BudgetWithDetails[]
    }

    // Get budget by ID
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('budgets')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data as BudgetWithDetails
    }

    // Update budget
    static async update(id: string, updates: Partial<UpdateBudgetData>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuario no autenticado')

        const { assignToExisting, previewData, ...budgetData } = updates
        const { data, error } = await supabase
            .from('budgets')
            .update({ ...budgetData, user_id: user.id })
            .eq('id', id)
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .single()

        if (error) throw error
        return data as BudgetWithDetails
    }

    // Delete budget
    static async delete(id: string) {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Get budget insights (from view)
    static async getInsights(filters?: BudgetFilters) {
        let query = supabase
            .from('budget_insights')
            .select('*')

        // Apply filters
        if (filters?.category_id) {
            query = query.eq('category_id', filters.category_id)
        }
        if (filters?.category_ids?.length) {
            query = query.in('category_id', filters.category_ids)
        }
        if (filters?.period_start) {
            query = query.gte('period_start', filters.period_start)
        }
        if (filters?.period_end) {
            query = query.lte('period_end', filters.period_end)
        }
        if (filters?.is_active) {
            // Get today's date in local timezone (GMT-5)
            const now = new Date()
            const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
            query = query.lte('period_start', today).gte('period_end', today)
        }
        if (filters?.is_over_budget) {
            query = query.gt('spent_amount', 'budget_amount')
        }
        if (filters?.priority_min) {
            query = query.gte('priority', filters.priority_min)
        }
        if (filters?.priority_max) {
            query = query.lte('priority', filters.priority_max)
        }

        query = query.order('category_name', { ascending: true })

        const { data, error } = await query

        if (error) throw error



        return data as BudgetInsight[]
    }

    // Get active budgets for current period
    static async getActive() {
        // Get today's date in local timezone (GMT-5)
        const now = new Date()
        const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('budget_insights')
            .select('*')
            .lte('period_start', today)
            .gte('period_end', today)
            .order('category_name', { ascending: true })

        if (error) throw error
        return data as BudgetInsight[]
    }

    // Get budgets by category
    static async getByCategory(categoryId: string) {
        const { data, error } = await supabase
            .from('budgets')
            .select(`
                *,
                category:categories(id, name, color, icon)
            `)
            .eq('category_id', categoryId)
            .order('period_start', { ascending: false })

        if (error) throw error
        return data as BudgetWithDetails[]
    }

    // Get budgets by date range
    static async getByDateRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('budget_insights')
            .select('*')
            .or(`period_start.lte.${endDate},period_end.gte.${startDate}`)
            .order('period_start', { ascending: false })

        if (error) throw error
        return data as BudgetInsight[]
    }

    // Get budget statistics
    static async getStats(startDate?: string, endDate?: string) {
        let query = supabase
            .from('budget_insights')
            .select('budget_amount, spent_amount, remaining_amount')

        if (startDate) query = query.gte('period_start', startDate)
        if (endDate) query = query.lte('period_end', endDate)

        const { data, error } = await query

        if (error) throw error

        const total_budget = data?.reduce((sum, budget) => sum + budget.budget_amount, 0) || 0
        const total_spent = data?.reduce((sum, budget) => sum + budget.spent_amount, 0) || 0
        const total_remaining = data?.reduce((sum, budget) => sum + budget.remaining_amount, 0) || 0
        const budget_count = data?.length || 0
        const over_budget_count = data?.filter(b => b.spent_amount > b.budget_amount).length || 0

        return {
            total_budget,
            total_spent,
            total_remaining,
            budget_count,
            over_budget_count,
            currency: 'PEN' as const,
            period: {
                start: startDate || '',
                end: endDate || ''
            }
        } as BudgetStats
    }

    // Find budget for expense auto-assignment
    static async findBudgetForExpense(categoryId: string, expenseDate: string) {
        const { data, error } = await supabase
            .from('budgets')
            .select('id')
            .eq('category_id', categoryId)
            .lte('period_start', expenseDate)
            .gte('period_end', expenseDate)
            .order('priority', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
        return data?.id || null
    }

    // Create budget for period (helper)
    static async createForPeriod(
        categoryId: string,
        amount: number,
        periodStart: string,
        periodEnd: string,
        options?: {
            allocationPercentage?: number
            priority?: number
            rolloverAmount?: number
        }
    ) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuario no autenticado')

        const budgetData: CreateBudgetData = {
            user_id: user.id,
            category_id: categoryId,
            amount,
            period_start: periodStart,
            period_end: periodEnd,
            allocation_percentage: options?.allocationPercentage,
            priority: options?.priority || 5,
            rollover_amount: options?.rolloverAmount || 0
        }

        return this.create(budgetData)
    }

    // Get budget alerts
    static async getAlerts() {
        const insights = await this.getActive()
        const alerts = []

        for (const insight of insights) {
            // Over budget alert
            if (insight.spent_amount > insight.budget_amount) {
                alerts.push({
                    type: 'over_budget' as const,
                    category_name: insight.category_name,
                    message: `You've exceeded your ${insight.category_name} budget by ${(insight.spent_percentage - 100).toFixed(1)}%`,
                    severity: 'high' as const
                })
            }
            // Near limit alert (80%+)
            else if (insight.spent_percentage >= 80) {
                alerts.push({
                    type: 'near_limit' as const,
                    category_name: insight.category_name,
                    message: `You've used ${insight.spent_percentage.toFixed(1)}% of your ${insight.category_name} budget`,
                    severity: insight.spent_percentage >= 90 ? 'medium' as const : 'low' as const
                })
            }
        }

        return alerts
    }

    // Preview assignment for existing expenses
    static async previewAssignment(categoryId: string, startDate: string, endDate: string): Promise<BudgetAssignmentPreview> {
        const { data, error } = await supabase
            .from('expenses')
            .select('id, amount, budget_id')
            .eq('category_id', categoryId)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)

        if (error) throw error

        const expenses = data || []
        const unassignedExpenses = expenses.filter(exp => !exp.budget_id)
        const conflictExpenses = expenses.filter(exp => exp.budget_id)

        return {
            matchingExpenses: unassignedExpenses.length,
            totalAmount: unassignedExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            hasConflicts: conflictExpenses.length > 0,
            conflictCount: conflictExpenses.length
        }
    }

    // Assign budget to existing expenses
    static async assignToExistingExpenses(
        budgetId: string,
        categoryId: string,
        startDate: string,
        endDate: string
    ): Promise<BudgetAssignmentResult> {
        // Get existing expenses in this category and period
        const { data: expenses, error: fetchError } = await supabase
            .from('expenses')
            .select(`
                id, 
                amount, 
                description, 
                budget_id,
                budget:budgets(id, category:categories(name))
            `)
            .eq('category_id', categoryId)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)

        if (fetchError) throw fetchError

        const allExpenses = expenses || []
        const unassignedExpenses = allExpenses.filter(exp => !exp.budget_id)
        const conflictExpenses = allExpenses.filter(exp => exp.budget_id)

        // Update unassigned expenses
        let assignedCount = 0
        let totalAmount = 0

        if (unassignedExpenses.length > 0) {
            const expenseIds = unassignedExpenses.map(exp => exp.id)

            const { error: updateError } = await supabase
                .from('expenses')
                .update({ budget_id: budgetId })
                .in('id', expenseIds)

            if (updateError) throw updateError

            assignedCount = unassignedExpenses.length
            totalAmount = unassignedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        }

        // Prepare conflict details
        const conflicts: ExpenseConflict[] = conflictExpenses.map(exp => ({
            expenseId: exp.id,
            description: exp.description,
            amount: exp.amount,
            currentBudgetId: exp.budget_id,
            currentBudgetName: (exp.budget as any)?.category?.name || 'Unknown Budget'
        }))

        return {
            budgetId,
            assignedCount,
            totalAmount,
            skippedCount: conflictExpenses.length,
            conflicts
        }
    }

    // Get detailed expenses for a budget (helper method)
    static async getBudgetExpenses(budgetId: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                id,
                amount,
                description,
                date,
                merchant,
                category:categories(name, icon, color)
            `)
            .eq('budget_id', budgetId)
            .eq('type', 'expense')
            .order('date', { ascending: false })

        if (error) throw error
        return data || []
    }
} 