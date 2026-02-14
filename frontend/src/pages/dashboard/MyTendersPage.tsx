import { useState } from 'react'
import { Search, SlidersHorizontal, Sparkles, ArrowRight, TrendingUp, Clock, CheckCircle2, XCircle, Banknote, CalendarDays, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'

interface Tender {
  id: string
  organization: string
  title: string
  budget: string
  deadline: string
  location: string
  description?: string
  tags?: string[]
  matchScore: number
  isNew?: boolean
}

const mockTenders: Tender[] = [
  {
    id: '1',
    organization: 'Ministerstwo Cyfryzacji',
    title: 'System Zarządzania Dokumentacją AI z modułem NLP',
    budget: '500 000 PLN',
    deadline: 'Do 12.04.2024',
    location: 'Warszawa, Mazowieckie',
    description:
      'Przedmiotem zamówienia jest zaprojektowanie, wdrożenie i utrzymanie systemu obiegu dokumentów wykorzystującego algorytmy sztucznej inteligencji do automatycznej kategoryzacji pism przychodzących.',
    matchScore: 98,
    isNew: true,
  },
  {
    id: '2',
    organization: 'PKP Intercity S.A.',
    title: 'Modernizacja Infrastruktury IT - Etap II',
    budget: '1 200 000 PLN',
    deadline: 'Do 30.04.2024',
    location: 'Cała Polska',
    tags: ['Infrastruktura', 'Hardware'],
    matchScore: 92,
  },
  {
    id: '3',
    organization: 'Urząd Miasta Kraków',
    title: 'Wdrożenie Systemu Business Intelligence',
    budget: '150 000 PLN',
    deadline: 'Do 15.05.2024',
    location: 'Kraków, Małopolskie',
    description:
      'Dostawa licencji oraz wdrożenie platformy analitycznej do raportowania wydatków budżetowych.',
    matchScore: 91,
  },
  {
    id: '4',
    organization: 'Szpital Wojewódzki w Gdańsku',
    title: 'Dostawa sprzętu serwerowego dla serwerowni zapasowej',
    budget: '850 000 PLN',
    deadline: 'Do 20.04.2024',
    location: 'Gdańsk, Pomorskie',
    matchScore: 74,
  },
]

const stats = [
  { label: 'Aktywne', value: '12', icon: TrendingUp, color: 'text-[#006D5B]', bg: 'bg-[#E0F2F1]' },
  { label: 'W toku', value: '5', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Wygrane', value: '3', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Przegrane', value: '2', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
]

export function MyTendersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTenders = mockTenders.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organization.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#F9F9F9]/80 px-6 py-6 backdrop-blur-sm lg:px-10 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Moje Przetargi</h1>
            <Badge variant="outline" className="gap-1.5 rounded-full border-[#006D5B]/20 bg-[#E0F2F1] text-[#006D5B]">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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

      {/* Content - Grid layout */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
          {/* Left column - Tender list */}
          <div className="space-y-6">
            {filteredTenders.map((tender) => {
              const isLowMatch = tender.matchScore < 80
              return (
                <Card
                  key={tender.id}
                  className={`group relative rounded-lg p-8 transition-all duration-300 hover:border-[#006D5B] ${
                    isLowMatch ? 'opacity-60 hover:opacity-100' : ''
                  }`}
                >
                  {/* Left accent bar for high match */}
                  {!isLowMatch && (
                    <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-lg bg-[#006D5B]" />
                  )}

                  <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    {/* Left content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            {tender.organization}
                          </span>
                          {tender.isNew && (
                            <Badge variant="outline" size="sm">NOWE</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#006D5B]">
                          {tender.title}
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Banknote className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{tender.budget}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-slate-400" />
                          <span>{tender.deadline}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>{tender.location}</span>
                        </div>
                      </div>

                      {tender.description && (
                        <p className="pr-4 pt-1 text-sm leading-relaxed text-slate-600">
                          {tender.description}
                        </p>
                      )}

                      {tender.tags && tender.tags.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {tender.tags.map((tag) => (
                            <Badge key={tag} variant="outline" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right - AI Match */}
                    <div className="hidden min-w-30 flex-col items-end justify-between space-y-6 md:flex">
                      <div className="text-right">
                        <span className="mb-1 block text-xs font-bold uppercase text-slate-500">
                          AI Match
                        </span>
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`text-3xl font-bold ${
                              isLowMatch ? 'text-slate-400' : 'text-[#006D5B]'
                            }`}
                          >
                            {tender.matchScore}%
                          </span>
                          {tender.matchScore >= 95 && (
                            <Sparkles className="h-6 w-6 text-[#006D5B]" />
                          )}
                        </div>
                      </div>
                      <div className="flex w-full justify-end">
                        {isLowMatch ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 transition-all duration-200 group-hover:opacity-100"
                          >
                            Zobacz
                          </Button>
                        ) : (
                          <Button
                            className="opacity-0 transition-all duration-200 group-hover:opacity-100"
                          >
                            Szczegóły
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Mobile AI Match */}
                    <div className="flex items-center justify-between md:hidden">
                      <span
                        className={`text-2xl font-bold ${
                          isLowMatch ? 'text-slate-400' : 'text-[#006D5B]'
                        }`}
                      >
                        {tender.matchScore}%
                      </span>
                      <Button size="sm" variant={isLowMatch ? 'ghost' : 'default'}>
                        Szczegóły
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-6">
                    <Progress value={tender.matchScore}>
                      <ProgressTrack className="h-1 bg-slate-100">
                        <ProgressIndicator
                          className={isLowMatch ? 'bg-slate-300' : 'bg-[#006D5B]'}
                          style={{ opacity: isLowMatch ? 1 : tender.matchScore / 100 }}
                        />
                      </ProgressTrack>
                    </Progress>
                  </div>
                </Card>
              )
            })}

            {/* Load more */}
            <div className="flex justify-center pb-8 pt-6">
              <Button variant="outline" size="lg">
                Załaduj więcej
              </Button>
            </div>
          </div>

          {/* Right column - Sidebar widgets */}
          <div className="space-y-6 xl:sticky xl:top-0 xl:self-start">
            {/* Statistics card */}
            <Card className="rounded-lg p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Postępowania
              </h3>
              <div className="space-y-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-md ${stat.bg}`}>
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      </div>
                      <span className="text-sm text-slate-600">{stat.label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{stat.value}</span>
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

            {/* Placeholder card for future content */}
            <Card className="rounded-lg border-dashed p-5">
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Sparkles className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Wkrótce</p>
                <p className="mt-1 text-xs text-slate-400">Tu pojawi się więcej widgetów</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
