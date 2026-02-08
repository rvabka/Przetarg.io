import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: 'Funkcje', path: '/funkcje' },
    { label: 'Rozwiązania', path: '/rozwiazania' },
    { label: 'Cennik', path: '/cennik' },
    { label: 'Zasoby', path: '/zasoby' }
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

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 relative z-50"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className="material-symbols-outlined text-2xl">
                  {isMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[45] md:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-6">
          <div className="flex flex-col space-y-6 mb-8">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-lg font-bold hover:text-primary transition-colors ${
                  isActive(item.path) ? 'text-primary' : 'text-text-main-light'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-border-light">
            <button className="w-full text-left text-lg font-bold text-text-main-light hover:text-primary transition-colors mb-4">
              Zaloguj się
            </button>
            <Button size="md" className="w-full">
              Rozpocznij
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
