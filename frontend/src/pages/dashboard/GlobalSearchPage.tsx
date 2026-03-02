import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  CalendarDays,
  Gavel,
  Loader2,
  SearchX,
  History,
  SlidersHorizontal,
  ChevronRight,
  X,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem
} from '@/components/ui/select';
import {
  TenderDetailDrawer,
  type TenderDetail
} from '@/components/features/TenderDetailDrawer';
import { useCpvAutocomplete, type CpvEntry } from '@/hooks/useCpvAutocomplete';

// --- Mock data (no backend needed) ---
interface SearchResult {
  tender_id: number;
  external_id: string;
  title: string;
  organization: string;
  description: string;
  status: string;
  score: number;
  tags: string[];
  budget: string;
  deadline: string;
  location: string;
  deposit?: string;
}

const mockResults: SearchResult[] = [
  {
    tender_id: 1,
    external_id: 'MC-2024-0341',
    title: 'System Zarządzania Dokumentacją AI z modułem NLP',
    organization: 'Ministerstwo Cyfryzacji',
    description:
      'Wdrożenie systemu obiegu dokumentów z modułami AI do automatycznej kategoryzacji pism przychodzących, integracja z EZD RP oraz szkolenie personelu.',
    status: 'NOWE',
    score: 98,
    tags: ['IT', 'NLP'],
    budget: '500 000 PLN',
    deadline: 'Do 12.04.2024',
    location: 'Warszawa, Mazowieckie',
    deposit: '5 000 PLN'
  },
  {
    tender_id: 2,
    external_id: 'UMWM-2024-0112',
    title: 'Budowa hurtowni danych przestrzennych z modułem analitycznym',
    organization: 'Urząd Marszałkowski Woj. Małopolskiego',
    description:
      'Stworzenie centralnego repozytorium danych GIS dla jednostek samorządu terytorialnego wraz z aplikacją webową do wizualizacji danych.',
    status: 'NOWE',
    score: 92,
    tags: ['Cloud', 'Data'],
    budget: '1 200 000 PLN',
    deadline: 'Do 28.04.2024',
    location: 'Kraków, Małopolskie',
    deposit: '15 000 PLN'
  },
  {
    tender_id: 3,
    external_id: 'PWR-2024-0067',
    title: 'Dostawa klastra obliczeniowego do trenowania modeli językowych',
    organization: 'Politechnika Wrocławska',
    description:
      'Przedmiotem zamówienia jest dostawa, instalacja i konfiguracja klastra obliczeniowego opartego o akceleratory GPU dla centrum badawczego AI.',
    status: '',
    score: 87,
    tags: ['Research', 'AI'],
    budget: '3 500 000 PLN',
    deadline: 'Do 05.05.2024',
    location: 'Wrocław, Dolnośląskie',
    deposit: '40 000 PLN'
  },
  {
    tender_id: 4,
    external_id: 'PKP-2024-0892',
    title: 'Modernizacja Infrastruktury IT - Etap II',
    organization: 'PKP Intercity S.A.',
    description:
      'Modernizacja infrastruktury serwerowej oraz sieci LAN/WAN w 12 lokalizacjach na terenie kraju. Wymaga dostawy i konfiguracji sprzętu oraz migracji usług.',
    status: '',
    score: 74,
    tags: ['Infrastruktura', 'Hardware'],
    budget: '850 000 PLN',
    deadline: 'Do 20.04.2024',
    location: 'Cała Polska'
  }
];

// Filter option labels
const thresholdLabels: Record<string, string> = {
  '40': '40%+',
  '50': '50%+',
  '60': '60%+',
  '70': '70%+',
  '80': '80%+',
  '90': '90%+'
};

const limitLabels: Record<string, string> = {
  '5': '5 wyników',
  '10': '10 wyników',
  '20': '20 wyników',
  '50': '50 wyników'
};

const modeLabels: Record<string, string> = {
  all: 'Wszystkie tryby',
  open: 'Przetarg nieograniczony',
  quote: 'Zapytanie ofertowe'
};

const statusLabels: Record<string, string> = {
  all: 'Dowolny status',
  new: 'Nowe',
  updated: 'Aktualizacje'
};

export function GlobalSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [threshold, setThreshold] = useState('60');
  const [limit, setLimit] = useState('20');
  const [mode, setMode] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCpv, setSelectedCpv] = useState<CpvEntry[]>([]);

  // CPV autocomplete
  const cpv = useCpvAutocomplete();
  const [cpvInputFocused, setCpvInputFocused] = useState(false);
  const cpvContainerRef = useRef<HTMLDivElement>(null);

  // Close CPV dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cpvContainerRef.current &&
        !cpvContainerRef.current.contains(e.target as Node)
      ) {
        setCpvInputFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCpvSelect = useCallback(
    (entry: CpvEntry) => {
      setSelectedCpv(prev => {
        if (prev.some(c => c.code === entry.code)) return prev;
        return [...prev, entry];
      });
      cpv.clear();
      setCpvInputFocused(false);
    },
    [cpv]
  );

  const handleCpvRemove = useCallback((code: string) => {
    setSelectedCpv(prev => prev.filter(c => c.code !== code));
  }, []);

  // Helper to handle Base UI Select's (string | null) signature
  const setter =
    (fn: React.Dispatch<React.SetStateAction<string>>) =>
    (v: string | null) => {
      if (v !== null) fn(v);
    };

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<TenderDetail | null>(
    null
  );

  // Active filter chips (non-default values)
  const activeFilters = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (threshold !== '60')
      chips.push({
        key: 'threshold',
        label: `Próg: ${thresholdLabels[threshold]}`,
        onClear: () => setThreshold('60')
      });
    if (limit !== '20')
      chips.push({
        key: 'limit',
        label: limitLabels[limit],
        onClear: () => setLimit('20')
      });
    if (mode !== 'all')
      chips.push({
        key: 'mode',
        label: modeLabels[mode],
        onClear: () => setMode('all')
      });
    if (filterStatus !== 'all')
      chips.push({
        key: 'status',
        label: statusLabels[filterStatus],
        onClear: () => setFilterStatus('all')
      });
    for (const c of selectedCpv) {
      chips.push({
        key: `cpv-${c.code}`,
        label: `CPV: ${c.code}`,
        onClear: () => handleCpvRemove(c.code)
      });
    }
    return chips;
  }, [threshold, limit, mode, filterStatus, selectedCpv, handleCpvRemove]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    // Simulate search delay then filter mock data
    await new Promise(r => setTimeout(r, 400));

    const q = searchQuery.toLowerCase();
    const filtered = mockResults.filter(
      r =>
        r.title.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.external_id.toLowerCase().includes(q)
    );

    setResults(filtered.length > 0 ? filtered : mockResults);
    setLoading(false);
  }, [searchQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  const handleOpenDrawer = useCallback((result: SearchResult) => {
    const detail: TenderDetail = {
      id: String(result.tender_id),
      title: result.title,
      referenceId: result.external_id,
      summary: result.description
    };
    setSelectedTender(detail);
    setDrawerOpen(true);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#006D5B] font-bold';
    if (score >= 70) return 'text-emerald-600 font-bold';
    if (score >= 50) return 'text-amber-600 font-semibold';
    return 'text-slate-400 font-medium';
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5 sm:items-center">
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
              Globalna wyszukiwarka ofert
            </h1>
            <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
              Przeszukuj tysiące ofert przetargowych z wykorzystaniem algorytmów
              AI.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 gap-2" size="sm">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Ostatnie wyszukiwania</span>
          </Button>
        </div>

        {/* Search card */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {/* Search row */}
          <div className="mb-3 flex gap-2 sm:mb-4 sm:gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Wpisz słowa kluczowe, nazwę zamawiającego lub numer referencyjny..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#006D5B] focus:outline-none focus:ring-1 focus:ring-[#006D5B] transition-colors"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="h-10 bg-[#006D5B] hover:bg-[#004d40] text-white px-6 text-sm gap-2 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SlidersHorizontal className="h-4 w-4" />
              )}
              {loading ? 'Szukam...' : 'Filtruj'}
            </Button>
          </div>

          {/* CPV autocomplete */}
          <div ref={cpvContainerRef} className="relative mb-3 sm:mb-4">
            <label className="mb-1.5 ml-0.5 block text-xs font-medium text-slate-500">
              Kody CPV
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 transition-colors focus-within:border-[#006D5B] focus-within:ring-1 focus-within:ring-[#006D5B]">
              {selectedCpv.map(c => (
                <span
                  key={c.code}
                  className="inline-flex items-center gap-1 rounded-md bg-[#006D5B]/10 px-2 py-0.5 text-xs font-medium text-[#006D5B]"
                >
                  <Tag className="h-3 w-3" />
                  {c.code}
                  <button
                    onClick={() => handleCpvRemove(c.code)}
                    className="ml-0.5 rounded-full hover:bg-[#006D5B]/20 p-0.5 transition-colors cursor-pointer"
                    aria-label={`Usuń ${c.code}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={
                  selectedCpv.length > 0
                    ? 'Dodaj kolejny kod...'
                    : 'Wpisz kod lub nazwę CPV, np. 72000000 lub "oprogramowanie"...'
                }
                value={cpv.query}
                onChange={e => cpv.search(e.target.value)}
                onFocus={() => setCpvInputFocused(true)}
                className="min-w-45 flex-1 border-none bg-transparent py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {cpv.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            {/* CPV dropdown */}
            {cpvInputFocused && cpv.results.length > 0 && (
              <div className="absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {cpv.results.map((entry, idx) => {
                  const isSelected = selectedCpv.some(
                    c => c.code === entry.code
                  );
                  return (
                    <button
                      key={entry.code}
                      onClick={() => handleCpvSelect(entry)}
                      disabled={isSelected}
                      className={`flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-50 text-slate-400'
                          : 'hover:bg-[#006D5B]/5'
                      } ${idx > 0 ? 'border-t border-slate-100' : ''}`}
                    >
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
                        {entry.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-700">
                        {entry.description}
                      </span>
                      {isSelected && (
                        <span className="shrink-0 text-xs text-[#006D5B]">
                          Dodano
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {cpvInputFocused &&
              cpv.query.length >= 2 &&
              cpv.results.length === 0 &&
              !cpv.isLoading && (
                <div className="absolute inset-x-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white p-4 text-center text-sm text-slate-500 shadow-lg">
                  Brak pasujących kodów CPV
                </div>
              )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 ml-0.5 block text-xs font-medium text-slate-500">
                Próg dopasowania
              </label>
              <Select value={threshold} onValueChange={setter(setThreshold)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz próg">
                    {thresholdLabels[threshold]}
                  </SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="40">40% i więcej</SelectItem>
                  <SelectItem value="50">50% i więcej</SelectItem>
                  <SelectItem value="60">60% i więcej</SelectItem>
                  <SelectItem value="70">70% i więcej</SelectItem>
                  <SelectItem value="80">80% i więcej</SelectItem>
                  <SelectItem value="90">90% i więcej</SelectItem>
                </SelectPopup>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 ml-0.5 block text-xs font-medium text-slate-500">
                Liczba wyników
              </label>
              <Select value={limit} onValueChange={setter(setLimit)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz ilość">
                    {limitLabels[limit]}
                  </SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="5">5 wyników</SelectItem>
                  <SelectItem value="10">10 wyników</SelectItem>
                  <SelectItem value="20">20 wyników</SelectItem>
                  <SelectItem value="50">50 wyników</SelectItem>
                </SelectPopup>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 ml-0.5 block text-xs font-medium text-slate-500">
                Tryb zamówienia
              </label>
              <Select value={mode} onValueChange={setter(setMode)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz tryb">
                    {modeLabels[mode]}
                  </SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="open">Przetarg nieograniczony</SelectItem>
                  <SelectItem value="quote">Zapytanie ofertowe</SelectItem>
                </SelectPopup>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 ml-0.5 block text-xs font-medium text-slate-500">
                Status
              </label>
              <Select
                value={filterStatus}
                onValueChange={setter(setFilterStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz status">
                    {statusLabels[filterStatus]}
                  </SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="new">Nowe</SelectItem>
                  <SelectItem value="updated">Aktualizacje</SelectItem>
                </SelectPopup>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400 mr-1">
                Aktywne filtry:
              </span>
              {activeFilters.map(f => (
                <button
                  key={f.key}
                  onClick={f.onClear}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors cursor-pointer"
                >
                  {f.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[#006D5B]" />
            <p className="text-sm font-medium text-slate-500">
              Przeszukuję bazę przetargów...
            </p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchX className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base font-medium text-slate-500">
              Brak wyników dla &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Spróbuj zmienić frazę lub obniżyć próg dopasowania.
            </p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base font-medium text-slate-500">
              Wyszukaj przetargi
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Wpisz frazę i naciśnij Enter lub kliknij &ldquo;Filtruj&rdquo;
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-slate-500">
              Znaleziono{' '}
              <span className="font-semibold text-slate-700">
                {results.length}
              </span>{' '}
              wyników
            </p>

            {results.map(result => (
              <Card
                key={result.tender_id}
                className="group relative rounded-lg bg-white p-4 transition-shadow hover:shadow-md sm:p-6"
              >
                {/* Header row */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {result.external_id}
                    </span>
                    {result.status && (
                      <Badge variant="outline" size="sm" className="uppercase">
                        {result.status}
                      </Badge>
                    )}
                    {result.tags.map(tag => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-1 pr-6 text-sm font-bold leading-snug text-slate-900 sm:pr-8 sm:text-base">
                  {result.title}
                </h3>

                {/* Organization */}
                <p className="mb-2 text-sm font-medium text-[#006D5B]">
                  {result.organization}
                </p>

                {/* Description */}
                <p className="mb-4 max-w-4xl text-sm leading-relaxed text-slate-600 line-clamp-2">
                  {result.description}
                </p>

                {/* Meta chips */}
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 sm:mb-4 sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Gavel className="h-3.5 w-3.5 text-slate-400" />
                    <span>{result.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    <span>{result.deadline}</span>
                  </div>
                  {result.location && (
                    <span className="text-slate-400">{result.location}</span>
                  )}
                  {result.deposit && (
                    <span className="text-slate-400">
                      Wadium: {result.deposit}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:pt-4">
                  <Button
                    onClick={() => handleOpenDrawer(result)}
                    className="bg-[#006D5B] hover:bg-[#004d40] text-white text-sm gap-1 group/btn"
                    size="sm"
                  >
                    Szczegóły
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Button>
                  <span
                    className={`text-lg tabular-nums ${getScoreColor(result.score)}`}
                  >
                    {result.score}%
                  </span>
                </div>

                {/* Chevron indicator */}
                <div className="absolute right-4 top-4 text-slate-300 sm:right-6 sm:top-6">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Tender detail drawer */}
      <TenderDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tender={selectedTender}
      />
    </div>
  );
}
