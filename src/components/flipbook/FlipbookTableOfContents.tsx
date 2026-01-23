import type { TableOfContentsItem } from '../../types/publication'

type FlipbookTableOfContentsProps = {
  items: TableOfContentsItem[]
  currentPage: number
  onItemSelect: (page: number) => void
  onClose: () => void
}

export function FlipbookTableOfContents({
  items,
  currentPage,
  onItemSelect,
  onClose,
}: FlipbookTableOfContentsProps) {
  // Find the current TOC item based on page
  const currentItemIndex = items.findIndex((item, index) => {
    const nextItem = items[index + 1]
    if (nextItem) {
      return currentPage >= item.pageNumber - 1 && currentPage < nextItem.pageNumber - 1
    }
    return currentPage >= item.pageNumber - 1
  })

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-medium text-white">Índice</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* TOC list */}
      <div className="flex-1 overflow-y-auto py-2">
        {items.map((item, index) => {
          const isActive = index === currentItemIndex
          const indentLevel = item.level || 0

          return (
            <button
              key={`${item.title}-${item.pageNumber}`}
              onClick={() => onItemSelect(item.pageNumber - 1)} // Convert to 0-indexed
              className={`w-full text-left px-3 py-2 transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`}
              style={{ paddingLeft: `${12 + indentLevel * 16}px` }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm truncate flex-1">{item.title}</span>
                <span className="text-xs text-gray-500 shrink-0">{item.pageNumber}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
