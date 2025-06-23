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

    // Generate page numbers with responsive logic
    const getPageNumbers = () => {
        const pages = []

        if (total_pages <= 5) {
            for (let i = 1; i <= total_pages; i++) {
                pages.push(i)
            }
        } else if (page <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
        } else if (page >= total_pages - 2) {
            for (let i = total_pages - 4; i <= total_pages; i++) {
                pages.push(i)
            }
        } else {
            for (let i = page - 2; i <= page + 2; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Results info */}
            <div className="flex items-center justify-center sm:justify-start">
                <span className="text-sm text-muted-foreground text-center sm:text-left">
                    Mostrando {startItem} a {endItem} de {total} resultados
                </span>
            </div>

            {/* Pagination controls */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Por página:</span>
                    <span className="text-sm text-muted-foreground sm:hidden">Página:</span>
                    <Select value={limit.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-16 sm:w-20">
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

                {/* Navigation buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={page <= 1}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                        <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>

                    {/* Page numbers - responsive */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map(pageNum => (
                            <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="h-8 w-8 p-0 text-xs sm:h-9 sm:w-9 sm:text-sm"
                            >
                                {pageNum}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= total_pages}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(total_pages)}
                        disabled={page >= total_pages}
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                        <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}