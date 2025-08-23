'use client'

import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import { CategorySummaryCards } from './CategorySummaryCards'
import { CategoryPieChart } from './CategoryPieChart'
import { WeeklySpendingChart } from './WeeklySpendingChart'
import { CategoryBreakdownCard } from './CategoryBreakdownCard'
import {
    processExpensesByCategory,
    processWeeklySpending,
    type CategorySpendingData,
    type WeeklySpendingData
} from './utils'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoryOverview() {
    const { totalExpense, loading } = useExpenseContext()
    const { categories } = useCategories()

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            </div>
        )
    }

    // // Process data
    // const categoryData = processExpensesByCategory(allFilteredExpenses)
    // const weeklyData = processWeeklySpending(allFilteredExpenses, 4)
    // const totalAmount = allFilteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {/* <CategorySummaryCards
                categories={categoryData}
                weeklyData={weeklyData}
                totalAmount={totalAmount}
                totalExpenses={allFilteredExpenses.length}
            /> */}

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 border-none">
                {/* <CategoryPieChart categories={categoryData} /> */}
                {/* <WeeklySpendingChart weeklyData={weeklyData} /> */}
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Desglose por Categorías
                </h2>
                <div className="space-y-4">
                    {/* {categoryData.map((category) => (
                        <CategoryBreakdownCard
                            key={category.categoryId}
                            category={category}
                            weeklyData={weeklyData}
                            expenses={allFilteredExpenses}
                            totalAmount={totalAmount}
                        />
                    ))} */}
                </div>
            </div>
        </div>
    )
} 