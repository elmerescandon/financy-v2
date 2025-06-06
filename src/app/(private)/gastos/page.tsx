'use client'

import { useState } from 'react'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import type { ExpenseWithDetails } from '@/types/expense'
import { ExpenseItem } from '@/components/expenses/ExpenseItem'

export default function ExpensesPage() {
    const { expenses, loading, error, createExpense, updateExpense, deleteExpense } = useExpenseContext()
    const { categories } = useCategories()
    const [showForm, setShowForm] = useState(false)
    const [editingExpense, setEditingExpense] = useState<ExpenseWithDetails | null>(null)

    const handleCreateExpense = async (data: any) => {
        try {
            await createExpense(data)
            setShowForm(false)
        } catch (err) {
            console.error('Error creating expense:', err)
        }
    }

    const handleUpdateExpense = async (data: any) => {
        if (!editingExpense) return

        try {
            await updateExpense(editingExpense.id, data)
            setEditingExpense(null)
        } catch (err) {
            console.error('Error updating expense:', err)
        }
    }

    const handleDeleteExpense = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto?')) return

        try {
            await deleteExpense(id)
        } catch (err) {
            console.error('Error deleting expense:', err)
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Cargando gastos...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-warm-gray-900">Gastos</h1>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-sage-600 hover:bg-sage-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Gasto
                </Button>
            </div>

            {/* Expense Form Modal */}
            {(showForm || editingExpense) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ExpenseForm
                            categories={categories}
                            initialData={editingExpense}
                            onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
                            onCancel={() => {
                                setShowForm(false)
                                setEditingExpense(null)
                            }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Expenses List */}
            <div className="space-y-4">
                {expenses.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-muted-foreground">No tienes gastos registrados aún.</p>
                            <Button
                                onClick={() => setShowForm(true)}
                                variant="outline"
                                className="mt-4"
                            >
                                Agregar tu primer gasto
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    expenses.map((expense) => (
                        <ExpenseItem
                            key={expense.id}
                            expense={expense}
                            onEdit={() => setEditingExpense(expense)}
                            onDelete={handleDeleteExpense}
                        />
                    ))
                )}
            </div>
        </div>
    )
} 