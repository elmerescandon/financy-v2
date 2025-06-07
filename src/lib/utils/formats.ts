export const formatAmount = (amount: number, currency: string = 'PEN') => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(amount)
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}