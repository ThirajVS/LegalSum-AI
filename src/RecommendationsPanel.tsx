"use client"

import { useState, useEffect } from "react"
import { Sparkles, ThumbsUp, ThumbsDown, X, ArrowRight, FileText, Scale, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Recommendation {
  id: number
  recommendationType: string
  title: string
  description: string
  context: any
  documentId?: number
  priority: string
  status: string
  createdAt: string
}

interface RecommendationsPanelProps {
  documentId?: number
  onRecommendationApply?: (recommendation: Recommendation) => void
}

export function RecommendationsPanel({ documentId, onRecommendationApply }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [documentId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const url = documentId 
        ? `/api/recommendations?documentId=${documentId}&status=pending`
        : '/api/recommendations?status=pending'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching recommendations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateRecommendationStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/recommendations?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update recommendation')
      }

      // Update local state
      setRecommendations(recommendations.filter(r => r.id !== id))

      const actionText = status === 'accepted' ? 'accepted' : 
                        status === 'applied' ? 'applied' : 'dismissed'
      toast.success(`Recommendation ${actionText}`)
    } catch (err: any) {
      console.error('Error updating recommendation:', err)
      toast.error('Failed to update recommendation')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template':
        return <FileText className="h-5 w-5" />
      case 'action':
        return <ArrowRight className="h-5 w-5" />
      case 'precedent':
        return <Scale className="h-5 w-5" />
      case 'clarification':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Loading suggestions...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recommendations at this time. The AI will learn from your usage patterns and provide suggestions.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </span>
          <Badge variant="secondary">
            {recommendations.length} Suggestions
          </Badge>
        </CardTitle>
        <CardDescription>
          Smart suggestions based on document analysis and usage patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="bg-gradient-to-r from-primary/5 to-primary/0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(recommendation.recommendationType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(recommendation.recommendationType)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold mb-2">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {recommendation.description}
                    </p>

                    {/* Context Information */}
                    {recommendation.context && Object.keys(recommendation.context).length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Context:</p>
                        <div className="space-y-1">
                          {Object.entries(recommendation.context).map(([key, value]) => (
                            <div key={key} className="text-sm flex items-start gap-2">
                              <span className="font-medium">{key}:</span>
                              <span className="text-muted-foreground">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateRecommendationStatus(recommendation.id, 'applied')
                          onRecommendationApply?.(recommendation)
                        }}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRecommendationStatus(recommendation.id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
