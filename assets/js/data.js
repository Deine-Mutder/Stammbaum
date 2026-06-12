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
   // Generation 0 (Urgroßeltern / Wurzeln des Baums)
   { id: 'person-a', name: 'Person A', birth: '1900', death: '1975', spouseId: 'person-b' },
   { id: 'person-b', name: 'Person B', birth: '1905', death: '1980', spouseId: 'person-a' },

   // Generation 1 (Großeltern)
   { id: 'person-c', name: 'Person C', birth: '1930', death: '2005', spouseId: 'person-d', parents: ['person-a', 'person-b'] },
   { id: 'person-d', name: 'Person D', birth: '1935', death: '2010', spouseId: 'person-c' },

   // Generation 2 (Eltern)
   { id: 'person-e', name: 'Person E', birth: '1960', death: '', spouseId: 'person-f', parents: ['person-c', 'person-d'] },
   { id: 'person-f', name: 'Person F', birth: '1965', death: '', spouseId: 'person-e' },

   // Generation 3 (Kinder)
   { id: 'konstantin', name: 'Konstantin (Du)', birth: '1999', death: '', parents: ['person-e', 'person-f'] },
   { id: 'person-g', name: 'Person G', birth: '2002', death: '', parents: ['person-e', 'person-f'] }
]
