/**
 * Globale Benutzerdaten und Profilinformationen.
 * Wird vor auth.js eingebunden, damit es global zur Verfügung steht.
 */
const USER_DATA = {
   user: {
      password: '1234',
      displayName: 'user',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Nein',
      married: 'Nein',
   },
   konstantin: {
      password: 'bormann26',
      displayName: 'Konstantin',
      role: 'member',
      birthdate: '16.05.2010',
      children: 'Nein',
      married: 'Nein',
   },
   user3: {
      password: '1234',
      displayName: 'user3',
      role: 'member',
      birthdate: '15.05.1985',
      children: 'Ja',
      married: 'Ja',
   },
}

/**
 * Stammbaum-Daten der Familie Bormann.
 * ID-Referenzen stellen Verbindungen zwischen Eltern, Partnern und Kindern dar.
 */
const FAMILY_TREE = [
   // Generation 0
   { id: 'albert', name: 'Albert Bormann', birth: '1880', death: '1945', spouseId: 'bertha', generation: 0 },
   { id: 'bertha', name: 'Bertha Bormann', birth: '1885', death: '1950', spouseId: 'albert', generation: 0 },

   // Generation 1
   { id: 'karl', name: 'Karl Bormann', birth: '1910', death: '1980', spouseId: 'erna', parents: ['albert', 'bertha'], generation: 1 },
   { id: 'erna', name: 'Erna Bormann (geb. Richter)', birth: '1915', death: '1995', spouseId: 'karl', generation: 1 },

   // Generation 2
   { id: 'dieter', name: 'Dieter Bormann', birth: '1945', death: '', spouseId: 'sabine', parents: ['karl', 'erna'], generation: 2 },
   { id: 'sabine', name: 'Sabine Bormann (geb. Weber)', birth: '1948', death: '', spouseId: 'dieter', generation: 2 },
   { id: 'frank', name: 'Frank Bormann', birth: '1948', death: '', spouseId: 'monika', parents: ['karl', 'erna'], generation: 2 },
   { id: 'monika', name: 'Monika Bormann (geb. Schulz)', birth: '1950', death: '', spouseId: 'frank', generation: 2 },

   // Generation 3
   { id: 'konstantin', name: 'Konstantin Bormann', birth: '1999', death: '', parents: ['dieter', 'sabine'], generation: 3 },
   { id: 'laura', name: 'Laura Bormann', birth: '2002', death: '', parents: ['dieter', 'sabine'], generation: 3 },
   { id: 'christian', name: 'Christian Bormann', birth: '1975', death: '', parents: ['frank', 'monika'], generation: 3 }
]
