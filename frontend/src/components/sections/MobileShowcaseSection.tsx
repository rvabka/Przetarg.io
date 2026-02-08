import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { GlowSpot } from '../ui/GlowSpot';
import { Icon } from '../ui/Icon';
import { IPhone3D } from '../mobile/IPhone3D';
import { MobileScreen } from '../mobile/MobileScreen';

const features = [
  {
    icon: 'check_circle',
    title: 'Powiadomienia w czasie rzeczywistym',
    description:
      'Otrzymuj alerty natychmiast, gdy projekt jest gotowy do przeglądu.'
  },
  {
    icon: 'check_circle',
    title: 'Płynne przekazywanie',
    description:
      'Zacznij na komputerze, dokończ na telefonie. Wszystko się synchronizuje.'
  },
  {
    icon: 'check_circle',
    title: 'Bezpieczny dostęp',
    description: 'Logowanie biometryczne i szyfrowanie klasy korporacyjnej.'
  }
];

export function MobileShowcaseSection() {
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="min-h-screen lg:h-screen lg:max-h-screen flex items-center overflow-hidden w-full relative bg-section-white lg:pt-0 sm:py-16 lg:py-0"
    >
      <GlowSpot
        variant="mobile"
        position={{ top: '50%', left: '25%' }}
        className="-translate-y-1/2 -translate-x-1/2"
        opacity={0.7}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 xl:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-8 py-4 sm:py-8">
          {/* iPhone Mockup - Hidden on very small screens, shown as smaller on medium */}
          <div className="lg:w-[45%] order-1 lg:order-2 flex justify-center lg:justify-end relative items-center">
            <div className="scale-[0.65] sm:scale-75 lg:scale-100 origin-center">
              <IPhone3D>
                <MobileScreen />
              </IPhone3D>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-[75%] order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:pl-4 xl:pl-8 pt-0 lg:pt-4 self-center">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-[800] mb-4 sm:mb-6 text-text-main-light leading-tight lg:leading-none tracking-tight"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              Twoje biuro ofertowe
              <br />
              <span className="text-primary">W Twojej kieszeni.</span>
            </motion.h2>
            <motion.p
              className="text-sm sm:text-base lg:text-lg text-text-muted-light mb-6 sm:mb-8 leading-relaxed max-w-lg font-medium px-4 sm:px-0"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              Nie pozwól, by termin minął tylko dlatego, że nie ma Cię przy
              biurku. Monitoruj postępy, zatwierdzaj wyjątki i współpracuj z
              zespołem w czasie rzeczywistym z dowolnego miejsca.
            </motion.p>

            {/* Features List — each item staggers in with a left-border draw */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 w-full max-w-md text-left bg-white/50 p-4 sm:p-6 rounded-2xl border border-gray-100 backdrop-blur-sm">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4"
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + index * 0.12,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <Icon
                    name={feature.icon}
                    size="md"
                    className="text-primary mt-0.5 sm:mt-1 shrink-0"
                  />
                  <div>
                    <strong className="block text-text-main-light text-base sm:text-lg mb-0.5 sm:mb-1">
                      {feature.title}
                    </strong>
                    <span className="text-xs sm:text-sm text-text-muted-light leading-relaxed block font-medium">
                      {feature.description}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* App Store Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.7,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <button className="flex items-center justify-center sm:justify-start gap-3 bg-black text-white px-5 sm:px-6 py-3 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xl group">
                <Icon
                  name="phone_iphone"
                  size="lg"
                  className="group-hover:scale-110 transition-transform"
                />
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">
                    Pobierz w
                  </div>
                  <div className="font-bold text-sm sm:text-base">
                    App Store
                  </div>
                </div>
              </button>
              <button className="flex items-center justify-center sm:justify-start gap-3 bg-black text-white px-5 sm:px-6 py-3 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-xl group">
                <Icon
                  name="ad_units"
                  size="lg"
                  className="group-hover:scale-110 transition-transform"
                />
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">
                    Pobierz z
                  </div>
                  <div className="font-bold text-sm sm:text-base">
                    Google Play
                  </div>
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
