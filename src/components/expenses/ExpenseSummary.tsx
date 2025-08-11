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
            return '******'
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
        <button onClick={handleToggleMonthlyVisibility} className="rounded-lg border bg-card shadow-sm p-4 flex items-center justify-between w-full">

                <p className="text-sm font-medium text-foreground">Gasto Mensual</p>
                <div className="flex items-center justify-end gap-2">
                {loading ? (
                    <div className="flex gap-3">
                        <Skeleton className="w-24 h-7" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                ) : (
                    <div className="text-sm font-semibold text-foreground">
                        {renderAmount(monthlyTotal, showMonthlyAmount)}
                    </div>
                )}
                 {showMonthlyAmount ? (
                    <EyeOff className="h-4 w-4" data-testid="eye-off-icon" />
                ) : (
                    <Eye className="h-4 w-4" data-testid="eye-icon" />
                )}
                </div>
        </button>
    )
} 