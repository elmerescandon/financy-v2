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
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Cargando gasto...</div>
                </div>
            </div>
        )
    }

    if (!expense) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="pt-6 text-center">
                        <p className="text-destructive">No se encontró el gasto</p>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="mt-4"
                        >
                            Volver a gastos
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="hover:bg-sage-100"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-3xl font-bold text-warm-gray-900">Editar Gasto</h1>
            </div>

            {/* Form */}
            <Card>
                <CardContent className="pt-6">
                    <ExpenseForm
                        categories={categories}
                        initialData={expense}
                        onSubmit={handleUpdateExpense}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    )
} 