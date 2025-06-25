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
        <div className="min-h-screen bg-background">
            <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
                {/* Header - Mobile optimized */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/gastos')}
                            className="h-10 w-10 p-0 rounded-full shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">
                            Análisis por Categorías
                        </h1>
                    </div>
                </div>

                {/* Content with improved mobile spacing */}
                <div className="space-y-6">
                    <div className="bg-background rounded-xl overflow-hidden">
                        <ExpenseFilters
                            categories={categories}
                            filters={uiFilters}
                            onFiltersChange={handleFiltersChange}
                        />
                    </div>

                    <div className="bg-background rounded-xl overflow-hidden">
                        <CategoryOverview />
                    </div>
                </div>
            </div>
        </div>
    )
} 