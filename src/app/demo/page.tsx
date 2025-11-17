"use client"

import { useState, useCallback } from "react"
import { Upload, FileText, FileIcon, Mic, Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { RisksPanel } from "@/components/RisksPanel"
import { RecommendationsPanel } from "@/components/RecommendationsPanel"
import { ChatAssistant } from "@/components/ChatAssistant"
import { AnnotationTool } from "@/components/AnnotationTool"
import { toast } from "sonner"

// Configuration: Set to true to use real Python backend
const USE_REAL_BACKEND = true // Set to true when Python service is running
const PYTHON_SERVICE_URL = "http://localhost:8000"

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [documentId, setDocumentId] = useState<number | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
      setError(null)
      setDocumentId(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setResults(null)
      setError(null)
      setDocumentId(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const processDocument = async () => {
    if (!file) {
      toast.error("Please select a file first")
      return
    }

    setProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: Create document record in database
      setProgress(20)
      const fileType = file.name.endsWith('.pdf') ? 'pdf' : 
                      file.name.endsWith('.docx') ? 'docx' : 'audio'
      
      const createDocResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `doc_${Date.now()}_${file.name}`,
          originalFilename: file.name,
          fileType,
          fileSize: file.size,
          filePath: `/uploads/${Date.now()}_${file.name}`,
        })
      })

      if (!createDocResponse.ok) {
        throw new Error('Failed to create document record')
      }

      const document = await createDocResponse.json()
      setDocumentId(document.id)
      
      // Step 2: Update to processing status
      setProgress(40)
      await fetch(`/api/documents?id=${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing', processingProgress: 40 })
      })

      // Step 3: Process with AI backend
      setProgress(60)
      let processingResults

      if (USE_REAL_BACKEND) {
        processingResults = await processWithPythonBackend(file)
      } else {
        processingResults = await generateMockResults()
      }

      // Step 4: Store results in database
      setProgress(70)
      
      // Create summary
      const summaryResponse = await fetch('/api/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          documentType: processingResults.document_type,
          caseNumber: processingResults.case_number,
          summaryText: processingResults.summary_text,
          keyPoints: processingResults.key_points,
          confidenceScore: processingResults.confidence_score
        })
      })

      if (!summaryResponse.ok) throw new Error('Failed to create summary')
      const summary = await summaryResponse.json()

      // Create entities
      setProgress(75)
      await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          processingResults.entities.map((e: any) => ({
            documentId: document.id,
            entityType: e.entityType,
            entityValue: e.entityValue,
            context: e.context,
            confidence: e.confidence,
            positionStart: e.positionStart,
            positionEnd: e.positionEnd
          }))
        )
      })

      // Create timeline
      setProgress(80)
      await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          processingResults.timeline.map((t: any) => ({
            documentId: document.id,
            eventDate: t.eventDate,
            eventTime: t.eventTime,
            eventDescription: t.eventDescription,
            eventType: t.eventType,
            participants: t.participants,
            location: t.location
          }))
        )
      })

      // Create evidence
      setProgress(85)
      await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          processingResults.evidence.map((e: any) => ({
            documentId: document.id,
            evidenceType: e.evidenceType,
            description: e.description,
            referenceNumber: e.referenceNumber,
            status: e.status,
            pageReference: e.pageReference
          }))
        )
      })

      // Create IPC sections
      setProgress(88)
      await fetch('/api/ipc-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          processingResults.ipc_sections.map((s: any) => ({
            documentId: document.id,
            sectionNumber: s.sectionNumber,
            sectionName: s.sectionName,
            description: s.description,
            applicable: s.applicable
          }))
        )
      })

      // Create risk flags (NEW)
      setProgress(91)
      if (processingResults.risks && processingResults.risks.length > 0) {
        await fetch('/api/risks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            processingResults.risks.map((r: any) => ({
              documentId: document.id,
              riskType: r.riskType,
              severity: r.severity,
              description: r.description,
              affectedText: r.affectedText,
              explanation: r.explanation,
              suggestions: r.suggestions
            }))
          )
        })
      }

      // Create recommendations (NEW)
      setProgress(94)
      if (processingResults.recommendations && processingResults.recommendations.length > 0) {
        await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            processingResults.recommendations.map((r: any) => ({
              documentId: document.id,
              recommendationType: r.recommendationType,
              title: r.title,
              description: r.description,
              context: r.context,
              priority: r.priority
            }))
          )
        })
      }

      // Create document category (NEW)
      setProgress(97)
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          category: processingResults.document_type.toLowerCase().replace(' ', '_'),
          subcategory: null,
          confidenceScore: processingResults.confidence_score,
          suggestedWorkflow: { nextSteps: ['review', 'verification', 'filing'] },
          autoDetected: true
        })
      })

      // Step 5: Mark as completed
      setProgress(100)
      await fetch(`/api/documents?id=${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed', 
          processingProgress: 100,
          processedAt: new Date().toISOString()
        })
      })

      // Fetch all results
      const [entitiesRes, timelineRes, evidenceRes, ipcRes, risksRes, recommendationsRes] = await Promise.all([
        fetch(`/api/entities?documentId=${document.id}`),
        fetch(`/api/timeline?documentId=${document.id}`),
        fetch(`/api/evidence?documentId=${document.id}`),
        fetch(`/api/ipc-sections?documentId=${document.id}`),
        fetch(`/api/risks?documentId=${document.id}`),
        fetch(`/api/recommendations?documentId=${document.id}`)
      ])

      const entities = await entitiesRes.json()
      const timeline = await timelineRes.json()
      const evidence = await evidenceRes.json()
      const ipcSections = await ipcRes.json()
      const risks = await risksRes.json()
      const recommendations = await recommendationsRes.json()

      setResults({
        summary,
        entities,
        timeline,
        evidence,
        ipcSections,
        risks,
        recommendations
      })

      toast.success("Document processed successfully!")

    } catch (err: any) {
      console.error('Processing error:', err)
      setError(err.message || 'Failed to process document')
      toast.error(err.message || 'Failed to process document')
      
      if (documentId) {
        await fetch(`/api/documents?id=${documentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'failed', 
            errorMessage: err.message 
          })
        })
      }
    } finally {
      setProcessing(false)
    }
  }

  const processWithPythonBackend = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${PYTHON_SERVICE_URL}/api/process-document`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Python backend processing failed')
      }

      return await response.json()
    } catch (err: any) {
      console.error('Python backend error:', err)
      throw new Error(`AI processing failed: ${err.message}. Make sure Python service is running on ${PYTHON_SERVICE_URL}`)
    }
  }

  const generateMockResults = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      document_type: 'FIR',
      case_number: 'FIR-2024-001234',
      summary_text: `This is a First Information Report (FIR) documenting an incident of theft. The complainant reported the loss of valuable items including electronic devices and jewelry. The incident occurred at a residential premises, and the report was filed at the local police station. Initial investigation has been initiated, and forensic analysis of the crime scene is underway.`,
      key_points: [
        'Theft reported at residential premises',
        'Electronic devices and jewelry stolen',
        'FIR filed at local police station',
        'Forensic investigation initiated',
        'Multiple witnesses identified'
      ],
      confidence_score: 0.89,
      entities: [
        {
          entityType: 'person',
          entityValue: 'Rajesh Kumar',
          context: 'Complainant in the theft case',
          confidence: 0.95,
          positionStart: 120,
          positionEnd: 132
        },
        {
          entityType: 'person',
          entityValue: 'Inspector Sharma',
          context: 'Investigating officer',
          confidence: 0.92,
          positionStart: 450,
          positionEnd: 466
        },
        {
          entityType: 'location',
          entityValue: 'Mumbai Central Police Station',
          context: 'FIR filing location',
          confidence: 0.88,
          positionStart: 230,
          positionEnd: 259
        },
        {
          entityType: 'date',
          entityValue: '2024-01-15',
          context: 'Date of incident',
          confidence: 0.98,
          positionStart: 89,
          positionEnd: 99
        },
        {
          entityType: 'ipc_section',
          entityValue: 'IPC 379',
          context: 'Section applicable for theft',
          confidence: 0.91,
          positionStart: 567,
          positionEnd: 575
        }
      ],
      timeline: [
        {
          eventDate: '2024-01-15',
          eventTime: '02:30 AM',
          eventDescription: 'Break-in reported at residential premises',
          eventType: 'incident',
          participants: ['Unknown perpetrator'],
          location: 'Andheri West, Mumbai'
        },
        {
          eventDate: '2024-01-15',
          eventTime: '08:00 AM',
          eventDescription: 'Complainant discovered the theft',
          eventType: 'incident',
          participants: ['Rajesh Kumar'],
          location: 'Andheri West, Mumbai'
        },
        {
          eventDate: '2024-01-15',
          eventTime: '11:30 AM',
          eventDescription: 'FIR filed at police station',
          eventType: 'filing',
          participants: ['Rajesh Kumar', 'Inspector Sharma'],
          location: 'Mumbai Central Police Station'
        },
        {
          eventDate: '2024-01-16',
          eventTime: '10:00 AM',
          eventDescription: 'Forensic team visited crime scene',
          eventType: 'investigation',
          participants: ['Forensic Team', 'Inspector Sharma'],
          location: 'Andheri West, Mumbai'
        }
      ],
      evidence: [
        {
          evidenceType: 'physical',
          description: 'Fingerprints lifted from window frame',
          referenceNumber: 'EVD-2024-001',
          status: 'collected',
          pageReference: 'Page 3'
        },
        {
          evidenceType: 'digital',
          description: 'CCTV footage from building entrance',
          referenceNumber: 'EVD-2024-002',
          status: 'verified',
          pageReference: 'Page 4'
        },
        {
          evidenceType: 'testimonial',
          description: 'Witness statement from security guard',
          referenceNumber: 'EVD-2024-003',
          status: 'collected',
          pageReference: 'Page 5'
        }
      ],
      ipc_sections: [
        {
          sectionNumber: '379',
          sectionName: 'Punishment for theft',
          description: 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
          applicable: true
        },
        {
          sectionNumber: '457',
          sectionName: 'Lurking house-trespass or house-breaking by night',
          description: 'Whoever commits lurking house-trespass by night, or house-breaking by night, shall be punished with imprisonment of either description for a term which may extend to three years, and shall also be liable to fine.',
          applicable: true
        }
      ],
      risks: [
        {
          riskType: 'missing_section',
          severity: 'high',
          description: 'Missing detailed description of stolen items',
          affectedText: 'electronic devices and jewelry',
          explanation: 'The FIR lacks specific details about the stolen items including serial numbers, make, model, and estimated values. This may hinder recovery efforts and insurance claims.',
          suggestions: ['Add detailed list of stolen items with serial numbers', 'Include photographs if available', 'Specify estimated market value of each item']
        },
        {
          riskType: 'ambiguity',
          severity: 'medium',
          description: 'Unclear timeline of incident',
          affectedText: '02:30 AM break-in',
          explanation: 'The exact time of the break-in is uncertain. The report states "02:30 AM" but does not specify whether this is estimated or confirmed.',
          suggestions: ['Clarify if time is estimated or confirmed by evidence', 'Cross-reference with CCTV timestamps', 'Include margin of error for estimated times']
        },
        {
          riskType: 'inconsistency',
          severity: 'low',
          description: 'Minor discrepancy in location details',
          affectedText: 'Andheri West, Mumbai',
          explanation: 'The location description could be more precise. Exact address and flat/house number should be included for legal accuracy.',
          suggestions: ['Add complete address with flat/house number', 'Include landmark references', 'Specify if location is residential or commercial']
        }
      ],
      recommendations: [
        {
          recommendationType: 'action',
          title: 'Request Additional Evidence',
          description: 'Based on the FIR details, requesting building CCTV footage and neighboring witness statements would strengthen the case.',
          context: { documentType: 'FIR', caseType: 'theft', priority: 'evidence_collection' },
          priority: 'high'
        },
        {
          recommendationType: 'clarification',
          title: 'Clarify Timeline Details',
          description: 'The incident timeline has some ambiguities. Consider interviewing the complainant again to establish precise timings.',
          context: { section: 'timeline', issue: 'ambiguous_timestamps' },
          priority: 'medium'
        },
        {
          recommendationType: 'template',
          title: 'Use Standard FIR Template',
          description: 'For future FIR filings, consider using the standard template that includes all required sections to avoid missing information.',
          context: { templateType: 'fir', usage: 'standardization' },
          priority: 'low'
        }
      ]
    }
  }

  const loadSampleDocument = async (type: 'fir' | 'contract' | 'chargesheet') => {
    const sampleFiles = {
      fir: new File(["sample"], "sample_fir.pdf", { type: "application/pdf" }),
      contract: new File(["sample"], "sample_contract.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
      chargesheet: new File(["sample"], "sample_chargesheet.pdf", { type: "application/pdf" })
    }
    
    setFile(sampleFiles[type])
    toast.success(`Sample ${type.toUpperCase()} loaded`)
  }

  const getEntityIcon = (type: string) => {
    const icons: any = {
      person: "👤",
      organization: "🏢",
      location: "📍",
      date: "📅",
      ipc_section: "⚖️",
      case_number: "📋",
      act: "📜"
    }
    return icons[type] || "•"
  }

  const getEvidenceColor = (status: string) => {
    const colors: any = {
      collected: "secondary",
      verified: "default",
      pending: "outline",
      disputed: "destructive"
    }
    return colors[status] || "secondary"
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <FileText className="h-3 w-3 mr-1" />
              Interactive Demo {!USE_REAL_BACKEND && "• Demo Mode"}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Try LegalSum AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload a legal document and see our AI extract entities, timelines, and generate comprehensive summaries in seconds.
            </p>
            {!USE_REAL_BACKEND && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg inline-block">
                <p className="text-sm text-muted-foreground">
                  🔧 <strong>Demo Mode:</strong> Using simulated AI results. To enable real offline processing, 
                  start the Python service and set <code className="text-xs bg-muted px-1 py-0.5 rounded">USE_REAL_BACKEND=true</code>
                </p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <CardDescription>
                Upload PDF, DOCX, or audio files (WAV/MP3) for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.wav,.mp3"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">
                    {file ? file.name : "Drop your document here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOCX, WAV, MP3 (Max 50MB)
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-6 flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {file.name.endsWith('.pdf') && <FileText className="h-8 w-8 text-primary" />}
                    {file.name.endsWith('.docx') && <FileIcon className="h-8 w-8 text-primary" />}
                    {(file.name.endsWith('.wav') || file.name.endsWith('.mp3')) && <Mic className="h-8 w-8 text-primary" />}
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={processDocument}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Process Document"
                    )}
                  </Button>
                </div>
              )}

              {processing && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-semibold text-destructive">Processing Error</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
              )}

              {/* Sample Documents */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm font-semibold mb-3">Quick Start with Sample Documents:</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleDocument('fir')}
                  >
                    Sample FIR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleDocument('contract')}
                  >
                    Sample Contract
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadSampleDocument('chargesheet')}
                  >
                    Sample Charge Sheet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && documentId && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Analysis Results
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Document Type: {results.summary.documentType} • Case: {results.summary.caseNumber} • Confidence: {(results.summary.confidenceScore * 100).toFixed(1)}%
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Summary */}
                  <div className="mb-6 p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Executive Summary</h3>
                    <p className="text-sm leading-relaxed mb-4">{results.summary.summaryText}</p>
                    <div className="space-y-2">
                      <p className="font-semibold text-sm">Key Points:</p>
                      <ul className="space-y-1">
                        {results.summary.keyPoints.map((point: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tabs for detailed results */}
                  <Tabs defaultValue="entities" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="entities">Entities ({results.entities.length})</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline ({results.timeline.length})</TabsTrigger>
                      <TabsTrigger value="evidence">Evidence ({results.evidence.length})</TabsTrigger>
                      <TabsTrigger value="ipc">IPC Sections ({results.ipcSections.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="entities" className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.entities.map((entity: any) => (
                          <Card key={entity.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{getEntityIcon(entity.entityType)}</span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold">{entity.entityValue}</p>
                                    <Badge variant="secondary" className="text-xs">
                                      {(entity.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {entity.entityType.replace('_', ' ').toUpperCase()}
                                  </p>
                                  <p className="text-sm text-muted-foreground italic">
                                    "{entity.context}"
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        {results.timeline.map((event: any, index: number) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                              {index < results.timeline.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>
                            <Card className="flex-1 mb-4">
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-semibold">{event.eventDescription}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {new Date(event.eventDate).toLocaleDateString()} {event.eventTime && `• ${event.eventTime}`}
                                    </p>
                                  </div>
                                  <Badge variant="outline">{event.eventType}</Badge>
                                </div>
                                {event.location && (
                                  <p className="text-sm text-muted-foreground">📍 {event.location}</p>
                                )}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {event.participants.map((participant: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {participant}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="evidence" className="space-y-4 mt-6">
                      <div className="space-y-3">
                        {results.evidence.map((item: any) => (
                          <Card key={item.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={getEvidenceColor(item.status)}>
                                      {item.status}
                                    </Badge>
                                    <Badge variant="outline">{item.evidenceType}</Badge>
                                    {item.referenceNumber && (
                                      <span className="text-xs text-muted-foreground">
                                        Ref: {item.referenceNumber}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium mb-1">{item.description}</p>
                                  {item.pageReference && (
                                    <p className="text-xs text-muted-foreground">{item.pageReference}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="ipc" className="space-y-4 mt-6">
                      <div className="space-y-4">
                        {results.ipcSections.map((section: any) => (
                          <Card key={section.id} className={section.applicable ? "border-primary" : ""}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-semibold text-lg">Section {section.sectionNumber}</h4>
                                    {section.applicable && (
                                      <Badge variant="default">Applicable</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {section.sectionName}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed">{section.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* AI Features Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risks Panel */}
                <RisksPanel documentId={documentId} />
                
                {/* Recommendations Panel */}
                <RecommendationsPanel documentId={documentId} />
              </div>

              {/* Annotation Tool */}
              <AnnotationTool documentId={documentId} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Assistant */}
      {documentId && (
        <ChatAssistant 
          documentId={documentId}
          documentContext={{
            summary: results?.summary?.summaryText,
            entities: results?.entities,
            keyPoints: results?.summary?.keyPoints
          }}
          compact={true}
        />
      )}

      <Footer />
    </div>
  )
}