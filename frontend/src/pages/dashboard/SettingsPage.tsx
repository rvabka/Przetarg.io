import { useState, useCallback } from 'react'
import {
  Users,
  SlidersHorizontal,
  Shield,
  CreditCard,
  Plus,
  X,
  Trash2,
  Mail,
  Bot,
  Lock,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { toastManager } from '@/components/ui/toast'

const VOIVODESHIPS = [
  'Dolnośląskie',
  'Kujawsko-pomorskie',
  'Lubelskie',
  'Lubuskie',
  'Łódzkie',
  'Małopolskie',
  'Mazowieckie',
  'Opolskie',
  'Podkarpackie',
  'Podlaskie',
  'Pomorskie',
  'Śląskie',
  'Świętokrzyskie',
  'Warmińsko-mazurskie',
  'Wielkopolskie',
  'Zachodniopomorskie',
] as const

export function SettingsPage() {
  const { profile } = useAuth()

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500">Ładowanie ustawień...</p>
      </div>
    )
  }

  return <SettingsForm key={profile.id} />
}

function SettingsForm() {
  const { user, profile, updateProfile } = useAuth()

  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName, setLastName] = useState(profile?.last_name || '')
  const [position, setPosition] = useState(profile?.position || '')
  const [language, setLanguage] = useState<'pl' | 'en'>((profile?.language as 'pl' | 'en') || 'pl')

  const [searchAllPoland, setSearchAllPoland] = useState(profile?.search_all_poland ?? false)
  const [selectedVoivodeships, setSelectedVoivodeships] = useState<Set<string>>(
    new Set(profile?.preferred_voivodeships || [])
  )

  const [keywords, setKeywords] = useState<string[]>(profile?.keywords || [])
  const [newKeyword, setNewKeyword] = useState('')
  const [negativeKeywords, setNegativeKeywords] = useState(profile?.negative_keywords || '')

  const [emailDailyReport, setEmailDailyReport] = useState(profile?.email_daily_report ?? true)
  const [emailHighMatchAlerts, setEmailHighMatchAlerts] = useState(profile?.email_high_match_alerts ?? true)

  const [saving, setSaving] = useState(false)

  const handleToggleVoivodeship = useCallback((v: string) => {
    setSelectedVoivodeships((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })
  }, [])

  const handleAddKeyword = useCallback(() => {
    const tag = newKeyword.trim().replace(/^#/, '')
    if (!tag) return
    setKeywords((prev) => (prev.includes(tag) ? prev : [...prev, tag]))
    setNewKeyword('')
  }, [newKeyword])

  const handleRemoveKeyword = useCallback((tag: string) => {
    setKeywords((prev) => prev.filter((k) => k !== tag))
  }, [])

  const handleKeywordKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddKeyword()
      }
    },
    [handleAddKeyword]
  )

  const handleSave = useCallback(async () => {
    setSaving(true)

    const { error } = await updateProfile({
      first_name: firstName,
      last_name: lastName,
      position,
      language,
      search_all_poland: searchAllPoland,
      preferred_voivodeships: Array.from(selectedVoivodeships),
      keywords,
      negative_keywords: negativeKeywords,
      email_daily_report: emailDailyReport,
      email_high_match_alerts: emailHighMatchAlerts,
    })

    setSaving(false)
    if (error) {
      toastManager.add({ title: 'Wystąpił błąd podczas zapisywania.', type: 'error' })
    } else {
      toastManager.add({ title: 'Zmiany zostały zapisane.', type: 'success' })
    }
  }, [
    firstName, lastName, position, language, searchAllPoland,
    selectedVoivodeships, keywords, negativeKeywords,
    emailDailyReport, emailHighMatchAlerts, updateProfile,
  ])

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-[#F9F9F9]/80 px-6 py-6 backdrop-blur-sm lg:px-10 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ustawienia konta
          </h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 shadow-lg"
          >
            {saving ? 'Zapisuję...' : 'Zapisz zmiany'}
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="mx-auto max-w-5xl space-y-8 pb-10">
          <Card className="rounded-lg p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#065F46]" />
              Profil i Zespół
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Imię
                </Label>
                <Input
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Nazwisko
                </Label>
                <Input
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Stanowisko
                </Label>
                <Input
                  value={position}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPosition(e.target.value)
                  }
                  placeholder="np. Owner / CEO"
                  className="bg-slate-50"
                />
              </div>
              <div className="flex flex-col justify-end space-y-3">
                <Label className="text-xs font-semibold text-slate-500 uppercase">
                  Język interfejsu
                </Label>
                <div className="inline-flex rounded-md sm:h-8">
                  <Button
                    variant={language === 'pl' ? 'default' : 'outline'}
                    className={`rounded-r-none ${language === 'pl' ? 'bg-[#065F46] hover:bg-emerald-700' : ''}`}
                    onClick={() => setLanguage('pl')}
                  >
                    PL
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    className={`rounded-l-none ${language === 'en' ? 'bg-[#065F46] hover:bg-emerald-700' : ''}`}
                    onClick={() => setLanguage('en')}
                  >
                    EN
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Członkowie zespołu
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#065F46] hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj osobę
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#065F46]/10 text-[#065F46] flex items-center justify-center font-bold text-xs">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-200 text-slate-600 rounded">
                    Właściciel
                  </span>
                </div>

                {/* Placeholder team member */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                      AK
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Anna Kowalska
                      </p>
                      <p className="text-xs text-slate-500">
                        a.kowalska@example.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-500 rounded border border-slate-200">
                      Edytor
                    </span>
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-[#065F46]" />
              Preferencje Przetargowe (AI)
            </h2>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Lokalizacja
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Cała Polska</span>
                  <Switch
                    checked={searchAllPoland}
                    onCheckedChange={(checked: boolean) =>
                      setSearchAllPoland(checked)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VOIVODESHIPS.map(v => (
                  <label
                    key={v}
                    className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors"
                  >
                    <Checkbox
                      checked={searchAllPoland || selectedVoivodeships.has(v)}
                      disabled={searchAllPoland}
                      onCheckedChange={() => handleToggleVoivodeship(v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    Słowa kluczowe i Tagi
                  </h3>
                  <a
                    href="/dashboard/cpv"
                    className="text-xs text-[#065F46] font-semibold hover:underline"
                  >
                    Edytuj kody CPV
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 min-h-[100px]">
                  <div className="flex flex-wrap gap-2">
                    {keywords.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-xs font-medium text-slate-700"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveKeyword(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      className="bg-transparent border-none text-xs focus:ring-0 focus:outline-none p-1 text-slate-500 w-24"
                      placeholder="+ Dodaj tag"
                      value={newKeyword}
                      onChange={e => setNewKeyword(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      onBlur={handleAddKeyword}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Negative Keywords (Wykluczenia)
                </h3>
                <div className="space-y-1">
                  <Textarea
                    value={negativeKeywords}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNegativeKeywords(e.target.value)
                    }
                    placeholder="Wpisz słowa kluczowe po przecinku, np. sprzątanie, ochrona..."
                    className="min-h-[100px] bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-400 text-right">
                    Te frazy będą automatycznie odrzucać przetargi.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#065F46]" />
              Bezpieczeństwo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Logowanie</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Zmień hasło
                  </Button>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-sm text-slate-600">
                      Weryfikacja dwuetapowa (2FA)
                    </span>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Preferencje E-mail
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={emailDailyReport}
                      onCheckedChange={(checked: boolean) =>
                        setEmailDailyReport(checked)
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        Raport Dzienny
                      </p>
                      <p className="text-xs text-slate-500">
                        Podsumowanie nowych przetargów każdego ranka.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={emailHighMatchAlerts}
                      onCheckedChange={(checked: boolean) =>
                        setEmailHighMatchAlerts(checked)
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        Alerty Match Score &gt; 90%
                      </p>
                      <p className="text-xs text-slate-500">
                        Natychmiastowe powiadomienie o idealnych przetargach.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-lg p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#065F46]" />
              Subskrypcja i Pomoc
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Twój Plan</h3>
                <div className="bg-emerald-50/50 border border-[#065F46]/20 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-[#065F46] uppercase tracking-wider">
                        Obecny plan
                      </span>
                      <p className="text-2xl font-bold text-slate-900">
                        PRO Plan
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-white text-xs font-bold text-slate-600 rounded border border-slate-200">
                      Aktywny
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Następne odnowienie: 12 Maj 2025
                  </p>
                  <div className="flex gap-3 items-center">
                    <button className="text-xs font-semibold text-[#065F46] hover:text-emerald-700">
                      Zmień plan
                    </button>
                    <span className="text-slate-300">|</span>
                    <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">
                      Historia faktur
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 md:border-l md:border-slate-100 md:pl-8">
                <h3 className="text-sm font-bold text-slate-800">Wsparcie</h3>
                <p className="text-sm text-slate-600">
                  Masz problem techniczny lub pytanie dotyczące faktur?
                </p>
                <div className="space-y-3 pt-2">
                  <a
                    href="mailto:grupaprzetargowa@gmail.com"
                    className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-[#065F46] transition-colors"
                  >
                    <Mail className="h-5 w-5 text-slate-400" />
                    grupaprzetargowa@gmail.com
                  </a>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Bot className="h-5 w-5 text-slate-400" />
                    <span>Asystent AI dostępny 24/7 (Chatbot)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
