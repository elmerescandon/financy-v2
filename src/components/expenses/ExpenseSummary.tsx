'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingDown, Calendar, Tag, Eye, EyeOff } from 'lucide-react'
import { formatAmount } from '@/lib/utils/formats'
import type { Expense } from '@/types/expense'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { Skeleton } from '../ui/skeleton'
import { useState } from 'react'

export function ExpenseSummary() {
    const { allFilteredExpenses, loading } = useExpenseContext()

    // State for controlling visibility of amounts in each card
    const [showTotalAmount, setShowTotalAmount] = useState(false)
    const [showMonthlyAmount, setShowMonthlyAmount] = useState(false)

    // Calculate amounts with error handling
    const totalExpenses = allFilteredExpenses.reduce((sum, expense) => {
        try {
            return sum + (expense.amount || 0)
        } catch {
            return sum
        }
    }, 0)

    const monthlyExpenses = allFilteredExpenses.filter(expense => {
        try {
            const expenseDate = new Date(expense.date)
            const now = new Date()
            return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
        } catch {
            return false
        }
    })

    const monthlyTotal = monthlyExpenses.reduce((sum, expense) => {
        try {
            return sum + (expense.amount || 0)
        } catch {
            return sum
        }
    }, 0)

    const uniqueCategories = new Set(
        allFilteredExpenses
            .map(expense => expense.category_id)
            .filter(Boolean)
    ).size

    // Helper function to render amount with visibility control
    const renderAmount = (amount: number, isVisible: boolean) => {
        if (!isVisible) {
            return '****'
        }

        try {
            return formatAmount(amount)
        } catch {
            return 'S/ 0.00'
        }
    }

    // Toggle handlers
    const handleToggleTotalVisibility = () => {
        setShowTotalAmount(prev => !prev)
    }

    const handleToggleMonthlyVisibility = () => {
        setShowMonthlyAmount(prev => !prev)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
            {/* Total Gastos Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleTotalVisibility}
                            data-testid="amount-toggle"
                            className="h-auto p-1 hover:bg-accent"
                        >
                            {showTotalAmount ? (
                                <EyeOff className="h-4 w-4" data-testid="eye-off-icon" />
                            ) : (
                                <Eye className="h-4 w-4" data-testid="eye-icon" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <>
                            <div className="text-2xl font-bold text-primary">
                                <Skeleton className="w-24 h-8" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Skeleton className="w-32 h-4 mt-2" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-primary">
                                {renderAmount(totalExpenses, showTotalAmount)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {allFilteredExpenses.length} gastos registrados
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Este Mes Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMonthlyVisibility}
                            data-testid="amount-toggle"
                            className="h-auto p-1 hover:bg-accent"
                        >
                            {showMonthlyAmount ? (
                                <EyeOff className="h-4 w-4" data-testid="eye-off-icon" />
                            ) : (
                                <Eye className="h-4 w-4" data-testid="eye-icon" />
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <>
                            <div className="text-2xl font-bold">
                                <Skeleton className="w-24 h-8" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Skeleton className="w-32 h-4 mt-2" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold">
                                {renderAmount(monthlyTotal, showMonthlyAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {monthlyExpenses.length} gastos este mes
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Categorías Card (no amount hiding needed) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <>
                            <div className="text-2xl font-bold">
                                <Skeleton className="w-24 h-8" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <Skeleton className="w-32 h-4 mt-2" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold">
                                {uniqueCategories}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Categorías utilizadas
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 