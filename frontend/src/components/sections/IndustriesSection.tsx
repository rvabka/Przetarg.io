import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { IndustryCard } from '../features/IndustryCard';
import { GlowSpot } from '../ui/GlowSpot';

// Each card reveals from a different edge — diagonal polygon wipe
const cardReveals = [
  // Large — left-to-right curtain
  {
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0% 0 0)' },
    delay: 0.15
  },
  // Medium — top-to-bottom
  {
    initial: { clipPath: 'inset(0 0 100% 0)' },
    animate: { clipPath: 'inset(0 0 0% 0)' },
    delay: 0.3
  },
  // Small — right-to-left
  {
    initial: { clipPath: 'inset(0 0 0 100%)' },
    animate: { clipPath: 'inset(0 0 0 0%)' },
    delay: 0.45
  },
  // CTA — bottom-to-top
  {
    initial: { clipPath: 'inset(100% 0 0 0)' },
    animate: { clipPath: 'inset(0% 0 0 0)' },
    delay: 0.55
  }
];

export function IndustriesSection() {
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.15 });
  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden relative w-full bg-section-white"
    >
      <GlowSpot
        variant="accent"
        position={{ top: '-10%', right: '10%' }}
        opacity={0.25}
      />
      <GlowSpot
        variant="hero"
        position={{ bottom: '-20%', left: '-5%' }}
        opacity={0.15}
      />
      <GlowSpot
        variant="accent"
        position={{ top: '40%', left: '60%' }}
        opacity={0.12}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[800] text-text-main-light leading-none mb-3 sm:mb-4 tracking-tight">
              Rozwiązania <br className="hidden sm:block" />
              Dla Branż
            </h2>
            {/* Mobile description */}
            <p className="md:hidden text-sm font-medium text-text-muted-light leading-relaxed mt-4">
              Specjalistyczne modele językowe trenowane na dokumentacji
              technicznej Twojego sektora.
            </p>
          </div>
          <div className="hidden md:block border-l-2 border-primary pl-8 py-2 max-w-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-text-muted-light leading-relaxed">
              Specjalistyczne modele językowe trenowane na dokumentacji
              technicznej Twojego sektora.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 md:grid-rows-12 gap-4 sm:gap-5 md:gap-6 h-auto md:h-[820px]">
          {/* Defense - Large Card */}
          <motion.div
            className="sm:col-span-2 md:col-span-8 md:row-span-7 min-h-[280px] sm:min-h-[320px] md:min-h-0"
            initial={cardReveals[0].initial}
            animate={isInView ? cardReveals[0].animate : {}}
            transition={{
              duration: 0.9,
              delay: cardReveals[0].delay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <IndustryCard
              variant="large"
              title="Obronność & Technologie"
              subtitle="Sektor Strategiczny"
              description="Dedykowane instancje z certyfikacją bezpieczeństwa. Przetwarzanie danych wrażliwych zgodnie z normami wojskowymi."
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuAftZFK7V5DcqKyPVs6NTL_3GPl2_2CVvrD8wzbYcKdO-95ypmtoM5nkWYpcx-E9EMq_4cyIAgqlpHG9cVoWjAx6RaqF8vyVSRMNMUIv-O7YPttkqqn64ttK0tXuplnhxpicvsa25w2ydazQLw9akoLsRNlxF_CN0scBNKqMp_8FmLtqhg7RhNd-LFOK6RwNIkZNoILYYUhsIKH5Wxorwa8KKU7s21O0J9WOhYp4brvTRdnYlQAPk0uf6GlSlXdqdqoHSyuSaaO2y8"
              className="h-full"
            />
          </motion.div>

          {/* Construction - Medium Card */}
          <motion.div
            className="sm:col-span-1 md:col-span-4 md:row-span-7 min-h-[240px] sm:min-h-[280px] md:min-h-0"
            initial={cardReveals[1].initial}
            animate={isInView ? cardReveals[1].animate : {}}
            transition={{
              duration: 0.9,
              delay: cardReveals[1].delay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <IndustryCard
              variant="medium"
              title="Budownictwo"
              subtitle="Automatyzacja kosztorysów"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCmYyjQrqlhahFQqJeJUlb6vEm_XD01w88KuD5fgqkc5EpcDJChIUM9Jh1B6N93rptbyo7d9o-9ivC0erzY9uYudG-J0B3y24zzrXTLlGQDNMXABH9X8UIZdA2x4tDTzZsxChLJFQ6zSFig27g9CNVCsrFu79P6ESKHKj_o0eMOHCs631s8thWJlIPLjSadmIjFJpzun1z0GLYto4Nbj8klpiktgNxwGU_c0fzGYI94jXpvBYFCTRjUXsTY1Muib9m3_GanQDu3s94"
              className="h-full"
            />
          </motion.div>

          {/* Infrastructure - Small Card */}
          <motion.div
            className="sm:col-span-1 md:col-span-4 md:row-span-5 min-h-[240px] sm:min-h-[260px] md:min-h-0"
            initial={cardReveals[2].initial}
            animate={isInView ? cardReveals[2].animate : {}}
            transition={{
              duration: 0.9,
              delay: cardReveals[2].delay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <IndustryCard
              variant="small"
              title="Infrastruktura"
              subtitle="Zgodność publiczna"
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuB6IyrFCgYR9ciu6FHIRWCXSLxPz5Wm15qfynlXmGiDZUIRN2IwBE1I0xkpFV6GIdranJuDpiS72RHpvIDoOT0wsNlISDbemgvLtqYcPGonOti3VGenSvJNkU5qjOvYXUuJgHFXe9CNed5kWCcIjRxWNFYQWIcQWHevwNF3dAFJOES1Oeb-winqZl9mINXfRK6dNOUrQjdzMQS8aQ8320NE8gw_icUBFHV0_M7pMg20cMZyU3bA_CANussCmIO2YT-aaqVn51x8JJo"
              className="h-full"
            />
          </motion.div>

          {/* CTA Card */}
          <motion.div
            className="sm:col-span-2 md:col-span-8 md:row-span-5 min-h-[200px] sm:min-h-[220px] md:min-h-0"
            initial={cardReveals[3].initial}
            animate={isInView ? cardReveals[3].animate : {}}
            transition={{
              duration: 0.9,
              delay: cardReveals[3].delay,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <IndustryCard variant="cta" title="" image="" className="h-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
