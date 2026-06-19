/**
 * Globale Benutzerdaten und Profilinformationen.
 * Wird vor auth.js eingebunden, damit es global zur Verfügung steht.
 */
const USER_DATA = {
   user: {
      password: '1234',
      displayName: 'user',
      role: 'member',
      birthdate: '10.06.2026',
      children: 'Nein',
      married: 'Nein',
   },
   konstantin: {
      password: 'bormann26',
      displayName: 'Konstantin',
      role: 'admin',
      birthdate: '16.05.2010',
      children: 'Nein',
      married: 'Nein',
   },
   jakob: {
      password: 'bormann26',
      displayName: 'Jakob',
      role: 'member',
      birthdate: '31.05.2020',
      children: 'Nein',
      married: 'Nein',
   },
   martha: {
      password: 'bormann26',
      displayName: 'Martha',
      role: 'member',
      birthdate: '17.05.2013',
      children: 'Nein',
      married: 'Nein',
   },
   alexander: {
      password: 'bormann26',
      displayName: 'Alexander',
      role: 'member',
      birthdate: '16.05.2010',
      children: 'Nein',
      married: 'Nein',
   },
   leonard: {
      password: 'bormann26',
      displayName: 'Leonard',
      role: 'member',
      birthdate: '2x.05.2009',
      children: 'Nein',
      married: 'Nein',
   },
   vero: {
      password: 'bormann26',
      displayName: 'Vero',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'jakob',
      married: 'Nein',
   },
   tom: {
      password: 'bormann26',
      displayName: 'Tom',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'jakob',
      married: 'Nein',
   },
   nadine: {
      password: 'bormann26',
      displayName: 'Nadine',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Leonard und Martha',
      married: '->  Henry',
   },
   henry: {
      password: 'bormann26',
      displayName: 'Henry',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Nein',
      married: ' -> Nadine',
   },
   sylvi: {
      password: 'bormann26',
      displayName: 'Sylvi',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Konstantin und Alexander',
      married: '-> Jens',
   },
   jens: {
      password: 'bormann26',
      displayName: 'Jens',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Konstantin und Alexander',
      married: '-> Silvy',
   },
   thomas: {
      password: 'bormann26',
      displayName: 'Thomas',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Nein',
      married: 'Nein',
   },
   marlies: {
      password: 'bormann26',
      displayName: 'Marlies',
      role: 'member',
      birthdate: '01.01.1990',
      children: 'Tom, Nadien, Sylvi',
      married: 'ja',
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