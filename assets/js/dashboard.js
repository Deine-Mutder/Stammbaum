/**
 * Dashboard – interne Startseite nach dem Login.
 * Wird von main.js nach der Willkommensanimation initialisiert.
 */

function renderProfileData(username) {
   const profile = Auth.getUserProfile(username)
   if (!profile) return

   const nameEl = document.getElementById('profile-name')
   const birthdateEl = document.getElementById('profile-birthdate')
   const childrenEl = document.getElementById('profile-children')
   const marriedEl = document.getElementById('profile-married')

   if (nameEl) nameEl.textContent = profile.displayName || '-'
   if (birthdateEl) birthdateEl.textContent = profile.birthdate || '-'
   if (childrenEl) childrenEl.textContent = profile.children || '-'
   if (marriedEl) marriedEl.textContent = profile.married || '-'
}

/**
 * Initialisiert und zeigt das Dashboard.
 * @param {object} options
 * @param {boolean} options.animate Fade-In-Animation abspielen
 */
function initDashboard({ animate = true, revealImmediately = false } = {}) {
   const session = Auth.getSession()
   if (!session) return

   const loginSection = document.getElementById('app-login')
   const welcomeScreen = document.getElementById('app-welcome')
   const dashboardEl = document.getElementById('app-dashboard')
   const greetingEl = document.getElementById('dashboard-greeting')
   const logoutBtn = document.getElementById('logout-btn')

   if (typeof AnimationUtils !== 'undefined') {
      AnimationUtils.resetDashboardLayout(dashboardEl)
      AnimationUtils.resetPageScroll()
      AnimationUtils.resetGsapDefaults()
   }

   loginSection.classList.add('app-hidden')

   if (!revealImmediately) {
      welcomeScreen.classList.remove('welcome-screen--active')
      welcomeScreen.setAttribute('aria-hidden', 'true')
   }

   dashboardEl.classList.remove('app-hidden')
   dashboardEl.setAttribute('aria-hidden', 'false')

   greetingEl.textContent = `Hallo ${session.displayName}`

   renderProfileData(session.username)

   const openTreeBtn = document.getElementById('open-tree-btn')
   if (openTreeBtn) {
      openTreeBtn.onclick = () => {
         window.location.href = 'tree.html'
      }
   }

   const themeToggleBtn = document.getElementById('theme-toggle-btn')
   if (themeToggleBtn) {
      themeToggleBtn.onclick = () => {
         const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark'
         const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
         const target = newTheme === 'light' ? 1 : 0
         gsap.to(document.documentElement, {
            duration: 0.9,
            ease: 'power2.out',
            css: { '--theme-progress': target },
            onComplete: () => {
               document.documentElement.setAttribute('data-theme', newTheme)
               localStorage.setItem('stammbaum_theme', newTheme)
            },
         })
      }
   }

   logoutBtn.onclick = () => {
      Auth.clearSession()
      window.location.reload()
   }

   if (revealImmediately) {
      gsap.set(dashboardEl, { opacity: 0, filter: 'blur(16px)' })
      gsap.set('.dashboard__header, .dashboard__welcome, .dashboard__profile-panel, .dashboard__cta-btn', { opacity: 0, y: 20 })
      dashboardEl.style.pointerEvents = 'none'
   }

   if (!animate) {
      if (!revealImmediately) {
         gsap.set(dashboardEl, { clearProps: 'all' })
      }
      return
   }

   const tl = gsap.timeline({
      onComplete: () => {
         gsap.set(dashboardEl, { clearProps: 'all' })
         gsap.set('.dashboard__header, .dashboard__welcome, .dashboard__profile-panel, .dashboard__cta-btn', { clearProps: 'all' })
         AnimationUtils.resetPageScroll()
      },
   })

   tl.fromTo(dashboardEl,
      { opacity: 0, filter: revealImmediately ? 'blur(16px)' : 'none' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
   )

   tl.fromTo('.dashboard__header, .dashboard__welcome',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out' },
      '-=0.55'
   )

   tl.fromTo('.dashboard__profile-panel, .dashboard__cta-btn',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.15, ease: 'power2.out' },
      '-=0.45'
   )
}

if (document.getElementById('app-dashboard') && !document.getElementById('app-login')) {
   if (Auth.requireAuth('index.html') && Auth.hasWelcomeShown()) {
      initDashboard({ animate: true })
   } else if (Auth.getSession()) {
      window.location.href = 'index.html'
   }
}
