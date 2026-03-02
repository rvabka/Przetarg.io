import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetPopup,
  SheetHeader,
  SheetPanel,
  SheetFooter,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

export interface TenderDetail {
  id: string;
  title: string;
  referenceId?: string;
  summary?: string;
  formalRequirements?: string[];
  risks?: string[];
  timeline?: { label: string; date: string; isActive?: boolean }[];
}

interface TenderDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tender: TenderDetail | null;
  onAddToWatchlist?: () => void;
  onViewDocumentation?: () => void;
}

export function TenderDetailDrawer({
  open,
  onOpenChange,
  tender,
  onAddToWatchlist,
  onViewDocumentation
}: TenderDetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {tender && (
        <SheetPopup side="right" className="max-w-135">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle>Analiza Przetargu</SheetTitle>
                {tender.referenceId && (
                  <SheetDescription className="mt-1 text-xs font-medium">
                    ID: {tender.referenceId}
                  </SheetDescription>
                )}
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" size="sm">
                Analiza merytoryczna
              </Badge>
            </div>
          </SheetHeader>

          <SheetPanel>
            <div className="space-y-8">
              {/* Executive Summary */}
              {tender.summary && (
                <section>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Executive Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {tender.summary}
                  </p>
                </section>
              )}

              {/* Wymagania Formalne */}
              {tender.formalRequirements &&
                tender.formalRequirements.length > 0 && (
                  <section>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Wymagania Formalne
                    </h4>
                    <ul className="space-y-2">
                      {tender.formalRequirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-slate-600"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

              {/* Kluczowe Ryzyka */}
              {tender.risks && tender.risks.length > 0 && (
                <section className="rounded-lg border border-red-100 bg-red-50/30 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-red-500">
                    Kluczowe Ryzyka
                  </h4>
                  <ul className="space-y-2">
                    {tender.risks.map((risk, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-red-600"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Harmonogram */}
              {tender.timeline && tender.timeline.length > 0 && (
                <section>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Harmonogram
                  </h4>
                  <div className="relative space-y-6 border-l border-slate-100 pl-4">
                    {tender.timeline.map((item, i) => (
                      <div key={i} className="relative">
                        <div
                          className={`absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full border-2 bg-white ${
                            item.isActive
                              ? 'border-[#006D5B]'
                              : 'border-slate-300'
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Termin: {item.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </SheetPanel>

          <SheetFooter variant="default" className="sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={onViewDocumentation}
            >
              Pełna dokumentacja
            </Button>
            <Button
              className="w-full sm:flex-1 bg-[#064E3B] hover:bg-[#064E3B]/90"
              onClick={onAddToWatchlist}
            >
              Dodaj do obserwowanych
            </Button>
          </SheetFooter>
        </SheetPopup>
      )}
    </Sheet>
  );
}
