import { render, screen, fireEvent } from '@testing-library/react'
import { MobileInput, MobileNumberInput, MobileEmailInput, MobileTelInput } from '../mobile-input'

describe('MobileInput', () => {
  it('renders with mobile-optimized sizing by default', () => {
    render(<MobileInput placeholder="Test input" />)
    const input = screen.getByTestId('mobile-input')
    
    // Should have mobile-first classes to prevent zoom
    expect(input).toHaveClass('h-12')
    expect(input).toHaveClass('text-base')
    expect(input).toHaveClass('sm:h-9')
    expect(input).toHaveClass('sm:text-sm')
  })

  it('prevents zoom with minimum 16px font size', () => {
    render(<MobileInput placeholder="No zoom" />)
    const input = screen.getByTestId('mobile-input')
    
    // Should have inline style to ensure 16px minimum
    expect(input).toHaveStyle({ fontSize: 'max(16px, 1rem)' })
  })

  it('can disable zoom prevention', () => {
    render(<MobileInput preventZoom={false} placeholder="Allow zoom" />)
    const input = screen.getByTestId('mobile-input')
    
    // Should not have the preventZoom style
    expect(input).not.toHaveStyle({ fontSize: 'max(16px, 1rem)' })
  })

  it('applies touch enhancement when enabled', () => {
    render(<MobileInput touchEnhanced placeholder="Touch enhanced" />)
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveClass('touch-manipulation')
    expect(input).toHaveClass('selection:bg-primary/20')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<MobileInput size="sm" />)
    let input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('text-sm')
    
    rerender(<MobileInput size="lg" />)
    input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveClass('h-14')
    expect(input).toHaveClass('text-lg')
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <MobileInput 
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Focus test"
      />
    )
    
    const input = screen.getByTestId('mobile-input')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('supports enhanced variant with better focus states', () => {
    render(<MobileInput variant="enhanced" />)
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveClass('focus-visible:ring-2')
    expect(input).toHaveClass('focus-visible:ring-offset-1')
    expect(input).toHaveClass('focus-visible:ring-primary/20')
  })

  it('maintains all standard input attributes', () => {
    render(
      <MobileInput 
        type="text"
        name="test"
        id="test-input"
        required
        disabled
        placeholder="Standard attributes"
      />
    )
    
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('name', 'test')
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('required')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('placeholder', 'Standard attributes')
  })

  it('allows custom styles while preserving zoom prevention', () => {
    render(
      <MobileInput 
        style={{ color: 'red', backgroundColor: 'blue' }}
        placeholder="Custom styles"
      />
    )
    
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveStyle({ 
      fontSize: 'max(16px, 1rem)'
    })
    // Check that custom styles are applied
    expect(input.style.color).toBe('red')
    expect(input.style.backgroundColor).toBe('blue')
  })
})

describe('MobileNumberInput', () => {
  it('renders with proper number input attributes', () => {
    render(<MobileNumberInput placeholder="Number input" />)
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputMode', 'decimal')
    expect(input).toHaveAttribute('pattern', '[0-9]*\\.?[0-9]*')
  })

  it('handles numeric input correctly', () => {
    render(<MobileNumberInput />)
    const input = screen.getByTestId('mobile-input') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: '123.45' } })
    expect(input.value).toBe('123.45')
  })
})

describe('MobileEmailInput', () => {
  it('renders with email input attributes', () => {
    render(<MobileEmailInput placeholder="Email input" />)
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('inputMode', 'email')
    expect(input).toHaveAttribute('autoComplete', 'email')
  })

  it('validates email format', () => {
    render(<MobileEmailInput />)
    const input = screen.getByTestId('mobile-input') as HTMLInputElement
    
    fireEvent.change(input, { target: { value: 'invalid-email' } })
    expect(input.validity.valid).toBe(false)
    
    fireEvent.change(input, { target: { value: 'valid@email.com' } })
    expect(input.validity.valid).toBe(true)
  })
})

describe('MobileTelInput', () => {
  it('renders with telephone input attributes', () => {
    render(<MobileTelInput placeholder="Phone input" />)
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('inputMode', 'tel')
    expect(input).toHaveAttribute('autoComplete', 'tel')
  })
})

describe('Accessibility', () => {
  it('maintains proper focus management', () => {
    render(<MobileInput aria-label="Accessible input" />)
    const input = screen.getByTestId('mobile-input')
    
    input.focus()
    expect(document.activeElement).toBe(input)
  })

  it('supports aria attributes', () => {
    render(
      <MobileInput 
        aria-label="Test input"
        aria-describedby="help-text"
        aria-invalid="true"
      />
    )
    const input = screen.getByTestId('mobile-input')
    
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('aria-describedby', 'help-text')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveClass('aria-invalid:ring-destructive/20')
  })
})

describe('Touch interaction requirements', () => {
  it('meets minimum height requirements for touch', () => {
    render(<MobileInput size="default" />)
    const input = screen.getByTestId('mobile-input')
    
    // h-12 = 48px, which exceeds 44px minimum touch target
    expect(input).toHaveClass('h-12')
  })

  it('provides sufficient touch targets even for small size', () => {
    render(<MobileInput size="sm" />)
    const input = screen.getByTestId('mobile-input')
    
    // h-10 = 40px, still reasonably touch-friendly
    expect(input).toHaveClass('h-10')
  })
})