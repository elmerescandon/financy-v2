import { render, screen, fireEvent } from '@testing-library/react'
import { TouchTarget, NavigationTrigger, IconTouchTarget } from '../touch-target'

describe('TouchTarget', () => {
  it('renders with default WCAG compliant size', () => {
    render(
      <TouchTarget aria-label="Test target">
        <span>🏠</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    // size-12 = 48px, which exceeds WCAG 2.5.5 minimum of 44px
    expect(target).toHaveClass('size-12')
    expect(target).toHaveClass('touch-manipulation')
    expect(target).toHaveClass('select-none')
  })

  it('meets minimum touch target size requirements', () => {
    render(
      <TouchTarget size="sm" aria-label="Small target">
        <span>📍</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    // size-11 = 44px, exactly meets WCAG 2.5.5 minimum
    expect(target).toHaveClass('size-11')
  })

  it('applies haptic feedback by default', () => {
    render(
      <TouchTarget aria-label="Haptic target">
        <span>⚡</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('active:scale-95')
    expect(target).toHaveClass('active:transition-transform')
    expect(target).toHaveClass('active:duration-75')
  })

  it('can disable haptic feedback', () => {
    render(
      <TouchTarget hapticFeedback={false} aria-label="No haptic">
        <span>🔇</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).not.toHaveClass('active:scale-95')
  })

  it('applies proper spacing between targets', () => {
    render(
      <TouchTarget spacing="comfortable" aria-label="Spaced target">
        <span>🎯</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('m-3')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <TouchTarget onClick={handleClick} aria-label="Clickable target">
        <span>👆</span>
      </TouchTarget>
    )
    
    const target = screen.getByTestId('touch-target')
    fireEvent.click(target)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('supports different variants', () => {
    const { rerender } = render(
      <TouchTarget variant="ghost" aria-label="Ghost variant">
        <span>👻</span>
      </TouchTarget>
    )
    let target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('hover:bg-accent/50')
    
    rerender(
      <TouchTarget variant="outline" aria-label="Outline variant">
        <span>⭕</span>
      </TouchTarget>
    )
    target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('border')
    expect(target).toHaveClass('border-input')
  })

  it('requires aria-label for accessibility', () => {
    render(
      <TouchTarget aria-label="Accessible target">
        <span>♿</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).toHaveAttribute('aria-label', 'Accessible target')
  })

  it('works as polymorphic component with asChild', () => {
    render(
      <TouchTarget asChild aria-label="Link target">
        <a href="/test">
          <span>🔗</span>
        </a>
      </TouchTarget>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('size-12')
  })

  it('maintains focus management', () => {
    render(
      <TouchTarget aria-label="Focusable target">
        <span>🎯</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    target.focus()
    expect(document.activeElement).toBe(target)
    expect(target).toHaveClass('focus-visible:ring-ring/50')
  })
})

describe('NavigationTrigger', () => {
  it('uses navigation variant by default', () => {
    render(
      <NavigationTrigger aria-label="Menu toggle">
        <span>☰</span>
      </NavigationTrigger>
    )
    const trigger = screen.getByTestId('touch-target')
    
    expect(trigger).toHaveClass('hover:bg-muted/50')
    expect(trigger).toHaveClass('text-muted-foreground')
    expect(trigger).toHaveClass('hover:text-foreground')
    expect(trigger).toHaveClass('rounded-lg')
  })

  it('maintains proper size for navigation', () => {
    render(
      <NavigationTrigger aria-label="Navigation trigger">
        <span>🧭</span>
      </NavigationTrigger>
    )
    const trigger = screen.getByTestId('touch-target')
    
    expect(trigger).toHaveClass('size-12') // 48px - good for navigation
  })
})

describe('IconTouchTarget', () => {
  it('uses tight spacing for icon clusters', () => {
    render(
      <IconTouchTarget aria-label="Icon action">
        <span>⚙️</span>
      </IconTouchTarget>
    )
    const icon = screen.getByTestId('touch-target')
    
    expect(icon).toHaveClass('m-1') // Tight spacing for icon groups
  })

  it('maintains proper touch target size', () => {
    render(
      <IconTouchTarget aria-label="Icon target">
        <span>🔧</span>
      </IconTouchTarget>
    )
    const icon = screen.getByTestId('touch-target')
    
    expect(icon).toHaveClass('size-12')
  })
})

describe('Accessibility compliance', () => {
  it('meets WCAG 2.5.5 Target Size requirements', () => {
    // Test all sizes meet or exceed 44x44px requirement
    const sizes = [
      { size: 'sm', expectedClass: 'size-11', pixelSize: 44 }, // Exactly 44px
      { size: 'default', expectedClass: 'size-12', pixelSize: 48 }, // Exceeds requirement
      { size: 'lg', expectedClass: 'size-14', pixelSize: 56 }, // Exceeds requirement
      { size: 'xl', expectedClass: 'size-16', pixelSize: 64 }, // Exceeds requirement
    ] as const
    
    sizes.forEach(({ size, expectedClass }) => {
      const { unmount } = render(
        <TouchTarget size={size} aria-label={`${size} target`}>
          <span>🎯</span>
        </TouchTarget>
      )
      const target = screen.getByTestId('touch-target')
      
      expect(target).toHaveClass(expectedClass)
      unmount()
    })
  })

  it('provides adequate spacing between touch targets', () => {
    render(
      <div>
        <TouchTarget spacing="default" aria-label="First target">
          <span>1️⃣</span>
        </TouchTarget>
        <TouchTarget spacing="default" aria-label="Second target">
          <span>2️⃣</span>
        </TouchTarget>
      </div>
    )
    
    const targets = screen.getAllByTestId('touch-target')
    
    // Both should have m-2 (8px) spacing to prevent accidental activation
    targets.forEach(target => {
      expect(target).toHaveClass('m-2')
    })
  })

  it('supports keyboard navigation', () => {
    render(
      <TouchTarget aria-label="Keyboard accessible">
        <span>⌨️</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    // Should be focusable and have focus styles
    expect(target).toHaveAttribute('tabIndex', '0')
    expect(target).toHaveClass('focus-visible:ring-ring/50')
  })
})

describe('Touch interaction validation', () => {
  it('prevents text selection on touch', () => {
    render(
      <TouchTarget aria-label="No selection">
        <span>📱</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('select-none')
  })

  it('optimizes touch responsiveness', () => {
    render(
      <TouchTarget aria-label="Fast touch">
        <span>⚡</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    expect(target).toHaveClass('touch-manipulation')
  })

  it('provides visual feedback on touch', () => {
    render(
      <TouchTarget aria-label="Touch feedback">
        <span>👋</span>
      </TouchTarget>
    )
    const target = screen.getByTestId('touch-target')
    
    // Should have active state feedback
    expect(target).toHaveClass('active:scale-95')
  })
})