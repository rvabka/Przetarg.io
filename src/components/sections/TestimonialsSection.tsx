import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlowSpot } from '../ui/GlowSpot';
import { Icon } from '../ui/Icon';

const testimonials = [
  {
    rating: 5,
    text: 'Narzędzie bezbłędnie wychwytuje niuanse prawne. To jak dodatkowy zespół ekspertów dostępny 24/7. Odkąd korzystamy z TenderAI, nasza skuteczność wzrosła dwukrotnie.',
    author: 'Anna Nowicka',
    role: 'Head of Legal @ TechFlow',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChBim7bfcsaAJB532dnMtcIOvbsurgj6h7ow2TvmjT_R2UfCC0TqdkLP0aBqCJzxrTsoIC0wmimnIE1DgsKC9msD_gWzdmjImsdKJAcrMEpkpOqgeoGFaoAH8tNJ-n51zQ5bbIIVbhR_GVkvqf_Liyo3AN3qTez4ikXkI0twx_eqoc1UE5TFnrDPbk5zBj4y9i_Xzgo-d6Bzi0UIezQ05fkURge-1LtR5WYHJS5ocNKi8boyQatRK43lbwWJWoLYJ1DFmZIdjOnns'
  },
  {
    rating: 4.9,
    text: 'Prowadzenie biznesu oznacza, że każda decyzja finansowa ma znaczenie. Ta platforma daje mi wgląd w czasie rzeczywistym w przepływy pieniężne. Niezastąpione.',
    author: 'Marek Kowalski',
    role: 'Dyrektor ds. Przetargów @ BuildCo',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1mZ8cZjLS4ru2ZTFIY2YWzmwhJxpbAHc6THsLqam8HWQcmFBgEdDwyF8htFQkX5bZsE8FTDD6uMEtSW6Qkm6NdBbV0fmScw8pn38rGrYU4DJVOPPIX2G5ZnpunTnoyGRYjYB6NdWDK8nA4Tbv3wpWtF6LaHB74unMmUHCF435t4PaoUDffZ24YWsHoH4bPb1_FC3j_SPaFecG4jOzfgVRZdlX3PZHYN-j9kRTEo8e2YwOWvh8fwJMMElr39Puifs6EoCAXfA7Ubk'
  },
  {
    rating: 5,
    text: 'Automatyzacja procesu compliance zaoszczędziła nam setki godzin pracy. AI wykrywa rzeczy, które człowiek mógłby przeoczyć.',
    author: 'Piotr Wiśniewski',
    role: 'CEO @ InnovateTech',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChBim7bfcsaAJB532dnMtcIOvbsurgj6h7ow2TvmjT_R2UfCC0TqdkLP0aBqCJzxrTsoIC0wmimnIE1DgsKC9msD_gWzdmjImsdKJAcrMEpkpOqgeoGFaoAH8tNJ-n51zQ5bbIIVbhR_GVkvqf_Liyo3AN3qTez4ikXkI0twx_eqoc1UE5TFnrDPbk5zBj4y9i_Xzgo-d6Bzi0UIezQ05fkURge-1LtR5WYHJS5ocNKi8boyQatRK43lbwWJWoLYJ1DFmZIdjOnns'
  },
  {
    rating: 4.8,
    text: 'Wreszcie system, który naprawdę rozumie specyfikę polskich przetargów publicznych. Współpraca z TenderAI to game changer.',
    author: 'Katarzyna Nowak',
    role: 'Kierownik Działu Ofert @ PolBuild',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1mZ8cZjLS4ru2ZTFIY2YWzmwhJxpbAHc6THsLqam8HWQcmFBgEdDwyF8htFQkX5bZsE8FTDD6uMEtSW6Qkm6NdBbV0fmScw8pn38rGrYU4DJVOPPIX2G5ZnpunTnoyGRYjYB6NdWDK8nA4Tbv3wpWtF6LaHB74unMmUHCF435t4PaoUDffZ24YWsHoH4bPb1_FC3j_SPaFecG4jOzfgVRZdlX3PZHYN-j9kRTEo8e2YwOWvh8fwJMMElr39Puifs6EoCAXfA7Ubk'
  }
];

const cardOffsets = ['lg:translate-x-12', 'lg:-translate-x-4'];
const GAP = 48; // gap-12 = 3rem = 48px

function TestimonialCard({
  testimonial,
  offsetClass
}: {
  testimonial: (typeof testimonials)[0];
  offsetClass: string;
}) {
  return (
    <div
      className={`bg-white p-12 rounded-2xl shadow-card border border-gray-100 relative overflow-hidden ${offsetClass}`}
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-1 text-yellow-400">
          {[1, 2, 3, 4, 5].map(star => (
            <Icon
              key={star}
              name="star"
              size="md"
              filled={star <= Math.floor(testimonial.rating)}
              className={
                star <= Math.floor(testimonial.rating)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }
            />
          ))}
          <span className="font-bold text-text-main-light ml-2 text-sm">
            {testimonial.rating}/5
          </span>
        </div>
        <Icon
          name="format_quote"
          size="xl"
          className="text-gray-200 text-5xl opacity-50"
        />
      </div>
      <p className="text-xl font-medium text-gray-800 mb-8 leading-relaxed relative z-10">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md shrink-0">
          <img
            alt={testimonial.author}
            className="w-full h-full object-cover"
            src={testimonial.avatar}
          />
        </div>
        <div>
          <p className="font-bold text-base text-text-main-light">
            {testimonial.author}
          </p>
          <p className="text-sm text-text-muted-light font-medium">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [skipTransition, setSkipTransition] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(300);

  // Triple the array: [0,1,2,3, 0,1,2,3, 0,1,2,3]
  // Start at index = testimonials.length (the middle copy)
  // This gives room to go backward and forward
  const tripled = [...testimonials, ...testimonials, ...testimonials];
  const baseOffset = testimonials.length;

  // Measure real card height on mount & resize
  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        const firstCard = trackRef.current.children[0] as HTMLElement;
        if (firstCard) {
          setSlotHeight(firstCard.offsetHeight + GAP);
        }
      }
    };
    // Wait for render
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => prev + 1);
    }, 5000);
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoScroll]);

  // Seamless loop: when animation finishes at an edge, jump to middle copy instantly
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setActiveIndex(prev => {
      const len = testimonials.length;
      // If we're outside the middle copy range, remap
      if (prev < 0 || prev >= len) {
        const remapped = ((prev % len) + len) % len;
        // Instant jump — no transition
        setSkipTransition(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setSkipTransition(false);
          });
        });
        return remapped;
      }
      return prev;
    });
  }, []);

  const goNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(prev => prev + 1);
    startAutoScroll();
  };

  const goPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(prev => prev - 1);
    startAutoScroll();
  };

  // Y offset: move the track up so the active card is at the top of the viewport
  const translateY = -(baseOffset + activeIndex) * slotHeight;

  // Visible window = 2 cards (minus one gap so both cards are fully shown)
  const windowHeight = slotHeight * 2 - GAP;

  return (
    <section className="py-32 relative w-full overflow-hidden bg-section-dots">
      <GlowSpot
        variant="accent"
        position={{ bottom: '0', right: '5%' }}
        opacity={0.3}
      />
      <GlowSpot
        variant="hero"
        position={{ top: '10%', left: '-5%' }}
        opacity={0.15}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left Column - Sticky */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-8">
              <span className="text-xs font-bold tracking-wide text-gray-800 uppercase">
                Opinie Klientów
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-[800] text-text-main-light tracking-tight mb-8">
              Zaufali nam <br /> profesjonaliści
            </h2>
            <p className="text-xl text-text-muted-light leading-relaxed mb-12 max-w-lg font-medium">
              Tysiące użytkowników polega na nas każdego dnia, aby zarządzać
              przetargami z pewnością i łatwością. Poznaj ich historie sukcesu.
            </p>
            <div className="flex gap-4">
              <button
                onClick={goPrev}
                className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors shadow-sm group"
                aria-label="Previous testimonial"
              >
                <Icon
                  name="arrow_back"
                  size="md"
                  className="group-hover:text-primary transition-colors"
                />
              </button>
              <button
                onClick={goNext}
                className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors shadow-sm group"
                aria-label="Next testimonial"
              >
                <Icon
                  name="arrow_forward"
                  size="md"
                  className="group-hover:text-primary transition-colors"
                />
              </button>
            </div>
          </div>

          {/* Right Column - Smooth Vertical Carousel */}
          <div
            className="relative mt-12 overflow-x-visible overflow-y-clip pr-14 lg:pr-16"
            style={{ height: windowHeight > 0 ? windowHeight : 'auto' }}
          >
            <motion.div
              ref={trackRef}
              className="flex flex-col gap-12"
              animate={{ y: translateY }}
              transition={
                skipTransition
                  ? { duration: 0 }
                  : { duration: 0.65, ease: [0.4, 0, 0.15, 1] }
              }
              onAnimationComplete={handleAnimationComplete}
            >
              {tripled.map((testimonial, idx) => (
                <TestimonialCard
                  key={idx}
                  testimonial={testimonial}
                  offsetClass={cardOffsets[idx % 2]}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
