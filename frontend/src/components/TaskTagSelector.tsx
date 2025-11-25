/**
 * TaskTagSelector Component
 * Multi-select dropdown for selecting tags to associate with a task
 *
 * @author Thang Truong
 * @date 2025-11-25
 */

import { useState, useRef, useEffect } from 'react'

interface Tag {
  id: string
  name: string
  description?: string
  category?: string
}

interface TaskTagSelectorProps {
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  error?: string
}

/**
 * TaskTagSelector Component
 * Renders a multi-select dropdown for tag selection
 *
 * @param tags - Array of available tags
 * @param selectedTagIds - Array of currently selected tag IDs
 * @param onChange - Callback when tag selection changes
 * @param error - Optional error message to display
 * @returns JSX element containing tag selector dropdown
 */
const TaskTagSelector = ({ tags, selectedTagIds, onChange, error }: TaskTagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  /**
   * Handle click outside to close dropdown
   *
   * @author Thang Truong
   * @date 2025-11-25
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Toggle tag selection
   * Adds or removes tag from selected list
   *
   * @author Thang Truong
   * @date 2025-11-25
   * @param tagId - Tag ID to toggle
   */
  const handleToggleTag = async (tagId: string) => {
    const newSelection = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId]
    await onChange(newSelection)
  }

  /**
   * Remove tag from selection
   * Removes specific tag from the selected list
   *
   * @author Thang Truong
   * @date 2025-11-25
   * @param tagId - Tag ID to remove
   */
  const handleRemoveTag = async (tagId: string) => {
    const newSelection = selectedTagIds.filter(id => id !== tagId)
    await onChange(newSelection)
  }

  /**
   * Filter tags based on search term
   */
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.category && tag.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  /**
   * Get selected tag objects
   */
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))

  return (
    /* Tag Selector Container */
    <div className="relative" ref={dropdownRef}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tags
      </label>

      {/* Selected Tags Display / Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full px-3 py-2 border rounded-lg cursor-pointer transition-all ${
          error
            ? 'border-red-300 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:ring-blue-500'
        } ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
      >
        {/* Selected Tags Pills */}
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation()
                    await handleRemoveTag(tag.id)
                  }}
                  className="hover:text-blue-600 focus:outline-none"
                  aria-label={`Remove ${tag.name}`}
                >
                  {/* Close Icon */}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Select tags...</span>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Tags List */}
          <div className="max-h-44 overflow-y-auto">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <div
                  key={tag.id}
                  onClick={async () => await handleToggleTag(tag.id)}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTagIds.includes(tag.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox Indicator */}
                  <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                    selectedTagIds.includes(tag.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedTagIds.includes(tag.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Tag Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{tag.name}</p>
                    {tag.category && (
                      <p className="text-xs text-gray-500 truncate">{tag.category}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No tags found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default TaskTagSelector

