/**
 * Stammbaum-Logik zur Visualisierung und Interaktivität.
 * Baut den Baum dynamisch aus FAMILY_TREE (data.js) auf und
 * steuert Zoom und Pan per Maus/Touch.
 */
document.addEventListener('DOMContentLoaded', () => {
   // Authentifizierung prüfen (falls Auth-Modul geladen ist)
   const session = typeof Auth !== 'undefined' ? Auth.getSession() : null;
   if (typeof Auth !== 'undefined') {
      if (!Auth.requireAuth('index.html')) return;
   }

   // Stammbaum-Rendern initialisieren
   initFamilyTree(session);

   // Pan- und Zoom-Steuerung einrichten
   initPanZoom();
});

/**
 * Erstellt die Stammbaum-HTML-Struktur rekursiv und zeichnet die Linien.
 */
function initFamilyTree(session) {
   const treeContent = document.getElementById('tree-content');
   if (!treeContent) return;

   // Wurzeln des Baums dynamisch ermitteln (Personen ohne Eltern im Datensatz)
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

   // Kurz warten, damit das CSS-Layout gerendert ist, bevor Linien gezeichnet und skaliert wird
   setTimeout(() => {
      drawTreeLines();
      fitTreeToViewport(); // Auto-Scale (View-All-Mode)
   }, 100);

   // Fenster-Größenänderung abfangen, um Linien neu zu berechnen
   window.addEventListener('resize', () => {
      drawTreeLines();
   });
}

/**
 * Erstellt eine Familieneinheit (Eltern und Kinder).
 */
function getFamilyUnit(parentIds) {
   const children = FAMILY_TREE.filter(person => {
      if (!person.parents) return false;
      return parentIds.every(pId => person.parents.includes(pId));
   });

   const childrenUnits = children.map(child => {
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
 * Generiert die HTML-Karten und Zweige.
 */
function renderFamilyUnit(unit, session) {
   const branchDiv = document.createElement('div');
   branchDiv.className = 'family-branch';

   // Paar-Container
   const coupleDiv = document.createElement('div');
   coupleDiv.className = 'couple';

   unit.parents.forEach(pId => {
      const person = FAMILY_TREE.find(p => p.id === pId);
      if (person) {
         const card = document.createElement('div');
         card.className = 'person-card';
         card.id = `card-${person.id}`;
         
         // Aktuellen Benutzer hervorheben
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

   // Kinder-Zweige
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
 * Zeichnet die Verbindungslinien im SVG-Overlay.
 */
function drawTreeLines() {
   const svg = document.getElementById('tree-connections');
   const treeContent = document.getElementById('tree-content');
   if (!svg || !treeContent) return;

   const cw = treeContent.scrollWidth;
   const ch = treeContent.scrollHeight;
   svg.setAttribute('width', cw);
   svg.setAttribute('height', ch);
   svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`);

   svg.innerHTML = ''; // Vorherige Linien löschen

   const rootRect = treeContent.getBoundingClientRect();

   // Transformierte Koordinaten in lokale Koordinaten umrechnen (wichtig für Zoom)
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
            const rectA = cards[0].getBoundingClientRect();
            const rectB = cards[1].getBoundingClientRect();

            const ax = toLocalX((rectA.left + rectA.right) / 2);
            const ay = toLocalY((rectA.top + rectA.bottom) / 2);
            const bx = toLocalX((rectB.left + rectB.right) / 2);
            const by = toLocalY((rectB.top + rectB.bottom) / 2);

            // Linie zwischen Partnern
            const spouseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            spouseLine.setAttribute('x1', ax);
            spouseLine.setAttribute('y1', ay);
            spouseLine.setAttribute('x2', bx);
            spouseLine.setAttribute('y2', by);
            spouseLine.setAttribute('class', 'tree-line tree-line--spouse');
            svg.appendChild(spouseLine);

            parentMidX = (ax + bx) / 2;
            parentBottomY = toLocalY(Math.max(rectA.bottom, rectB.bottom));

            // Vertikale Abzweigung nach unten
            const verticalDrop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            verticalDrop.setAttribute('x1', parentMidX);
            verticalDrop.setAttribute('y1', (ay + by) / 2);
            verticalDrop.setAttribute('x2', parentMidX);
            verticalDrop.setAttribute('y2', parentBottomY);
            verticalDrop.setAttribute('class', 'tree-line');
            svg.appendChild(verticalDrop);

         } else if (cards.length === 1) {
            const rect = cards[0].getBoundingClientRect();
            parentMidX = toLocalX((rect.left + rect.right) / 2);
            parentBottomY = toLocalY(rect.bottom);
         } else {
            return;
         }

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
               const yBridge = parentBottomY + 20; // Brücke 20px unter dem Paar

               // Verbindungslinie zur Brücke
               const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'path');
               trunk.setAttribute('d', `M ${parentMidX} ${parentBottomY} L ${parentMidX} ${yBridge}`);
               trunk.setAttribute('class', 'tree-line');
               svg.appendChild(trunk);

               // Horizontale Brückenlinie
               if (childrenTargets.length > 1) {
                  const bridge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  bridge.setAttribute('d', `M ${firstChildX} ${yBridge} L ${lastChildX} ${yBridge}`);
                  bridge.setAttribute('class', 'tree-line');
                  svg.appendChild(bridge);
               }

               // Linien von Brücke zu Kindern
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
 * Zoom und Pan Zustand
 */
let currentScale = 1;
let panX = 0;
let panY = 0;

/**
 * Initialisiert die Maus- und Touch-Gesten.
 */
function initPanZoom() {
   const viewport = document.getElementById('tree-viewport');
   const container = document.getElementById('tree-container');
   if (!viewport || !container) return;

   let isDragging = false;
   let startX = 0;
   let startY = 0;

   // Verschieben mit der Maus (Drag)
   viewport.addEventListener('mousedown', (e) => {
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

   // Zoom per Mausrad (um den Zeiger zentriert)
   viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomIntensity = 0.08;
      const vRect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - vRect.left;
      const mouseY = e.clientY - vRect.top;

      const prevScale = currentScale;
      const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
      
      currentScale = Math.min(Math.max(currentScale * zoomFactor, 0.15), 2.5);

      panX = mouseX - (mouseX - panX) * (currentScale / prevScale);
      panY = mouseY - (mouseY - panY) * (currentScale / prevScale);

      applyTransform();
   });

   // TOUCH GESTEN (Wischen & Pinch-to-Zoom für Smartphones)
   let touchStartDist = 0;
   let touchStartScale = 1;

   viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
         isDragging = true;
         startX = e.touches[0].clientX - panX;
         startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
         isDragging = false;
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

   // Zoom Buttons steuern
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
 * Wendet Verschiebung und Zoom auf den Container an.
 */
function applyTransform() {
   const container = document.getElementById('tree-container');
   if (container) {
      container.style.transform = `translate(${panX}px, ${panY}px) scale(${currentScale})`;
   }
}

/**
 * Hilfsfunktion zum Zoomen aus dem Zentrum.
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
 * Passt den Stammbaum komplett in die Bildschirmgröße ein (View-All).
 */
function fitTreeToViewport() {
   const viewport = document.getElementById('tree-viewport');
   const content = document.getElementById('tree-content');
   if (!viewport || !content) return;

   const vw = viewport.clientWidth;
   const vh = viewport.clientHeight;
   const cw = content.scrollWidth;
   const ch = content.scrollHeight;

   const scaleX = vw / (cw + 40); // 20px Rand
   const scaleY = vh / (ch + 40);

   currentScale = Math.min(scaleX, scaleY, 1.0); // Maximal 1.0x
   
   panX = (vw - cw * currentScale) / 2;
   panY = (vh - ch * currentScale) / 2;

   applyTransform();
}
