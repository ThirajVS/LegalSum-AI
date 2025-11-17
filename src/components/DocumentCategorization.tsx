"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FolderOpen, 
  FileText, 
  Scale, 
  FileCheck, 
  Users, 
  Mic,
  RefreshCw
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DocumentCategory {
  id: number
  documentId: number
  category: 'contract' | 'fir' | 'charge_sheet' | 'case_record' | 'witness_statement' | 'audio_transcript' | 'other'
  subcategory: string | null
  confidenceScore: number
  suggestedWorkflow: Record<string, any> | null
  autoDetected: boolean
  createdAt: string
}

interface DocumentCategorizationProps {
  documentId: number
  documentContent?: string
  onCategorized?: (category: DocumentCategory) => void
}

export const DocumentCategorization = ({ 
  documentId, 
  documentContent = "",
  onCategorized
}: DocumentCategorizationProps) => {
  const [category, setCategory] = useState<DocumentCategory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const categoryConfig = {
    contract: {
      icon: FileCheck,
      label: "Contract",
      color: "bg-blue-500/10 text-blue-500",
      workflow: ["Review terms", "Verify parties", "Check clauses", "Identify obligations"]
    },
    fir: {
      icon: Scale,
      label: "FIR (First Information Report)",
      color: "bg-red-500/10 text-red-500",
      workflow: ["Extract incident details", "Identify parties", "List charges", "Timeline analysis"]
    },
    charge_sheet: {
      icon: FileText,
      label: "Charge Sheet",
      color: "bg-orange-500/10 text-orange-500",
      workflow: ["List charges", "Verify evidence", "Check legal sections", "Review prosecution case"]
    },
    case_record: {
      icon: FolderOpen,
      label: "Case Record",
      color: "bg-purple-500/10 text-purple-500",
      workflow: ["Extract case details", "Timeline of events", "List all parties", "Review proceedings"]
    },
    witness_statement: {
      icon: Users,
      label: "Witness Statement",
      color: "bg-green-500/10 text-green-500",
      workflow: ["Identify witness", "Extract testimony", "Verify dates", "Cross-reference with case"]
    },
    audio_transcript: {
      icon: Mic,
      label: "Audio Transcript",
      color: "bg-yellow-500/10 text-yellow-500",
      workflow: ["Review transcription", "Identify speakers", "Extract key points", "Timestamp analysis"]
    },
    other: {
      icon: FileText,
      label: "Other Document",
      color: "bg-gray-500/10 text-gray-500",
      workflow: ["Manual review", "Content analysis", "Classification needed"]
    }
  }

  useEffect(() => {
    if (documentId) {
      fetchCategory()
    }
  }, [documentId])

  const fetchCategory = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/categories?documentId=${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
        onCategorized?.(data)
      } else if (response.status === 404) {
        // No category yet, auto-analyze if content available
        if (documentContent) {
          categorizeDocument()
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categorizeDocument = async () => {
    if (!documentContent) return

    setIsAnalyzing(true)
    try {
      // Simulate AI-powered document categorization
      const lowerContent = documentContent.toLowerCase()
      let detectedCategory: DocumentCategory['category'] = 'other'
      let confidenceScore = 0.5
      let subcategory: string | null = null

      // Pattern matching for categorization
      if (lowerContent.includes('first information report') || 
          lowerContent.includes('fir no') || 
          lowerContent.includes('police station')) {
        detectedCategory = 'fir'
        confidenceScore = 0.92
        subcategory = 'Criminal'
      } else if (lowerContent.includes('charge sheet') || 
                 lowerContent.includes('chargesheet') ||
                 lowerContent.includes('section 173')) {
        detectedCategory = 'charge_sheet'
        confidenceScore = 0.88
      } else if (lowerContent.includes('witness') && 
                 (lowerContent.includes('statement') || lowerContent.includes('testimony'))) {
        detectedCategory = 'witness_statement'
        confidenceScore = 0.85
      } else if (lowerContent.includes('contract') || 
                 lowerContent.includes('agreement') ||
                 lowerContent.includes('parties hereby agree')) {
        detectedCategory = 'contract'
        confidenceScore = 0.90
        
        // Detect contract subcategory
        if (lowerContent.includes('employment')) subcategory = 'Employment'
        else if (lowerContent.includes('lease') || lowerContent.includes('rent')) subcategory = 'Lease'
        else if (lowerContent.includes('sale') || lowerContent.includes('purchase')) subcategory = 'Sale/Purchase'
      } else if (lowerContent.includes('case no') || 
                 lowerContent.includes('judgment') ||
                 lowerContent.includes('order')) {
        detectedCategory = 'case_record'
        confidenceScore = 0.80
      } else if (lowerContent.includes('[audio transcription]') ||
                 lowerContent.includes('transcript of')) {
        detectedCategory = 'audio_transcript'
        confidenceScore = 0.95
      }

      // Generate suggested workflow
      const suggestedWorkflow = {
        steps: categoryConfig[detectedCategory].workflow,
        estimatedTime: '15-30 minutes',
        priority: confidenceScore > 0.8 ? 'high' : 'medium'
      }

      // Save categorization to database
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          category: detectedCategory,
          subcategory,
          confidenceScore,
          suggestedWorkflow,
          autoDetected: true
        })
      })

      if (response.ok) {
        const savedCategory = await response.json()
        setCategory(savedCategory)
        onCategorized?.(savedCategory)
      }
    } catch (error) {
      console.error('Error categorizing document:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateCategory = async (newCategory: DocumentCategory['category']) => {
    try {
      if (!category) return

      const response = await fetch(`/api/categories?id=${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategory,
          confidenceScore: 1.0, // Manual override has full confidence
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setCategory(updated)
        onCategorized?.(updated)
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  if (isLoading || isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Classification
          </CardTitle>
          <CardDescription>
            {isAnalyzing ? 'Analyzing document...' : 'Loading classification...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!category) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Document Classification
          </CardTitle>
          <CardDescription>
            Automatically categorize document type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {documentContent 
                ? "Ready to analyze document type" 
                : "Upload a document to begin classification"}
            </p>
            <Button 
              onClick={categorizeDocument} 
              disabled={!documentContent}
            >
              Analyze Document Type
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = categoryConfig[category.category]
  const CategoryIcon = config.icon

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Document Classification
            </CardTitle>
            <CardDescription>
              Automatic categorization and workflow suggestions
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={categorizeDocument}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Re-analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Category */}
        <div className={`p-4 rounded-lg ${config.color} border`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-full bg-background/50">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{config.label}</h3>
              {category.subcategory && (
                <p className="text-sm text-muted-foreground">{category.subcategory}</p>
              )}
            </div>
            <div className="text-right">
              <Badge variant={category.autoDetected ? "secondary" : "default"}>
                {category.autoDetected ? 'Auto-detected' : 'Manual'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round(category.confidenceScore * 100)}% confident
              </div>
            </div>
          </div>
        </div>

        {/* Change Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Override Category</label>
          <Select
            value={category.category}
            onValueChange={(value: DocumentCategory['category']) => updateCategory(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, conf]) => {
                const Icon = conf.icon
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {conf.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Suggested Workflow */}
        {category.suggestedWorkflow && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Workflow</h4>
            <div className="space-y-2">
              {config.workflow.map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
                >
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            {category.suggestedWorkflow.estimatedTime && (
              <p className="text-xs text-muted-foreground mt-2">
                Estimated time: {category.suggestedWorkflow.estimatedTime}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
