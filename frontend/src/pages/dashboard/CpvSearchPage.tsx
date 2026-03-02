import { useState, useMemo, useCallback, useDeferredValue, memo } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Plus,
  ChevronsDownUp,
  MinusCircle,
  Trash2,
  HelpCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  buildCpvTree,
  filterTreeWithExpanded,
  type CpvNode
} from '@/lib/cpv-tree';
import { useCpvSearch } from '@/hooks/useCpvSearch';
import { toastManager } from '@/components/ui/toast';
import cpvData from '@/data/cpv-2008.json';

const cpvTree = buildCpvTree(cpvData);

function buildNodeMap(roots: CpvNode[]): Map<string, CpvNode> {
  const map = new Map<string, CpvNode>();
  function walk(node: CpvNode) {
    map.set(node.code, node);
    for (const child of node.children) walk(child);
  }
  for (const root of roots) walk(root);
  return map;
}

function collectAllDescendantCodes(
  node: CpvNode
): Array<{ code: string; description: string }> {
  const result: Array<{ code: string; description: string }> = [];
  for (const child of node.children) {
    result.push({ code: child.code, description: child.description });
    result.push(...collectAllDescendantCodes(child));
  }
  return result;
}

const cpvNodeMap = buildNodeMap(cpvTree);

interface TreeNodeProps {
  node: CpvNode;
  expandedCodes: Set<string>;
  selectedCodes: Set<string>;
  highlightedCodes: Set<string>;
  onToggleExpand: (code: string) => void;
  onToggleSelect: (code: string, description: string) => void;
  onDeselectAllBelow: (code: string) => void;
  depth?: number;
}

const TreeNode = memo(function TreeNode({
  node,
  expandedCodes,
  selectedCodes,
  highlightedCodes,
  onToggleExpand,
  onToggleSelect,
  onDeselectAllBelow,
  depth = 0
}: TreeNodeProps) {
  const isExpanded = expandedCodes.has(node.code);
  const isSelected = selectedCodes.has(node.code);
  const isHighlighted = highlightedCodes.has(node.code);
  const hasChildren = node.children.length > 0;
  const isLeaf = !hasChildren;

  const fontWeight =
    depth === 0 ? 'font-bold' : depth === 1 ? 'font-semibold' : 'font-medium';

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
          if (hasChildren) onToggleExpand(node.code);
        }}
      >
        {hasChildren ? (
          <button
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 group-hover:text-[#065F46] transition-colors"
            onClick={e => {
              e.stopPropagation();
              onToggleExpand(node.code);
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
          <div onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() =>
                onToggleSelect(node.code, node.description)
              }
              className="shrink-0"
            />
          </div>
          <span
            className={`text-sm ${fontWeight} ${isSelected ? 'text-slate-900' : isLeaf ? 'text-slate-600 group-hover:text-slate-900' : 'text-slate-900'} truncate`}
            onClick={e => {
              e.stopPropagation();
              if (hasChildren) onToggleExpand(node.code);
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

        {hasChildren && (
          <Button
            variant="ghost"
            size="xs"
            onClick={e => {
              e.stopPropagation();
              onDeselectAllBelow(node.code);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 transition-all"
            title="Odznacz wszystkie poniżej"
          >
            <MinusCircle className="h-3.5 w-3.5" />
            <span className="text-[11px]">Odznacz w dół</span>
          </Button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-3 pl-3 border-l border-gray-200 flex flex-col mt-1 space-y-0.5">
          {node.children.map(child => (
            <TreeNode
              key={child.code}
              node={child}
              expandedCodes={expandedCodes}
              selectedCodes={selectedCodes}
              highlightedCodes={highlightedCodes}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onDeselectAllBelow={onDeselectAllBelow}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export function CpvSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [selectedCodes, setSelectedCodes] = useState<Map<string, string>>(
    new Map()
  );
  const [useAiSearch, setUseAiSearch] = useState(false);

  const {
    results: aiResults,
    isLoading: aiLoading,
    error: aiError,
    search: aiSearch,
    clearResults
  } = useCpvSearch();

  const deferredQuery = useDeferredValue(searchQuery);

  const { tree: filteredTree, expanded: filterExpandedCodes } = useMemo(() => {
    if (useAiSearch || !deferredQuery.trim())
      return { tree: cpvTree, expanded: new Set<string>() };
    return filterTreeWithExpanded(cpvTree, deferredQuery);
  }, [deferredQuery, useAiSearch]);

  const effectiveExpanded = useMemo(() => {
    const merged = new Set(expandedCodes);
    for (const code of filterExpandedCodes) {
      merged.add(code);
    }
    return merged;
  }, [expandedCodes, filterExpandedCodes]);

  const highlightedCodes = useMemo(() => {
    if (!useAiSearch) return new Set<string>();
    return new Set(aiResults.map(r => r.cpv_code));
  }, [aiResults, useAiSearch]);

  const selectedCodesSet = useMemo(
    () => new Set(selectedCodes.keys()),
    [selectedCodes]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (useAiSearch) {
        aiSearch(value);
      }
    },
    [useAiSearch, aiSearch]
  );

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const handleToggleSelect = useCallback(
    (code: string, description: string) => {
      setSelectedCodes(prev => {
        const next = new Map(prev);
        if (next.has(code)) {
          next.delete(code);
        } else {
          next.set(code, description);
          // Auto-select direct children when selecting a parent
          const node = cpvNodeMap.get(code);
          if (node && node.children.length > 0) {
            for (const child of node.children) {
              next.set(child.code, child.description);
            }
          }
        }
        return next;
      });
    },
    []
  );

  const handleDeselectAllBelow = useCallback((code: string) => {
    const node = cpvNodeMap.get(code);
    if (!node) return;
    setSelectedCodes(prev => {
      const next = new Map(prev);
      next.delete(code);
      const descendants = collectAllDescendantCodes(node);
      for (const desc of descendants) {
        next.delete(desc.code);
      }
      return next;
    });
  }, []);

  const handleRemoveSelected = useCallback((code: string) => {
    setSelectedCodes(prev => {
      const next = new Map(prev);
      next.delete(code);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedCodes(new Map());
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedCodes(new Set());
  }, []);

  const handleToggleAiSearch = useCallback(() => {
    setUseAiSearch(prev => {
      const next = !prev;
      if (next && searchQuery.trim()) {
        aiSearch(searchQuery);
      } else {
        clearResults();
      }
      return next;
    });
  }, [searchQuery, aiSearch, clearResults]);

  const cpvCodeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of cpvData) {
      map.set(entry.code.split('-')[0], entry.code);
    }
    return map;
  }, []);

  const aiExpandedCodes = useMemo(() => {
    if (!useAiSearch || aiResults.length === 0) return new Set<string>();
    const codes = new Set<string>();
    for (const result of aiResults) {
      let num = result.cpv_code.split('-')[0];
      while (num) {
        let tz = 0;
        for (let i = num.length - 1; i >= 0; i--) {
          if (num[i] === '0') tz++;
          else break;
        }
        if (tz >= 6) break;
        const pos = num.length - 1 - tz;
        const chars = num.split('');
        chars[pos] = '0';
        num = chars.join('');
        const fullCode = cpvCodeMap.get(num);
        if (fullCode) codes.add(fullCode);
      }
    }
    return codes;
  }, [aiResults, useAiSearch, cpvCodeMap]);

  const allExpanded = useMemo(() => {
    const merged = new Set(effectiveExpanded);
    for (const code of aiExpandedCodes) {
      merged.add(code);
    }
    return merged;
  }, [effectiveExpanded, aiExpandedCodes]);

  const isStale = deferredQuery !== searchQuery && !useAiSearch;

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

          <Button className="bg-[#065F46] hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4" />
            Dodaj
          </Button>
        </div>

        {/* Search mode toggle */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={useAiSearch}
              onCheckedChange={handleToggleAiSearch}
            />
            <label
              className="text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer"
              onClick={handleToggleAiSearch}
            >
              <Sparkles
                className={`h-3.5 w-3.5 ${useAiSearch ? 'text-[#065F46]' : 'text-slate-400'}`}
              />
              Wyszukiwanie AI
            </label>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-slate-400 hover:text-slate-600 transition-colors">
                <HelpCircle className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipPopup side="bottom" className="max-w-xs">
                <div className="space-y-1.5 py-1">
                  <p className="font-semibold">Tryby wyszukiwania:</p>
                  <p>
                    <span className="font-medium">Zwykłe</span> — szuka po
                    dokładnych słowach kluczowych w kodach i nazwach CPV.
                  </p>
                  <p>
                    <span className="font-medium">AI</span> — szuka po
                    kontekście i znaczeniu frazy, np. "sprzątanie biur" znajdzie
                    powiązane kody CPV.
                  </p>
                </div>
              </TooltipPopup>
            </Tooltip>
          </TooltipProvider>
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
                Znaleziono {aiResults.length} wyników AI — podświetlone w
                drzewku
              </span>
            ) : searchQuery.trim() ? (
              <span>Brak wyników semantycznych</span>
            ) : (
              <span>
                Wpisz frazę aby wyszukać semantycznie (np. "sprzątanie biur")
              </span>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden bg-gray-50/30 flex flex-col">
          <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-white/60">
            <span className="text-xs text-slate-400">
              {filteredTree.length} kategorii głównych
            </span>
            <Button variant="ghost" size="xs" onClick={handleCollapseAll}>
              <ChevronsDownUp className="h-3.5 w-3.5" />
              Zwiń wszystko
            </Button>
          </div>
          <ScrollArea className="h-full flex-1">
            <div
              className={`p-6 space-y-0.5 transition-opacity duration-150 ${isStale ? 'opacity-60' : ''}`}
            >
              {useAiSearch && aiResults.length > 0 && (
                <div className="mb-4 p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Wyniki wyszukiwania AI
                  </h3>
                  <div className="space-y-1">
                    {aiResults.map(result => (
                      <div
                        key={result.cpv_code}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedCodesSet.has(result.cpv_code)
                            ? 'bg-emerald-50 border border-emerald-100'
                            : 'hover:bg-amber-100/50'
                        }`}
                        onClick={() =>
                          handleToggleSelect(
                            result.cpv_code,
                            result.description
                          )
                        }
                      >
                        <Checkbox
                          checked={selectedCodesSet.has(result.cpv_code)}
                          onCheckedChange={() =>
                            handleToggleSelect(
                              result.cpv_code,
                              result.description
                            )
                          }
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
              {filteredTree.map(node => (
                <TreeNode
                  key={node.code}
                  node={node}
                  expandedCodes={allExpanded}
                  selectedCodes={selectedCodesSet}
                  highlightedCodes={highlightedCodes}
                  onToggleExpand={handleToggleExpand}
                  onToggleSelect={handleToggleSelect}
                  onDeselectAllBelow={handleDeselectAllBelow}
                />
              ))}

              {filteredTree.length === 0 && (
                <div className="flex flex-col items-center py-12 text-center">
                  <Search className="h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">
                    Brak wyników
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Spróbuj zmienić frazę lub włącz wyszukiwanie AI
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Podsumowanie */}
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 text-sm">
              Podsumowanie
            </h2>
            <span className="bg-emerald-50 text-[#065F46] text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100">
              {selectedCodes.size} wybrane
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {Array.from(selectedCodes.entries()).map(([code, description]) => (
              <div
                key={code}
                className="bg-white border border-slate-100 rounded-lg p-3 group relative hover:border-[#065F46]/30 transition-colors shadow-sm"
              >
                <button
                  onClick={() => handleRemoveSelected(code)}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-[#065F46] font-medium">
                    {code}
                  </span>
                  <span className="text-xs text-slate-700 font-medium leading-tight pr-4">
                    {description}
                  </span>
                </div>
              </div>
            ))}

            {selectedCodes.size === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <Plus className="h-6 w-6 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">
                  Zaznacz kategorie w drzewku
                </p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-200">
            {selectedCodes.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50 mb-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Wyczyść wszystko
              </Button>
            )}
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
              onClick={() => {
                toastManager.add({
                  title: 'Zapisano',
                  description: `Wybrano ${selectedCodes.size} kategorii CPV`,
                  type: 'success'
                });
              }}
            >
              Zapisz zmiany
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
