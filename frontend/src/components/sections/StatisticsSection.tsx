import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { Card } from '../ui/Card';

const stats = [
  {
    value: '10x',
    label: 'Szybsza Reakcja',
    description: 'Od otrzymania do wysłania',
    numericValue: 10,
    suffix: 'x'
  },
  {
    value: '95%',
    label: 'Wzrost Wygranych',
    description: 'Dla klientów enterprise',
    numericValue: 95,
    suffix: '%'
  },
  {
    value: '500+',
    label: 'Integracji',
    description: 'Łączy się z Twoim CRM',
    numericValue: 500,
    suffix: '+'
  },
  {
    value: '24/7',
    label: 'Dostępność AI',
    description: 'Nigdy nie przegapisz terminu',
    numericValue: null,
    suffix: ''
  }
];

function CountUp({
  target,
  suffix,
  fallback,
  active
}: {
  target: number | null;
  suffix: string;
  fallback: string;
  active: boolean;
}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active || target === null) return;
    const duration = 1800;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target]);

  if (target === null) return <>{fallback}</>;
  return (
    <>
      {count}
      {suffix}
    </>
  );
}

export function StatisticsSection() {
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-14 md:py-16 w-full bg-section-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 lg:mb-20 px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-[800] mb-4 sm:mb-6 text-text-main-light leading-tight">
            Dlaczego zespoły zakupowe wybierają Przetargo
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-muted-light font-medium">
            Automatyzujemy żmudne części procesu RFP, abyś mógł skupić się na
            strategii i wygrywaniu zleceń.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.15 + index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <Card
                variant="elevated"
                hoverable
                className="p-4 sm:p-6 lg:p-8 text-center flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px] lg:min-h-[220px]"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform inline-block">
                  <CountUp
                    target={stat.numericValue}
                    suffix={stat.suffix}
                    fallback={stat.value}
                    active={isInView}
                  />
                </div>
                <div className="text-xs sm:text-sm lg:text-base font-bold text-text-main-light uppercase tracking-wide">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-text-muted-light mt-1 sm:mt-2 font-medium hidden sm:block">
                  {stat.description}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
