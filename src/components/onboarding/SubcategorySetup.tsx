'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, ChevronDown, ChevronRight } from 'lucide-react'

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

export default function SubcategorySetup({
    selectedCategories,
    onSubcategoriesUpdate
}: SubcategorySetupProps) {
    const [newSubcategoryInputs, setNewSubcategoryInputs] = useState<Record<string, string>>({})
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

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

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev)
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId)
            } else {
                newSet.add(categoryId)
            }
            return newSet
        })
    }

    return (
        <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="text-center"
                variants={itemVariants}
            >
                <h3 className="text-lg font-semibold mb-2">Personaliza tus subcategorías</h3>
                <p className="text-sm text-muted-foreground">
                    Añade o elimina subcategorías para cada una de tus categorías seleccionadas.
                </p>
            </motion.div>

            <motion.div
                className="space-y-3"
                variants={containerVariants}
            >
                {selectedCategories.map((category) => (
                    <motion.div
                        key={category.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader
                                className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleCategory(category.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                        style={{ backgroundColor: category.color + '20' }}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {category.icon}
                                    </motion.div>
                                    <CardTitle className="text-base font-medium">{category.name}</CardTitle>
                                    <Badge variant="secondary" className="text-xs">
                                        {category.subcategories.length} subcategorías
                                    </Badge>
                                </div>
                                <motion.div
                                    animate={{ rotate: expandedCategories.has(category.id) ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </motion.div>
                            </CardHeader>

                            <AnimatePresence>
                                {expandedCategories.has(category.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <CardContent className="p-4 pt-0 space-y-3 border-t">
                                            <div className="flex flex-wrap gap-2">
                                                <AnimatePresence>
                                                    {category.subcategories.map((sub) => (
                                                        <motion.div
                                                            key={sub}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Badge variant="secondary" className="text-sm py-1 px-2">
                                                                {sub}
                                                                <motion.button
                                                                    onClick={() => handleRemoveSubcategory(category.id, sub)}
                                                                    className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </motion.button>
                                                            </Badge>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                                {category.subcategories.length === 0 && (
                                                    <motion.p
                                                        className="text-xs text-muted-foreground"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        No hay subcategorías.
                                                    </motion.p>
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
                                                    className="flex-1"
                                                />
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAddSubcategory(category.id)}
                                                        disabled={!newSubcategoryInputs[category.id]?.trim()}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {selectedCategories.length === 0 && (
                <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="text-muted-foreground">No hay categorías seleccionadas.</p>
                </motion.div>
            )}
        </motion.div>
    )
} 