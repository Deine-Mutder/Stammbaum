/**
 * Authentifizierungsmodul für den Familienstammbaum.
 * Zentraler Ort für Benutzerkonten, Session-Verwaltung und
 * benutzerbezogene Inhalte (erweiterbar für individuelle Ansichten).
 */
const Auth = (() => {
   const SESSION_KEY = 'stammbaum_session'

   /**
    * Testkonten – später durch Backend/API ersetzbar.
    * Jeder Eintrag kann um benutzer-spezifische Felder ergänzt werden
    * (z. B. stammbaumId, permissions, theme).
    */
   const users = {
      user1: {
         password: '1234',
         displayName: 'user1',
         role: 'member',
         // Platzhalter für spätere benutzerbezogene Inhalte:
         // stammbaumId: 'tree-user1',
         // permissions: ['view', 'edit'],
      },
      user2: {
         password: '1234',
         displayName: 'user2',
         role: 'member',
      },
      user3: {
         password: '1234',
         displayName: 'user3',
         role: 'member',
      },
   }

   /**
    * Prüft Benutzername und Passwort gegen die registrierten Konten.
    * @returns {string|null} Benutzername bei Erfolg, sonst null
    */
   function validateLogin(username, password) {
      const normalizedUsername = username.trim().toLowerCase()
      const user = users[normalizedUsername]

      if (!user || user.password !== password) {
         return null
      }

      return normalizedUsername
   }

   /** Speichert die aktive Session im sessionStorage. */
   function setSession(username) {
      const profile = getUserProfile(username)
      if (!profile) return false

      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
         username,
         displayName: profile.displayName,
         role: profile.role,
         loginTime: Date.now(),
         welcomeShown: false,
      }))
      return true
   }

   /** Markiert die Willkommensanimation als abgeschlossen. */
   function markWelcomeShown() {
      const session = getSession()
      if (!session) return

      session.welcomeShown = true
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
   }

   /** Prüft, ob die Willkommensanimation bereits gezeigt wurde. */
   function hasWelcomeShown() {
      return getSession()?.welcomeShown === true
   }

   /** Liest die aktuelle Session; gibt null zurück wenn nicht eingeloggt. */
   function getSession() {
      try {
         const raw = sessionStorage.getItem(SESSION_KEY)
         return raw ? JSON.parse(raw) : null
      } catch {
         return null
      }
   }

   /** Beendet die aktuelle Session. */
   function clearSession() {
      sessionStorage.removeItem(SESSION_KEY)
   }

   /**
    * Gibt das vollständige Benutzerprofil zurück.
    * Basis für spätere benutzerbezogene Ansichten und Inhalte.
    */
   function getUserProfile(username) {
      return users[username] ?? null
   }

   /**
    * Schützt interne Seiten – leitet zur Login-Seite um wenn keine Session.
    * @param {string} loginPath Relativer Pfad zur Login-Seite
    */
   function requireAuth(loginPath = 'index.html') {
      if (!getSession()) {
         window.location.href = loginPath
         return false
      }
      return true
   }

   /**
    * Leitet eingeloggte Benutzer weiter, wenn Willkommensanimation bereits gezeigt wurde.
    * @returns {boolean} true wenn weitergeleitet
    */
   function redirectIfAuthenticated() {
      const session = getSession()
      if (!session) return false

      if (hasWelcomeShown()) {
         return true
      }

      return false
   }

   return {
      validateLogin,
      setSession,
      getSession,
      clearSession,
      getUserProfile,
      requireAuth,
      redirectIfAuthenticated,
      markWelcomeShown,
      hasWelcomeShown,
   }
})()
