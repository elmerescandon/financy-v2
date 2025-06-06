import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Edit, Trash2 } from 'lucide-react'
import type { ExpenseWithDetails } from '@/types/expense'
import { Button } from '../ui/button'

interface ExpenseItemProps {
    expense: ExpenseWithDetails
    onEdit: (expense: ExpenseWithDetails) => void
    onDelete: (id: string) => void
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {

    return (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            {expense.category && (
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: expense.category.color }}
                                />
                            )}
                            <h3 className="font-semibold text-warm-gray-900">
                                {expense.description}
                            </h3>
                            <span className="text-lg font-bold text-warm-gray-900">
                                {formatCurrency(expense.amount)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>
                                {new Date(expense.date).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })}
                                {' '}
                                {new Date(expense.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {expense.category && (
                                <span className="flex items-center gap-1">
                                    <span>{expense.category.icon}</span>
                                    {expense.category.name}
                                </span>
                            )}
                            {expense.subcategory && (
                                <span>• {expense.subcategory.name}</span>
                            )}
                            <span>• {expense.payment_method}</span>
                        </div>

                        {expense.merchant && (
                            <p className="text-sm text-muted-foreground mb-2">
                                📍 {expense.merchant}
                            </p>
                        )}

                        {expense.tags && expense.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                                {expense.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-sage-100 text-sage-700 text-xs rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 ml-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(expense)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(expense.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
