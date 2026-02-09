import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
              <button className="hidden md:block text-sm font-semibold hover:text-primary transition-colors">
                Zaloguj się
              </button>
              <Button size="md" className="hidden md:inline-flex">
                Rozpocznij
              </Button>

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
                <button className="w-full py-3 px-4 text-center text-base font-semibold text-text-main-light hover:text-primary transition-colors rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5">
                  Zaloguj się
                </button>
                <Button size="lg" className="w-full justify-center">
                  Rozpocznij za darmo
                </Button>
                <p className="text-xs text-center text-text-muted-light mt-4">
                  Bez karty kredytowej • 14 dni za darmo
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
