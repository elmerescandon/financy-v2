'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import CategorySelection from '@/components/onboarding/CategorySelection'
import SubcategorySetup from '@/components/onboarding/SubcategorySetup'
import OnboardingComplete from '@/components/onboarding/OnboardingComplete'
import { CategoryData } from '@/components/onboarding/types'
import { defaultCategories } from '@/components/onboarding/constants'

type OnboardingStep = 'categories' | 'subcategories' | 'complete'

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('categories')
    const [selectedCategories, setSelectedCategories] = useState<CategoryData[]>(defaultCategories)
    const [customCategories, setCustomCategories] = useState<CategoryData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [direction, setDirection] = useState(0)

    const handleCategoryToggle = (categoryId: string) => {
        const newSelectedCategories = selectedCategories.map(cat =>
            cat.id === categoryId
                ? { ...cat, isSelected: !cat.isSelected }
                : cat
        )
        setSelectedCategories(newSelectedCategories)
    }

    const handleAddCustomCategory = (category: Omit<CategoryData, 'id' | 'isSelected'>) => {
        const newCategory: CategoryData = {
            ...category,
            id: `custom-${Date.now()}`,
            isSelected: true
        }
        setCustomCategories(prev => [...prev, newCategory])
    }

    const handleRemoveCustomCategory = (categoryId: string) => {
        setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId))
    }

    const handleNext = () => {
        setDirection(1)
        if (currentStep === 'categories') {
            setCurrentStep('subcategories')
        } else if (currentStep === 'subcategories') {
            setCurrentStep('complete')
        }
    }

    const handleBack = () => {
        setDirection(-1)
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 'categories':
                return (
                    <CategorySelection
                        defaultCategories={defaultCategories}
                        customCategories={customCategories}
                        selectedCategories={selectedCategories}
                        onCategoryToggle={handleCategoryToggle}
                        onAddCustomCategory={handleAddCustomCategory}
                        onRemoveCustomCategory={handleRemoveCustomCategory}
                    />
                )
            case 'subcategories':
                return (
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
                )
            case 'complete':
                return (
                    <OnboardingComplete
                        categories={[...selectedCategories, ...customCategories].filter(c => c.isSelected)}
                        onComplete={() => {
                            window.location.href = '/'
                        }}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Fixed Header */}
            <motion.div
                className="flex-shrink-0 p-6 border-b"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                    >
                        <CardTitle className="text-2xl font-bold mb-2">{getStepTitle()}</CardTitle>
                        <CardDescription className="text-base">{getStepDescription()}</CardDescription>
                    </motion.div>

                    <div className="mt-6">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Progress value={getProgress()} className="h-2" />
                        </motion.div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-3">
                            <motion.div
                                className={`text-lg rounded-full px-3 py-1 font-bold transition-all duration-300 ${currentStep === 'categories'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                1
                            </motion.div>
                            <motion.div
                                className={`text-lg rounded-full px-3 py-1 font-bold transition-all duration-300 ${currentStep === 'subcategories'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                2
                            </motion.div>
                            <motion.div
                                className={`text-lg rounded-full px-3 py-1 font-bold transition-all duration-300 ${currentStep === 'complete'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                                whileHover={{ scale: 1.1 }}
                            >
                                3
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full max-w-2xl mx-auto p-6">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x)

                                if (swipe < -swipeConfidenceThreshold && currentStep !== 'complete') {
                                    handleNext()
                                } else if (swipe > swipeConfidenceThreshold && currentStep !== 'categories') {
                                    handleBack()
                                }
                            }}
                            className="h-full"
                        >
                            <div className="h-full overflow-y-auto pr-2">
                                {renderStepContent()}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Fixed Footer */}
            <motion.div
                className="flex-shrink-0 p-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 'categories'}
                                className="flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Anterior
                            </Button>
                        </motion.div>

                        {currentStep !== 'complete' && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    className="flex items-center"
                                >
                                    Siguiente
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
} 