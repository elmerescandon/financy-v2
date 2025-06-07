'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Trash2, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { BudgetInsight } from '@/types/budget'

interface BudgetCardProps {
    budget: BudgetInsight
    onEdit: (budget: BudgetInsight) => void
    onDelete: (id: string) => void
}

export default function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
    const isOverBudget = budget.spent_amount > budget.budget_amount
    const isNearLimit = budget.spent_percentage >= 80 && !isOverBudget

    const getProgressColor = () => {
        if (isOverBudget) return 'bg-destructive'
        if (isNearLimit) return 'bg-yellow-500'
        return 'bg-primary'
    }

    const getStatusBadge = () => {
        if (isOverBudget) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Excedido
                </Badge>
            )
        }
        if (isNearLimit) {
            return (
                <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3" />
                    Cerca del límite
                </Badge>
            )
        }
        return <Badge variant="outline">En progreso</Badge>
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{ backgroundColor: budget.category_color }}
                        >
                            {budget.category_icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{budget.category_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {new Date(budget.period_start).toLocaleDateString('es-ES', {
                                    month: 'short',
                                    year: 'numeric'
                                })} - {new Date(budget.period_end).toLocaleDateString('es-ES', {
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge()}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(budget)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(budget.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Gastado</span>
                        <span className="font-medium">
                            {formatCurrency(budget.spent_amount)} / {formatCurrency(budget.budget_amount)}
                        </span>
                    </div>
                    <div className="relative">
                        <Progress
                            value={Math.min(budget.spent_percentage, 100)}
                            className="h-2"
                        />
                        <div
                            className={`absolute top-0 h-2 rounded-full transition-all ${getProgressColor()}`}
                            style={{ width: `${Math.min(budget.spent_percentage, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{budget.spent_percentage.toFixed(1)}% gastado</span>
                        <span>
                            {budget.remaining_amount >= 0
                                ? `${formatCurrency(budget.remaining_amount)} restante`
                                : `${formatCurrency(Math.abs(budget.remaining_amount))} excedido`
                            }
                        </span>
                    </div>
                </div>

                {budget.allocation_percentage && (
                    <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Asignación de ingresos</span>
                            <span>{budget.allocation_percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 