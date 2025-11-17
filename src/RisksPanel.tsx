"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, XCircle, Lightbulb, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface RiskFlag {
  id: number
  riskType: string
  severity: string
  description: string
  affectedText: string
  explanation: string
  suggestions: string[] | string | null
  positionStart?: number
  positionEnd?: number
  isResolved: boolean
}

interface RisksPanelProps {
  documentId: number
  onRiskClick?: (risk: RiskFlag) => void
}

export function RisksPanel({ documentId, onRiskClick }: RisksPanelProps) {
  const [risks, setRisks] = useState<RiskFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRisks()
  }, [documentId])

  const fetchRisks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/risks?documentId=${documentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch risks')
      }

      const data = await response.json()
      setRisks(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching risks:', err)
      setError(err.message)
      toast.error('Failed to load risk analysis')
    } finally {
      setLoading(false)
    }
  }

  const resolveRisk = async (riskId: number) => {
    try {
      const response = await fetch(`/api/risks?id=${riskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true })
      })

      if (!response.ok) {
        throw new Error('Failed to resolve risk')
      }

      // Update local state
      setRisks(risks.map(r => 
        r.id === riskId ? { ...r, isResolved: true } : r
      ))

      toast.success('Risk marked as resolved')
    } catch (err: any) {
      console.error('Error resolving risk:', err)
      toast.error('Failed to resolve risk')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />
      case 'medium':
        return <Info className="h-5 w-5" />
      case 'low':
        return <Lightbulb className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getRiskTypeLabel = (riskType: string) => {
    return riskType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const parseSuggestions = (suggestions: string[] | string | null): string[] => {
    if (!suggestions) return []
    if (Array.isArray(suggestions)) return suggestions
    try {
      const parsed = JSON.parse(suggestions)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return [suggestions]
    }
  }

  const unresolvedRisks = risks.filter(r => !r.isResolved)
  const resolvedRisks = risks.filter(r => r.isResolved)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>Loading risk flags...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No risks detected in this document. All sections appear clear and consistent.
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
            <AlertTriangle className="h-5 w-5" />
            Risk Analysis
          </span>
          <Badge variant="secondary">
            {unresolvedRisks.length} Active
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-detected potential issues, ambiguities, and inconsistencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Unresolved Risks */}
        {unresolvedRisks.map((risk) => (
          <Card 
            key={risk.id}
            className={`border-l-4 ${
              risk.severity === 'critical' ? 'border-l-destructive' :
              risk.severity === 'high' ? 'border-l-orange-500' :
              risk.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            } cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => onRiskClick?.(risk)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(risk.severity)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(risk.severity)}>
                        {risk.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {getRiskTypeLabel(risk.riskType)}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm">{risk.description}</h4>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    resolveRisk(risk.id)
                  }}
                >
                  Resolve
                </Button>
              </div>

              {/* Affected Text */}
              <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Affected Text:</p>
                <p className="text-sm italic">"{risk.affectedText}"</p>
              </div>

              {/* Explanation */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">Analysis:</p>
                <p className="text-sm">{risk.explanation}</p>
              </div>

              {/* Suggestions */}
              {parseSuggestions(risk.suggestions).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Suggestions:
                  </p>
                  <ul className="space-y-1">
                    {parseSuggestions(risk.suggestions).map((suggestion, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Resolved Risks */}
        {resolvedRisks.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Resolved ({resolvedRisks.length})
            </h4>
            <div className="space-y-2">
              {resolvedRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="p-3 bg-muted/30 rounded-lg opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{risk.description}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {risk.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
