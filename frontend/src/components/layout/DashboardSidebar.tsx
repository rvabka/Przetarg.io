import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SearchCheck,
  FolderCheck,
  FolderOpen,
  Bell,
  BellRing,
  Brain,
  BrainCircuit,
  Building2,
  Building,
  Settings,
  ExternalLink,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

const iconConfig: Record<
  string,
  {
    hoverIcon: LucideIcon;
    motion?: Record<string, unknown>;
  }
> = {
  FolderCheck: {
    hoverIcon: FolderOpen,
    motion: { y: [0, -2, 0], transition: { duration: 0.25 } }
  },
  Search: {
    hoverIcon: SearchCheck,
    motion: { rotate: [0, -12, 0], transition: { duration: 0.3 } }
  },
  Bell: {
    hoverIcon: BellRing,
    motion: {
      rotate: [0, 10, -10, 6, 0],
      transformOrigin: 'top center',
      transition: { duration: 0.5 }
    }
  },
  Brain: {
    hoverIcon: BrainCircuit,
    motion: { scale: [1, 1.12, 1], transition: { duration: 0.35 } }
  },
  Building2: {
    hoverIcon: Building,
    motion: { y: [0, -2, 0], transition: { duration: 0.25 } }
  },
  Settings: {
    hoverIcon: Settings,
    motion: { rotate: 120, transition: { duration: 0.4, ease: 'easeInOut' } }
  }
};

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: 'Praca Codzienna',
    items: [
      {
        name: 'Moje Przetargi',
        href: '/dashboard',
        icon: FolderCheck,
        end: true
      },
      { name: 'Wyszukiwarka', href: '/dashboard/szukaj', icon: Search },
      {
        name: 'Powiadomienia',
        href: '/dashboard/powiadomienia',
        icon: Bell,
        badge: true
      }
    ]
  },
  {
    label: 'Narzędzia AI',
    items: [
      { name: 'Katalog CPV', href: '/dashboard/cpv', icon: Brain }
    ]
  },
  {
    label: 'Profil i Strategia',
    items: [
      { name: 'Profil Firmy', href: '/dashboard/firma', icon: Building2 },
      { name: 'Ustawienia', href: '/dashboard/ustawienia', icon: Settings }
    ]
  }
];

function AnimatedIcon({
  icon: DefaultIcon,
  isActive,
  isHovered
}: {
  icon: LucideIcon;
  isActive: boolean;
  isHovered: boolean;
}) {
  const iconName = DefaultIcon.displayName || DefaultIcon.name;
  const config = iconConfig[iconName];
  const showHover = isHovered || isActive;
  const ActiveIcon = config?.hoverIcon ?? DefaultIcon;
  const colorClass =
    isActive || isHovered ? 'text-[#006D5B]' : 'text-slate-400';

  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <AnimatePresence mode="wait">
        {showHover ? (
          <motion.div
            key="hover"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: 1,
              scale: 1,
              ...(config?.motion ?? {})
            }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveIcon className={`h-5 w-5 ${colorClass}`} />
          </motion.div>
        ) : (
          <motion.div
            key="default"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <DefaultIcon className={`h-5 w-5 ${colorClass}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/zaloguj');
  };

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase()
    : '?';

  const fullName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : '';

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex h-16 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#006D5B] text-lg font-bold text-white"
            whileHover={{ scale: 1.05, rotate: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            P
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Przetargo
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-8 overflow-y-auto p-4">
        {navigation.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.items.map(item => (
                <li
                  key={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <NavLink
                    to={item.href}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#E0F2F1] font-semibold text-[#006D5B]'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <AnimatedIcon
                            icon={item.icon}
                            isActive={isActive}
                            isHovered={hoveredItem === item.href}
                          />
                          {item.name}
                        </div>
                        {item.badge && (
                          <motion.span
                            className="h-2 w-2 rounded-full bg-red-500"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Link
          to="/"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <ExternalLink className="h-4 w-4" />
          Strona główna
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#006D5B] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-slate-900">
              {fullName || 'Użytkownik'}
            </p>
            <p className="truncate text-xs text-slate-500">Pro Plan</p>
          </div>
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Settings className="h-4.5 w-4.5 shrink-0 text-slate-400" />
          </motion.div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        </div>
      )}
    </>
  );
}
