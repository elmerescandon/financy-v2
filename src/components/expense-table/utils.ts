import type { ExpenseWithDetails } from '@/types/expense'

export type DateRangeFilter = 'all' | 'this_month' | 'prev_month' | 'last_3_months' | 'this_year'

export function getDateRange(filter: DateRangeFilter): { start: Date | null, end: Date | null } {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (filter) {
        case 'this_month':
            return {
                start: new Date(currentYear, currentMonth, 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
            }

        case 'prev_month':
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
            return {
                start: new Date(prevYear, prevMonth, 1),
                end: new Date(prevYear, prevMonth + 1, 0, 23, 59, 59)
            }

        case 'last_3_months':
            const threeMonthsAgo = new Date(now)
            threeMonthsAgo.setMonth(currentMonth - 3)
            return {
                start: new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth(), 1),
                end: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
            }

        case 'this_year':
            return {
                start: new Date(currentYear, 0, 1),
                end: new Date(currentYear, 11, 31, 23, 59, 59)
            }

        case 'all':
        default:
            return { start: null, end: null }
    }
}

export function filterExpensesByDateRange(
    expenses: ExpenseWithDetails[],
    dateRange: DateRangeFilter
): ExpenseWithDetails[] {
    if (dateRange === 'all') return expenses

    const { start, end } = getDateRange(dateRange)
    if (!start || !end) return expenses

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate >= start && expenseDate <= end
    })
}

export function filterExpensesByCategory(
    expenses: ExpenseWithDetails[],
    categoryId?: string
): ExpenseWithDetails[] {
    if (!categoryId) return expenses
    return expenses.filter(expense => expense.category_id === categoryId)
} 