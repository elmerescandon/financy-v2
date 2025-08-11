import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const mobileInputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all",
  {
    variants: {
      size: {
        // Mobile-first sizing to prevent zoom (16px minimum on mobile)
        default: "h-12 text-base sm:h-9 sm:text-sm",
        sm: "h-10 text-sm px-2.5 py-1.5 sm:h-8 sm:text-xs",
        lg: "h-14 text-lg px-4 py-3 sm:h-10 sm:text-base sm:px-3 sm:py-2",
      },
      variant: {
        default: "",
        // Enhanced focus states for touch devices
        enhanced: "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/20",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface MobileInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof mobileInputVariants> {
  /**
   * Prevents iOS Safari zoom on input focus
   * @default true
   */
  preventZoom?: boolean
  /**
   * Enhanced touch interaction styles
   * @default false
   */
  touchEnhanced?: boolean
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ 
    className, 
    type, 
    size, 
    variant,
    preventZoom = true,
    touchEnhanced = false,
    style,
    ...props 
  }, ref) => {
    // Ensure minimum 16px font size on mobile to prevent zoom
    const preventZoomStyle = preventZoom ? {
      fontSize: 'max(16px, 1rem)', // Ensures 16px minimum on mobile
      ...style
    } : style

    const touchEnhancedClass = touchEnhanced 
      ? "touch-manipulation selection:bg-primary/20" 
      : ""

    return (
      <input
        type={type}
        ref={ref}
        data-testid="mobile-input"
        className={cn(
          mobileInputVariants({ size, variant }),
          touchEnhancedClass,
          className
        )}
        style={preventZoomStyle}
        {...props}
      />
    )
  }
)

MobileInput.displayName = "MobileInput"

// Specialized components for common use cases
const MobileNumberInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="number"
      inputMode="decimal"
      pattern="[0-9]*\.?[0-9]*"
      {...props}
    />
  )
)

MobileNumberInput.displayName = "MobileNumberInput"

const MobileEmailInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="email"
      inputMode="email"
      autoComplete="email"
      {...props}
    />
  )
)

MobileEmailInput.displayName = "MobileEmailInput"

const MobileTelInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ ...props }, ref) => (
    <MobileInput
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      {...props}
    />
  )
)

MobileTelInput.displayName = "MobileTelInput"

export { 
  MobileInput, 
  MobileNumberInput, 
  MobileEmailInput, 
  MobileTelInput,
  mobileInputVariants 
}