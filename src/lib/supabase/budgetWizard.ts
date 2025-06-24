import {
    FinancialSummary,
    SpendingInsights,
    CategorySpending,
    AtypicalExpense,
    BudgetAllocation,
    BudgetConflict,
    WizardSummary,
    EligibleCategory,
    ESSENTIAL_CATEGORIES,
    MINIMUM_SPENDING_THRESHOLD
} from '@/types/budgetWizard'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { IncomeService } from './incomes'
import { ExpenseService } from './expenses'
import { CategoryService } from './categories'
import { BudgetService } from './budgets'
import { GoalService } from './goals'
import { createClient } from './client'

export async function getFinancialSummary(
    userId: string,
    month?: number,
    year?: number
): Promise<FinancialSummary> {
    const targetDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1)
    const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd')

    const incomeService = new IncomeService(userId)

    // Get current month income using existing service
    const incomes = await incomeService.getByDateRange(startDate, endDate)
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

    // Get current month goal savings using existing service
    const goals = await GoalService.getGoals()
    const goalSavings = goals.reduce((sum, goal) => {
        return sum + goal.recent_entries
            .filter(entry => entry.date >= startDate && entry.date <= endDate)
            .reduce((entrySum, entry) => entrySum + entry.amount, 0)
    }, 0)

    return {
        totalIncome,
        goalSavings,
        availableForBudgets: totalIncome - goalSavings,
        month: targetDate.getMonth(),
        year: targetDate.getFullYear()
    }
}

export async function getSpendingInsights(
    userId: string,
    currentMonth?: number,
    currentYear?: number
): Promise<SpendingInsights> {
    const currentDate = new Date(currentYear || new Date().getFullYear(), (currentMonth || new Date().getMonth()), 1)
    const lastMonth = subMonths(currentDate, 1)
    const quarterStart = subMonths(currentDate, 3)

    const expenseService = new ExpenseService(userId)

    // Get last month spending using existing service
    const lastMonthExpenses = await expenseService.getAllFiltered(
        { date_from: format(startOfMonth(lastMonth), 'yyyy-MM-dd'), date_to: format(endOfMonth(lastMonth), 'yyyy-MM-dd') }
    )

    // Get quarter spending using existing service
    const quarterExpenses = await expenseService.getAllFiltered(
        { date_from: format(quarterStart, 'yyyy-MM-dd'), date_to: format(subMonths(currentDate, 1), 'yyyy-MM-dd') } // Up to last month
    )

    // Process last month data
    const lastMonthByCategory = new Map<string, CategorySpending>()
    let totalLastMonth = 0

    lastMonthExpenses.forEach(expense => {
        const category = expense.category
        totalLastMonth += expense.amount

        if (!category) return

        const existing = lastMonthByCategory.get(category.id) || {
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            totalSpending: 0,
            percentage: 0,
            transactionCount: 0
        }

        existing.totalSpending += expense.amount
        existing.transactionCount += 1
        lastMonthByCategory.set(category.id, existing)
    })

    // Calculate percentages for last month
    lastMonthByCategory.forEach(category => {
        category.percentage = totalLastMonth > 0 ? (category.totalSpending / totalLastMonth) * 100 : 0
    })

    // Process quarter data (3 months average)
    const quarterByCategory = new Map<string, CategorySpending>()
    let totalQuarter = 0

    quarterExpenses?.forEach(expense => {
        const category = expense.category
        totalQuarter += expense.amount

        if (!category) return

        const existing = quarterByCategory.get(category.id) || {
            categoryId: category.id,
            categoryName: category.name,
            categoryIcon: category.icon,
            categoryColor: category.color,
            totalSpending: 0,
            percentage: 0,
            transactionCount: 0
        }

        existing.totalSpending += expense.amount
        existing.transactionCount += 1
        quarterByCategory.set(category.id, existing)
    })

    // Calculate monthly averages for quarter
    const totalQuarterAverage = totalQuarter / 3
    quarterByCategory.forEach(category => {
        category.totalSpending = category.totalSpending / 3 // Monthly average
        category.percentage = totalQuarterAverage > 0 ? (category.totalSpending / totalQuarterAverage) * 100 : 0
    })

    // Find atypical expenses
    const atypicalExpenses: AtypicalExpense[] = []
    lastMonthByCategory.forEach((lastMonth, categoryId) => {
        const quarterAvg = quarterByCategory.get(categoryId)
        if (quarterAvg && quarterAvg.totalSpending > 0) {
            const percentageIncrease = ((lastMonth.totalSpending - quarterAvg.totalSpending) / quarterAvg.totalSpending) * 100

            if (percentageIncrease > 25) { // Flag increases > 25%
                atypicalExpenses.push({
                    categoryId,
                    categoryName: lastMonth.categoryName,
                    lastMonthAmount: lastMonth.totalSpending,
                    quarterAverage: quarterAvg.totalSpending,
                    percentageIncrease,
                    isSignificant: percentageIncrease > 50
                })
            }
        }
    })

    return {
        lastMonth: Array.from(lastMonthByCategory.values()).sort((a, b) => b.totalSpending - a.totalSpending),
        quarterAverage: Array.from(quarterByCategory.values()).sort((a, b) => b.totalSpending - a.totalSpending),
        atypicalExpenses: atypicalExpenses.sort((a, b) => b.percentageIncrease - a.percentageIncrease),
        totalLastMonth,
        totalQuarterAverage
    }
}

export async function getEligibleCategories(userId: string): Promise<EligibleCategory[]> {
    const threeMonthsAgo = subMonths(new Date(), 3)
    const expenseService = new ExpenseService(userId)

    // Get categories with recent spending (exclude income)
    const categorySpending = await expenseService.getAllFiltered(
        { date_from: format(threeMonthsAgo, 'yyyy-MM-dd'), date_to: format(new Date(), 'yyyy-MM-dd') }
    )

    // Process spending by category
    const spendingByCategory = new Map<string, EligibleCategory>()

    categorySpending?.forEach(expense => {
        const category = expense.category

        if (!category) return
        const existing = spendingByCategory.get(category.id) || {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            totalSpending: 0,
            isEssential: ESSENTIAL_CATEGORIES.includes(category.name.toLowerCase() as any),
            hasRecentActivity: true
        }

        existing.totalSpending += expense.amount
        spendingByCategory.set(category.id, existing)
    })

    // Filter categories: essential OR spending above threshold
    return Array.from(spendingByCategory.values())
        .filter(category =>
            category.isEssential ||
            category.totalSpending >= MINIMUM_SPENDING_THRESHOLD
        )
        .sort((a, b) => {
            // Sort by: essential first, then by spending amount
            if (a.isEssential && !b.isEssential) return -1
            if (!a.isEssential && b.isEssential) return 1
            return b.totalSpending - a.totalSpending
        })
}

export async function detectBudgetConflicts(
    userId: string,
    categoryIds: string[],
    targetMonth: number,
    targetYear: number
): Promise<BudgetConflict[]> {
    const targetDate = new Date(targetYear, targetMonth, 1)
    const startDate = startOfMonth(targetDate)
    const endDate = endOfMonth(targetDate)

    const supabase = createClient()

    const { data: existingBudgets, error } = await supabase
        .from('budgets')
        .select('id, category_id, amount, period_start, period_end, categories!inner(name)')
        .eq('user_id', userId)
        .in('category_id', categoryIds)
        .or(`and(period_start.lte.${format(startDate, 'yyyy-MM-dd')},period_end.gte.${format(startDate, 'yyyy-MM-dd')}),and(period_start.lte.${format(endDate, 'yyyy-MM-dd')},period_end.gte.${format(endDate, 'yyyy-MM-dd')})`)

    if (error) throw error

    return existingBudgets?.map(budget => ({
        categoryId: budget.category_id,
        categoryName: budget.categories[0].name,
        existingAmount: budget.amount,
        existingPeriodStart: budget.period_start,
        existingPeriodEnd: budget.period_end,
        proposedAmount: 0, // Will be set by wizard
        action: 'replace' as const,
        budgetId: budget.id
    })) || []
}

export async function generateBudgets(
    userId: string,
    allocations: BudgetAllocation[],
    conflicts: BudgetConflict[],
    targetMonth: number,
    targetYear: number
): Promise<void> {
    const targetDate = new Date(targetYear, targetMonth, 1)
    const periodStart = format(startOfMonth(targetDate), 'yyyy-MM-dd')
    const periodEnd = format(endOfMonth(targetDate), 'yyyy-MM-dd')

    // Handle conflicts first
    for (const conflict of conflicts) {
        if (conflict.action === 'replace') {
            // Delete existing budget
            await BudgetService.delete(conflict.budgetId)
        }
    }

    // Create new budgets for allocations that should be created
    const budgetsToCreate = allocations
        .filter(allocation => {
            const conflict = conflicts.find(c => c.categoryId === allocation.categoryId)
            return !conflict || conflict.action === 'replace'
        })
        .map(allocation => ({
            user_id: userId,
            category_id: allocation.categoryId,
            amount: allocation.amount,
            period_start: periodStart,
            period_end: periodEnd
        }))

    if (budgetsToCreate.length > 0) {
        await Promise.all(budgetsToCreate.map(async budget => {
            const createdBudget = await BudgetService.create(budget)
            await BudgetService.assignToExistingExpenses(createdBudget.id, budget.category_id, periodStart, periodEnd)
        }))
    }
}

export async function canUseWizard(userId: string): Promise<boolean> {
    const currentDate = new Date()
    const isEarlyInMonth = currentDate.getDate() <= 10 // First 10 days of month

    // Check if user has income this month
    const summary = await getFinancialSummary(userId)
    const hasIncome = summary.totalIncome > 0

    // Check if user has eligible categories
    const categories = await getEligibleCategories(userId)
    const hasCategories = categories.length > 0

    return isEarlyInMonth && hasIncome && hasCategories
} 