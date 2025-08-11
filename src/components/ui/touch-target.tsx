import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const touchTargetVariants = cva(
  "inline-flex items-center justify-center touch-manipulation select-none transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
  {
    variants: {
      size: {
        // WCAG 2.5.5 compliant touch targets (minimum 44x44px)
        sm: "size-11", // 44px
        default: "size-12", // 48px - recommended size
        lg: "size-14", // 56px
        xl: "size-16", // 64px
      },
      variant: {
        default: "hover:bg-accent hover:text-accent-foreground rounded-md",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground rounded-md",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground rounded-md",
        // Specialized for navigation triggers
        navigation: "hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg",
      },
      spacing: {
        // Minimum 8px spacing between touch targets
        none: "",
        tight: "m-1",
        default: "m-2",
        comfortable: "m-3",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      spacing: "default",
    },
  }
)

export interface TouchTargetProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof touchTargetVariants> {
  asChild?: boolean
  /**
   * Adds haptic feedback animation on press
   * @default true
   */
  hapticFeedback?: boolean
  /**
   * Aria label for accessibility (required for icon-only buttons)
   */
  "aria-label": string
}

const TouchTarget = React.forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ 
    className, 
    variant, 
    size, 
    spacing,
    asChild = false,
    hapticFeedback = true,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const hapticClass = hapticFeedback 
      ? "active:scale-95 active:transition-transform active:duration-75"
      : ""

    return (
      <Comp
        ref={ref}
        data-testid="touch-target"
        className={cn(
          touchTargetVariants({ variant, size, spacing }),
          hapticClass,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

TouchTarget.displayName = "TouchTarget"

// Specialized component for navigation triggers (sidebar, menu toggles)
const NavigationTrigger = React.forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ variant = "navigation", size = "default", ...props }, ref) => (
    <TouchTarget
      ref={ref}
      variant={variant}
      size={size}
      {...props}
    />
  )
)

NavigationTrigger.displayName = "NavigationTrigger"

// Specialized component for icon-only actions
const IconTouchTarget = React.forwardRef<HTMLButtonElement, TouchTargetProps>(
  ({ size = "default", spacing = "tight", ...props }, ref) => (
    <TouchTarget
      ref={ref}
      size={size}
      spacing={spacing}
      {...props}
    />
  )
)

IconTouchTarget.displayName = "IconTouchTarget"

export { TouchTarget, NavigationTrigger, IconTouchTarget, touchTargetVariants }