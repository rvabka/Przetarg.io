import { Icon } from '../ui/Icon'

const brands = [
  { icon: 'api', name: 'TechFlow' },
  { icon: 'layers', name: 'Stacked' },
  { icon: 'hexagon', name: 'HexaCorp' },
  { icon: 'bolt', name: 'RapidScale' },
  { icon: 'token', name: 'NorthStar' },
  { icon: 'pentagon', name: 'DefenseCore' },
  { icon: 'language', name: 'GlobalTech' },
  { icon: 'security', name: 'SecureOps' }
]

export function BrandLogos() {
  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands]

  return (
    <div className="w-full overflow-hidden relative py-8">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background-light to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background-light to-transparent z-10"></div>

      <div className="flex gap-16 animate-scroll-brands">
        {duplicatedBrands.map((brand, index) => (
          <div
            key={`${brand.name}-${index}`}
            className="flex items-center gap-3 font-bold text-2xl tracking-tight whitespace-nowrap opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
          >
            <Icon name={brand.icon} size="xl" />
            {brand.name}
          </div>
        ))}
      </div>
    </div>
  )
}
