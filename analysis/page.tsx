"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, MessageSquare, FileText, Target, TrendingUp } from "lucide-react"
import Navigation from "@/components/Navigation"
import Footer from "@/components/Footer"
import { RisksPanel } from "@/components/RisksPanel"
import { RecommendationsPanel } from "@/components/RecommendationsPanel"
import { ChatAssistant } from "@/components/ChatAssistant"
import { TemplateManager } from "@/components/TemplateManager"
import { AnnotationTool } from "@/components/AnnotationTool"

export default function AnalysisPage() {
  const [selectedDocumentId] = useState<number | undefined>(undefined)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">AI Analysis Hub</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore advanced AI features including risk detection, smart recommendations, 
              custom templates, and interactive document analysis.
            </p>
          </div>

          {/* Feature Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Risk Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Auto</p>
                <p className="text-xs text-muted-foreground">Identifies inconsistencies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-muted-foreground">Offline chat support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Custom</p>
                <p className="text-xs text-muted-foreground">Personalized workflows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Smart</p>
                <p className="text-xs text-muted-foreground">Improves over time</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="recommendations">Suggestions</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="annotations">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agentic AI Features</CardTitle>
                  <CardDescription>
                    Advanced capabilities that make LegalSum AI truly intelligent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Feature List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Intelligent Analysis
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Automatic risk detection and flagging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Inconsistency and ambiguity identification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Missing section detection</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Misinformation flagging</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Smart Recommendations
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Next step suggestions based on document type</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Template recommendations from usage patterns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Precedent linking from similar cases</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Clarification requests for unclear sections</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Self-Improving Intelligence
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Learns from user edits and feedback</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Pattern recognition across documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Local history for precedent recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Auto-categorization and workflow sorting</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Interactive Assistant
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Local chatbot for document Q&A</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Context-aware responses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>Role-based dynamic analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>100% offline operation</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Demo Notice */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                      <p className="text-sm">
                        <strong>Try it now:</strong> Upload a document in the{" "}
                        <a href="/demo" className="underline text-primary">Demo page</a> to see 
                        these AI features in action. All features work completely offline!
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Global Recommendations */}
              <RecommendationsPanel />
            </TabsContent>

            <TabsContent value="risks">
              {selectedDocumentId ? (
                <RisksPanel documentId={selectedDocumentId} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>
                      AI-powered risk detection and flagging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload and process a document in the Demo page to see risk analysis
                      </p>
                      <a href="/demo" className="text-primary underline text-sm">
                        Go to Demo →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations">
              <RecommendationsPanel documentId={selectedDocumentId} />
            </TabsContent>

            <TabsContent value="templates">
              <TemplateManager />
            </TabsContent>

            <TabsContent value="annotations">
              {selectedDocumentId ? (
                <AnnotationTool documentId={selectedDocumentId} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Annotations</CardTitle>
                    <CardDescription>
                      Tag and annotate important sections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload and process a document in the Demo page to start annotating
                      </p>
                      <a href="/demo" className="text-primary underline text-sm">
                        Go to Demo →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Chat Assistant (Floating) */}
          <ChatAssistant 
            documentId={selectedDocumentId}
            compact={true}
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}
