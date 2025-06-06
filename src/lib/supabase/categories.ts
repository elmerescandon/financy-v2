import { createClient } from './client'
import type { Category, CategoryWithSubcategories, CreateCategoryData, UpdateCategoryData } from '@/types/category'
import type { Subcategory } from '@/types/subcategory'

const supabase = createClient()

// Create missing subcategory types
interface CreateSubcategoryData {
    name: string
    category_id: string
}

interface UpdateSubcategoryData {
    name?: string
}

export class CategoryService {
    // Get all categories with subcategories
    static async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .order('name')

        if (error) throw error
        return data as CategoryWithSubcategories[]
    }

    // Get category by ID with subcategories
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data as CategoryWithSubcategories
    }

    // Create category
    static async create(category: CreateCategoryData) {
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select()
            .single()

        if (error) throw error
        return data as Category
    }

    // Update category
    static async update(id: string, updates: UpdateCategoryData) {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Category
    }

    // Delete category
    static async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

export class SubcategoryService {
    // Get subcategories by category
    static async getByCategory(categoryId: string) {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', categoryId)
            .order('name')

        if (error) throw error
        return data as Subcategory[]
    }

    // Create subcategory
    static async create(subcategory: CreateSubcategoryData) {
        const { data, error } = await supabase
            .from('subcategories')
            .insert(subcategory)
            .select()
            .single()

        if (error) throw error
        return data as Subcategory
    }

    // Update subcategory
    static async update(id: string, updates: UpdateSubcategoryData) {
        const { data, error } = await supabase
            .from('subcategories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Subcategory
    }

    // Delete subcategory
    static async delete(id: string) {
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
} 