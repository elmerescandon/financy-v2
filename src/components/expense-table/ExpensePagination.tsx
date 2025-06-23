import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"

interface PaginationResult {
    page: number
    limit: number
    total: number
    total_pages: number
}


export function ExpensePagination({
    pagination,
    onPageChange,
    onPageSizeChange
}: {
    pagination: PaginationResult | null
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
}) {
    if (!pagination) return null

    const { page, limit, total, total_pages } = pagination
    const startItem = (page - 1) * limit + 1
    const endItem = Math.min(page * limit, total)

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= total_pages && onPageChange) {
            onPageChange(newPage)
        }
    }

    const handlePageSizeChange = (newPageSize: string) => {
        if (onPageSizeChange) {
            onPageSizeChange(parseInt(newPageSize))
        }
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                    Mostrando {startItem} a {endItem} de {total} resultados
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Por página:</span>
                    <Select value={limit.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={page <= 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                            let pageNum: number
                            if (total_pages <= 5) {
                                pageNum = i + 1
                            } else if (page <= 3) {
                                pageNum = i + 1
                            } else if (page >= total_pages - 2) {
                                pageNum = total_pages - 4 + i
                            } else {
                                pageNum = page - 2 + i
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className="w-8 h-8"
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= total_pages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(total_pages)}
                        disabled={page >= total_pages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}