import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  CalendarDays,
  MapPin,
  PanelRightClose
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TenderDetailDrawer,
  type TenderDetail
} from '@/components/features/TenderDetailDrawer';
import { SimpleTooltip } from '@/components/ui/simple-tooltip';

interface Tender {
  id: string;
  organization: string;
  title: string;
  description?: string;
  budget: string;
  deadline: string;
  location: string;
  tags?: string[];
  matchScore: number;
  isNew?: boolean;
}

const mockTenders: Tender[] = [
  {
    id: '1',
    organization: 'Ministerstwo Cyfryzacji',
    title: 'System Zarządzania Dokumentacją AI z modułem NLP',
    description:
      'Wdrożenie systemu obiegu dokumentów z modułami AI do automatycznej kategoryzacji pism przychodzących.',
    budget: '500 000 PLN',
    deadline: 'Do 12.04.2024',
    location: 'Warszawa, Mazowieckie',
    matchScore: 98,
    isNew: true
  },
  {
    id: '2',
    organization: 'PKP Intercity S.A.',
    title: 'Modernizacja Infrastruktury IT - Etap II',
    description:
      'Modernizacja infrastruktury serwerowej oraz sieci LAN/WAN w 12 lokalizacjach na terenie kraju.',
    budget: '1 200 000 PLN',
    deadline: 'Do 30.04.2024',
    location: 'Cała Polska',
    tags: ['Infrastruktura', 'Hardware'],
    matchScore: 92
  },
  {
    id: '3',
    organization: 'Urząd Miasta Kraków',
    title: 'Wdrożenie Systemu Business Intelligence',
    description:
      'Dostawa licencji oraz wdrożenie platformy analitycznej do raportowania wydatków budżetowych.',
    budget: '150 000 PLN',
    deadline: 'Do 15.05.2024',
    location: 'Kraków, Małopolskie',
    matchScore: 91
  },
  {
    id: '4',
    organization: 'Szpital Wojewódzki w Gdańsku',
    title: 'Dostawa sprzętu serwerowego dla serwerowni zapasowej',
    description:
      'Dostawa, instalacja i konfiguracja sprzętu serwerowego dla zapasowego centrum danych.',
    budget: '850 000 PLN',
    deadline: 'Do 20.04.2024',
    location: 'Gdańsk, Pomorskie',
    matchScore: 74
  }
];

const mockTenderDetails: Record<string, TenderDetail> = {
  '1': {
    id: '1',
    title: 'System Zarządzania Dokumentacją AI z modułem NLP',
    referenceId: 'MC-2024-0341',
    summary:
      'Przetarg dotyczy wdrożenia zaawansowanego systemu zarządzania dokumentacją opartego na modułach NLP. Zamawiający kładzie silny nacisk na automatyzację procesów kategoryzacji i analizy treści. Projekt wymaga integracji z istniejącymi systemami rządowymi oraz zapewnienia wysokiego poziomu bezpieczeństwa danych.',
    formalRequirements: [
      'Doświadczenie w co najmniej 3 projektach AI/NLP o wartości powyżej 200k PLN każdy.',
      'Posiadanie poświadczenia bezpieczeństwa osobowego dla zespołu wdrożeniowego.',
      'Wniesienie wadium w wysokości 15 000 PLN przed terminem składania ofert.'
    ],
    risks: [
      'Krótki termin realizacji pierwszej fazy (tylko 45 dni od podpisania umowy).',
      'Wymagana pełna kompatybilność z legacy API Ministerstwa, brak dokumentacji technicznej.'
    ],
    timeline: [
      { label: 'Pytania do SIWZ', date: '05.04.2024', isActive: true },
      { label: 'Składanie Ofert', date: '12.04.2024, 10:00' },
      { label: 'Otwarcie Ofert', date: '12.04.2024, 12:00' }
    ]
  },
  '2': {
    id: '2',
    title: 'Modernizacja Infrastruktury IT - Etap II',
    referenceId: 'PKP-2024-0892',
    summary:
      'Zamówienie obejmuje modernizację infrastruktury serwerowej oraz sieci LAN/WAN w 12 lokalizacjach na terenie kraju. Wymaga dostawy i konfiguracji sprzętu oraz migracji istniejących usług.',
    formalRequirements: [
      'Minimum 5 lat doświadczenia w realizacji projektów infrastrukturalnych IT.',
      'Certyfikaty producenta sprzętu dla inżynierów wdrożeniowych.'
    ],
    risks: [
      'Rozproszenie geograficzne lokalizacji — logistyka wdrożenia.',
      'Konieczność zachowania ciągłości działania systemów podczas migracji.'
    ],
    timeline: [
      { label: 'Składanie Ofert', date: '30.04.2024, 12:00', isActive: true },
      { label: 'Otwarcie Ofert', date: '30.04.2024, 14:00' }
    ]
  },
  '3': {
    id: '3',
    title: 'Wdrożenie Systemu Business Intelligence',
    referenceId: 'UMK-2024-0156',
    summary:
      'Dostawa licencji oraz wdrożenie platformy analitycznej do raportowania wydatków budżetowych. System ma umożliwiać tworzenie dashboardów i raportów ad-hoc przez użytkowników biznesowych.',
    formalRequirements: [
      'Doświadczenie we wdrożeniach BI w sektorze publicznym.',
      'Zapewnienie szkoleń dla minimum 20 użytkowników końcowych.'
    ],
    risks: [
      'Brak jednolitego formatu danych źródłowych — wymagana integracja wielu systemów.'
    ],
    timeline: [
      { label: 'Pytania do SIWZ', date: '01.05.2024', isActive: true },
      { label: 'Składanie Ofert', date: '15.05.2024, 10:00' },
      { label: 'Otwarcie Ofert', date: '15.05.2024, 12:00' }
    ]
  }
};

const stats = [
  {
    label: 'Aktywne',
    value: '12',
    icon: TrendingUp,
    color: 'text-[#006D5B]',
    bg: 'bg-[#E0F2F1]'
  },
  {
    label: 'W toku',
    value: '5',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    label: 'Wygrane',
    value: '3',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    label: 'Przegrane',
    value: '2',
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50'
  }
];

export function MyTendersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<TenderDetail | null>(
    null
  );

  const handleOpenDrawer = (tenderId: string) => {
    const detail = mockTenderDetails[tenderId];
    if (detail) {
      setSelectedTender(detail);
      setDrawerOpen(true);
    }
  };

  const filteredTenders = mockTenders.filter(
    t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#F9F9F9]/80 px-6 py-6 backdrop-blur-sm lg:px-10 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Moje Przetargi
            </h1>
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-[#006D5B]/20 bg-[#E0F2F1] text-[#006D5B]"
            >
              <span className="h-2 w-2 rounded-full bg-[#006D5B]" />
              Match Score &gt;90%
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Szukaj w wynikach..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="w-64 pl-10"
              />
            </div>
            <Button variant="outline">
              <SlidersHorizontal className="h-4.5 w-4.5" />
              Filtry
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
          {/* Tender grid */}
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTenders.map(tender => {
                const isLowMatch = tender.matchScore < 80;
                return (
                  <Card
                    key={tender.id}
                    className={`group relative flex flex-col justify-between rounded-lg p-5 transition-colors duration-200 hover:border-[#006D5B]/40 ${
                      isLowMatch ? 'opacity-60 hover:opacity-100' : ''
                    }`}
                  >
                    {/* Drawer icon — top right */}
                    <button
                      onClick={() => handleOpenDrawer(tender.id)}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center cursor-pointer justify-center rounded-md text-slate-300 transition-colors duration-200 hover:bg-[#E0F2F1] hover:text-[#006D5B]"
                      title="Otwórz panel analizy"
                    >
                      <PanelRightClose className="h-5 w-5" />
                    </button>

                    {/* Card content */}
                    <div className="space-y-3">
                      {/* Header row: org + badge */}
                      <div className="flex items-center gap-2 pr-8">
                        <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {tender.organization}
                        </span>
                        {tender.isNew && (
                          <Badge
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                          >
                            NOWE
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="pr-8 text-lg font-semibold leading-snug text-slate-900 line-clamp-2">
                        {tender.title}
                      </h2>

                      {/* Description */}
                      {tender.description && (
                        <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
                          {tender.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5 text-slate-300" />
                          <span className="font-medium text-slate-700">
                            {tender.budget}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-300" />
                          <span>{tender.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-300" />
                          <span>{tender.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <Button variant="default" size="sm">
                        Szczegóły
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <SimpleTooltip content="Dopasowanie do Twojego profilu">
                        <span
                          className={`cursor-default text-sm font-bold tabular-nums ${
                            isLowMatch ? 'text-slate-400' : 'text-[#006D5B]'
                          }`}
                        >
                          {tender.matchScore}%
                        </span>
                      </SimpleTooltip>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Load more */}
            <div className="flex justify-center pb-8 pt-8">
              <Button variant="outline" size="lg">
                Załaduj więcej
              </Button>
            </div>
          </div>

          {/* Sidebar widgets */}
          <div className="space-y-6 xl:sticky xl:top-0 xl:self-start">
            <Card className="rounded-lg p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Postępowania
              </h3>
              <div className="space-y-3">
                {stats.map(stat => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${stat.bg}`}
                      >
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <span className="text-sm text-slate-600">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Łącznie</span>
                  <span className="text-lg font-bold text-slate-900">22</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-lg border-dashed p-5">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Sparkles className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Wkrótce</p>
                <p className="mt-1 text-xs text-slate-400">
                  Tu pojawi się więcej widgetów
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <TenderDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tender={selectedTender}
      />
    </div>
  );
}
