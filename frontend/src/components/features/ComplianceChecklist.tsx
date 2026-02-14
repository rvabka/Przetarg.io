import { Badge } from '../ui/badge';

interface ComplianceItem {
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error';
  statusLabel: string;
  statusIcon: string;
  actions?: { label: string; variant: 'primary' | 'outline' }[];
}

const items: ComplianceItem[] = [
  {
    title: 'Certyfikat ISO 27001',
    description:
      'AI wykryło ważny certyfikat w Bazie Wiedzy pasujący do wymagania 3.2.1. Dokument ważny do 2025.',
    status: 'success',
    statusLabel: 'Spełniony',
    statusIcon: 'check_circle'
  },
  {
    title: 'Rezydencja Danych (UE)',
    description:
      'Potwierdzona dostępność regionu Frankfurt zgodnie z sekcją 4.1. Zgodność z RODO zapewniona.',
    status: 'success',
    statusLabel: 'Spełniony',
    statusIcon: 'check_circle'
  },
  {
    title: 'Niestandardowe SLA',
    description:
      'Wymóg 99.999% dostępności przekracza standardową ofertę (99.99%). Wymagana akceptacja techniczna.',
    status: 'warning',
    statusLabel: 'Do Przeglądu',
    statusIcon: 'warning',
    actions: [
      { label: 'Utwórz Wyjątek', variant: 'primary' },
      { label: 'Dział Prawny', variant: 'outline' }
    ]
  }
];

export function ComplianceChecklist() {
  return (
    <div className="space-y-6 overflow-y-auto pr-2 h-full">
      {items.map((item, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border ${
            item.status === 'success'
              ? 'border-emerald-200 bg-emerald-50/40'
              : 'border-yellow-200 bg-yellow-50/40'
          } hover:shadow-md transition-all duration-300`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-base font-bold text-text-main-light">
              {item.title}
            </span>
            <Badge variant={item.status === 'success' ? 'success' : 'warning'} size="default">
              {item.statusLabel}
            </Badge>
          </div>
          <p className="text-sm text-text-muted-light leading-relaxed font-medium">
            {item.description}
          </p>
          {item.actions && (
            <div className="mt-4 flex gap-3">
              {item.actions.map((action, i) => (
                <button
                  key={i}
                  className={`text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm ${
                    action.variant === 'primary'
                      ? 'bg-primary text-white hover:bg-emerald-800'
                      : 'bg-white border border-border-light hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
