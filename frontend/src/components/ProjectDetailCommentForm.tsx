/**
 * ProjectDetailCommentForm Component
 * Form for posting new comments with emoji picker
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useRef, useEffect } from 'react'
import EmojiPicker from './EmojiPicker'

interface ProjectDetailCommentFormProps {
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
}

/**
 * ProjectDetailCommentForm Component
 * Handles comment input and submission
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailCommentForm = ({ onSubmit, isSubmitting }: ProjectDetailCommentFormProps) => {
  const [commentContent, setCommentContent] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Close emoji picker when clicking outside
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showEmojiPicker])

  /**
   * Handle emoji selection from picker - inserts emoji at cursor position
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleEmojiSelect = (emoji: string): void => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBefore = commentContent.substring(0, start)
      const textAfter = commentContent.substring(end)
      const newContent = textBefore + emoji + textAfter
      setCommentContent(newContent)
      setShowEmojiPicker(false)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setCommentContent(commentContent + emoji)
      setShowEmojiPicker(false)
    }
  }

  /**
   * Toggle emoji picker visibility
   * @author Thang Truong
   * @date 2025-01-27
   */
  const toggleEmojiPicker = (): void => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  /**
   * Handle form submission
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const trimmedContent = commentContent.trim()
    if (!trimmedContent) return

    await onSubmit(trimmedContent)
    setCommentContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={toggleEmojiPicker}
            className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
            aria-label="Add emoji"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showEmojiPicker && (
            <div ref={emojiPickerRef}>
              <EmojiPicker onEmojiSelect={handleEmojiSelect} isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !commentContent.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default ProjectDetailCommentForm

