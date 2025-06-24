'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, Sparkles, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import BudgetCard from '../../../components/budgets/BudgetCard'
import BudgetForm from '@/components/budgets/BudgetForm'
import SmartBudgetWizard from '@/components/budget/SmartBudgetWizard'
import { useBudgetContext } from '@/lib/context/BudgetContext'
import { IncomeService } from '@/lib/supabase/incomes'
import { GoalService } from '@/lib/supabase/goals'
import type { BudgetInsight, CreateBudgetData } from '@/types/budget'
import { useIncomeContext } from '@/lib/context/IncomeContext'

export default function PresupuestoPage() {
    const {
        budgets,
        categories,
        loading,
        error,
        stats,
        createBudget,
        updateBudget,
        deleteBudget,
        refreshBudgets
    } = useBudgetContext()

    const [editingBudget, setEditingBudget] = useState<BudgetInsight | null>(null)
    const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [showWizard, setShowWizard] = useState(false)
    const [unbudgetedIncome, setUnbudgetedIncome] = useState<number>(0)
    const { incomes, getIncomeStats } = useIncomeContext()
    const handleCreateBudget = async (data: CreateBudgetData) => {
        try {
            await createBudget(data)
            toast.success('Presupuesto creado exitosamente')
            setShowForm(false)
        } catch (error) {
            console.error('Error creating budget:', error)
            toast.error(error instanceof Error ? error.message : 'Error al crear presupuesto')
        }
    }

    const handleEditBudget = async (data: CreateBudgetData) => {
        if (!editingBudget) return

        try {
            const updateData = { ...data, id: editingBudget.id }
            await updateBudget(editingBudget.id, updateData)
            toast.success('Presupuesto actualizado exitosamente')
            setEditingBudget(null)
            setShowForm(false)
        } catch (error) {
            console.error('Error updating budget:', error)
            toast.error(error instanceof Error ? error.message : 'Error al actualizar presupuesto')
        }
    }

    const handleDeleteBudget = async (id: string) => {
        try {
            await deleteBudget(id)
            toast.success('Presupuesto eliminado exitosamente')
            setDeletingBudgetId(null)
        } catch (error) {
            console.error('Error deleting budget:', error)
            toast.error(error instanceof Error ? error.message : 'Error al eliminar presupuesto')
        }
    }

    // Calculate summary stats from context stats or compute from budgets
    const totalBudget = stats?.total_budget || budgets.reduce((sum, budget) => sum + budget.budget_amount, 0)
    const totalSpent = stats?.total_spent || budgets.reduce((sum, budget) => sum + budget.spent_amount, 0)
    const totalRemaining = stats?.total_remaining || (totalBudget - totalSpent)
    const overBudgetCount = stats?.over_budget_count || budgets.filter(b => b.spent_amount > b.budget_amount).length

    // Calculate unbudgeted income (total income - goal savings - total budget allocation)
    useEffect(() => {
        const calculateUnbudgetedIncome = async () => {
            try {
                const currentDate = new Date()
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                const startDate = startOfMonth.toISOString().split('T')[0]
                const endDate = endOfMonth.toISOString().split('T')[0]

                // Get current month income
                const incomeStats = await getIncomeStats()

                // Get current month goal savings
                const goals = await GoalService.getGoals()
                const goalSavings = goals.reduce((sum, goal) => {
                    return sum + goal.recent_entries
                        .filter(entry => entry.date >= startDate && entry.date <= endDate)
                        .reduce((entrySum, entry) => entrySum + entry.amount, 0)
                }, 0)

                // Unbudgeted income = total income - goal savings - total budget
                const unbudgeted = incomeStats.total_amount - goalSavings - totalBudget
                setUnbudgetedIncome(Math.max(0, unbudgeted))
            } catch (error) {
                console.error('Error calculating unbudgeted income:', error)
                setUnbudgetedIncome(0)
            }
        }

        calculateUnbudgetedIncome()
    }, [totalBudget])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando presupuestos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Presupuestos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus presupuestos y controla tus gastos
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Smart Budget Wizard */}
                    <Sheet open={showWizard} onOpenChange={setShowWizard}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100">
                                <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                                Asistente Inteligente
                            </Button>
                        </SheetTrigger>

                        <SheetContent className="w-full max-w-6xl sm:max-w-6xl overflow-y-auto p-0">
                            <SheetTitle className='hidden'>Asistente Inteligente</SheetTitle>
                            <div className="p-6">
                                <SmartBudgetWizard
                                    onComplete={() => {
                                        setShowWizard(false)
                                        refreshBudgets() // Refresh to show new budgets
                                        toast.success('¡Presupuestos inteligentes creados exitosamente!')
                                    }}
                                    onCancel={() => setShowWizard(false)}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Regular Budget Form */}
                    <Sheet open={showForm} onOpenChange={setShowForm}>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Presupuesto
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full max-w-4xl sm:max-w-4xl overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Nuevo Presupuesto</SheetTitle>
                            </SheetHeader>
                            <BudgetForm
                                categories={categories}
                                initialData={editingBudget}
                                onSubmit={editingBudget ? handleEditBudget : handleCreateBudget}
                                onCancel={() => {
                                    setShowForm(false)
                                    setEditingBudget(null)
                                }}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                        <p className="text-xs text-muted-foreground">
                            {budgets.length} presupuestos activos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% del presupuesto
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Presupuesto Disponible</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(totalRemaining))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {totalRemaining < 0 ? 'Excedido' : 'Disponible'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos No Presupuestados</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(unbudgetedIncome)}</div>
                        <p className="text-xs text-muted-foreground">
                            Sin asignar a presupuesto
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget Grid */}
            {budgets.length === 0 ? (
                <Card className="p-8">
                    <div className="text-center">
                        <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay presupuestos</h3>
                        <p className="text-muted-foreground mb-4">
                            Crea tu primer presupuesto para comenzar a controlar tus gastos
                        </p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Presupuesto
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onEdit={(budget: BudgetInsight) => {
                                setEditingBudget(budget)
                                setShowForm(true)
                            }}
                            onDelete={(id: string) => setDeletingBudgetId(id)}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deletingBudgetId}
                onOpenChange={() => setDeletingBudgetId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El presupuesto será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingBudgetId && handleDeleteBudget(deletingBudgetId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 