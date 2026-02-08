export function Footer() {
  const productLinks = [
    'Funkcje',
    'Cennik',
    'Integracje',
    'Enterprise',
    'Dziennik zmian'
  ];
  const resourceLinks = [
    'Dokumentacja',
    'API Reference',
    'Blog',
    'Społeczność',
    'Centrum Pomocy'
  ];
  const companyLinks = ['O nas', 'Kariera', 'Prawne', 'Prywatność', 'Kontakt'];

  return (
    <footer className="bg-white/90 border-t border-border-light/50 pt-20 pb-10 w-full backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16 w-full">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white font-bold text-xl">
                T
              </div>
              <span className="font-bold text-2xl tracking-tight text-text-main-light">
                TenderAI
              </span>
            </div>
            <p className="text-text-muted-light max-w-sm mb-8 text-base font-medium leading-relaxed">
              Oprogramowanie do zarządzania ofertami oparte na AI, pomagające
              zespołom szybciej reagować i zdobywać więcej klientów.
            </p>
            <div className="flex gap-5">
              <a
                href="#"
                className="text-text-muted-light hover:text-primary transition-colors p-2 bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                href="#"
                className="text-text-muted-light hover:text-primary transition-colors p-2 bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">bolt</span>
              </a>
              <a
                href="#"
                className="text-text-muted-light hover:text-primary transition-colors p-2 bg-gray-100 rounded-full"
              >
                <span className="material-symbols-outlined">work</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="pt-2">
            <h4 className="font-bold text-lg text-text-main-light mb-6">
              Produkt
            </h4>
            <ul className="space-y-4 text-sm text-text-muted-light font-medium">
              {productLinks.map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource Links */}
          <div className="pt-2">
            <h4 className="font-bold text-lg text-text-main-light mb-6">
              Zasoby
            </h4>
            <ul className="space-y-4 text-sm text-text-muted-light font-medium">
              {resourceLinks.map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="pt-2">
            <h4 className="font-bold text-lg text-text-main-light mb-6">
              Firma
            </h4>
            <ul className="space-y-4 text-sm text-text-muted-light font-medium">
              {companyLinks.map(link => (
                <li key={link}>
                  <a href="#" className="hover:text-primary transition-colors">
                    {link}
                    {link === 'Kariera' && (
                      <span className="text-[10px] uppercase bg-black text-white px-2 py-0.5 rounded ml-1 font-bold align-middle">
                        Zatrudniamy
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border-light pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-text-muted-light font-medium">
            © 2024 TenderAI Inc. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-8 text-sm text-text-muted-light font-medium">
            <a href="#" className="hover:text-primary transition-colors">
              Polityka prywatności
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Warunki usług
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Pliki cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
