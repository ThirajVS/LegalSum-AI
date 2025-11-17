"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  StickyNote, 
  AlertTriangle, 
  Star, 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2,
  Check,
  X
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Annotation {
  id: number
  textSelection: string
  annotationContent: string
  annotationType: 'important' | 'risk' | 'clarification' | 'note'
  positionStart?: number
  positionEnd?: number
  createdAt: string
  updatedAt: string
}

interface AnnotationSystemProps {
  documentId: number
  documentContent?: string
}

export const AnnotationSystem = ({ documentId, documentContent = "" }: AnnotationSystemProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null)
  
  const [formData, setFormData] = useState({
    textSelection: '',
    annotationContent: '',
    annotationType: 'note' as Annotation['annotationType']
  })

  const annotationTypeConfig = {
    important: {
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      label: 'Important',
      variant: 'default' as const
    },
    risk: {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      label: 'Risk',
      variant: 'destructive' as const
    },
    clarification: {
      icon: HelpCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Clarification',
      variant: 'secondary' as const
    },
    note: {
      icon: StickyNote,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      label: 'Note',
      variant: 'outline' as const
    }
  }

  useEffect(() => {
    if (documentId) {
      fetchAnnotations()
    }
  }, [documentId])

  const fetchAnnotations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/annotations?documentId=${documentId}`)
      if (response.ok) {
        const data = await response.json()
        setAnnotations(data)
      }
    } catch (error) {
      console.error('Error fetching annotations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openNewAnnotationDialog = () => {
    setEditingAnnotation(null)
    setFormData({
      textSelection: '',
      annotationContent: '',
      annotationType: 'note'
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (annotation: Annotation) => {
    setEditingAnnotation(annotation)
    setFormData({
      textSelection: annotation.textSelection,
      annotationContent: annotation.annotationContent,
      annotationType: annotation.annotationType
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.textSelection.trim() || !formData.annotationContent.trim()) {
      return
    }

    try {
      if (editingAnnotation) {
        // Update existing annotation
        const response = await fetch(`/api/annotations?id=${editingAnnotation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            annotationContent: formData.annotationContent,
            annotationType: formData.annotationType
          })
        })

        if (response.ok) {
          const updated = await response.json()
          setAnnotations(prev => prev.map(a => 
            a.id === updated.id ? updated : a
          ))
        }
      } else {
        // Create new annotation
        const response = await fetch('/api/annotations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            textSelection: formData.textSelection,
            annotationContent: formData.annotationContent,
            annotationType: formData.annotationType
          })
        })

        if (response.ok) {
          const newAnnotation = await response.json()
          setAnnotations(prev => [...prev, newAnnotation])
        }
      }

      setIsDialogOpen(false)
      setFormData({
        textSelection: '',
        annotationContent: '',
        annotationType: 'note'
      })
    } catch (error) {
      console.error('Error saving annotation:', error)
    }
  }

  const handleDelete = async (annotationId: number) => {
    try {
      const response = await fetch(`/api/annotations?id=${annotationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId))
      }
    } catch (error) {
      console.error('Error deleting annotation:', error)
    }
  }

  const groupedAnnotations = annotations.reduce((acc, annotation) => {
    if (!acc[annotation.annotationType]) {
      acc[annotation.annotationType] = []
    }
    acc[annotation.annotationType].push(annotation)
    return acc
  }, {} as Record<string, Annotation[]>)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Annotations
              </CardTitle>
              <CardDescription>
                Tag and annotate important sections for quick reference
              </CardDescription>
            </div>
            <Button onClick={openNewAnnotationDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Annotation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : annotations.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No annotations yet. Start highlighting important sections!
              </p>
              <Button onClick={openNewAnnotationDialog} variant="outline">
                Create First Annotation
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedAnnotations).map(([type, typeAnnotations]) => {
                  const config = annotationTypeConfig[type as Annotation['annotationType']]
                  const Icon = config.icon

                  return (
                    <div key={type}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label} ({typeAnnotations.length})
                      </h3>
                      <div className="space-y-3">
                        {typeAnnotations.map(annotation => (
                          <div
                            key={annotation.id}
                            className={`border rounded-lg p-4 ${config.bg} hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={config.variant} className="text-xs">
                                    {config.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(annotation.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm font-medium mb-2 bg-background/50 p-2 rounded">
                                  "{annotation.textSelection}"
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {annotation.annotationContent}
                                </p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openEditDialog(annotation)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(annotation.id)}
                                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnotation ? 'Edit Annotation' : 'Add New Annotation'}
            </DialogTitle>
            <DialogDescription>
              Highlight important sections and add your notes for future reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Text</label>
              <Textarea
                placeholder="Select or paste the text you want to annotate..."
                value={formData.textSelection}
                onChange={(e) => setFormData(prev => ({ ...prev, textSelection: e.target.value }))}
                rows={3}
                disabled={!!editingAnnotation}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Annotation Type</label>
              <Select
                value={formData.annotationType}
                onValueChange={(value: Annotation['annotationType']) => 
                  setFormData(prev => ({ ...prev, annotationType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(annotationTypeConfig).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Note</label>
              <Textarea
                placeholder="Add your annotation or note here..."
                value={formData.annotationContent}
                onChange={(e) => setFormData(prev => ({ ...prev, annotationContent: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.textSelection.trim() || !formData.annotationContent.trim()}
            >
              <Check className="h-4 w-4 mr-2" />
              {editingAnnotation ? 'Update' : 'Save'} Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
