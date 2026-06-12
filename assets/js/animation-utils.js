/**
 * Setzt GSAP-Transforms und Scroll-Zustand nach Animationen zurück.
 * Verhindert Layout-Verschiebungen (z. B. Dashboard zu weit oben).
 */
const AnimationUtils = (() => {
   /** Neutralisiert globale GSAP-Defaults – keine vererbten y/opacity-Werte. */
   function resetGsapDefaults() {
      gsap.defaults({
         duration: 0.5,
         ease: 'power1.out',
      })
   }

   /** Enable lightweight performance hints for GSAP (force GPU compositing) */
   function enablePerformanceOptimizations() {
      try {
         if (gsap && typeof gsap.defaults === 'function') {
            gsap.defaults({ force3D: true })
         }
         if (gsap && gsap.ticker && typeof gsap.ticker.fps === 'function') {
            // Keep default RAF behavior but cap FPS on older devices if needed.
            // We don't force a lower FPS here to avoid changing animation timing.
         }
         document.documentElement.classList.add('perf-optimised')
      } catch (e) {
         // silent fail if GSAP not available
      }
   }

   /** Scroll und Overflow auf Normalzustand zurücksetzen. */
   function resetPageScroll() {
      document.documentElement.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('height')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('height')
      document.body.style.removeProperty('position')
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
   }

   /**
    * Entfernt alle GSAP-Inline-Styles von Welcome-Elementen.
    */
   function resetWelcomeScreen(welcomeScreen, welcomeBg, welcomeText) {
      if (!welcomeScreen) return

      gsap.killTweensOf([welcomeScreen, welcomeBg, welcomeText].filter(Boolean))

      if (welcomeBg) gsap.set(welcomeBg, { clearProps: 'all' })
      if (welcomeText) gsap.set(welcomeText, { clearProps: 'all' })
      gsap.set(welcomeScreen, { clearProps: 'all' })

      welcomeScreen.classList.remove('welcome-screen--active')
      welcomeScreen.setAttribute('aria-hidden', 'true')
   }

   /**
    * Entfernt GSAP-Styles vom Dashboard und seinen Kindern.
    */
   function resetDashboardLayout(dashboardSection) {
      if (!dashboardSection) return

      gsap.killTweensOf([
         dashboardSection,
         ...dashboardSection.querySelectorAll('.dashboard__header, .dashboard__welcome, .dashboard__card'),
      ])

      gsap.set(dashboardSection, { clearProps: 'all' })
      gsap.set('.dashboard__header, .dashboard__welcome, .dashboard__card', { clearProps: 'all' })

      dashboardSection.style.removeProperty('opacity')
      dashboardSection.style.removeProperty('transform')
   }

   /** Vollständiger Reset vor Dashboard-Anzeige. */
   function prepareDashboardView(welcomeScreen, welcomeBg, welcomeText, dashboardSection) {
      resetWelcomeScreen(welcomeScreen, welcomeBg, welcomeText)
      resetDashboardLayout(dashboardSection)
      resetPageScroll()
      resetGsapDefaults()
   }

   return {
      resetGsapDefaults,
      resetPageScroll,
      resetWelcomeScreen,
      resetDashboardLayout,
      prepareDashboardView,
      enablePerformanceOptimizations,
   }
})()

// Apply performance hints on module load
try {
   AnimationUtils.enablePerformanceOptimizations()
} catch (e) {
   /* ignore */
}
