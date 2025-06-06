'use client'
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowUpDown,
    ChevronDown,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    EllipsisVertical,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ExpenseWithDetails } from '@/types/expense'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'

interface ExpenseTableProps {
    expenses: ExpenseWithDetails[]
    onDelete: (id: string) => void
}

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

    const columns: ColumnDef<ExpenseWithDetails>[] = [
        {
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="h-8 px-2"
                    >
                        Fecha
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new TZDate(row.getValue('date'), 'America/Lima')
                console.log(date)
                return (
                    <span className="text-sm">
                        {format(date.toLocaleString(undefined, { timeZone: 'America/Lima' }), "PPpp")}
                    </span>
                )
            },
            size: 120,
        },

        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="h-8 px-2"
                    >
                        Cantidad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('amount'))
                return (
                    <div className="text-left ml-4 font-medium">
                        {formatCurrency(amount)}
                    </div>
                )
            },
            // size: 100,
        },
        {
            accessorKey: 'category',
            header: 'Categoría',
            cell: ({ row }) => {
                const expense = row.original
                if (!expense.category) return <span className="text-muted-foreground">-</span>

                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: expense.category.color }}
                        />
                        <div>
                            <div className="flex items-center gap-1">
                                <span>{expense.category.icon}</span>
                                <span className="text-sm">{expense.category.name}</span>
                            </div>
                            {expense.subcategory && (
                                <div className="text-xs text-muted-foreground">
                                    {expense.subcategory.name}
                                </div>
                            )}
                        </div>
                    </div>
                )
            },
            size: 150,
        },
        {
            accessorKey: 'payment_method',
            header: 'Método de Pago',
            cell: ({ row }) => {
                const paymentMethods = {
                    cash: 'Efectivo',
                    debit_card: 'T. Débito',
                    credit_card: 'T. Crédito',
                    bank_transfer: 'Transferencia',
                    other: 'Otro'
                }

                const method = row.getValue('payment_method') as keyof typeof paymentMethods
                return (
                    <Badge variant="outline" className="text-xs">
                        {paymentMethods[method] || method}
                    </Badge>
                )
            },
            size: 120,
        },
        {
            accessorKey: 'description',
            header: 'Descripción',
            cell: ({ row }) => {
                const expense = row.original
                return (
                    <div>
                        <div className="font-medium">{row.getValue('description')}</div>
                        {expense.merchant && (
                            <div className="text-xs text-muted-foreground">
                                📍 {expense.merchant}
                            </div>
                        )}
                        {expense.tags && expense.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                                {expense.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                        #{tag}
                                    </Badge>
                                ))}
                                {expense.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{expense.tags.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                )
            },
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const expense = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                            >
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <DropdownMenuItem className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(expense.id)}>
                                    <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/gastos/editar/${expense.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >

                )
            },
            size: 80,
        },

    ]

    const table = useReactTable({
        data: expenses,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    return (
        <div className="space-y-4">
            {/* Column Visibility */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {expenses.length} gastos encontrados
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Columnas
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                const columnLabels: Record<string, string> = {
                                    date: 'Fecha',
                                    description: 'Descripción',
                                    amount: 'Cantidad',
                                    category: 'Categoría',
                                    payment_method: 'Método Pago',
                                    actions: 'Acciones'
                                }

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {columnLabels[column.id] || column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron gastos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 