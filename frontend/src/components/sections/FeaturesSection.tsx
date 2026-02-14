import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { GlowSpot } from '../ui/GlowSpot';
import { ComplianceChecklist } from '../features/ComplianceChecklist';
import { PDFViewer } from '../features/PDFViewer';
import { Badge } from '../ui/Badge';

export function FeaturesSection() {
  const { ref: sectionRef, isInView } = useInView({ threshold: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-24 overflow-hidden relative w-full bg-section-dots"
    >
      <GlowSpot
        variant="accent"
        position={{ top: '10%', left: '10%' }}
        opacity={0.4}
      />
      <GlowSpot
        variant="hero"
        position={{ bottom: '-15%', right: '-5%' }}
        opacity={0.2}
      />
      <GlowSpot
        variant="accent"
        position={{ top: '60%', right: '20%' }}
        opacity={0.15}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-text-main-light tracking-tight leading-tight">
            AI, które rozumie <br />
            kontekst RFP
          </h2>
          <p className="text-lg text-text-muted-light mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            Nasz model nie tylko dopasowuje słowa kluczowe. Rozumie wymagania
            semantyczne, sprzeczności i ukryte ograniczenia w złożonych
            dokumentach przetargowych.
          </p>
        </motion.div>

        <div className="relative max-w-[1100px] mx-auto">
          <div className="absolute -top-12 -right-12 w-96 h-96 bg-primary/10 rounded-full blur-[80px]"></div>

          {/* Browser Window — scan-line boot animation */}
          <motion.div
            className="relative bg-white rounded-xl border border-border-light shadow-xl overflow-hidden backdrop-blur-md flex flex-col"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Scan line overlay */}
            <motion.div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, transparent 0%, rgba(0, 82, 204, 0.06) 50%, transparent 100%)',
                backgroundSize: '100% 8px'
              }}
              initial={{ y: '-100%' }}
              animate={isInView ? { y: '100%' } : {}}
              transition={{ duration: 1.2, delay: 0.4, ease: 'linear' }}
            />
            {/* Browser Header */}
            <div className="bg-gray-50 border-b border-border-light px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-400"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-6 bg-white rounded-md px-4 py-1.5 text-xs text-text-muted-light flex-1 max-w-lg border border-border-light text-center font-mono">
                app.przetargo.pl/project/rfp-2023-enterprise/analysis
              </div>
            </div>

            {/* Content Split View */}
            <div className="flex flex-col md:flex-row flex-grow">
              {/* PDF Viewer */}
              <div className="w-full md:w-1/2 bg-gray-50/50 p-6 border-r border-border-light overflow-hidden relative">
                <div className="absolute top-6 left-6 bg-white px-3 py-1.5 rounded text-xs font-mono shadow-sm border border-border-light flex items-center gap-2 z-10">
                  <span className="material-symbols-outlined text-sm text-red-500">
                    picture_as_pdf
                  </span>
                  zrodlo_dokument.pdf
                </div>
                <PDFViewer />
              </div>

              {/* Compliance Checklist */}
              <div className="w-full md:w-1/2 bg-white p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      auto_awesome
                    </span>
                    Lista Kontrolna Zgodności
                  </h3>
                  <Badge status="success" size="md">
                    98% Zgodności
                  </Badge>
                </div>
                <ComplianceChecklist />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
