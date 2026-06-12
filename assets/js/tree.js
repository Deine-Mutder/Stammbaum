/**
 * Stammbaum-Logik zur Visualisierung und Interaktivität.
 */
document.addEventListener('DOMContentLoaded', () => {
   // 1. Authentifizierung prüfen
   if (!Auth.requireAuth('index.html')) return;

   const session = Auth.getSession();
   
   // 2. Begrüßung und Name im Header anzeigen
   const greetingEl = document.getElementById('tree-greeting');
   if (greetingEl && session) {
      greetingEl.textContent = `Familienstammbaum der Bormanns – Hallo ${session.displayName}`;
   }

   // 3. Stammbaum-Rendern initialisieren
   initFamilyTree(session);

   // 4. Pan- und Zoom-Steuerung einrichten
   initPanZoom();

   // 5. Header-Aktionen (Theme-Toggle und Logout)
   initHeaderActions();
});

/**
 * Erstellt die Stammbaum-HTML-Struktur rekursiv und zeichnet die Linien.
 */
function initFamilyTree(session) {
   const treeContent = document.getElementById('tree-content');
   if (!treeContent) return;

    // Finde alle Wurzel-Einheiten (Personen ohne Eltern im Datensatz)
    const roots = FAMILY_TREE.filter(person => !person.parents || person.parents.length === 0);
    const visited = new Set();

    roots.forEach(root => {
       if (visited.has(root.id)) return;

       visited.add(root.id);
       let parentIds = [root.id];
       if (root.spouseId) {
          visited.add(root.spouseId);
          parentIds.push(root.spouseId);
       }

       const rootUnit = getFamilyUnit(parentIds);
       const treeHtml = renderFamilyUnit(rootUnit, session);
       treeContent.appendChild(treeHtml);
    });

   // Kurzer Timeout, damit das Layout im Browser berechnet ist, bevor die Linien gezeichnet werden
   setTimeout(() => {
      drawTreeLines();
      fitTreeToViewport(); // View-All-Mode beim Laden
   }, 100);

   // Fenster-Resize abfangen, um Linien neu zu zeichnen
   window.addEventListener('resize', () => {
      drawTreeLines();
   });
}

/**
 * Rekursiver Stammbaum-Datenstruktur-Konstruktor.
 */
function getFamilyUnit(parentIds) {
   // Finde Kinder, die BEIDE Elternteile in ihren parents-Referenzen haben
   const children = FAMILY_TREE.filter(person => {
      if (!person.parents) return false;
      return parentIds.every(pId => person.parents.includes(pId));
   });

   const childrenUnits = children.map(child => {
      // Wenn das Kind einen Partner hat, bildet dieses Paar eine neue Familieneinheit
      if (child.spouseId) {
         return getFamilyUnit([child.id, child.spouseId]);
      } else {
         return { parents: [child.id], children: [] };
      }
   });

   return {
      parents: parentIds,
      children: childrenUnits
   };
}

/**
 * Erstellt das HTML für eine Familieneinheit (Couple + Children).
 */
function renderFamilyUnit(unit, session) {
   const branchDiv = document.createElement('div');
   branchDiv.className = 'family-branch';

   // Couple Container (Paar)
   const coupleDiv = document.createElement('div');
   coupleDiv.className = 'couple';

   unit.parents.forEach(pId => {
      const person = FAMILY_TREE.find(p => p.id === pId);
      if (person) {
         const card = document.createElement('div');
         card.className = 'person-card';
         card.id = `card-${person.id}`;
         
         // Markiere den aktuell eingeloggten Benutzer
         if (session && person.id === session.username) {
            card.classList.add('person-card--current');
         }

         const lifespan = person.birth ? `* ${person.birth} ${person.death ? `† ${person.death}` : ''}` : '';
         
         card.innerHTML = `
            <div class="person-card__avatar">
               <i class="ri-user-line"></i>
            </div>
            <div class="person-card__details">
               <h4 class="person-card__name">${person.name}</h4>
               <span class="person-card__dates">${lifespan}</span>
            </div>
         `;
         coupleDiv.appendChild(card);
      }
   });

   branchDiv.appendChild(coupleDiv);

   // Kinder-Container
   if (unit.children && unit.children.length > 0) {
      const childrenRow = document.createElement('div');
      childrenRow.className = 'children-row';

      unit.children.forEach(childUnit => {
         childrenRow.appendChild(renderFamilyUnit(childUnit, session));
      });

      branchDiv.appendChild(childrenRow);
   }

   return branchDiv;
}

/**
 * Zeichnet orthogonale Linien zwischen Eltern und Kindern.
 */
function drawTreeLines() {
   const svg = document.getElementById('tree-connections');
   const treeContent = document.getElementById('tree-content');
   if (!svg || !treeContent) return;

   // SVG-Leinwandgröße an die Größe des Stammbaums anpassen
   const cw = treeContent.scrollWidth;
   const ch = treeContent.scrollHeight;
   svg.setAttribute('width', cw);
   svg.setAttribute('height', ch);
   svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`);

   svg.innerHTML = ''; // Bisherige Linien löschen

   const rootRect = treeContent.getBoundingClientRect();

   // Lokale Koordinatenumrechner unter Einbeziehung des aktuellen Zoom-Faktors
   const toLocalX = (x) => (x - rootRect.left) / currentScale;
   const toLocalY = (y) => (y - rootRect.top) / currentScale;

   const branches = document.querySelectorAll('.family-branch');
   branches.forEach(branch => {
      const couple = branch.querySelector(':scope > .couple');
      const childrenRow = branch.querySelector(':scope > .children-row');

      if (couple && childrenRow) {
         const cards = couple.querySelectorAll('.person-card');
         let parentMidX, parentBottomY;

         if (cards.length === 2) {
            // Zwei Partner: Zeichne Verbindungslinie zwischen ihnen
            const rectA = cards[0].getBoundingClientRect();
            const rectB = cards[1].getBoundingClientRect();

            const ax = toLocalX((rectA.left + rectA.right) / 2);
            const ay = toLocalY((rectA.top + rectA.bottom) / 2);
            const bx = toLocalX((rectB.left + rectB.right) / 2);
            const by = toLocalY((rectB.top + rectB.bottom) / 2);

            const spouseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            spouseLine.setAttribute('x1', ax);
            spouseLine.setAttribute('y1', ay);
            spouseLine.setAttribute('x2', bx);
            spouseLine.setAttribute('y2', by);
            spouseLine.setAttribute('class', 'tree-line tree-line--spouse');
            svg.appendChild(spouseLine);

            parentMidX = (ax + bx) / 2;
            parentBottomY = toLocalY(Math.max(rectA.bottom, rectB.bottom));

            // Vertikaler Tropfen ab Mitte des Partner-Verbinders bis zum Karten-Boden
            const verticalDrop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            verticalDrop.setAttribute('x1', parentMidX);
            verticalDrop.setAttribute('y1', (ay + by) / 2);
            verticalDrop.setAttribute('x2', parentMidX);
            verticalDrop.setAttribute('y2', parentBottomY);
            verticalDrop.setAttribute('class', 'tree-line');
            svg.appendChild(verticalDrop);

         } else if (cards.length === 1) {
            // Einzelnes Elternteil
            const rect = cards[0].getBoundingClientRect();
            parentMidX = toLocalX((rect.left + rect.right) / 2);
            parentBottomY = toLocalY(rect.bottom);
         } else {
            return;
         }

         // Kinder-Zweige abfragen
         const childrenBranches = childrenRow.querySelectorAll(':scope > .family-branch');
         if (childrenBranches.length > 0) {
            let firstChildX = Infinity;
            let lastChildX = -Infinity;
            const childrenTargets = [];

            childrenBranches.forEach(childBranch => {
               const childCouple = childBranch.querySelector(':scope > .couple');
               if (childCouple) {
                  const childCards = childCouple.querySelectorAll('.person-card');
                  if (childCards.length > 0) {
                     const cRect1 = childCards[0].getBoundingClientRect();
                     let targetX = toLocalX((cRect1.left + cRect1.right) / 2);
                     const targetY = toLocalY(cRect1.top);

                     // Wenn das Kind verheiratet ist (2 Karten), verbinde in die Mitte der zwei Karten
                     if (childCards.length === 2) {
                        const cRect2 = childCards[1].getBoundingClientRect();
                        targetX = toLocalX((cRect1.left + cRect2.right) / 2);
                     }

                     childrenTargets.push({ x: targetX, y: targetY });
                     firstChildX = Math.min(firstChildX, targetX);
                     lastChildX = Math.max(lastChildX, targetX);
                  }
               }
            });

            if (childrenTargets.length > 0) {
               // Horizontale Brücke 20px unter dem Paar
               const yBridge = parentBottomY + 20;

               // Stamm-Strich von Eltern zu Brücke
               const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'path');
               trunk.setAttribute('d', `M ${parentMidX} ${parentBottomY} L ${parentMidX} ${yBridge}`);
               trunk.setAttribute('class', 'tree-line');
               svg.appendChild(trunk);

               // Brücken-Verbinder bei mehreren Kindern
               if (childrenTargets.length > 1) {
                  const bridge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  bridge.setAttribute('d', `M ${firstChildX} ${yBridge} L ${lastChildX} ${yBridge}`);
                  bridge.setAttribute('class', 'tree-line');
                  svg.appendChild(bridge);
               }

               // Verbindungs-Striche von Brücke zu Kindern
               childrenTargets.forEach(target => {
                  const lineToChild = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  lineToChild.setAttribute('d', `M ${target.x} ${yBridge} L ${target.x} ${target.y}`);
                  lineToChild.setAttribute('class', 'tree-line');
                  svg.appendChild(lineToChild);
               });
            }
         }
      }
   });
}

/**
 * Globale Zoom/Pan Zustandsvariablen
 */
let currentScale = 1;
let panX = 0;
let panY = 0;

/**
 * Initialisiert das Pan- und Zoom-Verhalten
 */
function initPanZoom() {
   const viewport = document.getElementById('tree-viewport');
   const container = document.getElementById('tree-container');
   if (!viewport || !container) return;

   let isDragging = false;
   let startX = 0;
   let startY = 0;

   // Maus-Verschiebung (Drag)
   viewport.addEventListener('mousedown', (e) => {
      // Nur linke Maustaste
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      viewport.style.cursor = 'grabbing';
   });

   window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyTransform();
   });

   window.addEventListener('mouseup', () => {
      isDragging = false;
      viewport.style.cursor = 'grab';
   });

   // Zoom über Mausrad (Zentriert um den Mauszeiger)
   viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomIntensity = 0.08;
      const vRect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - vRect.left;
      const mouseY = e.clientY - vRect.top;

      const prevScale = currentScale;
      const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
      
      currentScale = Math.min(Math.max(currentScale * zoomFactor, 0.15), 2.5);

      // Verschiebe Pan, sodass unter dem Mauszeiger vergrößert wird
      panX = mouseX - (mouseX - panX) * (currentScale / prevScale);
      panY = mouseY - (mouseY - panY) * (currentScale / prevScale);

      applyTransform();
   });

   // TOUCH GESTEN (Drag & Pinch-to-Zoom für mobile Geräte)
   let touchStartDist = 0;
   let touchStartScale = 1;

   viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
         isDragging = true;
         startX = e.touches[0].clientX - panX;
         startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
         isDragging = false; // Dragging deaktivieren bei Zwei-Finger-Zoom
         touchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
         touchStartScale = currentScale;

         const vRect = viewport.getBoundingClientRect();
         const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - vRect.left;
         const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - vRect.top;
         startX = midX;
         startY = midY;
      }
   });

   viewport.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
         panX = e.touches[0].clientX - startX;
         panY = e.touches[0].clientY - startY;
         applyTransform();
      } else if (e.touches.length === 2) {
         const dist = getTouchDistance(e.touches[0], e.touches[1]);
         const scaleFactor = dist / touchStartDist;
         const prevScale = currentScale;

         currentScale = Math.min(Math.max(touchStartScale * scaleFactor, 0.15), 2.5);

         panX = startX - (startX - panX) * (currentScale / prevScale);
         panY = startY - (startY - panY) * (currentScale / prevScale);

         applyTransform();
      }
   });

   viewport.addEventListener('touchend', () => {
      isDragging = false;
   });

   function getTouchDistance(t1, t2) {
      return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);
   }

   // Zoom Buttons
   document.getElementById('zoom-in').onclick = () => {
      zoomByCenter(1.2);
   };

   document.getElementById('zoom-out').onclick = () => {
      zoomByCenter(0.8);
   };

   document.getElementById('zoom-fit').onclick = () => {
      fitTreeToViewport();
   };
}

/**
 * Wendet die Verschiebung und Skalierung auf den Baum an.
 */
function applyTransform() {
   const container = document.getElementById('tree-container');
   if (container) {
      container.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
   }
}

/**
 * Zoomt zentriert im Viewport.
 */
function zoomByCenter(factor) {
   const viewport = document.getElementById('tree-viewport');
   if (!viewport) return;

   const midX = viewport.clientWidth / 2;
   const midY = viewport.clientHeight / 2;

   const prevScale = currentScale;
   currentScale = Math.min(Math.max(currentScale * factor, 0.15), 2.5);

   panX = midX - (midX - panX) * (currentScale / prevScale);
   panY = midY - (midY - panY) * (currentScale / prevScale);

   applyTransform();
}

/**
 * Passt den Stammbaum so an, dass er vollständig im Viewport sichtbar ist (View-All).
 */
function fitTreeToViewport() {
   const viewport = document.getElementById('tree-viewport');
   const content = document.getElementById('tree-content');
   if (!viewport || !content) return;

   const vw = viewport.clientWidth;
   const vh = viewport.clientHeight;
   const cw = content.scrollWidth;
   const ch = content.scrollHeight;

   // Maßstab ermitteln
   const scaleX = vw / (cw + 60); // 30px Abstand links/rechts
   const scaleY = vh / (ch + 60); // 30px Abstand oben/unten

   currentScale = Math.min(scaleX, scaleY, 1.0); // maximal 1x Vergrößerung
   
   // Zentrieren
   panX = (vw - cw * currentScale) / 2;
   panY = Math.max((vh - ch * currentScale) / 2, 30);

   applyTransform();
}

/**
 * Initialisiert Header-Interaktionen (Themewechsel & Abmelden).
 */
function initHeaderActions() {
   const themeToggleBtn = document.getElementById('theme-toggle-btn');
   if (themeToggleBtn) {
      themeToggleBtn.onclick = () => {
         const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
         const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
         const target = newTheme === 'light' ? 1 : 0;
         
         gsap.to(document.documentElement, {
            duration: 0.9,
            ease: 'power2.out',
            css: { '--theme-progress': target },
            onComplete: () => {
               document.documentElement.setAttribute('data-theme', newTheme);
               localStorage.setItem('stammbaum_theme', newTheme);
               // Rote Linien und Farben anpassen
               drawTreeLines();
            },
         });
      };
   }

   const logoutBtn = document.getElementById('logout-btn');
   if (logoutBtn) {
      logoutBtn.onclick = () => {
         Auth.clearSession();
         window.location.href = 'index.html';
      };
   }
}
