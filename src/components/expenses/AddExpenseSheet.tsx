'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
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
                            size="default"
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Gasto
                        </Button>
                    </SheetTrigger>
                )}
                <SheetContent
                    side="right"
                    className="w-full max-w-4xl sm:max-w-4xl overflow-y-auto p-0"
                >
                    <SheetHeader className="px-6 py-6 border-b bg-muted/30">
                        <SheetTitle className="text-left text-2xl font-bold text-foreground">
                            Agregar Nuevo Gasto
                        </SheetTitle>
                        <SheetDescription className="text-left text-muted-foreground">
                            Registra un nuevo gasto y organiza tus finanzas
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 p-6">
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