"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle, Info, XCircle, Lightbulb } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface RiskFlag {
  id: number
  riskType: 'inconsistency' | 'missing_section' | 'ambiguity' | 'misinformation' | 'contradiction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedText: string
  explanation: string
  suggestions: string[]
  isResolved: boolean
}

interface RiskDetectionProps {
  documentId: number
  documentContent?: string
  autoDetect?: boolean
}

export const RiskDetection = ({ documentId, documentContent = "", autoDetect = true }: RiskDetectionProps) => {
  const [risks, setRisks] = useState<RiskFlag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const severityConfig = {
    critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Critical" },
    high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", label: "High" },
    medium: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medium" },
    low: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", label: "Low" }
  }

  const riskTypeLabels = {
    inconsistency: "Inconsistency",
    missing_section: "Missing Section",
    ambiguity: "Ambiguity",
    misinformation: "Potential Misinformation",
    contradiction: "Contradiction"
  }

  useEffect(() => {
    if (documentId) {
      fetchRisks()
    }
  }, [documentId])

  useEffect(() => {
    if (autoDetect && documentContent && risks.length === 0) {
      analyzeDocument()
    }
  }, [documentContent, autoDetect])

  const fetchRisks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/risks?documentId=${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setRisks(data)
      }
    } catch (error) {
      console.error('Error fetching risks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeDocument = async () => {
    if (!documentContent) return

    setIsAnalyzing(true)
    try {
      // Simulate AI-powered risk detection
      const detectedRisks: Omit<RiskFlag, 'id' | 'isResolved'>[] = []

      // Check for missing sections
      const requiredSections = ['case details', 'parties', 'evidence', 'charges', 'date']
      const missingRequiredSections = requiredSections.filter(
        section => !documentContent.toLowerCase().includes(section)
      )

      if (missingRequiredSections.length > 0) {
        detectedRisks.push({
          riskType: 'missing_section',
          severity: 'high',
          description: `Missing required sections: ${missingRequiredSections.join(', ')}`,
          affectedText: 'Document structure',
          explanation: 'Legal documents should contain all mandatory sections for completeness and evidentiary value.',
          suggestions: [
            `Add the following sections: ${missingRequiredSections.join(', ')}`,
            'Ensure each section contains relevant and complete information',
            'Cross-reference with standard legal document templates'
          ]
        })
      }

      // Check for ambiguous dates
      const datePattern = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g
      const dates = documentContent.match(datePattern)
      if (dates && dates.length > 0) {
        const ambiguousDates = dates.filter(date => {
          const parts = date.split(/[/-]/)
          return parseInt(parts[0]) > 12 && parseInt(parts[1]) > 12
        })

        if (ambiguousDates.length > 0) {
          detectedRisks.push({
            riskType: 'ambiguity',
            severity: 'medium',
            description: 'Ambiguous date formats detected',
            affectedText: ambiguousDates.join(', '),
            explanation: 'Date formats like DD/MM/YYYY vs MM/DD/YYYY can cause confusion and legal disputes.',
            suggestions: [
              'Use ISO format (YYYY-MM-DD) for clarity',
              'Spell out month names (e.g., 15 January 2024)',
              'Ensure consistency throughout the document'
            ]
          })
        }
      }

      // Check for contradictions (simple keyword-based)
      const contradictionPatterns = [
        { words: ['innocent', 'guilty'], severity: 'critical' as const },
        { words: ['before', 'after'], severity: 'medium' as const },
        { words: ['present', 'absent'], severity: 'low' as const }
      ]

      contradictionPatterns.forEach(pattern => {
        const hasAll = pattern.words.every(word => 
          documentContent.toLowerCase().includes(word)
        )
        if (hasAll) {
          detectedRisks.push({
            riskType: 'contradiction',
            severity: pattern.severity,
            description: `Potential contradiction with terms: ${pattern.words.join(' and ')}`,
            affectedText: `References to: ${pattern.words.join(', ')}`,
            explanation: 'Contradictory statements can undermine the credibility of the document.',
            suggestions: [
              'Review context of each usage',
              'Ensure timeline consistency',
              'Clarify any apparent contradictions with additional context'
            ]
          })
        }
      })

      // Check for vague language
      const vagueTerms = ['approximately', 'around', 'possibly', 'maybe', 'unclear']
      const foundVagueTerms = vagueTerms.filter(term => 
        documentContent.toLowerCase().includes(term)
      )

      if (foundVagueTerms.length >= 3) {
        detectedRisks.push({
          riskType: 'ambiguity',
          severity: 'medium',
          description: 'Excessive use of vague or uncertain language',
          affectedText: foundVagueTerms.join(', '),
          explanation: 'Legal documents should be precise and definitive. Vague language can create interpretation issues.',
          suggestions: [
            'Replace approximate terms with specific values',
            'Use definitive language where possible',
            'Qualify uncertain statements with context'
          ]
        })
      }

      // Save detected risks to database
      if (detectedRisks.length > 0) {
        const response = await fetch('/api/risks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            detectedRisks.map(risk => ({
              ...risk,
              documentId,
              suggestions: JSON.stringify(risk.suggestions)
            }))
          )
        })

        if (response.ok) {
          const savedRisks = await response.json()
          setRisks(savedRisks)
        }
      }
    } catch (error) {
      console.error('Error analyzing document:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resolveRisk = async (riskId: number) => {
    try {
      const response = await fetch(`/api/risks?id=${riskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true })
      })

      if (response.ok) {
        setRisks(prev => prev.map(r => 
          r.id === riskId ? { ...r, isResolved: true } : r
        ))
      }
    } catch (error) {
      console.error('Error resolving risk:', error)
    }
  }

  const unresolvedRisks = risks.filter(r => !r.isResolved)
  const resolvedRisks = risks.filter(r => r.isResolved)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>Loading risk assessment...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Analysis
            </CardTitle>
            <CardDescription>
              AI-detected potential issues and recommendations
            </CardDescription>
          </div>
          <Button 
            onClick={analyzeDocument} 
            disabled={isAnalyzing || !documentContent}
            size="sm"
          >
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {unresolvedRisks.length === 0 && resolvedRisks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {documentContent 
                ? "No risks detected. Document appears to be well-structured." 
                : "Upload and process a document to begin risk analysis."}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {/* Unresolved Risks */}
              {unresolvedRisks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Active Risks ({unresolvedRisks.length})
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {unresolvedRisks.map((risk, index) => {
                      const SeverityIcon = severityConfig[risk.severity].icon
                      return (
                        <AccordionItem 
                          key={risk.id} 
                          value={`risk-${risk.id}`}
                          className="border rounded-lg"
                        >
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3 w-full">
                              <div className={`p-2 rounded-full ${severityConfig[risk.severity].bg}`}>
                                <SeverityIcon className={`h-4 w-4 ${severityConfig[risk.severity].color}`} />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium">{risk.description}</div>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {riskTypeLabels[risk.riskType]}
                                  </Badge>
                                  <Badge 
                                    variant={risk.severity === 'critical' || risk.severity === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {severityConfig[risk.severity].label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Affected Content:</p>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                  {risk.affectedText}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Explanation:</p>
                                <p className="text-sm text-muted-foreground">{risk.explanation}</p>
                              </div>
                              {risk.suggestions && risk.suggestions.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" />
                                    Recommendations:
                                  </p>
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {risk.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-primary mt-1">•</span>
                                        <span>{suggestion}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => resolveRisk(risk.id)}
                                className="w-full"
                              >
                                Mark as Resolved
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              )}

              {/* Resolved Risks */}
              {resolvedRisks.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resolved ({resolvedRisks.length})
                  </h3>
                  <div className="space-y-2">
                    {resolvedRisks.map(risk => (
                      <div 
                        key={risk.id}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm line-through text-muted-foreground">
                            {risk.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
