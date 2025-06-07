'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { GoalStats } from '@/types/goal'

interface GoalSummaryProps {
    stats: GoalStats
}

export function GoalSummary({ stats }: GoalSummaryProps) {
    const progressPercentage = stats.total_target > 0
        ? (stats.total_saved / stats.total_target) * 100
        : 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Metas</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_goals}</div>
                    <p className="text-xs text-muted-foreground">
                        Metas registradas
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {stats.achieved_goals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.total_goals > 0
                            ? `${((stats.achieved_goals / stats.total_goals) * 100).toFixed(1)}% completado`
                            : 'Sin metas'
                        }
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ahorrado</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(stats.total_saved)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {progressPercentage.toFixed(1)}% del objetivo total
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.in_progress_goals}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.overdue_goals > 0
                            ? `${stats.overdue_goals} vencidas`
                            : 'Metas activas'
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 