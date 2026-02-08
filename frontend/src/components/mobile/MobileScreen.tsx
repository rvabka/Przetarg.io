import { Icon } from '../ui/Icon'
import { TaskCard } from './TaskCard'

const tasks = [
  { icon: 'calendar_today', title: 'Modernizacja Kolei', subtitle: 'PKP PLK S.A.', deadline: 'Dziś', status: 'urgent' as const },
  { icon: 'description', title: 'Dostawa Sprzętu', subtitle: 'Min. Cyfryzacji', deadline: 'Jutro', status: 'soon' as const },
  { icon: 'edit_document', title: 'Audyt Energetyczny', subtitle: 'Tauron', deadline: '3 dni', status: 'normal' as const }
]

export function MobileScreen() {
  return (
    <div className="h-full w-full bg-white flex flex-col font-sans relative">
      {/* Status Bar */}
      <div className="h-16 w-full flex justify-between items-end px-8 pb-2 text-[14px] font-semibold text-text-main-light z-20">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <Icon name="signal_cellular_alt" size="sm" />
          <Icon name="wifi" size="sm" />
          <Icon name="battery_full" size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-[12px] uppercase font-bold text-gray-400 tracking-wider mb-1">Witaj ponownie</div>
            <div className="font-bold text-3xl text-text-main-light">Anna N.</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-text-main-light relative shadow-sm">
            <Icon name="notifications" size="lg" />
            <div className="absolute top-3.5 right-4 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-[32px] p-8 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-6 relative">
            <div>
              <div className="text-emerald-800/70 text-[12px] font-bold uppercase tracking-wide mb-1">
                Skuteczność Ofert
              </div>
              <div className="text-[3.5rem] font-black text-primary tracking-tight leading-none">85%</div>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <Icon name="trending_up" size="xl" className="text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-2 h-16 w-full mt-2">
            {[40, 60, 45, 75, 30, 100].map((height, i) => {
              const colors = ['emerald-100', 'emerald-200', 'emerald-300', 'emerald-400', 'emerald-500', 'emerald-600']
              return (
                <div key={i} className={`w-1/6 bg-${colors[i]} rounded-t-sm`} style={{ height: `${height}%` }}></div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-lg font-bold text-text-main-light">Nadchodzące</h3>
          <span className="text-[12px] font-bold text-primary cursor-pointer">Wszystkie</span>
        </div>

        <div className="space-y-5 flex-1 overflow-hidden pb-4">
          {tasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/95 backdrop-blur absolute bottom-0 inset-x-0 h-[100px] flex items-center justify-around pb-6 pt-4 border-t border-gray-100 z-20">
        <div className="text-primary flex flex-col items-center gap-1">
          <Icon name="dashboard" size="xl" className="font-bold" />
        </div>
        <div className="text-gray-300 flex flex-col items-center gap-1">
          <Icon name="folder" size="xl" />
        </div>
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center -mt-10 shadow-lg shadow-black/20 text-white z-10 border-4 border-white">
          <Icon name="add" size="xl" />
        </div>
        <div className="text-gray-300 flex flex-col items-center gap-1">
          <Icon name="chat" size="xl" />
        </div>
        <div className="text-gray-300 flex flex-col items-center gap-1">
          <Icon name="person" size="xl" />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-black rounded-full z-30"></div>
    </div>
  )
}
