import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GlowSpot } from '../ui/glow-spot';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { BrandLogos } from '../features/BrandLogos';

// Split text into words, preserving spaces
function WordReveal({
  text,
  className,
  startDelay = 0
}: {
  text: string;
  className?: string;
  startDelay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.15em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotateX: -80 }}
            animate={{ y: 0, rotateX: 0 }}
            transition={{
              duration: 0.7,
              delay: startDelay + i * 0.06,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Delay to next frame to avoid cascading render warning
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  return (
    <section className="relative pt-16 pb-12 lg:pt-20 lg:pb-16 w-full overflow-hidden bg-section-white">
      <GlowSpot
        variant="hero"
        position={{ top: '-300px', right: '-200px' }}
        opacity={0.6}
      />
      <GlowSpot
        variant="hero"
        position={{ bottom: '-200px', left: '-300px' }}
        opacity={0.4}
      />
      <GlowSpot
        variant="accent"
        position={{ top: '30%', left: '50%' }}
        opacity={0.15}
      />
      <GlowSpot
        variant="accent"
        position={{ bottom: '10%', right: '30%' }}
        opacity={0.2}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto mb-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border-light shadow-sm mb-8 mx-auto backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px)' }}
            animate={
              mounted ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}
            }
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold tracking-wide uppercase text-text-muted-light">
              NOWOŚĆ: Automatyczna Zgodność
            </span>
          </motion.div>

          {/* Headline — word-by-word reveal from below */}
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tighter text-text-main-light mb-8 leading-[0.9]">
            <WordReveal text="Wygrywaj więcej przetargów." startDelay={0.25} />
            <br />
            <span className="text-primary relative inline-block">
              <WordReveal text="Szybciej." startDelay={0.65} />
              <motion.svg
                className="absolute -bottom-3 w-full h-4 text-primary opacity-30"
                preserveAspectRatio="none"
                viewBox="0 0 100 10"
              >
                <motion.path
                  d="M0 5 Q 50 10 100 5"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={mounted ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
                />
              </motion.svg>
            </span>
          </h1>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-text-muted-light max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.85,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            Obszar roboczy AI dla zespołów ofertowych. Analizuj złożone
            zapytania ofertowe, generuj zgodne odpowiedzi i zarządzaj lejkiem
            ofertowym w kilka sekund.
          </motion.p>

          {/* Email Form */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 1.05,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <form className="relative w-full flex items-center bg-white rounded-full p-2 border border-border-light shadow-xl shadow-gray-200/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Input
                type="email"
                placeholder="Twój adres e-mail"
                required
                className="py-3"
              />
              <Button
                variant="secondary"
                size="default"
                type="button"
              >
                Rozpocznij
              </Button>
            </form>
            <p className="text-xs font-medium text-text-muted-light opacity-60 mt-2">
              Darmowy trial 14 dni · Karta nie wymagana
            </p>
          </motion.div>
        </div>

        {/* Brand Logos */}
        <motion.div
          className="border-t border-border-light/30 pt-16 mt-16"
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <p className="text-center text-xs font-bold text-text-muted-light mb-10 uppercase tracking-[0.2em]">
            Zaufały nam globalne marki
          </p>
          <BrandLogos />
        </motion.div>
      </div>
    </section>
  );
}
