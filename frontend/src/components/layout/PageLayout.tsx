import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Footer } from './Footer'

export function PageLayout() {
  return (
    <div className="bg-background-light text-text-main-light antialiased overflow-x-hidden min-h-screen flex flex-col w-full relative">
      {/* Watermarks */}
      <div className="watermark top-[5%] -left-[5%] rotate-[-5deg] opacity-30">OFERTA</div>
      <div className="watermark bottom-[15%] left-[5%] rotate-[90deg] opacity-20">SZYBKO</div>

      <Navigation />

      <main className="flex-grow w-full relative z-10">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
