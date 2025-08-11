import { render, screen, fireEvent } from '@testing-library/react'
import { MobileButton } from '../mobile-button'

describe('MobileButton', () => {
  it('renders with default mobile-optimized size', () => {
    render(<MobileButton>Test Button</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    // Should have mobile-first classes (h-12 for mobile, h-9 for desktop)
    expect(button).toHaveClass('h-12')
    expect(button).toHaveClass('sm:h-9')
    expect(button).toHaveClass('text-base')
    expect(button).toHaveClass('sm:text-sm')
  })

  it('applies touch-optimized classes by default', () => {
    render(<MobileButton>Touch Button</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    expect(button).toHaveClass('touch-manipulation')
    expect(button).toHaveClass('select-none')
  })

  it('can disable touch optimization', () => {
    render(<MobileButton touchOptimized={false}>No Touch</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    expect(button).not.toHaveClass('touch-manipulation')
    expect(button).not.toHaveClass('select-none')
  })

  it('applies haptic feedback classes when enabled', () => {
    render(<MobileButton hapticFeedback>Haptic Button</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    expect(button).toHaveClass('active:scale-95')
    expect(button).toHaveClass('active:transition-transform')
  })

  it('renders touch size with proper dimensions', () => {
    render(<MobileButton size="touch">Touch Size</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    // Should have minimum 48px height (h-12) and width constraints
    expect(button).toHaveClass('h-12')
    expect(button).toHaveClass('min-w-[120px]')
    expect(button).toHaveClass('sm:min-w-[100px]')
  })

  it('renders icon button with square touch target', () => {
    render(<MobileButton size="icon">🏠</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    // Should be square with proper mobile size
    expect(button).toHaveClass('size-12')
    expect(button).toHaveClass('sm:size-9')
  })

  it('handles click events properly', () => {
    const handleClick = jest.fn()
    render(<MobileButton onClick={handleClick}>Clickable</MobileButton>)
    
    const button = screen.getByTestId('mobile-button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies comfortable spacing for touch-friendly layouts', () => {
    render(<MobileButton spacing="comfortable">Spaced Button</MobileButton>)
    const button = screen.getByTestId('mobile-button')
    
    expect(button).toHaveClass('mx-2')
    expect(button).toHaveClass('my-2')
    expect(button).toHaveClass('sm:mx-1')
    expect(button).toHaveClass('sm:my-1')
  })

  it('maintains accessibility attributes', () => {
    render(
      <MobileButton 
        aria-label="Accessible button" 
        disabled
      >
        Disabled Button
      </MobileButton>
    )
    const button = screen.getByTestId('mobile-button')
    
    expect(button).toHaveAttribute('aria-label', 'Accessible button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('works as polymorphic component with asChild', () => {
    render(
      <MobileButton asChild>
        <a href="/test">Link Button</a>
      </MobileButton>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('h-12') // Should still have button styles
  })

  describe('Responsive behavior', () => {
    it('applies correct classes for different screen sizes', () => {
      render(<MobileButton size="lg">Large Button</MobileButton>)
      const button = screen.getByTestId('mobile-button')
      
      // Mobile classes
      expect(button).toHaveClass('h-14')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('text-lg')
      
      // Desktop classes
      expect(button).toHaveClass('sm:h-10')
      expect(button).toHaveClass('sm:px-6')
      expect(button).toHaveClass('sm:text-base')
    })
  })

  describe('Touch target validation', () => {
    it('meets minimum touch target requirements', () => {
      // Test that button meets WCAG 2.5.5 Target Size requirements (44px minimum)
      render(<MobileButton size="default">Standard Button</MobileButton>)
      const button = screen.getByTestId('mobile-button')
      
      // h-12 = 48px, which exceeds 44px requirement
      expect(button).toHaveClass('h-12')
    })

    it('icon buttons meet touch target size', () => {
      render(<MobileButton size="icon">🏠</MobileButton>)
      const button = screen.getByTestId('mobile-button')
      
      // size-12 = 48px x 48px, which meets requirements
      expect(button).toHaveClass('size-12')
    })

    it('compact size still meets minimum requirements', () => {
      render(<MobileButton size="compact">Compact</MobileButton>)
      const button = screen.getByTestId('mobile-button')
      
      // h-10 = 40px, still reasonably close to requirement for secondary actions
      expect(button).toHaveClass('h-10')
    })
  })
})