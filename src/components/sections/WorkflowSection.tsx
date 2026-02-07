import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { Icon } from '../ui/Icon';

const steps = [
  {
    number: '01',
    icon: 'cloud_upload',
    title: 'Wczytaj Dokumenty',
    description:
      'Przeciągnij i upuść pliki PDF, Word lub Excel. Nasze AI natychmiast analizuje wymagania i specyfikacje.'
  },
  {
    number: '02',
    icon: 'analytics',
    title: 'Analizuj i Redaguj',
    description:
      'Silnik dopasowuje wymagania do bazy wiedzy, automatycznie redaguje odpowiedzi i oznacza ryzyka.'
  },
  {
    number: '03',
    icon: 'send',
    title: 'Wyślij Ofertę',
    description:
      'Eksportuj pięknie sformatowane oferty w szablonie Twojej marki. Jedno kliknięcie zapewnia pełną zgodność.'
  }
];

export function WorkflowSection() {
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.25 });

  return (
    <section ref={sectionRef} className="py-20 w-full bg-section-dots relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-28"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-5xl font-[800] mb-6 text-text-main-light tracking-tight">
            Usprawniony przepływ pracy
          </h2>
          <p className="text-text-muted-light max-w-2xl mx-auto text-xl font-medium">
            Od nieuporządkowanych dokumentów do dopracowanej oferty w trzech
            prostych krokach.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Timeline line — draws itself */}
          <div className="hidden md:block absolute top-[70px] left-0 w-full h-[2px] z-0 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative z-10 group"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.2,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-10">
                  <motion.span
                    className="text-[140px] font-bold text-gray-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 opacity-60"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 0.6 } : {}}
                    transition={{
                      duration: 0.8,
                      delay: 0.5 + index * 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {step.number}
                  </motion.span>
                  <motion.div
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-soft group-hover:border-primary/50 transition-colors"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: 0.45 + index * 0.2,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <Icon name={step.icon} size="xl" className="text-primary" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-main-light">
                  {step.title}
                </h3>
                <p className="text-base text-text-muted-light leading-relaxed max-w-sm mx-auto font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
