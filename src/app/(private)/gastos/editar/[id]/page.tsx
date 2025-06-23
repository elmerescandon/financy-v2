'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { toast } from 'sonner'

export default function EditExpensePage() {
    const router = useRouter()
    const params = useParams()
    const expenseId = params.id as string

    const { categories } = useCategories()
    const { expenses, updateExpense, loading } = useExpenseContext()

    const expense = expenses.find(e => e.id === expenseId)

    const handleUpdateExpense = async (data: any) => {
        try {
            await updateExpense(expenseId, data)
            toast.success('Gasto actualizado exitosamente')
            router.push('/gastos')
        } catch (err) {
            toast.error('Error al actualizar el gasto')
            console.error('Error updating expense:', err)
        }
    }

    const handleCancel = () => {
        router.push('/gastos')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg">Cargando gasto...</div>
                </div>
            </div>
        )
    }

    if (!expense) {
        return (
            <div className="min-h-screen bg-gray-50/30">
                <div className="px-4 py-6 max-w-2xl mx-auto">
                    <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="p-6 text-center">
                            <p className="text-red-600 font-medium mb-4">No se encontró el gasto</p>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="h-12 px-6"
                                size="lg"
                            >
                                Volver a gastos
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
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
                            Editar Gasto
                        </h1>
                    </div>
                </div>

                {/* Form Card - Mobile optimized */}
                <Card className="shadow-sm border border-gray-100">
                    <CardContent className="p-6">
                        <ExpenseForm
                            categories={categories}
                            initialData={expense}
                            onSubmit={handleUpdateExpense}
                            onCancel={handleCancel}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 