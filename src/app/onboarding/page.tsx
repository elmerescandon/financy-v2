'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import CategorySelection from '@/components/onboarding/CategorySelection'
import SubcategorySetup from '@/components/onboarding/SubcategorySetup'
import OnboardingComplete from '@/components/onboarding/OnboardingComplete'

type OnboardingStep = 'categories' | 'subcategories' | 'complete'

interface CategoryData {
    id: string
    name: string
    icon: string
    color: string
    isSelected: boolean
    subcategories: string[]
}

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('categories')
    const [selectedCategories, setSelectedCategories] = useState<CategoryData[]>([])
    const [customCategories, setCustomCategories] = useState<CategoryData[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const defaultCategories: CategoryData[] = [
        { id: 'comida', name: 'Comida y Restaurantes', icon: '🍲', color: '#FF6B6B', isSelected: true, subcategories: ['Supermercado', 'Restaurantes', 'Delivery', 'Café'] },
        { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#4ECDC4', isSelected: true, subcategories: ['Gasolina', 'Transporte público', 'Taxi/Uber', 'Mantenimiento'] },
        { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎭', color: '#96CEB4', isSelected: true, subcategories: ['Cine', 'Conciertos', 'Videojuegos', 'Deportes'] },
        { id: 'servicios', name: 'Servicios y Facturas', icon: '🧾', color: '#FECA57', isSelected: true, subcategories: ['Luz', 'Agua', 'Internet', 'Teléfono', 'Suscripciones'] },
        { id: 'salud', name: 'Salud', icon: '⚕️', color: '#FF9FF3', isSelected: true, subcategories: ['Médico', 'Farmacia', 'Seguro', 'Gimnasio'] },
        { id: 'educacion', name: 'Educación', icon: '📚', color: '#54A0FF', isSelected: true, subcategories: ['Cursos', 'Libros', 'Material escolar', 'Certificaciones'] },
        { id: 'viajes', name: 'Viajes', icon: '✈️', color: '#5F27CD', isSelected: true, subcategories: ['Vuelos', 'Alojamiento', 'Actividades', 'Comida'] },
        { id: 'compras', name: 'Compras', icon: '🛍️', color: '#45B7D1', isSelected: true, subcategories: ['Ropa', 'Electrónicos', 'Hogar', 'Regalos', 'Otros'] }
    ]

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, isSelected: !cat.isSelected }
                    : cat
            )
        )
    }

    const handleAddCustomCategory = (category: Omit<CategoryData, 'id' | 'isSelected'>) => {
        const newCategory: CategoryData = {
            ...category,
            id: `custom-${Date.now()}`,
            isSelected: true
        }
        setCustomCategories(prev => [...prev, newCategory])
    }

    const handleNext = () => {
        if (currentStep === 'categories') {
            setCurrentStep('subcategories')
        } else if (currentStep === 'subcategories') {
            setCurrentStep('complete')
        }
    }

    const handleBack = () => {
        if (currentStep === 'subcategories') {
            setCurrentStep('categories')
        } else if (currentStep === 'complete') {
            setCurrentStep('subcategories')
        }
    }

    const getProgress = () => {
        switch (currentStep) {
            case 'categories': return 33
            case 'subcategories': return 66
            case 'complete': return 100
            default: return 0
        }
    }

    const getStepTitle = () => {
        switch (currentStep) {
            case 'categories': return 'Personaliza tus categorías'
            case 'subcategories': return 'Configura subcategorías'
            case 'complete': return '¡Todo listo!'
            default: return ''
        }
    }

    const getStepDescription = () => {
        switch (currentStep) {
            case 'categories': return 'Selecciona las categorías que usarás para organizar tus gastos'
            case 'subcategories': return 'Personaliza las subcategorías para un mejor control'
            case 'complete': return 'Tu configuración ha sido guardada exitosamente'
            default: return ''
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
                        <CardDescription className="text-base">{getStepDescription()}</CardDescription>

                        <div className="mt-6">
                            <Progress value={getProgress()} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>Paso 1</span>
                                <span>Paso 2</span>
                                <span>Paso 3</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {currentStep === 'categories' && (
                            <CategorySelection
                                defaultCategories={defaultCategories}
                                customCategories={customCategories}
                                onCategoryToggle={handleCategoryToggle}
                                onAddCustomCategory={handleAddCustomCategory}
                            />
                        )}

                        {currentStep === 'subcategories' && (
                            <SubcategorySetup
                                selectedCategories={[...selectedCategories, ...customCategories].filter(c => c.isSelected)}
                                onSubcategoriesUpdate={(categoryId, subcategories) => {
                                    const allCategories = [...selectedCategories, ...customCategories]
                                    const updated = allCategories.map(cat =>
                                        cat.id === categoryId
                                            ? { ...cat, subcategories }
                                            : cat
                                    )
                                    setSelectedCategories(updated.filter(c => !c.id.startsWith('custom-')))
                                    setCustomCategories(updated.filter(c => c.id.startsWith('custom-')))
                                }}
                            />
                        )}

                        {currentStep === 'complete' && (
                            <OnboardingComplete
                                categories={[...selectedCategories, ...customCategories].filter(c => c.isSelected)}
                                onComplete={() => {
                                    // Redirect to home after completion
                                    window.location.href = '/'
                                }}
                            />
                        )}

                        <div className="flex justify-between pt-6">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 'categories'}
                                className="flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Anterior
                            </Button>

                            {currentStep !== 'complete' && (
                                <Button
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    className="flex items-center"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 