'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CategoryData {
    id: string
    name: string
    icon: string
    color: string
    subcategories: string[]
}

interface OnboardingCompleteProps {
    categories: CategoryData[]
    onComplete: () => void
}

export default function OnboardingComplete({
    categories,
    onComplete
}: OnboardingCompleteProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleFinishOnboarding = async () => {
        setIsLoading(true)

        try {
            const supabase = createClient()
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                toast.error('Error de autenticación', {
                    description: 'No se pudo verificar tu sesión. Por favor, intenta iniciar sesión de nuevo.'
                })
                setIsLoading(false)
                router.push('/login')
                return
            }

            // Prepare categories for insertion
            const categoriesToInsert = categories.map(cat => ({
                user_id: user.id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                is_default: !cat.id.startsWith('custom-')
            }))

            // Insert categories and get their new IDs
            const { data: insertedCategories, error: categoryError } = await supabase
                .from('categories')
                .insert(categoriesToInsert)
                .select('id, name')

            if (categoryError) {
                console.error('Category insertion error:', categoryError)
                toast.error('Error al guardar categorías', {
                    description: 'No se pudieron guardar tus categorías personalizadas. Inténtalo de nuevo.'
                })
                setIsLoading(false)
                return
            }

            // Map original category names to their new UUIDs
            const categoryNameIdMap = insertedCategories.reduce((acc, cat) => {
                acc[cat.name] = cat.id
                return acc
            }, {} as Record<string, string>)

            // Prepare subcategories for insertion
            const subcategoriesToInsert = categories.flatMap(cat => {
                const categoryId = categoryNameIdMap[cat.name]
                if (!categoryId) return [] // Should not happen

                return cat.subcategories.map(subName => ({
                    category_id: categoryId,
                    name: subName
                }))
            })

            if (subcategoriesToInsert.length > 0) {
                const { error: subcategoryError } = await supabase
                    .from('subcategories')
                    .insert(subcategoriesToInsert)

                if (subcategoryError) {
                    console.error('Subcategory insertion error:', subcategoryError)
                    // This is not critical, the user can add them later.
                    // We can decide to show a non-blocking error.
                    toast.warning('Algunas subcategorías no se guardaron', {
                        description: 'Podrás añadirlas manualmente más tarde.'
                    })
                }
            }

            toast.success('¡Configuración completada!', {
                description: 'Tus categorías han sido guardadas. ¡Bienvenido/a!'
            })

            onComplete()

        } catch (error) {
            console.error('Unexpected error:', error)
            toast.error('Error inesperado', {
                description: 'Ocurrió un problema al finalizar la configuración. Por favor, inténtalo de nuevo.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold">¡Estás listo para empezar!</h3>
            <p className="text-muted-foreground">
                Hemos guardado tus preferencias. Ahora puedes empezar a registrar tus gastos y tomar el control de tus finanzas.
            </p>
            <div className="w-full pt-4">
                <Button
                    onClick={handleFinishOnboarding}
                    disabled={isLoading}
                    className="w-full max-w-xs h-12 text-base warm-gradient"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Finalizando...
                        </>
                    ) : (
                        'Ir a mi panel'
                    )}
                </Button>
            </div>
        </div>
    )
} 