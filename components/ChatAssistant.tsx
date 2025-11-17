"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, Send, Bot, User, Loader2, X, Minimize2, Maximize2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface ChatMessage {
  id: number
  sessionId: string
  messageRole: 'user' | 'assistant'
  messageContent: string
  contextUsed?: any
  createdAt: string
}

interface ChatAssistantProps {
  documentId?: number
  documentContext?: {
    summary?: string
    entities?: any[]
    keyPoints?: string[]
  }
  compact?: boolean
}

export function ChatAssistant({ documentId, documentContext, compact = false }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (documentId) {
      fetchChatHistory()
    }
  }, [documentId, sessionId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Error fetching chat history:', err)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // Offline AI response generation based on document context
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
      return documentContext?.summary || 
        "I can provide summaries of the document sections. Please upload a document first to enable contextual analysis."
    }
    
    if (lowerMessage.includes('entity') || lowerMessage.includes('entities') || lowerMessage.includes('person') || lowerMessage.includes('people')) {
      if (documentContext?.entities && documentContext.entities.length > 0) {
        const people = documentContext.entities.filter(e => e.entityType === 'person')
        return `I found ${people.length} people mentioned: ${people.map(p => p.entityValue).join(', ')}. Would you like details about any specific person?`
      }
      return "No entities have been extracted yet. Please process a document first."
    }
    
    if (lowerMessage.includes('key point') || lowerMessage.includes('important')) {
      if (documentContext?.keyPoints && documentContext.keyPoints.length > 0) {
        return `Here are the key points:\n${documentContext.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
      }
      return "No key points extracted yet. Please process a document first."
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
      return "I can help identify risks and potential issues in legal documents. Once you process a document, I'll analyze it for inconsistencies, ambiguities, and missing sections."
    }
    
    if (lowerMessage.includes('next step') || lowerMessage.includes('what should') || lowerMessage.includes('recommend')) {
      return "Based on document analysis, I can recommend next steps such as:\n• Filing required documents\n• Gathering additional evidence\n• Consulting specific legal precedents\n• Clarifying ambiguous sections"
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return "I'm your AI legal assistant. I can help you:\n• Answer questions about document content\n• Explain extracted entities and key points\n• Identify risks and inconsistencies\n• Suggest next steps and legal actions\n• Provide contextual analysis\n\nAsk me anything about your legal documents!"
    }
    
    // Default response
    return "I understand your question. Based on the document analysis, I can provide insights about entities, timelines, key sections, and potential risks. Please upload and process a document to enable detailed contextual responses."
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    try {
      // Save user message
      const userMsgResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageRole: 'user',
          messageContent: userMessage,
          documentId: documentId || null
        })
      })

      if (!userMsgResponse.ok) throw new Error('Failed to save user message')
      const savedUserMsg = await userMsgResponse.json()
      setMessages(prev => [...prev, savedUserMsg])

      // Generate AI response (offline)
      const aiResponse = generateAIResponse(userMessage)

      // Save AI response
      const aiMsgResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messageRole: 'assistant',
          messageContent: aiResponse,
          documentId: documentId || null,
          contextUsed: documentContext ? Object.keys(documentContext) : []
        })
      })

      if (!aiMsgResponse.ok) throw new Error('Failed to save AI response')
      const savedAiMsg = await aiMsgResponse.json()
      setMessages(prev => [...prev, savedAiMsg])

    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (compact && isMinimized) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsMinimized(false)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className={`${isExpanded ? 'fixed inset-4 z-50' : compact ? 'fixed bottom-4 right-4 w-96 shadow-2xl z-40' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              AI Legal Assistant
            </CardTitle>
            <CardDescription className="text-xs">
              Ask questions about your legal documents
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea 
          className={`${isExpanded ? 'h-[calc(100vh-250px)]' : 'h-80'} pr-4`}
          ref={scrollRef}
        >
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">Start a conversation!</p>
                <p className="text-xs">Ask me about the document, entities, risks, or next steps.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.messageRole === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.messageRole === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.messageRole === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.messageContent}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {message.messageRole === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about the document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => setInput("What are the key points?")}
          >
            Key Points
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => setInput("Who are the entities mentioned?")}
          >
            Entities
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => setInput("What are the risks?")}
          >
            Risks
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary"
            onClick={() => setInput("What should I do next?")}
          >
            Next Steps
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
