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
            <div className="rounded-lg border bg-card shadow-sm p-4 min-h-[60px] flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Este Mes</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleMonthlyVisibility}
                            data-testid="amount-toggle"
                            className="h-8 w-8 p-1 hover:bg-accent/50 touch-manipulation ml-auto"
                        >
                            {showMonthlyAmount ? (
                                <EyeOff className="h-4 w-4" data-testid="eye-off-icon" />
                            ) : (
                                <Eye className="h-4 w-4" data-testid="eye-icon" />
                            )}
                        </Button>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-baseline gap-3">
                            <Skeleton className="w-24 h-7" />
                            <Skeleton className="w-20 h-4" />
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-3">
                            <div className="text-2xl font-semibold text-foreground">
                                {renderAmount(monthlyTotal, showMonthlyAmount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {monthlyExpenses.length} gastos
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 