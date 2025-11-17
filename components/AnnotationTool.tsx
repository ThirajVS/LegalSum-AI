"use client"

import { useState, useEffect } from "react"
import { MessageSquarePlus, Tag, AlertCircle, Lightbulb, Star, Trash2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Annotation {
  id: number
  documentId: number
  textSelection: string
  annotationContent: string
  annotationType: string
  positionStart?: number
  positionEnd?: number
  createdAt: string
  updatedAt: string
}

interface AnnotationToolProps {
  documentId: number
  selectedText?: string
  onAnnotationCreate?: (annotation: Annotation) => void
}

export function AnnotationTool({ documentId, selectedText, onAnnotationCreate }: AnnotationToolProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState({
    textSelection: selectedText || '',
    annotationContent: '',
    annotationType: 'note'
  })

  useEffect(() => {
    fetchAnnotations()
  }, [documentId])

  useEffect(() => {
    if (selectedText) {
      setNewAnnotation(prev => ({ ...prev, textSelection: selectedText }))
      setDialogOpen(true)
    }
  }, [selectedText])

  const fetchAnnotations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/annotations?documentId=${documentId}`)
      
      if (response.ok) {
        const data = await response.json()
        setAnnotations(data)
      }
    } catch (err) {
      console.error('Error fetching annotations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newAnnotation.textSelection.trim() || !newAnnotation.annotationContent.trim()) {
      toast.error('Please provide both text selection and annotation content')
      return
    }

    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          textSelection: newAnnotation.textSelection,
          annotationContent: newAnnotation.annotationContent,
          annotationType: newAnnotation.annotationType
        })
      })

      if (!response.ok) throw new Error('Failed to create annotation')

      const created = await response.json()
      setAnnotations(prev => [...prev, created])
      onAnnotationCreate?.(created)
      
      toast.success('Annotation added successfully')
      setDialogOpen(false)
      setNewAnnotation({
        textSelection: '',
        annotationContent: '',
        annotationType: 'note'
      })
    } catch (err: any) {
      console.error('Error creating annotation:', err)
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/annotations?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete annotation')

      setAnnotations(prev => prev.filter(a => a.id !== id))
      toast.success('Annotation deleted')
    } catch (err: any) {
      console.error('Error deleting annotation:', err)
      toast.error(err.message)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'important':
        return <Star className="h-4 w-4" />
      case 'risk':
        return <AlertCircle className="h-4 w-4" />
      case 'clarification':
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'important':
        return 'default'
      case 'risk':
        return 'destructive'
      case 'clarification':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" />
                Annotations
              </CardTitle>
              <CardDescription>
                Tag and annotate important points for quick reference
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading annotations...</p>
          ) : annotations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-3">
                No annotations yet. Start annotating important sections.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Create First Annotation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {annotations.map((annotation) => (
                <Card key={annotation.id} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(annotation.annotationType)}
                        <Badge variant={getTypeColor(annotation.annotationType)}>
                          {getTypeLabel(annotation.annotationType)}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(annotation.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="mb-3 p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Highlighted Text:</p>
                      <p className="text-sm italic">"{annotation.textSelection}"</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Note:</p>
                      <p className="text-sm">{annotation.annotationContent}</p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(annotation.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
            <DialogDescription>
              Annotate important sections for future reference
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Selection</label>
              <Textarea
                value={newAnnotation.textSelection}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, textSelection: e.target.value })}
                placeholder="Paste or type the text you want to annotate..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Annotation Type</label>
              <Select
                value={newAnnotation.annotationType}
                onValueChange={(value) => setNewAnnotation({ ...newAnnotation, annotationType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="clarification">Clarification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Note</label>
              <Textarea
                value={newAnnotation.annotationContent}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, annotationContent: e.target.value })}
                placeholder="Add your notes, comments, or observations..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                Save Annotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
