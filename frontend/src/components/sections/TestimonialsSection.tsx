import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { GlowSpot } from '../ui/GlowSpot';
import { Icon } from '../ui/Icon';

// Swiper styles
import 'swiper/swiper-bundle.css';

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

function TestimonialCard({
  testimonial,
  isOffset = false
}: {
  testimonial: (typeof testimonials)[0];
  isOffset?: boolean;
}) {
  return (
    <div
      className={`bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg border border-gray-100 relative h-full transition-all duration-300 ${isOffset ? 'lg:ml-0 lg:mr-8' : 'lg:ml-8 lg:mr-0'}`}
    >
      <div className="flex justify-between items-start mb-4 sm:mb-5 relative z-10">
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
          className="text-gray-200 text-3xl sm:text-5xl opacity-50"
        />
      </div>
      <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 mb-5 sm:mb-6 leading-relaxed relative z-10">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md shrink-0">
          <img
            alt={testimonial.author}
            className="w-full h-full object-cover"
            src={testimonial.avatar}
          />
        </div>
        <div>
          <p className="font-bold text-sm sm:text-base text-text-main-light">
            {testimonial.author}
          </p>
          <p className="text-xs sm:text-sm text-text-muted-light font-medium">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const swiperRef = useRef<SwiperType | null>(null);

  const goNext = () => swiperRef.current?.slideNext();
  const goPrev = () => swiperRef.current?.slidePrev();

  return (
    <section className="py-16 sm:py-24 lg:py-32 relative w-full overflow-hidden bg-section-dots">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="lg:sticky lg:top-32 self-start text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6 sm:mb-8">
              <span className="text-xs font-bold tracking-wide text-gray-800 uppercase">
                Opinie Klientów
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[800] text-text-main-light tracking-tight mb-4 sm:mb-6 lg:mb-8">
              Zaufali nam <br className="hidden sm:block" /> profesjonaliści
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-text-muted-light leading-relaxed mb-8 sm:mb-10 lg:mb-12 max-w-lg mx-auto lg:mx-0 font-medium">
              Tysiące użytkowników polega na nas każdego dnia, aby zarządzać
              przetargami z pewnością i łatwością. Poznaj ich historie sukcesu.
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={goPrev}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-sm group"
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
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 active:scale-95 transition-all shadow-sm group"
                aria-label="Next testimonial"
              >
                <Icon
                  name="arrow_forward"
                  size="md"
                  className="group-hover:text-primary transition-colors"
                />
              </button>
            </div>

            {/* Custom pagination */}
            <div className="testimonials-pagination flex gap-2 mt-8 justify-center lg:justify-start" />
          </div>

          {/* Right Column - Swiper Carousel */}
          <div className="relative mt-4 sm:mt-8 lg:mt-0 lg:pr-4">
            <Swiper
              onSwiper={swiper => {
                swiperRef.current = swiper;
              }}
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={24}
              slidesPerView={1}
              loop={true}
              speed={500}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              pagination={{
                el: '.testimonials-pagination',
                clickable: true,
                bulletClass:
                  'h-2.5 w-2.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300 cursor-pointer inline-block',
                bulletActiveClass: '!bg-primary !w-8'
              }}
              breakpoints={{
                1024: {
                  direction: 'vertical',
                  slidesPerView: 2,
                  spaceBetween: 24
                }
              }}
              className="lg:h-[520px]"
            >
              {testimonials.map((testimonial, idx) => (
                <SwiperSlide key={idx} className="h-auto!">
                  <TestimonialCard
                    testimonial={testimonial}
                    isOffset={idx % 2 === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
