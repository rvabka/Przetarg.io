import { useState, useMemo, useCallback, useDeferredValue, memo } from 'react'
import { Search, ChevronRight, ChevronDown, X, Check, Sparkles, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { buildCpvTree, filterTreeWithExpanded, type CpvNode } from '@/lib/cpv-tree'
import { useCpvSearch } from '@/hooks/useCpvSearch'
import { toastManager } from '@/components/ui/toast'
import cpvData from '@/data/cpv-2008.json'

const cpvTree = buildCpvTree(cpvData)

interface TreeNodeProps {
  node: CpvNode
  expandedCodes: Set<string>
  selectedCodes: Set<string>
  highlightedCodes: Set<string>
  onToggleExpand: (code: string) => void
  onToggleSelect: (code: string, description: string) => void
  depth?: number
}

const TreeNode = memo(function TreeNode({
  node,
  expandedCodes,
  selectedCodes,
  highlightedCodes,
  onToggleExpand,
  onToggleSelect,
  depth = 0,
}: TreeNodeProps) {
  const isExpanded = expandedCodes.has(node.code)
  const isSelected = selectedCodes.has(node.code)
  const isHighlighted = highlightedCodes.has(node.code)
  const hasChildren = node.children.length > 0
  const isLeaf = !hasChildren

  const fontWeight = depth === 0 ? 'font-bold' : depth === 1 ? 'font-semibold' : 'font-medium'

  return (
    <div className="flex flex-col">
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer group transition-all duration-150 border ${
          isSelected
            ? 'bg-emerald-50/60 border-emerald-100/50'
            : isHighlighted
              ? 'bg-amber-50/60 border-amber-100/50'
              : 'border-transparent hover:bg-slate-100/70 hover:border-slate-200/60 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
        }`}
        onClick={() => {
          if (hasChildren) onToggleExpand(node.code)
        }}
      >
        {hasChildren ? (
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 group-hover:text-[#065F46] transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.code)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(node.code, node.description)}
              className="shrink-0"
            />
          </div>
          <span
            className={`text-sm ${fontWeight} ${isSelected ? 'text-slate-900' : isLeaf ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-900'} truncate`}
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) onToggleExpand(node.code)
            }}
          >
            {node.code} {node.description}
          </span>
          {isSelected && (
            <span className="text-[10px] bg-white border border-emerald-100 text-[#065F46] px-1.5 py-0.5 rounded font-bold uppercase ml-2 shadow-sm shrink-0">
              Wybrano
            </span>
          )}
          {isHighlighted && !isSelected && (
            <span className="text-[10px] bg-white border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shadow-sm shrink-0 flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-3 pl-3 border-l border-gray-200 flex flex-col mt-1 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.code}
              node={child}
              expandedCodes={expandedCodes}
              selectedCodes={selectedCodes}
              highlightedCodes={highlightedCodes}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export function CpvSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set())
  const [selectedCodes, setSelectedCodes] = useState<Map<string, string>>(new Map())
  const [useAiSearch, setUseAiSearch] = useState(false)

  const { results: aiResults, isLoading: aiLoading, error: aiError, search: aiSearch, clearResults } = useCpvSearch()

  const deferredQuery = useDeferredValue(searchQuery)

  const { tree: filteredTree, expanded: filterExpandedCodes } = useMemo(() => {
    if (useAiSearch || !deferredQuery.trim()) return { tree: cpvTree, expanded: new Set<string>() }
    return filterTreeWithExpanded(cpvTree, deferredQuery)
  }, [deferredQuery, useAiSearch])

  const effectiveExpanded = useMemo(() => {
    const merged = new Set(expandedCodes)
    for (const code of filterExpandedCodes) {
      merged.add(code)
    }
    return merged
  }, [expandedCodes, filterExpandedCodes])

  const highlightedCodes = useMemo(() => {
    if (!useAiSearch) return new Set<string>()
    return new Set(aiResults.map((r) => r.cpv_code))
  }, [aiResults, useAiSearch])

  const selectedCodesSet = useMemo(() => new Set(selectedCodes.keys()), [selectedCodes])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      if (useAiSearch) {
        aiSearch(value)
      }
    },
    [useAiSearch, aiSearch]
  )

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }, [])

  const handleToggleSelect = useCallback((code: string, description: string) => {
    setSelectedCodes((prev) => {
      const next = new Map(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.set(code, description)
      }
      return next
    })
  }, [])

  const handleRemoveSelected = useCallback((code: string) => {
    setSelectedCodes((prev) => {
      const next = new Map(prev)
      next.delete(code)
      return next
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setSelectedCodes(new Map())
  }, [])

  const handleToggleAiSearch = useCallback(() => {
    setUseAiSearch((prev) => {
      const next = !prev
      if (next && searchQuery.trim()) {
        aiSearch(searchQuery)
      } else {
        clearResults()
      }
      return next
    })
  }, [searchQuery, aiSearch, clearResults])

  const cpvCodeMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const entry of cpvData) {
      map.set(entry.code.split('-')[0], entry.code)
    }
    return map
  }, [])

  const aiExpandedCodes = useMemo(() => {
    if (!useAiSearch || aiResults.length === 0) return new Set<string>()
    const codes = new Set<string>()
    for (const result of aiResults) {
      let num = result.cpv_code.split('-')[0]
      while (num) {
        let tz = 0
        for (let i = num.length - 1; i >= 0; i--) {
          if (num[i] === '0') tz++
          else break
        }
        if (tz >= 6) break
        const pos = num.length - 1 - tz
        const chars = num.split('')
        chars[pos] = '0'
        num = chars.join('')
        const fullCode = cpvCodeMap.get(num)
        if (fullCode) codes.add(fullCode)
      }
    }
    return codes
  }, [aiResults, useAiSearch, cpvCodeMap])

  const allExpanded = useMemo(() => {
    const merged = new Set(effectiveExpanded)
    for (const code of aiExpandedCodes) {
      merged.add(code)
    }
    return merged
  }, [effectiveExpanded, aiExpandedCodes])

  const isStale = deferredQuery !== searchQuery && !useAiSearch

  function shortDescription(desc: string, maxLen = 30): string {
    if (desc.length <= maxLen) return desc
    return desc.slice(0, maxLen).trimEnd() + '...'
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Zarządzanie Kategoriami i Kodami CPV
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Konfiguruj strukturę drzewa kategorii dla systemu przetargowego.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Szukaj po kodzie lub nazwie..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10"
            />
          </div>

          <Button
            variant={useAiSearch ? 'default' : 'outline'}
            onClick={handleToggleAiSearch}
            className={useAiSearch ? 'bg-[#065F46] hover:bg-emerald-700' : ''}
          >
            <Sparkles className="h-4 w-4" />
            AI Search
          </Button>

          <Button className="bg-[#065F46] hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            Dodaj
          </Button>
        </div>

        {/* AI search status */}
        {useAiSearch && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-3 w-3 text-[#065F46]" />
            {aiError ? (
              <span className="text-red-500">{aiError}</span>
            ) : aiLoading ? (
              <span>Szukam semantycznie...</span>
            ) : aiResults.length > 0 ? (
              <span>
                Znaleziono {aiResults.length} wyników AI — podświetlone w drzewku
              </span>
            ) : searchQuery.trim() ? (
              <span>Brak wyników semantycznych</span>
            ) : (
              <span>Wpisz frazę aby wyszukać semantycznie (np. "sprzątanie biur")</span>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden bg-gray-50/30">
        <ScrollArea className="h-full">
          <div className={`p-6 space-y-0.5 transition-opacity duration-150 ${isStale ? 'opacity-60' : ''}`}>
            {useAiSearch && aiResults.length > 0 && (
              <div className="mb-4 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Wyniki wyszukiwania AI
                </h3>
                <div className="space-y-1">
                  {aiResults.map((result) => (
                    <div
                      key={result.cpv_code}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedCodesSet.has(result.cpv_code)
                          ? 'bg-emerald-50 border border-emerald-100'
                          : 'hover:bg-amber-100/50'
                      }`}
                      onClick={() => handleToggleSelect(result.cpv_code, result.description)}
                    >
                      <Checkbox
                        checked={selectedCodesSet.has(result.cpv_code)}
                        onCheckedChange={() => handleToggleSelect(result.cpv_code, result.description)}
                        className="shrink-0"
                      />
                      <span className="text-sm font-medium text-slate-900 flex-1">
                        {result.cpv_code} {result.description}
                      </span>
                      <span className="text-xs font-mono text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tree */}
            {filteredTree.map((node) => (
              <TreeNode
                key={node.code}
                node={node}
                expandedCodes={allExpanded}
                selectedCodes={selectedCodesSet}
                highlightedCodes={highlightedCodes}
                onToggleExpand={handleToggleExpand}
                onToggleSelect={handleToggleSelect}
              />
            ))}

            {filteredTree.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <Search className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">Brak wyników</p>
                <p className="text-xs text-slate-400 mt-1">
                  Spróbuj zmienić frazę lub włącz wyszukiwanie AI
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Wybrane kategorie ({selectedCodes.size})
            </h3>
            {selectedCodes.size > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-[#065F46] hover:text-emerald-700 hover:underline"
              >
                Wyczyść wszystko
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {Array.from(selectedCodes.entries()).map(([code, description]) => (
              <span
                key={code}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-[#065F46] border border-emerald-100 shadow-sm transition-all hover:bg-emerald-100"
              >
                {shortDescription(description)} ({code})
                <button
                  onClick={() => handleRemoveSelected(code)}
                  className="ml-2 hover:text-emerald-800 flex items-center justify-center rounded-full hover:bg-emerald-200/50 w-4 h-4"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {selectedCodes.size === 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-slate-400 border border-dashed border-slate-300">
                <Plus className="h-3 w-3 mr-1" />
                Zaznacz kategorie w drzewku powyżej
              </span>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 shadow-lg"
            onClick={() => {
              toastManager.add({
                title: 'Zapisano',
                description: `Wybrano ${selectedCodes.size} kategorii CPV`,
                type: 'success',
              })
            }}
          >
            Zapisz zmiany
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
