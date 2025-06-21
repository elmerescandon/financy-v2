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
        <div className="p-6 space-y-6 lg:mx-auto lg:w-fit">
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="hover:bg-sage-100"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-3xl font-bold text-warm-gray-900 pt-6 text-left lg:text-center">Agregar Gasto</h1>
            </div>


            <Card className="w-fit mr-auto lg:ml-auto ">
                <CardContent className="pt-4">
                    <ExpenseForm
                        categories={categories}
                        onSubmit={handleCreateExpense}
                        onCancel={handleCancel}
                    />
                </CardContent>
            </Card>
        </div>
    )
} 