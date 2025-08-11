import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const mobileCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "hover:shadow-md active:scale-[0.98] active:shadow-sm",
        interactive: "hover:shadow-md hover:bg-accent/5 active:scale-[0.98] active:shadow-sm cursor-pointer touch-manipulation",
        flat: "shadow-none border-0 bg-transparent",
      },
      size: {
        default: "p-4",
        sm: "p-3",
        lg: "p-6",
        // Mobile-optimized sizes with better touch targets
        touch: "p-4 min-h-[60px]", // Ensures adequate touch target
        compact: "p-3 min-h-[48px]",
      },
      spacing: {
        none: "",
        tight: "mb-2",
        default: "mb-4",
        comfortable: "mb-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "default",
    },
  }
)

export interface MobileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof mobileCardVariants> {
  /**
   * Makes the card interactive with proper touch feedback
   * @default false
   */
  interactive?: boolean
  /**
   * Callback for card interaction (click/tap)
   */
  onInteract?: () => void
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing,
    interactive = false,
    onInteract,
    onClick,
    children,
    ...props 
  }, ref) => {
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e)
      onInteract?.()
    }, [onClick, onInteract])

    const finalVariant = interactive ? "interactive" : variant

    return (
      <div
        ref={ref}
        data-testid="mobile-card"
        className={cn(
          mobileCardVariants({ variant: finalVariant, size, spacing }),
          className
        )}
        onClick={interactive ? handleClick : onClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MobileCard.displayName = "MobileCard"

// Specialized card components
const MobileCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between space-y-1.5 mb-3", className)}
    {...props}
  />
))
MobileCardHeader.displayName = "MobileCardHeader"

const MobileCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight sm:text-lg",
      className
    )}
    {...props}
  />
))
MobileCardTitle.displayName = "MobileCardTitle"

const MobileCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
MobileCardDescription.displayName = "MobileCardDescription"

const MobileCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("space-y-2", className)} 
    {...props} 
  />
))
MobileCardContent.displayName = "MobileCardContent"

const MobileCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mt-3 pt-3 border-t border-border/50", className)}
    {...props}
  />
))
MobileCardFooter.displayName = "MobileCardFooter"

// Specialized expense card
interface ExpenseCardProps extends MobileCardProps {
  expense: {
    id: string
    description: string
    amount: number
    date: string
    merchant?: string
    category?: {
      name: string
      icon: string
    }
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  formatCurrency: (amount: number) => string
}

const ExpenseCard = React.forwardRef<HTMLDivElement, ExpenseCardProps>(
  ({ expense, onEdit, onDelete, formatCurrency, className, ...props }, ref) => {
    const [swipeOffset, setSwipeOffset] = React.useState(0)
    const [isDragging, setIsDragging] = React.useState(false)
    const startX = React.useRef(0)
    const cardRef = React.useRef<HTMLDivElement>(null)

    // Function to format date as relative or regular
    const formatDate = React.useCallback((dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Hoy'
      if (diffDays === 1) return 'Ayer'
      if (diffDays === 2) return 'Hace 2 días'
      if (diffDays === 3) return 'Hace 3 días'
      
      // For dates older than 3 days, use regular format
      return date.toLocaleDateString('es-ES')
    }, [])

    const handleEdit = React.useCallback(() => {
      onEdit?.(expense.id)
    }, [onEdit, expense.id])

    const handleDelete = React.useCallback(() => {
      onDelete?.(expense.id)
      // Reset swipe position after delete
      setSwipeOffset(0)
    }, [onDelete, expense.id])

    const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX
      setIsDragging(true)
    }, [])

    const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
      if (!isDragging) return
      
      const currentX = e.touches[0].clientX
      const deltaX = startX.current - currentX
      
      // Only allow swipe to the left (negative deltaX becomes positive) and limit the distance
      const newOffset = Math.max(0, Math.min(deltaX, 80))
      setSwipeOffset(newOffset)
    }, [isDragging])

    const handleTouchEnd = React.useCallback(() => {
      setIsDragging(false)
      
      // If swiped more than 50px, keep delete visible, otherwise snap back
      if (swipeOffset > 50) {
        setSwipeOffset(80) // Fixed position showing delete
      } else {
        setSwipeOffset(0)
      }
    }, [swipeOffset])

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
      startX.current = e.clientX
      setIsDragging(true)
    }, [])

    const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
      if (!isDragging) return
      
      const deltaX = startX.current - e.clientX
      const newOffset = Math.max(0, Math.min(deltaX, 80))
      setSwipeOffset(newOffset)
    }, [isDragging])

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false)
      
      if (swipeOffset > 50) {
        setSwipeOffset(80)
      } else {
        setSwipeOffset(0)
      }
    }, [swipeOffset])

    // Close swipe when clicking outside
    const handleClickOutside = React.useCallback(() => {
      if (swipeOffset > 0) {
        setSwipeOffset(0)
      }
    }, [swipeOffset])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove as any)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove as any)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <div className="relative overflow-hidden">
        {/* Delete button background */}
        <div 
          className="absolute right-0 top-0 h-full w-20  flex items-center justify-center text-white"
          style={{
            transform: `translateX(${80 - swipeOffset}px)`,
            opacity: swipeOffset > 20 ? 1 : 0
          }}
        >
          <button
            onClick={handleDelete}
            className="h-full w-full flex  border-l border-t items-center justify-center touch-manipulation"
            aria-label={`Delete expense ${expense.description}`}
          >
            🗑️
          </button>
        </div>

        {/* Main card content */}
        <div
          ref={cardRef}
          className={cn(
            "relative bg-card border-t transition-transform duration-200 ease-out",
            className
          )}
          style={{ transform: `translateX(-${swipeOffset}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleClickOutside}
        >
          <div className="p-4 min-h-[60px]">
            {/* Compact layout: Description and Amount on same line */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex-1 min-w-0 mr-3">
                <span className="font-medium text-sm truncate block">
                  {expense.description}
                </span>
              </div>
              <div className="text-lg font-semibold flex-shrink-0">
                {formatCurrency(expense.amount)}
              </div>
            </div>

            {/* Date and Category below in muted and small text */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {formatDate(expense.date)}
                {expense.merchant && (
                  <span className="ml-2">• {expense.merchant}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {expense.category && (
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                    {expense.category.icon} {expense.category.name}
                  </span>
                )}
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded touch-manipulation"
                    aria-label={`Edit expense ${expense.description}`}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ExpenseCard.displayName = "ExpenseCard"

export {
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardDescription,
  MobileCardContent,
  MobileCardFooter,
  ExpenseCard,
  mobileCardVariants,
}