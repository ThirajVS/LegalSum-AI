"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Lightbulb, 
  TrendingUp, 
  FileText, 
  Scale, 
  HelpCircle,
  Check,
  X,
  AlertCircle
} from "lucide-react"

interface Recommendation {
  id: number
  recommendationType: 'template' | 'action' | 'precedent' | 'clarification'
  title: string
  description: string
  context: Record<string, any>
  documentId: number | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'accepted' | 'dismissed' | 'applied'
  createdAt: string
}

interface SmartRecommendationsProps {
  documentId?: number
  documentType?: string
  userHistory?: any[]
}

export const SmartRecommendations = ({ 
  documentId, 
  documentType,
  userHistory = []
}: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const recommendationTypeConfig = {
    template: {
      icon: FileText,
      label: "Template Suggestion",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    action: {
      icon: TrendingUp,
      label: "Next Action",
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    precedent: {
      icon: Scale,
      label: "Precedent",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    clarification: {
      icon: HelpCircle,
      label: "Clarification Needed",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  }

  const priorityConfig = {
    high: { label: "High", variant: "destructive" as const, icon: AlertCircle },
    medium: { label: "Medium", variant: "default" as const, icon: AlertCircle },
    low: { label: "Low", variant: "secondary" as const, icon: AlertCircle }
  }

  useEffect(() => {
    if (documentId) {
      fetchRecommendations()
    } else {
      generateSmartRecommendations()
    }
  }, [documentId])

  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const url = documentId 
        ? `/api/recommendations?documentId=${documentId}&status=pending`
        : '/api/recommendations?status=pending'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSmartRecommendations = async () => {
    setIsGenerating(true)
    try {
      // Simulate AI-powered recommendation generation
      const generatedRecommendations: Omit<Recommendation, 'id' | 'createdAt'>[] = []

      // Template recommendations based on document type
      if (documentType === 'contract' || !documentType) {
        generatedRecommendations.push({
          recommendationType: 'template',
          title: 'Use Contract Summary Template',
          description: 'You frequently summarize contracts. We recommend using the "Standard Contract Template" for consistent analysis.',
          context: { 
            templateType: 'contract',
            reason: 'User processes many contracts',
            confidence: 0.85 
          },
          documentId: documentId || null,
          priority: 'medium',
          status: 'pending'
        })
      }

      // Action recommendations
      generatedRecommendations.push({
        recommendationType: 'action',
        title: 'Verify Entity Cross-References',
        description: 'Cross-reference all mentioned entities with supporting documentation to ensure accuracy.',
        context: { 
          action: 'verification',
          expectedTime: '10-15 minutes' 
        },
        documentId: documentId || null,
        priority: 'high',
        status: 'pending'
      })

      // Clarification recommendations
      if (documentType === 'fir') {
        generatedRecommendations.push({
          recommendationType: 'clarification',
          title: 'Missing Witness Statements',
          description: 'This FIR appears to reference witnesses but no witness statements are attached. Consider requesting these documents.',
          context: { 
            missingDocuments: ['witness_statements'],
            criticality: 'high' 
          },
          documentId: documentId || null,
          priority: 'high',
          status: 'pending'
        })
      }

      // Precedent recommendations
      generatedRecommendations.push({
        recommendationType: 'precedent',
        title: 'Similar Case Pattern Detected',
        description: 'Based on document patterns, this case shares similarities with 3 previous cases you processed. Review for precedent.',
        context: { 
          similarCases: 3,
          matchScore: 0.78,
          suggestedAction: 'review_precedents' 
        },
        documentId: documentId || null,
        priority: 'medium',
        status: 'pending'
      })

      // Save generated recommendations to database
      for (const rec of generatedRecommendations) {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rec)
        })

        if (response.ok) {
          const saved = await response.json()
          setRecommendations(prev => [...prev, saved])
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateRecommendationStatus = async (
    recommendationId: number, 
    status: 'accepted' | 'dismissed' | 'applied'
  ) => {
    try {
      const response = await fetch(`/api/recommendations?id=${recommendationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setRecommendations(prev => prev.filter(r => r.id !== recommendationId))
      }
    } catch (error) {
      console.error('Error updating recommendation:', error)
    }
  }

  const pendingRecommendations = recommendations.filter(r => r.status === 'pending')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions based on your workflow and document patterns
            </CardDescription>
          </div>
          <Button 
            onClick={generateSmartRecommendations} 
            disabled={isGenerating}
            size="sm"
            variant="outline"
          >
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : pendingRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No active recommendations at the moment.
            </p>
            <Button onClick={generateSmartRecommendations} variant="outline">
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {pendingRecommendations.map(recommendation => {
                const typeConfig = recommendationTypeConfig[recommendation.recommendationType]
                const priorityConf = priorityConfig[recommendation.priority]
                const TypeIcon = typeConfig.icon

                return (
                  <div
                    key={recommendation.id}
                    className={`border rounded-lg p-4 ${typeConfig.bg} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-full ${typeConfig.bg}`}>
                        <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {typeConfig.label}
                          </Badge>
                          <Badge variant={priorityConf.variant} className="text-xs">
                            {priorityConf.label} Priority
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{recommendation.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>

                    {/* Context Information */}
                    {recommendation.context && Object.keys(recommendation.context).length > 0 && (
                      <div className="mb-3 p-2 bg-background/50 rounded text-xs">
                        {recommendation.context.confidence && (
                          <div className="mb-1">
                            Confidence: {Math.round(recommendation.context.confidence * 100)}%
                          </div>
                        )}
                        {recommendation.context.expectedTime && (
                          <div className="mb-1">
                            Est. Time: {recommendation.context.expectedTime}
                          </div>
                        )}
                        {recommendation.context.similarCases && (
                          <div className="mb-1">
                            {recommendation.context.similarCases} similar cases found
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateRecommendationStatus(recommendation.id, 'accepted')}
                        className="flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                        className="flex-1"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
