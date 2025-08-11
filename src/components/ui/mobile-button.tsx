import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Mobile-first sizes with proper touch targets (minimum 44px)
        default: "h-12 px-4 py-3 text-base sm:h-9 sm:px-4 sm:py-2 sm:text-sm has-[>svg]:px-3",
        sm: "h-10 px-3 py-2 text-sm sm:h-8 sm:px-3 sm:py-1.5 gap-1.5 has-[>svg]:px-2.5",
        lg: "h-14 px-6 py-4 text-lg sm:h-10 sm:px-6 sm:py-2 sm:text-base has-[>svg]:px-4",
        // Touch-optimized size for critical interactions
        touch: "h-12 px-6 py-3 text-base min-w-[120px] sm:h-10 sm:px-4 sm:py-2 sm:text-sm sm:min-w-[100px]",
        // Icon button with proper touch target
        icon: "size-12 sm:size-9",
        // Compact for secondary actions but still touch-friendly
        compact: "h-10 px-3 py-2 text-sm sm:h-8 sm:px-2 sm:py-1",
      },
      spacing: {
        // Spacing between buttons for touch-friendly layouts
        default: "mx-1 my-1",
        tight: "mx-0.5 my-0.5",
        comfortable: "mx-2 my-2 sm:mx-1 sm:my-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      spacing: "default",
    },
  }
)

export interface MobileButtonProps 
  extends React.ComponentProps<"button">,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
  /**
   * Ensures minimum touch target of 44px on mobile
   * @default true
   */
  touchOptimized?: boolean
  /**
   * Adds haptic feedback class for mobile devices
   * @default false
   */
  hapticFeedback?: boolean
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing, 
    asChild = false, 
    touchOptimized = true,
    hapticFeedback = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    const touchOptimizedClass = touchOptimized 
      ? "touch-manipulation select-none" // Prevents zoom on double tap, improves touch responsiveness
      : ""

    const hapticClass = hapticFeedback 
      ? "active:scale-95 active:transition-transform active:duration-75" // Visual feedback for touch
      : ""

    return (
      <Comp
        ref={ref}
        data-slot="mobile-button"
        data-testid="mobile-button"
        className={cn(
          mobileButtonVariants({ variant, size, spacing }),
          touchOptimizedClass,
          hapticClass,
          className
        )}
        {...props}
      />
    )
  }
)

MobileButton.displayName = "MobileButton"

export { MobileButton, mobileButtonVariants }