'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Target as TargetIcon } from 'lucide-react'
import { toast } from 'sonner'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalForm } from '@/components/goals/GoalForm'
import { GoalSummary } from '@/components/goals/GoalSummary'
import { useGoalContext } from '@/lib/context/GoalContext'
import type { GoalInsight, CreateGoalData } from '@/types/goal'

export default function MetasPage() {
    const {
        goals,
        loading,
        error,
        stats,
        createGoal,
        updateGoal,
        deleteGoal,
        addGoalEntry
    } = useGoalContext()

    const [editingGoal, setEditingGoal] = useState<GoalInsight | null>(null)
    const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)

    const handleCreateGoal = async (data: CreateGoalData) => {
        try {
            await createGoal(data)
            toast.success('Meta creada exitosamente')
            setShowForm(false)
        } catch (error) {
            console.error('Error creating goal:', error)
            toast.error(error instanceof Error ? error.message : 'Error al crear meta')
        }
    }

    const handleEditGoal = async (data: CreateGoalData) => {
        if (!editingGoal) return

        try {
            await updateGoal(editingGoal.id, data)
            toast.success('Meta actualizada exitosamente')
            setEditingGoal(null)
            setShowForm(false)
        } catch (error) {
            console.error('Error updating goal:', error)
            toast.error(error instanceof Error ? error.message : 'Error al actualizar meta')
        }
    }

    const handleDeleteGoal = async (id: string) => {
        try {
            await deleteGoal(id)
            toast.success('Meta eliminada exitosamente')
            setDeletingGoalId(null)
        } catch (error) {
            console.error('Error deleting goal:', error)
            toast.error(error instanceof Error ? error.message : 'Error al eliminar meta')
        }
    }

    const handleAddEntry = async (goalId: string, amount: number, description?: string) => {
        try {
            await addGoalEntry({ goal_id: goalId, amount, description })
        } catch (error) {
            console.error('Error adding goal entry:', error)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando metas...</p>
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-warm-gray-900">Metas</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus metas de ahorro y controla tu progreso
                    </p>
                </div>
                <Sheet open={showForm} onOpenChange={setShowForm}>
                    <SheetTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Meta
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full max-w-lg sm:max-w-lg overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <GoalForm
                                initialData={editingGoal}
                                onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
                                onCancel={() => {
                                    setShowForm(false)
                                    setEditingGoal(null)
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Summary */}
            {stats && <GoalSummary stats={stats} />}

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <Card className="p-8">
                    <div className="text-center">
                        <TargetIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No hay metas</h3>
                        <p className="text-muted-foreground mb-4">
                            Crea tu primera meta de ahorro para comenzar a alcanzar tus objetivos financieros
                        </p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Crear Meta
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onEdit={(goal: GoalInsight) => {
                                setEditingGoal(goal)
                                setShowForm(true)
                            }}
                            onDelete={(id: string) => setDeletingGoalId(id)}
                            onAddEntry={handleAddEntry}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deletingGoalId}
                onOpenChange={() => setDeletingGoalId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar meta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La meta y todas sus entradas serán eliminadas permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingGoalId && handleDeleteGoal(deletingGoalId)}
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