'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { CategoryData } from './types'


interface CategorySelectionProps {
    defaultCategories: CategoryData[]
    customCategories: CategoryData[]
    selectedCategories: CategoryData[]
    onCategoryToggle: (categoryId: string) => void
    onAddCustomCategory: (category: Omit<CategoryData, 'id' | 'isSelected'>) => void
    onRemoveCustomCategory: (categoryId: string) => void
}

const ICON_OPTIONS = ['🍽️', '🚗', '🎬', '🛍️', '🏥', '📚', '💡', '❓', '🏠', '✈️', '🎮', '💻', '📱', '🎵', '🎨', '🏃', '🐕', '🌱', '💎', '🎁']

const COLOR_OPTIONS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9F43', '#00B894',
    '#6C5CE7', '#FD79A8', '#FDCB6E', '#E17055', '#74B9FF'
]

export default function CategorySelection({
    defaultCategories,
    customCategories,
    selectedCategories,
    onCategoryToggle,
    onAddCustomCategory,
    onRemoveCustomCategory
}: CategorySelectionProps) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: '❓',
        color: '#F7DC6F'
    })

    const handleAddCategory = () => {
        if (!newCategory.name.trim()) {
            toast.error('El nombre de la categoría es requerido')
            return
        }

        onAddCustomCategory({
            name: newCategory.name.trim(),
            icon: newCategory.icon,
            color: newCategory.color,
            subcategories: []
        })

        setNewCategory({ name: '', icon: '❓', color: '#F7DC6F' })
        setShowAddForm(false)
        toast.success('Categoría personalizada agregada')
    }

    const allCategories = [...defaultCategories, ...customCategories]
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Categorías por defecto</h3>
                <p className="text-sm text-muted-foreground">
                    Selecciona las categorías que quieres usar. Puedes desmarcar las que no necesites.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allCategories.map((category) => (
                    <Card
                        key={category.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${category.isSelected ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                            }`}
                        onClick={() => onCategoryToggle(category.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                {!category.id.startsWith('custom-') && <Checkbox
                                    checked={selectedCategories.find(c => c.id === category.id)?.isSelected || false}
                                    onChange={() => onCategoryToggle(category.id)}
                                    className="flex-shrink-0"
                                />}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                    style={{ backgroundColor: category.color + '20' }}
                                >
                                    {category.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{category.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {category.subcategories.length} subcategorías
                                    </p>
                                </div>
                                {category.id.startsWith('custom-') && (
                                    <Badge variant="secondary" className="text-xs">
                                        Personalizada
                                    </Badge>
                                )}
                                {category.id.startsWith('custom-') && (
                                    <Button variant="ghost" size="icon" onClick={() => onRemoveCustomCategory(category.id)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {!showAddForm ? (
                <Button
                    variant="outline"
                    onClick={() => setShowAddForm(true)}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar categoría personalizada
                </Button>
            ) : (
                <Card className="p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Nueva categoría</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddForm(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="category-name" className="text-sm">Nombre</Label>
                                <Input
                                    id="category-name"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ej: Viajes, Mascotas..."
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-sm">Icono</Label>
                                <div className="grid grid-cols-10 gap-2 mt-2">
                                    {ICON_OPTIONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                                            className={`w-8 h-8 rounded border-2 flex items-center justify-center text-sm transition-colors ${newCategory.icon === icon
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm">Color</Label>
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                            className={`w-8 h-8 rounded border-2 transition-colors ${newCategory.color === color
                                                ? 'border-primary scale-110'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                onClick={handleAddCategory}
                                className="flex-1"
                                disabled={!newCategory.name.trim()}
                            >
                                Agregar categoría
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                    Seleccionadas: {allCategories.filter(c => c.isSelected).length} de {allCategories.length}
                </p>
            </div>
        </div>
    )
} 