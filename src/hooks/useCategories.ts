import { useState, useEffect } from 'react'
import { CategoryService, SubcategoryService } from '@/lib/supabase/categories'
import type { Category, CategoryWithSubcategories, CreateCategoryData, UpdateCategoryData } from '@/types/category'
import type { Subcategory } from '@/types/subcategory'
import { createClient } from '@/lib/supabase/client'

export function useCategories() {
    const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [categoryService, setCategoryService] = useState<CategoryService | null>(null)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCategoryService(new CategoryService(user.id))
        }
        init()
    }, [])

    const fetchCategories = async () => {
        if (!categoryService) return
        try {
            setLoading(true)
            setError(null)
            const data = await categoryService.getAll()
            setCategories(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar categorías')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (categoryService) fetchCategories()
    }, [categoryService])

    const createCategory = async (category: CreateCategoryData) => {
        if (!categoryService) throw new Error('CategoryService not initialized')
        try {
            const newCategory = await categoryService.create(category)
            await fetchCategories() // Refresh to get subcategories
            return newCategory
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al crear categoría')
        }
    }

    const updateCategory = async (id: string, updates: UpdateCategoryData) => {
        if (!categoryService) throw new Error('CategoryService not initialized')
        try {
            const updatedCategory = await categoryService.update(id, updates)
            await fetchCategories() // Refresh to get latest data
            return updatedCategory
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : 'Error al actualizar categoría')
        }
    }

    const deleteCategory = async (id: string) => {
        if (!categoryService) throw new Error('CategoryService not initialized')
        try {
            await categoryService.delete(id)
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
    const [subcategoryService, setSubcategoryService] = useState<SubcategoryService | null>(null)

    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setSubcategoryService(new SubcategoryService(user.id))
        }
        init()
    }, [])

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!categoryId || !subcategoryService) return
            try {
                setLoading(true)
                setError(null)
                const data = await subcategoryService.getByCategory(categoryId)
                setSubcategories(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar subcategorías')
            } finally {
                setLoading(false)
            }
        }
        fetchSubcategories()
    }, [categoryId, subcategoryService])

    return { subcategories, loading, error }
} 