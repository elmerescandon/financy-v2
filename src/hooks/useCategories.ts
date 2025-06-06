import { useState, useEffect } from 'react'
import { CategoryService, SubcategoryService } from '@/lib/supabase/categories'
import type { Category, CategoryWithSubcategories, CreateCategoryData, UpdateCategoryData } from '@/types/category'
import type { Subcategory } from '@/types/subcategory'

export function useCategories() {
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await CategoryService.getAll()
            setCategories(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar categorías')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const createCategory = async (category: CreateCategoryData) => {
        try {
            const newCategory = await CategoryService.create(category)
            await fetchCategories() // Refresh to get subcategories
            return newCategory
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear categoría')
        }
    }

    const updateCategory = async (id: string, updates: UpdateCategoryData) => {
        try {
            const updatedCategory = await CategoryService.update(id, updates)
            await fetchCategories() // Refresh to get latest data
            return updatedCategory
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar categoría')
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            await CategoryService.delete(id)
            setCategories(prev => prev.filter(cat => cat.id !== id))
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al eliminar categoría')
        }
    }

    return {
        categories,
        loading,
        error,
        refresh: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
}

export function useSubcategories(categoryId: string) {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!categoryId) return

            try {
                setLoading(true)
                setError(null)
                const data = await SubcategoryService.getByCategory(categoryId)
                setSubcategories(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar subcategorías')
            } finally {
                setLoading(false)
            }
        }

        fetchSubcategories()
    }, [categoryId])

    return { subcategories, loading, error }
} 