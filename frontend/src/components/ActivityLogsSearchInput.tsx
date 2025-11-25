/**
 * ActivityLogsSearchInput Component
 * Search input with clear icon and debounce support via parent component
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

interface ActivityLogsSearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

/**
 * ActivityLogsSearchInput Component
 * Renders a search input with leading search icon and trailing clear button
 *
 * @param value - Current search term
 * @param onChange - Callback when search term changes
 * @param onClear - Callback when clear button is clicked
 * @param placeholder - Input placeholder text
 * @returns JSX element containing search input
 */
const ActivityLogsSearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search activity logs by action, type, or metadata...',
}: ActivityLogsSearchInputProps) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default ActivityLogsSearchInput

