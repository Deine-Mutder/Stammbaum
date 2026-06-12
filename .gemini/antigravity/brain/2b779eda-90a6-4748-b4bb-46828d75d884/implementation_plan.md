# Dashboard-Design Anpassung: Profil-Informationspanel & Stammbaum-Button

Diese Anpassung strukturiert das Dashboard um: Die drei bisherigen Navigationskarten werden entfernt und durch ein zentrales Informationspanel mit den Profildaten des angemeldeten Benutzers sowie einem auffälligen Haupt-Button ("Stammbaum aufrufen") ersetzt.

## User Review Required

> [!IMPORTANT]
> - Das Design nutzt die bestehenden CSS-Variablen für das Dark/Light-Mode-Theme, sodass das Panel und der Button fließend die Farbe wechseln, wenn das Theme umgeschaltet wird.
> - Da die Karten gelöscht werden, müssen die GSAP-Eingangs- und Übergangs-Animationen in den JS-Dateien angepasst werden, um das neue Panel und den Button anstelle der Karten anzusteuern.

## Open Questions

> [!IMPORTANT]
> 1. **Funktion des Buttons:** Was soll genau passieren, wenn der Benutzer auf „Stammbaum aufrufen“ klickt? Soll eine neue Seite (z. B. `tree.html`) geladen, ein Popup geöffnet oder vorerst ein einfacher Platzhalter (Meldung/Konsoleneintrag) verwendet werden?
> 2. **Daten für Konstantin:** Wir haben im Entwurf folgende Standardwerte für dich hinterlegt:
>    - **Geboren am:** `26.11.1999` (abgeleitet von dem Passwort `bormann26` - bitte korrigieren, falls falsch)
>    - **Kinder:** `Nein`
>    - **Verheiratet:** `Nein`
>    Bitte teile uns die korrekten Daten mit, falls diese abweichen.

---

## Proposed Changes

### Dashboard & Layout

#### [MODIFY] [dashboard.html](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/dashboard.html)
- Ersetze den Container `<nav class="dashboard__cards" id="dashboard-cards" ...>` durch das neue Informations-Panel (`.dashboard__content`) mit Platzhaltern für Name, Geburtsdatum, Kinder- und Beziehungsstatus sowie dem Stammbaum-Button.

#### [MODIFY] [index.html](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/index.html)
- Führe dieselbe Ersetzung wie in der `dashboard.html` durch, damit beide Dashboard-Ansichten (die integrierte SPA-Ansicht und die Standalone-Ansicht) synchron und identisch aufgebaut sind.

---

### Logic & Data

#### [MODIFY] [auth.js](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/assets/js/auth.js)
- Ergänze die Benutzerprofile in der `users`-Konstante um die Felder:
  - `birthdate` (z.B. "26.11.1999")
  - `children` (z.B. "Nein")
  - `married` (z.B. "Nein")

#### [MODIFY] [dashboard.js](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/assets/js/dashboard.js)
- Entferne die Logik für `renderCards` und die statischen `DEFAULT_CARDS`.
- Implementiere die Funktion `renderProfileData(username)`, welche die Daten des aktuell angemeldeten Benutzers aus dem Profil ausliest und im HTML anzeigt.
- Richte den Event-Listener für den Button `#open-tree-btn` ein.
- Passe die GSAP-Animationen an, um `.dashboard__profile-panel` und `.dashboard__cta-btn` einfliegen zu lassen.

#### [MODIFY] [main.js](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/assets/js/main.js)
- Passe die Welcome-Transistions-Animation in `playWelcomeSequence` an, sodass sie ebenfalls auf die neuen Panel-Klassen anstelle der alten `.dashboard__card` referenziert.

---

### Styling

#### [MODIFY] [styles.css](file:///c:/Users/Konstantin/Documents/coding%20projekts/stammbaum/Test%20v4/responsive-login-form-with-gsap/assets/css/styles.css)
- Füge das responsive Styling für das zentrierte Informationspanel und den Haupt-Button hinzu.
- Verwende Glassmorphismus (`var(--glass-bg)`, `var(--glass-border)`, etc.) und runde Ecken, um den modernen Premium-Look beizubehalten.
- Style den Button mit einem modernen Glow-Effekt und Hover-Animationen.

---

## Verification Plan

### Automated Tests
- Nicht zutreffend (Vanilla HTML/JS Projekt).

### Manual Verification
1. **Layout & Responsive-Design:** Testen auf Desktop- und Mobil-Bildschirmbreiten. Das Panel soll sauber zentriert sein.
2. **Theme-Wechsel:** Umschalten zwischen Light- und Darkmode testen. Die Farben des Panels und des Buttons müssen sich automatisch und fließend anpassen.
3. **GSAP-Animationen:** Prüfen, ob nach dem Einloggen bzw. beim Neuladen die Animationen für das Panel und den Button fehlerfrei ausgeführt werden.
4. **Benutzerdaten:** Login mit Konstantin und den anderen Usern testen und prüfen, ob die entsprechenden Daten korrekt geladen werden.
