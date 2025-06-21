'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import {
    ExpenseTable,
    ExpenseFilters,
    type ExpenseFiltersType,
    filterExpensesByDateRange,
    filterExpensesByCategory
} from '@/components/expense-table'
import { ExpenseSummary } from '@/components/expenses/ExpenseSummary'
import { toast } from 'sonner'

export default function ExpensesPage() {
    const router = useRouter()
    const { expenses, loading, error, deleteExpense } = useExpenseContext()
    const { categories } = useCategories()

    const [filters, setFilters] = useState<ExpenseFiltersType>({
        dateRange: 'all'
    })

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id)
            toast.success('Gasto eliminado exitosamente')
        } catch (err) {
            toast.error('Error al eliminar el gasto')
            console.error('Error deleting expense:', err)
        }
    }

    const filteredExpenses = useMemo(() => {
        let filtered = expenses

        // Apply date range filter
        filtered = filterExpensesByDateRange(filtered, filters.dateRange)

        // Apply category filter
        filtered = filterExpensesByCategory(filtered, filters.categoryId)

        return filtered
    }, [expenses, filters])

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Cargando gastos...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray-900">Gastos</h1>
                <Button
                    onClick={() => router.push('/gastos/agregar')}
                    className="w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Gasto
                </Button>
            </div>

            {/* Summary */}
            <ExpenseSummary expenses={expenses} />

            {/* Filters */}
            <ExpenseFilters
                categories={categories}
                filters={filters}
                onFiltersChange={setFilters}
            />

            {/* Expenses Table */}
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                        {expenses.length === 0
                            ? 'No tienes gastos registrados aún.'
                            : 'No se encontraron gastos con los filtros aplicados.'
                        }
                    </p>
                    <Button
                        onClick={() => router.push('/gastos/agregar')}
                        variant="outline"
                        className="w-full sm:w-auto cursor-pointer"
                    >
                        Agregar tu primer gasto
                    </Button>
                </div>
            ) : (
                <ExpenseTable
                    expenses={filteredExpenses}
                    onDelete={handleDeleteExpense}
                />
            )}
        </div>
    )
} 