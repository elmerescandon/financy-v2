'use client'

import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import { CategoryOverview } from '@/components/category-overview'
import {
    ExpenseFilters,
    type ExpenseFilters as UIExpenseFilters
} from '@/components/expense-table'
import { convertToDatabaseFilters } from '@/components/expense-table/ExpenseFilters'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
    const {
        updateFilters,
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
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/gastos')}
                        className="w-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray-900">
                        Análisis por Categorías
                    </h1>
                </div>
            </div>

            <ExpenseFilters
                categories={categories}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
            />

            <CategoryOverview />
        </div>
    )
} 