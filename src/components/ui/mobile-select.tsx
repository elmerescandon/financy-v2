import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const mobileSelectTriggerVariants = cva(
  "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 shadow-xs text-left placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all [&>span]:line-clamp-1 touch-manipulation",
  {
    variants: {
      size: {
        // Mobile-first sizing to prevent zoom (16px minimum on mobile)
        default: "h-12 text-base sm:h-9 sm:text-sm",
        sm: "h-10 text-sm px-2.5 py-1.5 sm:h-8 sm:text-xs",
        lg: "h-14 text-lg px-4 py-3 sm:h-10 sm:text-base sm:px-3 sm:py-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const MobileSelect = SelectPrimitive.Root

const MobileSelectGroup = SelectPrimitive.Group

const MobileSelectValue = SelectPrimitive.Value

interface MobileSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof mobileSelectTriggerVariants> {
  /**
   * Prevents iOS Safari zoom on select focus
   * @default true
   */
  preventZoom?: boolean
}

const MobileSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  MobileSelectTriggerProps
>(({ className, children, size, preventZoom = true, style, ...props }, ref) => {
  // Ensure minimum 16px font size on mobile to prevent zoom
  const preventZoomStyle = preventZoom ? {
    fontSize: 'max(16px, 1rem)',
    ...style
  } : style

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-testid="mobile-select-trigger"
      className={cn(mobileSelectTriggerVariants({ size }), className)}
      style={preventZoomStyle}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
MobileSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const MobileSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
MobileSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const MobileSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
MobileSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const MobileSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <MobileSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <MobileSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
MobileSelectContent.displayName = SelectPrimitive.Content.displayName

const MobileSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
MobileSelectLabel.displayName = SelectPrimitive.Label.displayName

const MobileSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-base sm:text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 min-h-[44px] sm:min-h-[32px] touch-manipulation", // Mobile-optimized touch targets
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
MobileSelectItem.displayName = SelectPrimitive.Item.displayName

const MobileSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MobileSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  MobileSelect,
  MobileSelectGroup,
  MobileSelectValue,
  MobileSelectTrigger,
  MobileSelectContent,
  MobileSelectLabel,
  MobileSelectItem,
  MobileSelectSeparator,
  MobileSelectScrollUpButton,
  MobileSelectScrollDownButton,
}