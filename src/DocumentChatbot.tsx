"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Send, Loader2, MessageSquare } from "lucide-react"

interface Message {
  role: 'user' | 'assistant'
  content: string
  contextUsed?: string[]
}

interface DocumentChatbotProps {
  documentId?: number
  documentContent?: string
  documentSummary?: string
  entities?: any[]
}

export const DocumentChatbot = ({ 
  documentId, 
  documentContent = "",
  documentSummary = "",
  entities = []
}: DocumentChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI legal assistant. Ask me anything about this document, and I\'ll help you understand it better.'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = async (userMessage: string): Promise<{ response: string; context: string[] }> => {
    // Simulate AI processing with contextual understanding
    const lowerMessage = userMessage.toLowerCase()
    
    // Extract entities for context
    const personEntities = entities.filter(e => e.entityType === 'person').map(e => e.entityValue)
    const dateEntities = entities.filter(e => e.entityType === 'date').map(e => e.entityValue)
    const ipcEntities = entities.filter(e => e.entityType === 'ipc_section').map(e => e.entityValue)
    
    let response = ''
    let context: string[] = []

    // Question patterns
    if (lowerMessage.includes('who') || lowerMessage.includes('parties') || lowerMessage.includes('involved')) {
      if (personEntities.length > 0) {
        response = `The key parties involved in this document are: ${personEntities.join(', ')}. `
        response += `These individuals are referenced in the context of the legal matter described.`
        context = ['entities', 'parties']
      } else {
        response = `I couldn't identify specific parties from the document. The document may need to be processed first.`
      }
    } 
    else if (lowerMessage.includes('when') || lowerMessage.includes('date') || lowerMessage.includes('timeline')) {
      if (dateEntities.length > 0) {
        response = `Key dates mentioned in this document include: ${dateEntities.join(', ')}. `
        response += `These dates mark important events in the legal timeline.`
        context = ['timeline', 'dates']
      } else {
        response = `No specific dates were identified in this document yet.`
      }
    }
    else if (lowerMessage.includes('ipc') || lowerMessage.includes('section') || lowerMessage.includes('charges')) {
      if (ipcEntities.length > 0) {
        response = `The IPC sections referenced in this document are: ${ipcEntities.join(', ')}. `
        response += `These sections define the legal framework and charges applicable to this case.`
        context = ['ipc_sections', 'charges']
      } else {
        response = `No IPC sections were identified in this document.`
      }
    }
    else if (lowerMessage.includes('summary') || lowerMessage.includes('summarize') || lowerMessage.includes('overview')) {
      if (documentSummary) {
        response = `Here's a summary of the document: ${documentSummary.substring(0, 300)}...`
        context = ['summary']
      } else {
        response = `The document summary is being generated. Please wait for processing to complete.`
      }
    }
    else if (lowerMessage.includes('risk') || lowerMessage.includes('issue') || lowerMessage.includes('concern')) {
      response = `Based on my analysis, I recommend reviewing the following areas for potential risks: `
      response += `inconsistencies in dates or statements, missing mandatory sections, and ambiguous language that could lead to interpretation issues. `
      response += `Would you like me to perform a detailed risk analysis?`
      context = ['risk_analysis', 'recommendations']
    }
    else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('action')) {
      response = `Based on this document, I recommend: 1) Verify all dates and timelines for consistency, `
      response += `2) Cross-reference all mentioned entities with supporting documentation, `
      response += `3) Ensure all mandatory sections are complete and accurate. `
      response += `Would you like specific guidance on any of these areas?`
      context = ['recommendations', 'next_steps']
    }
    else {
      // General response
      response = `I understand you're asking about "${userMessage}". `
      response += `This document contains information about legal proceedings. `
      response += `You can ask me about specific parties, dates, IPC sections, or request a summary. `
      response += `I can also help identify potential risks and recommend next steps.`
      context = ['general']
    }

    return { response, context }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Save user message to database
      if (documentId) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messageRole: 'user',
            messageContent: userMessage.content,
            documentId
          })
        })
      }

      // Generate AI response
      const { response, context } = await generateResponse(userMessage.content)

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        contextUsed: context
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant response to database
      if (documentId) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            messageRole: 'assistant',
            messageContent: assistantMessage.content,
            documentId,
            contextUsed: context
          })
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Legal Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about this document and get instant AI-powered answers
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.contextUsed && message.contextUsed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.contextUsed.map((ctx, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {ctx}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything about this document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
