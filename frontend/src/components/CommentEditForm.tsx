/**
 * CommentEditForm Component
 * Form for editing a comment
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useRef, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import EmojiPicker from './EmojiPicker'

interface CommentEditFormProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

/**
 * CommentEditForm Component
 * Handles comment editing with emoji picker
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const CommentEditForm = ({ initialContent, onSave, onCancel, isSubmitting }: CommentEditFormProps) => {
  const [editContent, setEditContent] = useState(initialContent)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  /**
   * Close emoji picker when clicking outside
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
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
   * Handle emoji selection from picker
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleEmojiSelect = (emoji: string): void => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBefore = editContent.substring(0, start)
      const textAfter = editContent.substring(end)
      const newContent = textBefore + emoji + textAfter
      setEditContent(newContent)
      setShowEmojiPicker(false)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setEditContent(editContent + emoji)
      setShowEmojiPicker(false)
    }
  }

  /**
   * Toggle emoji picker visibility
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const toggleEmojiPicker = (): void => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  /**
   * Handle form submission
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    const trimmedContent = editContent.trim()
    if (!trimmedContent) {
      await showToast('Please enter a comment before saving.', 'info', 7000)
      return
    }
    if (trimmedContent === initialContent.trim()) {
      onCancel()
      return
    }
    await onSave(trimmedContent)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Edit form container */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          {/* Comment textarea */}
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
            disabled={isSubmitting}
          />
          {/* Emoji picker toggle button */}
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
          {/* Emoji picker component */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef}>
              <EmojiPicker onEmojiSelect={handleEmojiSelect} isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !editContent.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default CommentEditForm

