import type { ExpenseWithDetails } from '@/types/expense'
import { startOfWeek, endOfWeek, format, eachWeekOfInterval, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export interface CategorySpendingData {
    categoryId: string
    categoryName: string
    categoryIcon: string
    categoryColor: string
    totalAmount: number
    expenseCount: number
    averageAmount: number
    percentage: number
}

export interface WeeklySpendingData {
    week: string
    weekStart: string
    weekEnd: string
    totalAmount: number
    categoryBreakdown: CategorySpendingData[]
}

export interface ChartDataPoint {
    name: string
    value: number
    color: string
    icon: string
}

export function processExpensesByCategory(expenses: ExpenseWithDetails[]): CategorySpendingData[] {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const categoryMap = new Map<string, CategorySpendingData>()

    expenses.forEach(expense => {
        if (!expense.category) return

        const existing = categoryMap.get(expense.category.id) || {
            categoryId: expense.category.id,
            categoryName: expense.category.name,
            categoryIcon: expense.category.icon,
            categoryColor: expense.category.color,
            totalAmount: 0,
            expenseCount: 0,
            averageAmount: 0,
            percentage: 0
        }

        existing.totalAmount += expense.amount
        existing.expenseCount += 1
        categoryMap.set(expense.category.id, existing)
    })

    const categories = Array.from(categoryMap.values())
        .map(category => ({
            ...category,
            averageAmount: category.totalAmount / category.expenseCount,
            percentage: totalAmount > 0 ? (category.totalAmount / totalAmount) * 100 : 0
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)

    return categories
}

export function processWeeklySpending(expenses: ExpenseWithDetails[], weeks: number = 8): WeeklySpendingData[] {
    if (expenses.length === 0) return []

    const now = new Date()
    const startDate = subWeeks(now, weeks - 1)
    const endDate = now

    const weekIntervals = eachWeekOfInterval({ start: startDate, end: endDate })

    return weekIntervals.map(weekStart => {
        const weekEnd = endOfWeek(weekStart)
        const weekKey = format(weekStart, 'yyyy-MM-dd')

        const weekExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= weekStart && expenseDate <= weekEnd
        })

        const categoryBreakdown = processExpensesByCategory(weekExpenses)
        const totalAmount = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0)

        return {
            week: format(weekStart, 'MMM dd', { locale: es }),
            weekStart: format(weekStart, 'yyyy-MM-dd'),
            weekEnd: format(weekEnd, 'yyyy-MM-dd'),
            totalAmount,
            categoryBreakdown
        }
    })
}

export function preparePieChartData(categories: CategorySpendingData[]): ChartDataPoint[] {
    return categories.map(category => ({
        name: category.categoryName,
        value: category.totalAmount,
        color: category.categoryColor,
        icon: category.categoryIcon
    }))
}

export function prepareWeeklyBarChartData(weeklyData: WeeklySpendingData[]): any[] {
    return weeklyData.map(week => {
        const dataPoint: any = {
            week: week.week,
            total: week.totalAmount
        }

        week.categoryBreakdown.forEach(category => {
            dataPoint[category.categoryName] = category.totalAmount
        })

        return dataPoint
    })
}

export function getTopCategories(categories: CategorySpendingData[], limit: number = 5): CategorySpendingData[] {
    return categories.slice(0, limit)
}

export function calculateSpendingTrend(weeklyData: WeeklySpendingData[]): {
    trend: 'up' | 'down' | 'stable'
    percentage: number
} {
    if (weeklyData.length < 2) return { trend: 'stable', percentage: 0 }

    const recent = weeklyData[weeklyData.length - 1].totalAmount
    const previous = weeklyData[weeklyData.length - 2].totalAmount

    if (previous === 0) return { trend: 'stable', percentage: 0 }

    const percentage = ((recent - previous) / previous) * 100

    if (percentage > 5) return { trend: 'up', percentage }
    if (percentage < -5) return { trend: 'down', percentage: Math.abs(percentage) }
    return { trend: 'stable', percentage: Math.abs(percentage) }
} 