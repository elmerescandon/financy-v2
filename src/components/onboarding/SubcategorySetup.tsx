'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

interface CategoryData {
    id: string
    name: string
    icon: string
    color: string
    subcategories: string[]
}

interface SubcategorySetupProps {
    selectedCategories: CategoryData[]
    onSubcategoriesUpdate: (categoryId: string, subcategories: string[]) => void
}

export default function SubcategorySetup({
    selectedCategories,
    onSubcategoriesUpdate
}: SubcategorySetupProps) {
    const [newSubcategoryInputs, setNewSubcategoryInputs] = useState<Record<string, string>>({})

    const handleAddSubcategory = (categoryId: string) => {
        const subcategoryName = newSubcategoryInputs[categoryId]?.trim()
        if (!subcategoryName) return

        const category = selectedCategories.find(c => c.id === categoryId)
        if (category) {
            const updatedSubcategories = [...category.subcategories, subcategoryName]
            onSubcategoriesUpdate(categoryId, updatedSubcategories)
            setNewSubcategoryInputs(prev => ({ ...prev, [categoryId]: '' }))
        }
    }

    const handleRemoveSubcategory = (categoryId: string, subcategoryToRemove: string) => {
        const category = selectedCategories.find(c => c.id === categoryId)
        if (category) {
            const updatedSubcategories = category.subcategories.filter(s => s !== subcategoryToRemove)
            onSubcategoriesUpdate(categoryId, updatedSubcategories)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Personaliza tus subcategorías</h3>
                <p className="text-sm text-muted-foreground">
                    Añade o elimina subcategorías para cada una de tus categorías seleccionadas.
                </p>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {selectedCategories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                                    style={{ backgroundColor: category.color + '20' }}
                                >
                                    {category.icon}
                                </div>
                                <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {category.subcategories.map((sub) => (
                                    <Badge key={sub} variant="secondary" className="text-sm py-1 px-2">
                                        {sub}
                                        <button
                                            onClick={() => handleRemoveSubcategory(category.id, sub)}
                                            className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {category.subcategories.length === 0 && (
                                    <p className="text-xs text-muted-foreground">No hay subcategorías.</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Input
                                    placeholder="Nueva subcategoría..."
                                    value={newSubcategoryInputs[category.id] || ''}
                                    onChange={(e) =>
                                        setNewSubcategoryInputs(prev => ({ ...prev, [category.id]: e.target.value }))
                                    }
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory(category.id)}
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddSubcategory(category.id)}
                                    disabled={!newSubcategoryInputs[category.id]?.trim()}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
} 