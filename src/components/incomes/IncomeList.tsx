'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Calendar, DollarSign, Building, Tag } from 'lucide-react'
import type { IncomeWithDetails, IncomeSource } from '@/types/income'
import { formatAmount, formatDate } from '@/lib/utils/formats'

interface IncomeListProps {
    incomes: IncomeWithDetails[]
    onEdit?: (income: IncomeWithDetails) => void
    onDelete?: (incomeId: string) => void
    loading?: boolean
}

const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
    salary: 'Salario',
    freelance: 'Freelance',
    investment: 'Inversiones',
    rental: 'Alquiler',
    business: 'Negocio',
    gift: 'Regalo',
    refund: 'Reembolso',
    other: 'Otro'
}

const SOURCE_COLORS: Record<IncomeSource, string> = {
    salary: 'bg-blue-100 text-blue-800',
    freelance: 'bg-green-100 text-green-800',
    investment: 'bg-purple-100 text-purple-800',
    rental: 'bg-yellow-100 text-yellow-800',
    business: 'bg-orange-100 text-orange-800',
    gift: 'bg-pink-100 text-pink-800',
    refund: 'bg-gray-100 text-gray-800',
    other: 'bg-slate-100 text-slate-800'
}

export function IncomeList({ incomes, onEdit, onDelete, loading }: IncomeListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (incomeId: string) => {
        if (!onDelete) return

        setDeletingId(incomeId)
        try {
            await onDelete(incomeId)
        } finally {
            setDeletingId(null)
        }
    }



    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (incomes.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay ingresos registrados
                    </h3>
                    <p className="text-gray-500">
                        Comienza agregando tu primer ingreso
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {incomes.map((income) => (
                <Card key={income.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">
                                        {income.description}
                                    </h3>
                                    {income.is_recurring && (
                                        <Badge variant="outline" className="text-xs">
                                            Recurrente
                                        </Badge>
                                    )}
                                    {income.needs_review && (
                                        <Badge variant="destructive" className="text-xs">
                                            Revisar
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-green-600">
                                            {formatAmount(income.amount, income.currency)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(income.date)}</span>
                                    </div>

                                    {income.employer_client && (
                                        <div className="flex items-center gap-1">
                                            <Building className="h-4 w-4" />
                                            <span>{income.employer_client}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <Badge
                                        variant="secondary"
                                        className={`text-xs ${SOURCE_COLORS[income.source]}`}
                                    >
                                        {INCOME_SOURCE_LABELS[income.source]}
                                    </Badge>

                                    {income.category && (
                                        <Badge variant="outline" className="text-xs">
                                            <span className="mr-1">{income.category.icon}</span>
                                            {income.category.name}
                                        </Badge>
                                    )}

                                    {income.is_taxable && (
                                        <Badge variant="outline" className="text-xs">
                                            Gravable
                                        </Badge>
                                    )}
                                </div>

                                {income.tags && income.tags.length > 0 && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Tag className="h-3 w-3 text-gray-400" />
                                        <div className="flex flex-wrap gap-1">
                                            {income.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {income.notes && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        {income.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                {onEdit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(income)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}

                                {onDelete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(income.id)}
                                        disabled={deletingId === income.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 