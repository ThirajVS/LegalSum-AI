"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Languages, Check, Globe } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MultilingualSupportProps {
  documentId?: number
  onLanguageChange?: (language: string) => void
}

export const MultilingualSupport = ({ documentId, onLanguageChange }: MultilingualSupportProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳' }
  ]

  useEffect(() => {
    // Load user's language preference
    const savedLanguage = localStorage.getItem('preferred_language')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = async (languageCode: string) => {
    setIsTranslating(true)
    try {
      setSelectedLanguage(languageCode)
      localStorage.setItem('preferred_language', languageCode)
      
      // Update user preferences in database
      const userIdentifier = localStorage.getItem('user_identifier') || `user_${Date.now()}`
      localStorage.setItem('user_identifier', userIdentifier)

      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdentifier,
          languagePreference: languageCode
        })
      })

      onLanguageChange?.(languageCode)
    } catch (error) {
      console.error('Error changing language:', error)
    } finally {
      setTimeout(() => setIsTranslating(false), 500)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Multi-lingual Support
        </CardTitle>
        <CardDescription>
          Process and analyze legal documents in multiple Indian regional languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Language</label>
          <Select
            value={selectedLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <Check className="h-4 w-4 ml-auto text-primary" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTranslating && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm">Updating language preference...</span>
          </div>
        )}

        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Supported Features
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Document text translation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Summary generation in selected language</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Entity extraction with transliteration</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Audio transcription in regional languages</span>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Languages className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Offline Translation</p>
              <p className="text-xs text-muted-foreground">
                All translations are performed locally using offline language models. 
                No internet connection required for document processing in any supported language.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {supportedLanguages.slice(0, 6).map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange(lang.code)}
              className="justify-start"
            >
              <span className="mr-2">{lang.flag}</span>
              <span className="text-xs truncate">{lang.name.split(' (')[0]}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
