'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ExpenseForm } from './ExpenseForm'
import { useCategories } from '@/hooks/useCategories'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { toast } from 'sonner'

export interface AddExpenseSheetRef {
    open: () => void
}

interface AddExpenseSheetProps {
    showTrigger?: boolean
}

export const AddExpenseSheet = forwardRef<AddExpenseSheetRef, AddExpenseSheetProps>(
    ({ showTrigger = true }, ref) => {
        const [open, setOpen] = useState(false)
        const { categories } = useCategories()
        const { createExpense } = useExpenseContext()

        useImperativeHandle(ref, () => ({
            open: () => setOpen(true)
        }))

        const handleCreateExpense = async (data: any) => {
            try {
                await createExpense(data)
                toast.success('Gasto creado exitosamente')
                setOpen(false)
            } catch (err) {
                toast.error('Error al crear el gasto')
                console.error('Error creating expense:', err)
            }
        }

        const handleCancel = () => {
            setOpen(false)
        }

        return (
            <Sheet open={open} onOpenChange={setOpen}>
                {showTrigger && (
                    <SheetTrigger asChild>
                        <Button
                            className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                            size="lg"
                        >
                            <Plus className="w-5 h-5 mr-3" />
                            Agregar Gasto
                        </Button>
                    </SheetTrigger>
                )}
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Agregar Gasto</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                        <ExpenseForm
                            categories={categories}
                            onSubmit={handleCreateExpense}
                            onCancel={handleCancel}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        )
    }
)

AddExpenseSheet.displayName = 'AddExpenseSheet' 