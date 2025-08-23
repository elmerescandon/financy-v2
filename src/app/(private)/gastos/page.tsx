'use client'

import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import {
    ExpenseTable,
    type ExpenseFilters as UIExpenseFilters
} from '@/components/expense-table'
import { convertToDatabaseFilters, ExpenseFilters } from '@/components/expense-table/ExpenseFilters'
import { ExpenseSummary } from '@/components/expenses/ExpenseSummary'
import { AddExpenseSheet, AddExpenseSheetRef } from '@/components/expenses/AddExpenseSheet'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ExpensesPageContent() {
    const {
        updateFilters,
    } = useExpenseContext()
    const { categories } = useCategories()
    const addExpenseSheetRef = useRef<AddExpenseSheetRef>(null)
    const searchParams = useSearchParams()

      // Get a specific query parameter, e.g. ?id=123
    const expense = searchParams.get('expense');

    const [uiFilters, setUiFilters] = useState<UIExpenseFilters>({
        dateRange: 'this_month'
    })


    const handleFiltersChange = async (filters: UIExpenseFilters) => {
        setUiFilters(filters)
        const dbFilters = convertToDatabaseFilters(filters)
        await updateFilters(dbFilters)
    }

    const handleOpenAddExpense = () => {
        addExpenseSheetRef.current?.open()
    }

    useEffect(() => {
        if (expense && expense === 'true'){
            addExpenseSheetRef.current?.open()
        }
    },[])


    return (
        <div className="min-h-screen bg-background">
            <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto max-md:pt-0">
                {/* Header - Mobile optimized */}
                <div className="flex flex-col gap-4">
                    <AddExpenseSheet ref={addExpenseSheetRef} />
                </div>

                {/* Content with improved mobile spacing */}
                <div className="space-y-6">
                    <ExpenseSummary />
                     {/* <ExpenseFilters
                        categories={categories}
                         filters={uiFilters}
                         onFiltersChange={handleFiltersChange}
                     />  */}

                    <ExpenseTable onAddExpense={handleOpenAddExpense} />
                </div>
            </div>
        </div>
    )
}

export default function ExpensesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <ExpensesPageContent />
        </Suspense>
    )
} 