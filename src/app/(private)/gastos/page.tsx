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
        <div className="min-h-screen bg-background">
            <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
                {/* Header - Mobile optimized */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-foreground leading-tight">
                        Gastos
                    </h1>
                    <Button
                        onClick={() => router.push('/gastos/agregar')}
                        className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                        size="lg"
                    >
                        <Plus className="w-5 h-5 mr-3" />
                        Agregar Gasto
                    </Button>
                </div>

                {/* Content with improved mobile spacing */}
                <div className="space-y-6">
                    <ExpenseSummary allFilteredExpenses={allFilteredExpenses} />

                    <ExpenseFilters
                        categories={categories}
                        filters={uiFilters}
                        onFiltersChange={handleFiltersChange}
                    />

                    <ExpenseTable />
                </div>
            </div>
        </div>
    )
} 