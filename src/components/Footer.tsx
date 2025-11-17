"use client"

import Link from "next/link"
import { Scale, FileText, Shield, Zap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">LegalSum AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transforming complex legal documents into actionable summaries with AI-powered intelligence.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-4">Key Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Document Analysis
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secure & Encrypted
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Offline Capable
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to PDF/JSON
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-muted-foreground hover:text-foreground transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="font-semibold mb-4">Get Started</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try our AI-powered legal document summarizer today.
            </p>
            <Button asChild className="w-full">
              <Link href="/demo">Launch Demo</Link>
            </Button>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 LegalSum AI. All rights reserved. Built for lawyers, investigators, and law students.</p>
        </div>
      </div>
    </footer>
  )
}
