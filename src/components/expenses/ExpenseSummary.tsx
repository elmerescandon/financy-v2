'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, Calendar, Tag } from 'lucide-react'
import { formatAmount } from '@/lib/utils/formats'
import type { Expense } from '@/types/expense'

interface ExpenseSummaryProps {
    expenses: Expense[]
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const now = new Date()
        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
    })
    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    const uniqueCategories = new Set(expenses.map(expense => expense.category_id)).size

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {formatAmount(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {expenses.length} gastos registrados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatAmount(monthlyTotal)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {monthlyExpenses.length} gastos este mes
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {uniqueCategories}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Categorías utilizadas
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 