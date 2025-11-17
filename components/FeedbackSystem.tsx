"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, ThumbsUp, MessageSquare, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FeedbackSystemProps {
  documentId?: number
  summaryId?: number
  originalText?: string
  onFeedbackSubmitted?: () => void
}

export const FeedbackSystem = ({ 
  documentId, 
  summaryId,
  originalText = "",
  onFeedbackSubmitted
}: FeedbackSystemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'rating' | 'edit' | 'comment'>('rating')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [editedText, setEditedText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const feedbackData: any = {
        feedbackType,
        documentId,
        summaryId
      }

      if (feedbackType === 'rating') {
        feedbackData.rating = rating
        if (comment.trim()) {
          feedbackData.comment = comment
        }
      } else if (feedbackType === 'edit') {
        feedbackData.originalText = originalText
        feedbackData.userEditedText = editedText
      } else if (feedbackType === 'comment') {
        feedbackData.comment = comment
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
          setSubmitted(false)
          resetForm()
          onFeedbackSubmitted?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setRating(0)
    setComment('')
    setEditedText('')
    setFeedbackType('rating')
  }

  const openRatingDialog = () => {
    setFeedbackType('rating')
    setIsOpen(true)
  }

  const openEditDialog = () => {
    setFeedbackType('edit')
    setEditedText(originalText)
    setIsOpen(true)
  }

  const openCommentDialog = () => {
    setFeedbackType('comment')
    setIsOpen(true)
  }

  const canSubmit = () => {
    if (feedbackType === 'rating') return rating > 0
    if (feedbackType === 'edit') return editedText.trim() !== '' && editedText !== originalText
    if (feedbackType === 'comment') return comment.trim() !== ''
    return false
  }

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback helps us improve our AI models and provide better results.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={openRatingDialog}
        >
          <Star className="h-4 w-4 mr-2" />
          Rate Quality
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openEditDialog}
          disabled={!originalText}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Suggest Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openCommentDialog}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Comment
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {feedbackType === 'rating' && 'Rate Summary Quality'}
              {feedbackType === 'edit' && 'Suggest Improvements'}
              {feedbackType === 'comment' && 'Share Your Feedback'}
            </DialogTitle>
            <DialogDescription>
              {feedbackType === 'rating' && 'Help us improve by rating the quality of this summary'}
              {feedbackType === 'edit' && 'Edit the text to show us how you would improve it'}
              {feedbackType === 'comment' && 'Share your thoughts or report issues'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {feedbackType === 'rating' && (
              <>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          value <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {rating === 1 && 'Poor - Needs significant improvement'}
                    {rating === 2 && 'Fair - Below expectations'}
                    {rating === 3 && 'Good - Meets expectations'}
                    {rating === 4 && 'Very Good - Above expectations'}
                    {rating === 5 && 'Excellent - Outstanding quality'}
                  </p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Additional Comments (Optional)</label>
                  <Textarea
                    placeholder="Tell us what could be improved..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {feedbackType === 'edit' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Edit the text to show improvements</label>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Your edits help train our AI to generate better summaries in the future
                </p>
              </div>
            )}

            {feedbackType === 'comment' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Feedback</label>
                <Textarea
                  placeholder="Share your thoughts, report issues, or suggest features..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
