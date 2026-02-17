import { useState, useRef, useCallback } from 'react'

interface CpvSearchResult {
  cpv_code: string
  description: string
  score: number
}

interface SearchResponse {
  query: string
  count: number
  results: CpvSearchResult[]
}

const CPV_SEARCH_API = 'http://localhost:8000'

export function useCpvSearch() {
  const [results, setResults] = useState<CpvSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string, limit = 20) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const params = new URLSearchParams({ q: query, limit: String(limit) })
        const res = await fetch(`${CPV_SEARCH_API}/search?${params}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`)
        }

        const data: SearchResponse = await res.json()
        setResults(data.results)
        setError(null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const isConnectionError =
          err instanceof TypeError && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))
        setError(
          isConnectionError
            ? 'Serwer AI niedostępny — uruchom: uvicorn main:app --port 8000'
            : err instanceof Error ? err.message : 'Błąd wyszukiwania'
        )
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    setIsLoading(false)
  }, [])

  return { results, isLoading, error, search, clearResults }
}
