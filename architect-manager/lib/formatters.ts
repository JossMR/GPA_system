export function formatCurrency(amount: number | string | null | undefined): string {
    const numericAmount = Number(amount ?? 0)

    // Formatear el número con separador de miles (espacio) y 2 decimales
    const formatted = numericAmount.toLocaleString('es-CR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return `₡${formatted}`
}
export function formatNumber(amount: number | string | null | undefined): string {
    const numericAmount = Number(amount ?? 0)

    return numericAmount.toLocaleString('es-CR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
