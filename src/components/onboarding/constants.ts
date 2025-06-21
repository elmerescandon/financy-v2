import { CategoryData } from "./types"

export const defaultCategories: CategoryData[] = [
    { id: 'comida', name: 'Comida y Restaurantes', icon: '🍲', isSelected: true, color: '#FF6B6B', subcategories: ['Supermercado', 'Restaurantes', 'Delivery', 'Café'] },
    { id: 'transporte', name: 'Transporte', icon: '🚗', isSelected: true, color: '#4ECDC4', subcategories: ['Gasolina', 'Transporte público', 'Taxi/Uber', 'Mantenimiento'] },
    { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎭', isSelected: true, color: '#96CEB4', subcategories: ['Cine', 'Conciertos', 'Videojuegos', 'Deportes'] },
    { id: 'servicios', name: 'Servicios y Facturas', icon: '🧾', isSelected: true, color: '#FECA57', subcategories: ['Luz', 'Agua', 'Internet', 'Teléfono', 'Suscripciones'] },
    { id: 'salud', name: 'Salud', icon: '⚕️', isSelected: true, color: '#FF9FF3', subcategories: ['Médico', 'Farmacia', 'Seguro', 'Gimnasio'] },
    { id: 'educacion', name: 'Educación', icon: '📚', isSelected: true, color: '#54A0FF', subcategories: ['Cursos', 'Libros', 'Material escolar', 'Certificaciones'] },
    { id: 'viajes', name: 'Viajes', icon: '✈️', isSelected: true, color: '#5F27CD', subcategories: ['Vuelos', 'Alojamiento', 'Actividades', 'Comida'] },
    { id: 'compras', name: 'Compras', icon: '🛍️', isSelected: true, color: '#45B7D1', subcategories: ['Ropa', 'Electrónicos', 'Hogar', 'Regalos', 'Otros'] }
]
