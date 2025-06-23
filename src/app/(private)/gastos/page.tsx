'use client'

import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import {
    ExpenseTable,
    ExpenseFilters,
    type ExpenseFilters as UIExpenseFilters
} from '@/components/expense-table'
import { convertToDatabaseFilters } from '@/components/expense-table/ExpenseFilters'
import { ExpenseSummary } from '@/components/expenses/ExpenseSummary'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExpensesPage() {
    const {
        updateFilters,
        allFilteredExpenses,
    } = useExpenseContext()
    const { categories } = useCategories()
    const router = useRouter()

    const [uiFilters, setUiFilters] = useState<UIExpenseFilters>({
        dateRange: 'all'
    })


    const handleFiltersChange = async (filters: UIExpenseFilters) => {
        setUiFilters(filters)
        const dbFilters = convertToDatabaseFilters(filters)
        await updateFilters(dbFilters)
    }


    return (
        <div className="space-y-4 sm:space-y-6">
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

            <ExpenseSummary allFilteredExpenses={allFilteredExpenses} />
            <ExpenseFilters
                categories={categories}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
            />
            <ExpenseTable />
        </div>
    )
} 