import { Button } from '../ui/Button'

export function CTASection() {
  return (
    <section className="py-20 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#003366] w-full h-full z-0"></div>
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      ></div>
      <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10 py-16">
        <h2 className="text-5xl md:text-7xl font-[800] mb-8 tracking-tight text-white leading-tight">
          Gotowy zrewolucjonizować <br />
          proces ofertowania?
        </h2>
        <p className="text-2xl text-white/90 mb-12 font-medium max-w-2xl mx-auto">
          Dołącz do ponad 500 firm myślących przyszłościowo, które wygrywają więcej zleceń dzięki TenderAI.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 shadow-2xl transform hover:-translate-y-1"
          >
            Rozpocznij darmowy okres próbny
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 transform hover:-translate-y-1"
          >
            Porozmawiaj ze sprzedażą
          </Button>
        </div>
      </div>
    </section>
  )
}
