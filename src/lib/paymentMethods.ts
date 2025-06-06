import type { PaymentMethod } from '@/types/shared'

// Spanish payment methods used in UI
export const PAYMENT_METHODS_ES = [
    'efectivo',
    'tarjeta_debito',
    'tarjeta_credito',
    'transferencia',
    'paypal',
    'bizum',
    'otro'
] as const

// Spanish to English mapping for database
export const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
    'efectivo': 'cash',
    'tarjeta_debito': 'debit_card',
    'tarjeta_credito': 'credit_card',
    'transferencia': 'bank_transfer',
    'paypal': 'other',
    'bizum': 'other',
    'otro': 'other'
}

// English to Spanish mapping for UI display
export const PAYMENT_METHOD_MAP_REVERSE: Record<PaymentMethod, string> = {
    'cash': 'efectivo',
    'debit_card': 'tarjeta_debito',
    'credit_card': 'tarjeta_credito',
    'bank_transfer': 'transferencia',
    'other': 'otro'
}

// Spanish labels for UI
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    efectivo: 'Efectivo',
    tarjeta_debito: 'Tarjeta de débito',
    tarjeta_credito: 'Tarjeta de crédito',
    transferencia: 'Transferencia',
    paypal: 'PayPal',
    bizum: 'Bizum',
    otro: 'Otro'
}

/**
 * Convert Spanish payment method to English for database storage
 */
export function mapPaymentMethodToDb(spanishMethod: string): PaymentMethod {
    return PAYMENT_METHOD_MAP[spanishMethod] || 'other'
}

/**
 * Convert English payment method to Spanish for UI display
 */
export function mapPaymentMethodToUi(englishMethod: PaymentMethod): string {
    return PAYMENT_METHOD_MAP_REVERSE[englishMethod] || 'otro'
}

/**
 * Get the display label for a Spanish payment method
 */
export function getPaymentMethodLabel(spanishMethod: string): string {
    return PAYMENT_METHOD_LABELS[spanishMethod] || spanishMethod
} 