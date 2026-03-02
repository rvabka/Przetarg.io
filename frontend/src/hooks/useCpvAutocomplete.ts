import { useState, useRef, useCallback, useEffect } from 'react';

export interface CpvEntry {
  code: string;
  description: string;
}

// Lazy-loaded CPV dataset (loaded once, shared across all hook instances)
let cpvData: CpvEntry[] | null = null;
let cpvLoadPromise: Promise<CpvEntry[]> | null = null;

function loadCpvData(): Promise<CpvEntry[]> {
  if (cpvData) return Promise.resolve(cpvData);
  if (cpvLoadPromise) return cpvLoadPromise;

  cpvLoadPromise = import('@/data/cpv-2008.json').then(mod => {
    cpvData = mod.default as CpvEntry[];
    return cpvData;
  });

  return cpvLoadPromise;
}

// Pre-warm the import so it's cached by the time user types
loadCpvData();

function matchScore(entry: CpvEntry, query: string): number {
  const q = query.toLowerCase();
  const code = entry.code.toLowerCase();
  const desc = entry.description.toLowerCase();

  // Exact code prefix → highest priority
  if (code.startsWith(q)) return 100;
  // Code contains query
  if (code.includes(q)) return 80;
  // Description starts with query
  if (desc.startsWith(q)) return 70;
  // Word-boundary match in description
  if (desc.includes(` ${q}`)) return 60;
  // Substring match in description
  if (desc.includes(q)) return 50;

  return 0;
}

const MAX_RESULTS = 30;

export function useCpvAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CpvEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeQuery = useRef('');

  const search = useCallback((q: string) => {
    setQuery(q);
    activeQuery.current = q;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Short debounce — data is local so search is fast
    debounceRef.current = setTimeout(async () => {
      const data = await loadCpvData();

      // Check if query is still current (avoid stale results)
      if (activeQuery.current !== q) return;

      const scored: { entry: CpvEntry; score: number }[] = [];

      for (let i = 0; i < data.length; i++) {
        const score = matchScore(data[i], trimmed);
        if (score > 0) {
          scored.push({ entry: data[i], score });
          // Early exit if we have plenty of high-quality matches
          if (scored.length > 200) break;
        }
      }

      scored.sort((a, b) => b.score - a.score);

      setResults(scored.slice(0, MAX_RESULTS).map(s => s.entry));
      setIsLoading(false);
    }, 150);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    activeQuery.current = '';
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { query, results, isLoading, search, clear };
}
