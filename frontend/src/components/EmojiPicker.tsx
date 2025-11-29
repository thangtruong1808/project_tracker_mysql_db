/**
 * EmojiPicker Component
 * Simple emoji picker for comments without external dependencies
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  isOpen: boolean
  onClose: () => void
}

/**
 * Common emoji categories for quick access
 * @author Thang Truong
 * @date 2025-01-27
 */
const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'] },
  { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
  { name: 'Objects', emojis: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋'] },
]

/**
 * EmojiPicker Component
 * Renders a simple emoji picker interface
 * @author Thang Truong
 * @date 2025-01-27
 */
const EmojiPicker = ({ onEmojiSelect, isOpen, onClose: _onClose }: EmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState(0)

  /**
   * Handle emoji click
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleEmojiClick = async (emoji: string): Promise<void> => {
    onEmojiSelect(emoji)
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-12 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-80 max-h-96 overflow-hidden flex flex-col">
      <div className="flex gap-1 mb-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {EMOJI_CATEGORIES.map((category, index) => (
          <button
            key={category.name}
            type="button"
            onClick={() => setSelectedCategory(index)}
            className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              selectedCategory === index ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto flex-1 grid grid-cols-8 gap-1">
        {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            onClick={() => handleEmojiClick(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
            aria-label={`Select ${emoji} emoji`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmojiPicker

