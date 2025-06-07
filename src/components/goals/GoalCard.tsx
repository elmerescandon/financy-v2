'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, Minus, Edit, Trash2, Calendar, Target as TargetIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { GoalInsight } from '@/types/goal'
import { toast } from 'sonner'

interface GoalCardProps {
    goal: GoalInsight
    onEdit: (goal: GoalInsight) => void
    onDelete: (id: string) => void
    onAddEntry: (goalId: string, amount: number, description?: string) => Promise<void>
}

export function GoalCard({ goal, onEdit, onDelete, onAddEntry }: GoalCardProps) {
    const [showAddMoney, setShowAddMoney] = useState(false)
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAddEntry = async (isPositive: boolean) => {
        if (!amount || isNaN(Number(amount))) {
            toast.error('Ingresa un monto válido')
            return
        }

        setLoading(true)
        try {
            const entryAmount = isPositive ? Number(amount) : -Number(amount)
            await onAddEntry(goal.id, entryAmount, description || undefined)
            setAmount('')
            setDescription('')
            setShowAddMoney(false)
            toast.success(isPositive ? 'Dinero agregado a la meta' : 'Dinero retirado de la meta')
        } catch (error) {
            console.error('Error adding entry:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = () => {
        switch (goal.progress.status) {
            case 'achieved': return 'bg-green-500'
            case 'in_progress': return goal.progress.on_track ? 'bg-blue-500' : 'bg-yellow-500'
            case 'overdue': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusText = () => {
        switch (goal.progress.status) {
            case 'achieved': return 'Completada'
            case 'in_progress': return goal.progress.on_track ? 'En progreso' : 'Retrasada'
            case 'overdue': return 'Vencida'
            default: return 'Sin iniciar'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate flex-1">
                        {goal.name}
                    </CardTitle>
                    <div className="flex gap-1 ml-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(goal)}
                            className="h-8 w-8 p-0"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(goal.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor()}>
                        {getStatusText()}
                    </Badge>
                    {goal.progress.days_remaining !== null && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            {goal.progress.days_remaining > 0
                                ? `${goal.progress.days_remaining} días restantes`
                                : 'Vencida'
                            }
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span className="font-medium">{goal.progress.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={goal.progress.percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatCurrency(goal.current_amount)}</span>
                        <span>{formatCurrency(goal.target_amount)}</span>
                    </div>
                </div>

                {/* Targets */}
                {goal.progress.daily_target && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                        <div className="flex items-center text-sm font-medium">
                            <TargetIcon className="h-4 w-4 mr-1" />
                            Objetivos
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Diario: {formatCurrency(goal.progress.daily_target)}
                        </div>
                        {goal.progress.monthly_target && (
                            <div className="text-sm text-muted-foreground">
                                Mensual: {formatCurrency(goal.progress.monthly_target)}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Sheet open={showAddMoney} onOpenChange={setShowAddMoney}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Agregar/Retirar Dinero</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="amount">Monto</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Descripción (opcional)</Label>
                                    <Input
                                        id="description"
                                        placeholder="Ej: Ahorros mensuales"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAddEntry(true)}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Agregar
                                    </Button>
                                    <Button
                                        onClick={() => handleAddEntry(false)}
                                        disabled={loading}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Minus className="h-4 w-4 mr-1" />
                                        Retirar
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Target Date */}
                <div className="text-sm text-muted-foreground text-center">
                    Meta: {formatDate(goal.target_date)}
                </div>
            </CardContent>
        </Card>
    )
} 