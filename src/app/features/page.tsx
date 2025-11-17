"use client"

import { Brain, Search, Shield, Zap, Database, Download, FileSearch, Network, Lock, Wifi, HardDrive, FileType } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Brain,
      title: "Intelligent Document Classification",
      description: "Automatically detects document types and categorizes them for efficient processing.",
      details: [
        "FIRs, charge sheets, case records identification",
        "Contract and agreement classification",
        "Witness statement categorization",
        "Section-based document parsing"
      ]
    },
    {
      icon: Search,
      title: "Advanced Entity Extraction",
      description: "Identifies and extracts key information with contextual understanding.",
      details: [
        "Named entity recognition (people, organizations)",
        "Case numbers and legal references",
        "Legal sections and acts",
        "Date and location extraction with context"
      ]
    },
    {
      icon: FileSearch,
      title: "AI-Powered Summarization",
      description: "Generates concise, accurate summaries while preserving legal context.",
      details: [
        "Coherent executive summaries",
        "Multiple summarization techniques",
        "Context-preserving compression",
        "Judge-ready summary formatting"
      ]
    },
    {
      icon: Network,
      title: "Contextual Reasoning",
      description: "Maps entities to relational contexts and maintains evidentiary value.",
      details: [
        "Entity relationship mapping",
        "Timeline reconstruction",
        "Evidence correlation",
        "Cross-reference detection"
      ]
    },
    {
      icon: Wifi,
      title: "Offline-First Architecture",
      description: "Complete functionality without internet connectivity (compact footprint).",
      details: [
        "Local AI models",
        "Local database storage",
        "Offline speech recognition",
        "No cloud dependency"
      ]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Military-grade encryption and role-based access control for sensitive documents.",
      details: [
        "End-to-end encryption",
        "Secure authentication",
        "Audit trail logging",
        "Access control policies"
      ]
    }
  ]

  const technicalFeatures = [
    {
      icon: FileType,
      title: "Multi-Format Processing",
      description: "Handle PDF, DOCX, and audio files with intelligent extraction.",
      specs: [
        "PDF with OCR support",
        "Microsoft Word documents",
        "Audio file transcription",
        "Automatic format detection"
      ]
    },
    {
      icon: Database,
      title: "Smart Data Storage",
      description: "Local database with advanced analytics and quick lookups.",
      specs: [
        "Entity-relationship modeling",
        "Metadata indexing",
        "Fast query performance",
        "Export to CSV/JSON"
      ]
    },
    {
      icon: Download,
      title: "Flexible Export Options",
      description: "Generate professional reports in multiple formats.",
      specs: [
        "Professional PDF reports",
        "Structured JSON exports",
        "Timeline visualizations",
        "Customizable templates"
      ]
    },
    {
      icon: Zap,
      title: "Performance Optimized",
      description: "Lightweight models optimized for speed without sacrificing accuracy.",
      specs: [
        "Fast processing (10-30 seconds)",
        "Batch processing support",
        "Optimized for standard hardware",
        "Continuous improvement"
      ]
    }
  ]

  const processingPipeline = [
    {
      step: "1",
      title: "Document Ingestion",
      description: "Multi-format file handling with automatic type detection and OCR support for scanned documents."
    },
    {
      step: "2",
      title: "Preprocessing",
      description: "Text cleaning and structuring to remove noise and prepare content for analysis."
    },
    {
      step: "3",
      title: "Classification",
      description: "Pattern matching to identify document type and extract relevant sections."
    },
    {
      step: "4",
      title: "Entity Recognition",
      description: "Advanced AI to extract people, places, dates, and legal references."
    },
    {
      step: "5",
      title: "Summarization",
      description: "Hybrid AI approach to generate concise, coherent summaries."
    },
    {
      step: "6",
      title: "Output Generation",
      description: "Structured exports with visual timelines, entity graphs, and formatted legal summaries."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Brain className="h-3 w-3 mr-1" />
              Advanced AI Technology
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features for Legal Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge AI and designed for real-world legal workflows. Every feature optimized for accuracy, speed, and security.
            </p>
          </div>

          {/* Core Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Core Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Technical Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8">Technical Excellence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* AI Pipeline */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI Processing Pipeline</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A sophisticated 6-stage pipeline that transforms raw legal documents into structured, actionable intelligence
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processingPipeline.map((stage, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full flex items-start justify-end p-4">
                    <span className="text-3xl font-bold text-primary/30">{stage.step}</span>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{stage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="mb-20">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Enterprise-Grade Security</CardTitle>
                <CardDescription className="text-base">
                  Your legal documents are sensitive. We take security seriously.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Military-Grade Encryption</h3>
                    <p className="text-sm text-muted-foreground">
                      End-to-end encryption using industry-standard algorithms
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <HardDrive className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Local Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      All data stays on your device. No cloud uploads required.
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <Lock className="h-10 w-10 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Role-based authentication for team environments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Use Case Examples */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Real-World Applications</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how LegalSum AI transforms legal workflows across different scenarios
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Police Investigations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Process hundreds of FIRs daily, extract key facts, identify patterns, and generate investigation reports automatically.
                  </p>
                  <Badge variant="secondary">Time Saved: 75%</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Law Firm Case Prep</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Analyze case files, extract precedents, identify relevant sections, and prepare case summaries in minutes instead of hours.
                  </p>
                  <Badge variant="secondary">Accuracy: 95%+</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Legal Research</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Students and researchers can quickly analyze multiple case studies, extract legal principles, and build comprehensive understanding.
                  </p>
                  <Badge variant="secondary">Documents/Hour: 50+</Badge>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}