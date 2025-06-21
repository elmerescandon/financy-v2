'use client'

import { useRouter } from 'next/navigation'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import {
    ExpenseTable,
    ExpenseFilters,
    type ExpenseFilters as UIExpenseFilters
} from '@/components/expense-table'
import { convertToDatabaseFilters } from '@/components/expense-table/ExpenseFilters'
import { ExpenseSummary } from '@/components/expenses/ExpenseSummary'
import { toast } from 'sonner'
import { useState } from 'react'

export default function ExpensesPage() {
    const router = useRouter()
    const {
        expenses,
        loading,
        error,
        deleteExpense,
        pagination,
        updateFilters,
        setPage,
        setPageSize
    } = useExpenseContext()
    const { categories } = useCategories()

    // UI filter state (date range, category)
    const [uiFilters, setUiFilters] = useState<UIExpenseFilters>({
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

    // When UI filters change, update context filters (database filters)
    const handleFiltersChange = (filters: UIExpenseFilters) => {
        setUiFilters(filters)
        const dbFilters = convertToDatabaseFilters(filters)
        updateFilters(dbFilters)
    }

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setPage(page)
    }
    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize)
    }

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
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Expenses Table */}
            {expenses.length === 0 ? (
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
                    expenses={expenses}
                    onDelete={handleDeleteExpense}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    )
} 