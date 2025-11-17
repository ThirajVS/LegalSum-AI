"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Template {
  id: number
  name: string
  description?: string
  templateType: string
  sections: string[]
  keywords?: string[]
  formatPreferences?: any
  isDefault: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface TemplateManagerProps {
  onTemplateSelect?: (template: Template) => void
}

export function TemplateManager({ onTemplateSelect }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'custom',
    sections: '',
    keywords: ''
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const sections = formData.sections.split('\n').filter(s => s.trim())
      const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k)

      const payload = {
        name: formData.name,
        description: formData.description || null,
        templateType: formData.templateType,
        sections,
        keywords: keywords.length > 0 ? keywords : null
      }

      const url = editingTemplate 
        ? `/api/templates?id=${editingTemplate.id}`
        : '/api/templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to save template')

      toast.success(editingTemplate ? 'Template updated' : 'Template created')
      setDialogOpen(false)
      resetForm()
      fetchTemplates()
    } catch (err: any) {
      console.error('Error saving template:', err)
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete template')

      toast.success('Template deleted')
      fetchTemplates()
    } catch (err: any) {
      console.error('Error deleting template:', err)
      toast.error(err.message)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description || '',
      templateType: template.templateType,
      sections: template.sections.join('\n'),
      keywords: template.keywords?.join(', ') || ''
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      templateType: 'custom',
      sections: '',
      keywords: ''
    })
  }

  const handleUseTemplate = async (template: Template) => {
    try {
      // Increment usage count
      await fetch(`/api/templates?id=${template.id}`, {
        method: 'PATCH'
      })
      
      onTemplateSelect?.(template)
      toast.success(`Using template: ${template.name}`)
      fetchTemplates() // Refresh to show updated usage count
    } catch (err) {
      console.error('Error using template:', err)
    }
  }

  const getTemplateTypeLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Templates
            </CardTitle>
            <CardDescription>
              Create and manage custom summarization templates
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
                <DialogDescription>
                  Define sections, keywords, and formatting preferences
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Contract Summary Template"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of template purpose"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select
                    value={formData.templateType}
                    onValueChange={(value) => setFormData({ ...formData, templateType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="fir">FIR</SelectItem>
                      <SelectItem value="case_record">Case Record</SelectItem>
                      <SelectItem value="witness_statement">Witness Statement</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sections">Sections (one per line)</Label>
                  <Textarea
                    id="sections"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                    placeholder="Executive Summary&#10;Key Terms&#10;Parties Involved&#10;Obligations&#10;Liabilities"
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="contract, agreement, liability, obligations"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No templates yet. Create your first template to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline">
                          {getTemplateTypeLabel(template.templateType)}
                        </Badge>
                        {template.isDefault && (
                          <Badge>Default</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Used {template.usageCount}×
                        </Badge>
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.sections.slice(0, 4).map((section, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                        {template.sections.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.sections.length - 4} more
                          </Badge>
                        )}
                      </div>

                      {template.keywords && template.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {template.keywords.slice(0, 5).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
