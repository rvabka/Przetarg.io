import { HeroSection } from '../components/sections/HeroSection'
import { FeaturesSection } from '../components/sections/FeaturesSection'
import { IndustriesSection } from '../components/sections/IndustriesSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { StatisticsSection } from '../components/sections/StatisticsSection'
import { WorkflowSection } from '../components/sections/WorkflowSection'
import { MobileShowcaseSection } from '../components/sections/MobileShowcaseSection'
import { CTASection } from '../components/sections/CTASection'

export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <IndustriesSection />
      <TestimonialsSection />
      <StatisticsSection />
      <WorkflowSection />
      <MobileShowcaseSection />
      <CTASection />
    </div>
  )
}
