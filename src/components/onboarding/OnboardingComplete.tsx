'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Loader2, PartyPopper, CheckCircle } from 'lucide-react'
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5
        }
    }
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
        <motion.div
            className="flex flex-col items-center justify-center h-full space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="relative"
                variants={itemVariants}
            >
                <motion.div
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.3
                    }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            delay: 0.5,
                            type: "spring",
                            stiffness: 200,
                            damping: 10
                        }}
                    >
                        <CheckCircle className="w-12 h-12 text-primary" />
                    </motion.div>
                </motion.div>

                {/* Success particles effect */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-primary rounded-full"
                            style={{
                                left: '50%',
                                top: '50%',
                                marginLeft: '-4px',
                                marginTop: '-4px'
                            }}
                            initial={{
                                x: 0,
                                y: 0,
                                opacity: 0,
                                scale: 0
                            }}
                            animate={{
                                x: Math.cos(i * 60 * Math.PI / 180) * 40,
                                y: Math.sin(i * 60 * Math.PI / 180) * 40,
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0]
                            }}
                            transition={{
                                delay: 0.8 + i * 0.1,
                                duration: 1.5,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                className="text-center space-y-4"
                variants={itemVariants}
            >
                <motion.h3
                    className="text-3xl font-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    ¡Estás listo para empezar!
                </motion.h3>
                <motion.p
                    className="text-muted-foreground text-lg max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    Hemos guardado tus preferencias. Ahora puedes empezar a registrar tus gastos y tomar el control de tus finanzas.
                </motion.p>
            </motion.div>

            <motion.div
                className="w-full max-w-xs"
                variants={itemVariants}
            >
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        onClick={handleFinishOnboarding}
                        disabled={isLoading}
                        className="w-full h-12 text-base"
                        size="lg"
                    >
                        {isLoading ? (
                            <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Finalizando...
                            </motion.div>
                        ) : (
                            <motion.div
                                className="flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                Ir a mi panel
                            </motion.div>
                        )}
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                className="text-center"
                variants={itemVariants}
            >
                <p className="text-sm text-muted-foreground">
                    Configurado {categories.length} categorías con {categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)} subcategorías
                </p>
            </motion.div>
        </motion.div>
    )
} 