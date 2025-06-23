'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3
        }
    }
}

const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
}

const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 30
        }
    }
}

export default function CategorySelection({
    defaultCategories,
    customCategories,
    selectedCategories,
    onCategoryToggle,
    onAddCustomCategory,
    onRemoveCustomCategory
}: CategorySelectionProps) {
    const [showModal, setShowModal] = useState(false)
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
        setShowModal(false)
        toast.success('Categoría personalizada agregada')
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setNewCategory({ name: '', icon: '❓', color: '#F7DC6F' })
    }

    const allCategories = [...defaultCategories, ...customCategories]

    return (
        <>
            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    className="text-center"
                    variants={itemVariants}
                >
                    <h3 className="text-lg font-semibold mb-2">Categorías por defecto</h3>
                    <p className="text-sm text-muted-foreground">
                        Selecciona las categorías que quieres usar, puedes desmarcar las que no necesites.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    variants={containerVariants}
                >
                    {allCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <Card
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${selectedCategories.find(c => c.id === category.id)?.isSelected
                                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                                    : 'border-border hover:border-primary/20'
                                    }`}
                                onClick={() => onCategoryToggle(category.id)}
                            >
                                <CardContent className="p-2">
                                    <div className="flex items-center space-x-2">
                                        {!category.id.startsWith('custom-') && (
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Checkbox
                                                    checked={selectedCategories.find(c => c.id === category.id)?.isSelected || false}
                                                    onChange={() => onCategoryToggle(category.id)}
                                                    className="flex-shrink-0"
                                                />
                                            </motion.div>
                                        )}
                                        <motion.div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                            style={{ backgroundColor: category.color + '20' }}
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {category.icon}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-xs truncate">{category.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {category.subcategories.length} subcategorías
                                            </p>
                                        </div>
                                        {category.id.startsWith('custom-') && (
                                            <div className="flex items-center space-x-1">
                                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                                    Personalizada
                                                </Badge>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onRemoveCustomCategory(category.id)
                                                        }}
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Button
                        variant="outline"
                        onClick={() => setShowModal(true)}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar categoría personalizada
                    </Button>
                </motion.div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Nueva categoría</h3>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCloseModal}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="category-name" className="text-sm font-medium">Nombre</Label>
                                        <Input
                                            id="category-name"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Ej: Viajes, Mascotas..."
                                            className="mt-2"
                                            autoFocus
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Icono</Label>
                                        <div className="grid grid-cols-10 gap-2 mt-2">
                                            {ICON_OPTIONS.map((icon) => (
                                                <motion.button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                                                    className={`w-8 h-8 rounded border-2 flex items-center justify-center text-sm transition-colors ${newCategory.icon === icon
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    {icon}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Color</Label>
                                        <div className="grid grid-cols-5 gap-2 mt-2">
                                            {COLOR_OPTIONS.map((color) => (
                                                <motion.button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                                                    className={`w-8 h-8 rounded border-2 transition-colors ${newCategory.color === color
                                                        ? 'border-primary scale-110'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <motion.div
                                        className="flex-1"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            onClick={handleAddCategory}
                                            className="w-full"
                                            disabled={!newCategory.name.trim()}
                                        >
                                            Agregar categoría
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            variant="outline"
                                            onClick={handleCloseModal}
                                        >
                                            Cancelar
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
} 