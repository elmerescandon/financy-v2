'use client'

import { useRouter } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { toast } from 'sonner'

export default function AddExpensePage() {
    const router = useRouter()
    const { categories } = useCategories()
    const { createExpense } = useExpenseContext()

    const handleCreateExpense = async (data: any) => {
        try {
            await createExpense(data)
            toast.success('Gasto creado exitosamente')
            router.push('/gastos')
        } catch (err) {
            toast.error('Error al crear el gasto')
            console.error('Error creating expense:', err)
        }
    }

    const handleCancel = () => {
        router.push('/gastos')
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="px-4 py-6 max-w-2xl mx-auto">
                {/* Header - Mobile optimized */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            Agregar Gasto
                        </h1>
                    </div>
                </div>

                {/* Form Card - Mobile optimized */}
                <Card className="shadow-sm border border-gray-100">
                    <CardContent className="p-6">
                        <ExpenseForm
                            categories={categories}
                            onSubmit={handleCreateExpense}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 