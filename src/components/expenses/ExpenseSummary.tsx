'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Eye, EyeOff } from 'lucide-react'
import { formatAmount } from '@/lib/utils/formats'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { Skeleton } from '../ui/skeleton'
import { useState } from 'react'

export function ExpenseSummary() {
    const { allFilteredExpenses, loading } = useExpenseContext()

    const [showMonthlyAmount, setShowMonthlyAmount] = useState(false)

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

    const handleToggleMonthlyVisibility = () => {
        setShowMonthlyAmount(prev => !prev)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
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
                            className="h-12 w-12 p-2 hover:bg-accent sm:h-auto sm:w-auto sm:p-1 touch-manipulation"
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
        </div>
    )
} 