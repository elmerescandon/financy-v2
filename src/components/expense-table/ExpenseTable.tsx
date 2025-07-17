'use client'

import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useExpenseContext } from '@/lib/context/ExpenseContext'
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ExpensePagination } from "./ExpensePagination"
import ExpenseActions from "./ExpenseActions"
import { Button } from "../ui/button"


const ExpenseTableSkeleton = () => {
    return (
        <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableCell key={index} className="h-4 animate-pulse">
                            <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    )
}

interface ExpenseTableProps {
    onAddExpense?: () => void
}

export function ExpenseTable({ onAddExpense }: ExpenseTableProps) {
    const { expenses, pagination, setPage, setPageSize, deleteExpense, loading, error } = useExpenseContext()
    const handlePageChange = (page: number) => {
        setPage(page)
    }
    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize)
    }

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id)
            toast.success('Gasto eliminado exitosamente')
        } catch (err) {
            toast.error('Error al eliminar el gasto')
            console.error('Error deleting expense:', err)
        }
    }



    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    {loading && <ExpenseTableSkeleton />}
                    {!loading && expenses.length > 0 && <TableBody>
                        {expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>
                                    {format(new Date(expense.date), 'dd/MM/yyyy')}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{expense.description}</div>
                                        {expense.merchant && (
                                            <div className="text-sm text-muted-foreground">
                                                {expense.merchant}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {expense.category && (
                                        <Badge variant="secondary" className="gap-1">
                                            <span>{expense.category.icon}</span>
                                            {expense.category.name}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(expense.amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ExpenseActions expense={expense} onDelete={handleDeleteExpense} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    }
                    {!loading && expenses.length === 0 &&
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <div className="flex flex-col items-center justify-center w-full my-10">
                                        <p className="text-muted-foreground mb-4">
                                            {expenses.length === 0
                                                ? 'No tienes gastos registrados aún.'
                                                : 'No se encontraron gastos con los filtros aplicados.'
                                            }
                                        </p>
                                        <Button
                                            onClick={onAddExpense}
                                            variant="outline"
                                            className="w-full sm:w-auto cursor-pointer"
                                        >
                                            Agregar tu primer gasto
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>}
                </Table>
            </div>

            <ExpensePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div >
    )
} 