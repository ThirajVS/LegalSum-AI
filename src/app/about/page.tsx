"use client"

import { Cpu, Shield, Zap, Users, Target, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"

export default function AboutPage() {
  const architecture = [
    {
      layer: "Input Layer",
      description: "Handles multi-format document ingestion with automatic type detection",
      components: ["PDF Processing", "DOCX Reading", "Audio Transcription", "Format Validation"]
    },
    {
      layer: "Preprocessing Layer",
      description: "Cleans and structures raw text for AI processing",
      components: ["Text Cleaning", "Tokenization", "Linguistic Analysis", "Noise Removal"]
    },
    {
      layer: "Classification Layer",
      description: "Identifies document types and extracts relevant sections",
      components: ["Pattern Matching", "Keyword Detection", "Section Parsing", "Type Classification"]
    },
    {
      layer: "AI Core",
      description: "Hybrid AI engine combining multiple analysis techniques",
      components: ["Transformer Models", "Entity Recognition", "Extractive Methods", "Scoring Algorithms"]
    },
    {
      layer: "Storage Layer",
      description: "Local database with entity mapping and metadata",
      components: ["Data Storage", "Entity Mapping", "Context Indexing", "Audit Logging"]
    },
    {
      layer: "Output Layer",
      description: "Generates human-readable reports and structured exports",
      components: ["Report Generation", "Data Exports", "Timeline Building", "Template Formatting"]
    }
  ]

  const useCases = [
    {
      role: "Lawyers",
      icon: Users,
      benefits: [
        "Reduce document review time by 80%",
        "Automatically extract case precedents",
        "Generate client-ready summaries",
        "Identify relevant legal sections instantly"
      ]
    },
    {
      role: "Investigators",
      icon: Target,
      benefits: [
        "Process multiple FIRs simultaneously",
        "Extract key facts and timelines",
        "Correlate evidence across cases",
        "Generate investigation reports"
      ]
    },
    {
      role: "Law Students",
      icon: Users,
      benefits: [
        "Analyze case studies efficiently",
        "Understand legal document structures",
        "Extract learning summaries",
        "Build comprehensive case notes"
      ]
    }
  ]

  const systemFeatures = [
    "Completely offline operation",
    "No internet connectivity required",
    "Process documents in seconds",
    "Optimized for standard hardware",
    "Supports batch processing",
    "Continuous learning capabilities",
    "Comprehensive audit trails",
    "Role-based access control",
    "Military-grade encryption",
    "Multiple export formats"
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Cpu className="h-3 w-3 mr-1" />
              About LegalSum AI
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Intelligent Legal Document Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              An offline-first AI platform that transforms lengthy, unstructured legal documents into concise, verifiable, and structured summaries.
            </p>
          </div>

          {/* Mission Statement */}
          <section className="mb-20">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg leading-relaxed max-w-4xl mx-auto">
                  LegalSum AI was created to reduce the manual workload of legal professionals by enabling autonomous detection, extraction, and summarization of complex legal paperwork. Unlike regular AI summarizers, we function as an intelligent legal assistant that maintains original context and evidentiary value while producing judge-ready summaries.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* System Architecture */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">System Architecture</h2>
            <div className="space-y-4">
              {architecture.map((layer, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{layer.layer}</CardTitle>
                        <CardDescription className="mt-2">{layer.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map((component, idx) => (
                        <Badge key={idx} variant="secondary">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Built for Legal Professionals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <useCase.icon className="h-12 w-12 text-primary mb-4 mx-auto" />
                    <CardTitle className="text-center">{useCase.role}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {useCase.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* System Features */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 text-center">Key System Features</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {systemFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Offline Capability */}
          <section className="mb-20">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="text-center">
                <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Offline-First Design</CardTitle>
                <CardDescription className="text-base">
                  Perfect for courts, police departments, and rural legal offices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <div className="text-3xl font-bold text-primary mb-2">Compact</div>
                    <p className="text-sm text-muted-foreground">Small system footprint</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-primary mb-2">0%</div>
                    <p className="text-sm text-muted-foreground">Internet dependency</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl font-bold text-primary mb-2">100%</div>
                    <p className="text-sm text-muted-foreground">Data privacy guaranteed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Security */}
          <section>
            <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
                <CardTitle className="text-2xl">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-destructive" />
                      Data Protection
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                      <li>• Military-grade encryption for all documents</li>
                      <li>• Local processing, no cloud uploads</li>
                      <li>• Secure database storage</li>
                      <li>• Encrypted audit trails</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-destructive" />
                      Access Control
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                      <li>• Token-based authentication</li>
                      <li>• Role-based access policies</li>
                      <li>• Session management</li>
                      <li>• Activity logging and monitoring</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}