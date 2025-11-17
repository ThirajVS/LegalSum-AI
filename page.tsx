"use client"

import Link from "next/link"
import { FileText, Mic, FileType, CheckCircle, Shield, Zap, Database, Download, Scale, Users, Clock, Brain, Wifi, WifiOff, Target, MessageSquare, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: "Multi-Format Support",
      description: "Process PDF, DOCX, and audio files with intelligent extraction."
    },
    {
      icon: Brain,
      title: "100% Offline AI",
      description: "Advanced AI processing without internet connection. No API keys or external services needed."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Military-grade encryption with offline-first architecture. Your data never leaves your system."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process documents in seconds with optimized AI models."
    },
    {
      icon: Database,
      title: "Smart Storage",
      description: "Local database with intelligent entity mapping and contextual relationships."
    },
    {
      icon: Download,
      title: "Export Options",
      description: "Generate professional reports or structured data exports for further processing."
    }
  ]

  const agenticFeatures = [
    {
      icon: Target,
      title: "Risk Detection",
      description: "Automatically identifies inconsistencies, ambiguities, and potential issues in legal documents.",
      badge: "Smart"
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      description: "Suggests next steps, templates, and actions based on document analysis and usage patterns.",
      badge: "Agentic"
    },
    {
      icon: MessageSquare,
      title: "Interactive Assistant",
      description: "Local chatbot that answers questions about your documents with context-aware responses.",
      badge: "24/7"
    },
    {
      icon: TrendingUp,
      title: "Self-Improving",
      description: "Learns from your edits and feedback to improve summaries and recommendations over time.",
      badge: "Learning"
    }
  ]

  const documentTypes = [
    { name: "FIRs", description: "First Information Reports" },
    { name: "Charge Sheets", description: "Criminal charge documentation" },
    { name: "Case Records", description: "Complete case files" },
    { name: "Witness Statements", description: "Testimony transcriptions" },
    { name: "Contracts", description: "Legal agreements" },
    { name: "Audio Evidence", description: "Voice recordings to text" }
  ]

  const useCases = [
    {
      icon: Users,
      title: "Lawyers",
      description: "Reduce manual review time by 80%. Focus on strategy, not paperwork."
    },
    {
      icon: Scale,
      title: "Investigators",
      description: "Extract key facts and timelines from complex evidence quickly."
    },
    {
      icon: Clock,
      title: "Law Students",
      description: "Analyze case studies and understand legal structures efficiently."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="secondary" className="mb-4">
              <WifiOff className="h-3 w-3 mr-1" />
              100% Offline AI • No API Keys Required
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Transform Legal Documents into
              <span className="text-primary block mt-2">Actionable Summaries</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Completely offline AI-powered legal assistant that automatically extracts key facts, entities, and timelines from complex legal paperwork while maintaining evidentiary value. <strong>No internet connection or API keys needed.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/demo">
                  Try Demo Now
                  <FileText className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/analysis">
                  Explore AI Features
                </Link>
              </Button>
            </div>
          </div>

          {/* Offline Guarantee Banner */}
          <Card className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <WifiOff className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">100% Offline Processing Guaranteed</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI models run locally • No external services • Your data stays on your machine
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  No API Keys Required
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card className="mt-8 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-center">Supported Document Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <FileType className="h-12 w-12 text-primary" />
                  <h3 className="font-semibold">PDF Documents</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Including scanned documents with OCR
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <FileText className="h-12 w-12 text-primary" />
                  <h3 className="font-semibold">DOCX Files</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Microsoft Word documents
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Mic className="h-12 w-12 text-primary" />
                  <h3 className="font-semibold">Audio Files</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    WAV/MP3 with offline transcription
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Agentic AI Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">
              <Brain className="h-3 w-3 mr-1" />
              Agentic AI
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Intelligent AI Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond simple summarization - our AI actively assists, learns, and improves your legal workflow
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agenticFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/analysis">
                Explore All AI Features
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge AI and designed for real-world legal workflows
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Document Types Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Process Any Legal Document</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Intelligent detection of document types and automatic section identification
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((type, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Legal Professionals</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by lawyers, investigators, and law students nationwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <useCase.icon className="h-12 w-12 text-primary mb-4 mx-auto" />
                  <CardTitle>{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{useCase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Legal Workflow?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Experience the power of offline AI-driven legal document analysis. Works completely offline. No API keys required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link href="/demo">
                Launch Demo
                <FileText className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/analysis">
                Explore AI Features
                <Brain className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}