'use client'

import { useRouter } from 'next/navigation'
import { IncomeForm } from '@/components/incomes/IncomeForm'
import { useCategories } from '@/hooks/useCategories'
import { useIncomeContext } from '@/lib/context/IncomeContext'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewIncomePage() {
    const router = useRouter()
    const { categories } = useCategories()
    const { createIncome } = useIncomeContext()

    const handleCreateIncome = async (data: any) => {
        try {
            await createIncome(data)
            toast.success('Ingreso creado exitosamente')
            router.push('/ingresos')
        } catch (error) {
            console.error('Error creating income:', error)
            toast.error('Error al crear ingreso')
        }
    }

    const handleCancel = () => {
        router.push('/ingresos')
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => router.push('/ingresos')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Ingresos
                </Button>

                <h1 className="text-3xl font-bold mb-2">Nuevo Ingreso</h1>
                <p className="text-muted-foreground">
                    Agrega un nuevo ingreso a tu registro financiero
                </p>
            </div>

            <IncomeForm
                categories={categories}
                initialData={null}
                onSubmit={handleCreateIncome}
                onCancel={handleCancel}
            />
        </div>
    )
} 