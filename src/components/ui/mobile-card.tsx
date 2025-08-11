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
    const handleEdit = React.useCallback(() => {
      onEdit?.(expense.id)
    }, [onEdit, expense.id])

    const handleDelete = React.useCallback(() => {
      onDelete?.(expense.id)
    }, [onDelete, expense.id])

    return (
      <MobileCard
        ref={ref}
        size="touch"
        className={cn("relative", className)}
        {...props}
      >
        <MobileCardHeader>
          <div className="flex-1 min-w-0">
            <MobileCardTitle className="truncate">
              {expense.description}
            </MobileCardTitle>
            {expense.merchant && (
              <MobileCardDescription className="truncate">
                {expense.merchant}
              </MobileCardDescription>
            )}
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div className="text-lg font-semibold">
              {formatCurrency(expense.amount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(expense.date).toLocaleDateString('es-ES')}
            </div>
          </div>
        </MobileCardHeader>

        <MobileCardFooter>
          <div className="flex items-center space-x-2">
            {expense.category && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-secondary/50 text-xs">
                <span>{expense.category.icon}</span>
                <span className="font-medium">{expense.category.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded touch-manipulation"
                aria-label={`Edit expense ${expense.description}`}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors py-1 px-2 rounded touch-manipulation"
                aria-label={`Delete expense ${expense.description}`}
              >
                Eliminar
              </button>
            )}
          </div>
        </MobileCardFooter>
      </MobileCard>
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