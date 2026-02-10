import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const menuItems = [
    { label: 'Funkcje', path: '/funkcje', icon: 'auto_awesome' },
    { label: 'Rozwiązania', path: '/rozwiazania', icon: 'category' },
    { label: 'Cennik', path: '/cennik', icon: 'payments' },
    { label: 'Zasoby', path: '/zasoby', icon: 'library_books' }
  ];

  const isActive = (path: string) => location.pathname === path;

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on route change (e.g., browser back/forward)
  useEffect(() => {
    // This is intentional: we need to close the menu when route changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileMenuOpen && !target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border-light/30 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16 min-h-[64px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 relative z-50">
              <div className="w-8 h-8 bg-black rounded-none flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <span className="font-bold text-xl tracking-tight text-text-main-light">
                TenderAI
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-text-main-light">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`hover:text-primary transition-colors ${
                    isActive(item.path) ? 'text-primary' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {user && profile ? (
                <>
                  <Link
                    to="/dashboard"
                    className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">dashboard</span>
                    Dashboard
                  </Link>
                  <div className="hidden md:block relative profile-menu-container">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {profile.first_name?.[0]}
                        {profile.last_name?.[0]}
                      </div>
                      <span className="text-sm font-semibold text-text-main-light">
                        {profile.first_name} {profile.last_name}
                      </span>
                      <span className="material-symbols-outlined text-sm">
                        expand_more
                      </span>
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-card border border-border-light py-2"
                        >
                          <div className="px-4 py-3 border-b border-border-light">
                            <p className="text-sm font-semibold text-text-main-light">
                              {profile.first_name} {profile.last_name}
                            </p>
                            <p className="text-xs text-text-muted-light">
                              {user.email}
                            </p>
                            <p className="text-xs text-text-muted-light mt-1">
                              {profile.company_name}
                            </p>
                          </div>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <span className="material-symbols-outlined text-xl">
                              dashboard
                            </span>
                            <span className="text-sm font-medium">
                              Dashboard
                            </span>
                          </Link>
                          <Link
                            to="/profil"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <span className="material-symbols-outlined text-xl">
                              person
                            </span>
                            <span className="text-sm font-medium">
                              Mój profil
                            </span>
                          </Link>
                          <Link
                            to="/ustawienia"
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <span className="material-symbols-outlined text-xl">
                              settings
                            </span>
                            <span className="text-sm font-medium">
                              Ustawienia
                            </span>
                          </Link>
                          <div className="border-t border-border-light my-2"></div>
                          <button
                            onClick={async () => {
                              await signOut();
                              setIsProfileMenuOpen(false);
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-xl">
                              logout
                            </span>
                            <span className="text-sm font-medium">
                              Wyloguj się
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/zaloguj"
                    className="hidden md:block text-sm font-semibold hover:text-primary transition-colors"
                  >
                    Zaloguj się
                  </Link>
                  <Link to="/zarejestruj">
                    <Button size="md" className="hidden md:inline-flex">
                      Rozpocznij
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button - Animated Hamburger */}
              <button
                className="md:hidden p-2 relative z-50 w-10 h-10 flex items-center justify-center"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <motion.span
                    className="w-full h-0.5 bg-text-main-light rounded-full origin-left"
                    animate={
                      isMenuOpen
                        ? { rotate: 45, y: 0, x: 2 }
                        : { rotate: 0, y: 0, x: 0 }
                    }
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-text-main-light rounded-full"
                    animate={
                      isMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }
                    }
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="w-full h-0.5 bg-text-main-light rounded-full origin-left"
                    animate={
                      isMenuOpen
                        ? { rotate: -45, y: 0, x: 2 }
                        : { rotate: 0, y: 0, x: 0 }
                    }
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Full Screen */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[45] md:hidden bg-white"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-8 overflow-y-auto">
              {/* Menu Items */}
              <div className="flex flex-col space-y-2 flex-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 py-4 px-4 rounded-xl transition-all ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-main-light hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {item.icon}
                      </span>
                      <span className="text-lg font-semibold">
                        {item.label}
                      </span>
                      <span className="material-symbols-outlined ml-auto text-gray-400">
                        chevron_right
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Actions */}
              <motion.div
                className="pt-6 mt-auto border-t border-gray-100 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {user && profile ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {profile.first_name?.[0]}
                          {profile.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-main-light">
                            {profile.first_name} {profile.last_name}
                          </p>
                          <p className="text-xs text-text-muted-light">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted-light">
                        {profile.company_name}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        dashboard
                      </span>
                      <span className="text-base font-semibold">
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      to="/profil"
                      className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        person
                      </span>
                      <span className="text-base font-semibold">
                        Mój profil
                      </span>
                    </Link>
                    <Link
                      to="/ustawienia"
                      className="flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        settings
                      </span>
                      <span className="text-base font-semibold">
                        Ustawienia
                      </span>
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all font-semibold"
                    >
                      <span className="material-symbols-outlined text-xl">
                        logout
                      </span>
                      <span className="text-base">Wyloguj się</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/zaloguj"
                      className="w-full py-3 px-4 text-center text-base font-semibold text-text-main-light hover:text-primary transition-colors rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Zaloguj się
                    </Link>
                    <Link
                      to="/zarejestruj"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button size="lg" className="w-full justify-center">
                        Rozpocznij za darmo
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-text-muted-light mt-4">
                      Bez karty kredytowej • 14 dni za darmo
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
