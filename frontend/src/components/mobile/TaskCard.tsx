import { Icon } from '../ui/Icon'

interface TaskCardProps {
  icon: string
  title: string
  subtitle: string
  deadline: string
  status: 'urgent' | 'soon' | 'normal'
}

export function TaskCard({ icon, title, subtitle, deadline, status }: TaskCardProps) {
  const statusColors = {
    urgent: 'text-red-500 bg-red-50',
    soon: 'text-orange-500 bg-orange-50',
    normal: 'text-gray-400 bg-gray-50'
  }

  const iconColors = {
    urgent: 'bg-emerald-50 text-emerald-700',
    soon: 'bg-gray-50 text-text-muted-light',
    normal: 'bg-blue-50 text-blue-600'
  }

  return (
    <div className="bg-white p-6 rounded-[28px] flex items-center gap-5 border border-gray-100 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.05)]">
      <div className={`w-14 h-14 rounded-2xl ${iconColors[status]} flex items-center justify-center shrink-0`}>
        <Icon name={icon} size="lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-text-main-light truncate">{title}</div>
        <div className="text-[12px] text-text-muted-light font-medium mt-1">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-[11px] font-bold ${statusColors[status]} px-3 py-1.5 rounded-full`}>
          {deadline}
        </div>
      </div>
    </div>
  )
}
