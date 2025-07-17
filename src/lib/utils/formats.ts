export const formatAmount = (amount: number, currency: string = 'PEN') => {
    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount).replace('$', 'USD ')
    }

    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency
    }).format(amount)
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}