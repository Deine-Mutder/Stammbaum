/*=============== DOM REFS ===============*/
const loginSection = document.getElementById('app-login')
const loginContent = document.querySelector('.login__content')
const loginForm = document.getElementById('login-form')
const loginButton = document.getElementById('login-button')
const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const errorBox = document.getElementById('login-error')
const welcomeScreen = document.getElementById('app-welcome')
const welcomeBg = document.getElementById('welcome-bg')
const welcomeText = document.getElementById('welcome-text')
const dashboardSection = document.getElementById('app-dashboard')

const loginElements = '.login__title, .login__group, .login__button, .login__img'

/** Verhindert parallele Login-/Willkommens-Sequenzen. */
let isTransitioning = false

/*=============== LOGIN INTRO (callable) ===============*/
const loginIntroVars = { opacity: 0, y: -60, ease: 'power2.out', duration: 1.2 }

function playLoginIntro() {
   AnimationUtils.resetGsapDefaults()

   const tl = gsap.timeline({})

   tl.fromTo(
      loginContent,
      { y: -800, scaleX: 0.2, scaleY: 0.5, opacity: 0 },
      { y: 0, scaleX: 0.2, scaleY: 0.5, opacity: 1, duration: 1.5, ease: 'power3.out' }
   )
   tl.to(loginContent, { scaleY: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')
   tl.to(loginContent, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, '-=0.2')

   // Let the text, fields and image begin earlier so the panel feels alive sooner
   tl.from('.login__title', { opacity: 0, y: -60, duration: 0.75, ease: 'power2.out' }, '-=0.3')
   tl.from('.login__group, .login__button', { opacity: 0, y: -60, duration: 0.75, stagger: 0.1, ease: 'power2.out' }, '-=0.2')
   tl.from('.login__img', { opacity: 0, y: 0, x: 100, duration: 0.8, ease: 'elastic.out(1, 0.6)' }, '-=0.15')

   return tl
}

/*=============== INPUT HELPERS ===============*/

function enableInput(input) {
   input.addEventListener('focus', () => {
      input.removeAttribute('readonly')
   }, { once: true })
}

enableInput(usernameInput)
enableInput(passwordInput)

/*=============== LANDING -> LOGIN HANDLER ===============*/
const landingBtn = document.getElementById('landing-get-started')
if (landingBtn) {
   landingBtn.addEventListener('click', () => {
      const landing = document.getElementById('app-landing')
      if (landing) landing.classList.add('app-hidden')

      if (loginSection) {
         loginSection.classList.remove('app-hidden')
         loginSection.setAttribute('aria-hidden', 'false')
         // play the login intro animation now
         playLoginIntro()
      }
   })
}

function showLoginError() {
   errorBox.classList.add('login__error--visible')
   loginForm.classList.remove('login__form--shake')
   void loginForm.offsetWidth
   loginForm.classList.add('login__form--shake')
}

function hideLoginError() {
   errorBox.classList.remove('login__error--visible')
   loginForm.classList.remove('login__form--shake')
}

usernameInput.addEventListener('input', hideLoginError)
passwordInput.addEventListener('input', hideLoginError)

/*=============== LOGIN EXIT ===============*/

function animateLoginOut() {
   const tl = gsap.timeline()

   // 1. Elements animate out (mirroring entry sequence and timing)
   // Image exits (mirroring elastic entry with elastic.in for exact symmetry)
   tl.to('.login__img', {
      x: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'elastic.in(1, 0.6)',
   })

   // Groups & Button exit
   tl.to('.login__group, .login__button', {
      y: -60,
      opacity: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power2.in',
   }, '-=1.0')

   // Title exits
   tl.to('.login__title', {
      y: -60,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.in',
   }, '-=1.0')

   // 2. Container closes (exact mirror of the entrance timeline)
   tl.to(loginContent, {
      scaleX: 0.2,
      duration: 0.7,
      ease: 'power3.in',
   }, '-=0.8')

   tl.to(loginContent, {
      scaleY: 0.5,
      duration: 0.6,
      ease: 'power3.in',
   }, '-=0.5')

   tl.to(loginContent, {
      y: -800,
      opacity: 0,
      duration: 1.5,
      ease: 'power3.in',
   }, '-=0.3')

   return tl
}

/*=============== WELCOME SEQUENCE ===============*/

function playWelcomeSequence(displayName) {
   welcomeText.textContent = `Hallo ${displayName}`

   welcomeScreen.classList.add('welcome-screen--active')
   welcomeScreen.setAttribute('aria-hidden', 'false')

   gsap.set(welcomeScreen, { opacity: 1 })
   gsap.set(welcomeBg, { y: '8%', opacity: 1, filter: 'blur(0px)' })
   gsap.set(welcomeText, { y: '40vh', opacity: 0 })

   initDashboard({ animate: false, revealImmediately: true })

   const tl = gsap.timeline({
      onComplete: () => {
         Auth.markWelcomeShown()

         AnimationUtils.prepareDashboardView(
            welcomeScreen,
            welcomeBg,
            welcomeText,
            dashboardSection
         )

         isTransitioning = false
      },
   })

   // Slower and gentler entry
   tl.to(welcomeBg, {
      y: '0%',
      duration: 1.5,
      ease: 'power2.out',
   })

   tl.fromTo(welcomeText,
      { y: '40vh', opacity: 0 },
      { y: '0vh', opacity: 1, duration: 1.5, ease: 'power3.out' },
      '-=1.0'
   )

   // Stay in the center slightly longer for a calm and high-quality feel
   tl.to({}, { duration: 1.8 })

   tl.addLabel('hero-exit')

   // Slower exit - text slides up, the interface wakes up and brightens later in the movement
   tl.to(welcomeText, {
      y: '-40vh',
      opacity: 0,
      duration: 2.16,
      ease: 'power3.in',
   }, 'hero-exit')

   tl.to(document.documentElement, {
      duration: 1.32,
      ease: 'power2.out',
      css: { '--theme-progress': 1 },
      onComplete: () => {
         document.documentElement.setAttribute('data-theme', 'light')
         localStorage.setItem('stammbaum_theme', 'light')
      },
   }, 'hero-exit+=0.75')

   tl.to(welcomeBg, {
      opacity: 0,
      filter: 'blur(30px)',
      duration: 1.8,
      ease: 'power2.inOut',
   }, 'hero-exit+=0.8')

   tl.to(dashboardSection, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.68,
      ease: 'power2.out',
      onStart: () => {
         dashboardSection.style.pointerEvents = 'none'
      },
      onComplete: () => {
         dashboardSection.style.pointerEvents = ''
      }
   }, 'hero-exit+=0.85')

   tl.fromTo('.dashboard__header, .dashboard__welcome',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.44, stagger: 0.1, ease: 'power2.out' },
      'hero-exit+=0.95'
   )

   tl.fromTo('.dashboard__card',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1.44, stagger: 0.08, ease: 'power2.out' },
      'hero-exit+=1.0'
   )

   return tl
}

/*=============== LOGIN SUBMIT ===============*/

loginForm.addEventListener('submit', (event) => {
   event.preventDefault()

   if (isTransitioning) return

   hideLoginError()

   const username = usernameInput.value.trim()
   const password = passwordInput.value
   const validUser = Auth.validateLogin(username, password)

   if (!validUser) {
      showLoginError()
      passwordInput.value = ''
      passwordInput.focus()
      return
   }

   isTransitioning = true
   loginButton.disabled = true

   Auth.setSession(validUser)
   const profile = Auth.getUserProfile(validUser)

   const exitTl = animateLoginOut()
   exitTl.eventCallback('onComplete', () => {
      loginSection.classList.add('app-hidden')
      
      // FIX: Setzt das gesamte Login-Fenster UND alle verschobenen Buttons/Titel komplett auf CSS-Standard zurück!
      gsap.set([loginContent, '.login__group', '.login__button', '.login__title', '.login__img'], { clearProps: 'all' })
      
      AnimationUtils.resetPageScroll()
      playWelcomeSequence(profile.displayName)
   })
})

/*=============== APP INIT ===============*/

const existingSession = Auth.getSession()

if (existingSession) {
   // FIX: Landing Page und Login-Sektion beim App-Start rigoros verstecken, wenn eine Session läuft!
   const landingSection = document.getElementById('app-landing')
   if (landingSection) landingSection.classList.add('app-hidden')
   if (loginSection) loginSection.classList.add('app-hidden')

   if (Auth.hasWelcomeShown()) {
      AnimationUtils.prepareDashboardView(
         welcomeScreen,
         welcomeBg,
         welcomeText,
         dashboardSection
      )
      initDashboard({ animate: false })
   } else {
      isTransitioning = true
      playWelcomeSequence(existingSession.displayName)
   }
}