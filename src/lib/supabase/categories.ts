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
    private userId: string
    constructor(userId: string) {
        if (!userId) throw new Error('CategoryService requires a userId')
        this.userId = userId
    }
    // Get all categories with subcategories
    async getAll() {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .eq('user_id', this.userId)
            .order('name')

        if (error) throw error
        return data as CategoryWithSubcategories[]
    }
    // Get category by ID with subcategories
    async getById(id: string) {
        const { data, error } = await supabase
            .from('categories')
            .select(`
        *,
        subcategories (*)
      `)
            .eq('id', id)
            .eq('user_id', this.userId)
            .single()

        if (error) throw error
        return data as CategoryWithSubcategories
    }
    // Create category
    async create(category: CreateCategoryData) {
        const { data, error } = await supabase
            .from('categories')
            .insert({ ...category, user_id: this.userId })
            .select()
            .single()

        if (error) throw error
        return data as Category
    }
    // Update category
    async update(id: string, updates: UpdateCategoryData) {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .eq('user_id', this.userId)
            .select()
            .single()

        if (error) throw error
        return data as Category
    }
    // Delete category
    async delete(id: string) {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', this.userId)

        if (error) throw error
    }
}

export class SubcategoryService {
    private userId: string
    constructor(userId: string) {
        if (!userId) throw new Error('SubcategoryService requires a userId')
        this.userId = userId
    }
    // Get subcategories by category
    async getByCategory(categoryId: string) {
        const { data, error } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', categoryId)
            .eq('user_id', this.userId)
            .order('name')

        if (error) throw error
        return data as Subcategory[]
    }
    // Create subcategory
    async create(subcategory: CreateSubcategoryData) {
        const { data, error } = await supabase
            .from('subcategories')
            .insert({ ...subcategory, user_id: this.userId })
            .select()
            .single()

        if (error) throw error
        return data as Subcategory
    }
    // Update subcategory
    async update(id: string, updates: UpdateSubcategoryData) {
        const { data, error } = await supabase
            .from('subcategories')
            .update(updates)
            .eq('id', id)
            .eq('user_id', this.userId)
            .select()
            .single()

        if (error) throw error
        return data as Subcategory
    }
    // Delete subcategory
    async delete(id: string) {
        const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', id)
            .eq('user_id', this.userId)

        if (error) throw error
    }
} 