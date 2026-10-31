// Données de départ de l'annuaire ANEG : lieux de culte chrétiens de Libreville, Akanda et Owendo.
// Sources publiques (voir `source`). Les positions GPS sont APPROXIMATIVES (niveau quartier) :
// chaque église pourra les corriger depuis sa fiche une fois son compte validé.

export const COMMUNES = ['Libreville', 'Akanda', 'Owendo']

export const DENOM_COLORS = {
  Catholique: '#0a63c9',
  'Protestante (EEG)': '#009e60',
  Adventiste: '#c28a00',
  'Néo-apostolique': '#7a3fb5',
}

const SRC = {
  pratique: { titre: 'Le Pratique du Gabon – Cultes', url: 'https://lepratiquedugabon.com/rubriques/cultes/' },
  miboue: { titre: 'Miboué – Lieux de cultes', url: 'https://www.miboue.com/lieux-de-cultes/' },
  wikiNkembo: { titre: 'Wikipédia – Église Saint-Michel de Nkembo', url: 'https://fr.wikipedia.org/wiki/%C3%89glise_Saint-Michel_de_Nkembo' },
  lonely: { titre: 'Lonely Planet – Église de St-Michel de Nkembo', url: 'https://www.lonelyplanet.com/points-of-interest/eglise-de-st-michel-de-nkembo/1558372' },
  cathedrale: { titre: 'Gabonreview – Réouverture de la cathédrale', url: 'https://www.gabonreview.com/libreville-la-cathedrale-notre-dame-de-lassomption-rouvre-ses-portes-apres-une-annee-de-restauration/' },
  okala: { titre: 'Gabonreview – Paroisse d’Okala-Mikolongo', url: 'https://www.gabonreview.com/religion-une-campagne-devangelisation-a-la-paroisse-dokala-mikolongo' },
}

const e = (id, nom, denomination, commune, lieu, lat, lng, extra = {}) => ({
  id,
  nom,
  denomination,
  commune,
  lieu,
  lat,
  lng,
  precision: lat == null ? 'inconnue' : 'quartier',
  statut: 'Référencée',
  note: '',
  source: [SRC.pratique, SRC.miboue],
  ...extra,
})

export const CHURCHES = [
  // ---------- Libreville ----------
  e('cathedrale-sainte-marie', 'Cathédrale Notre-Dame de l’Assomption (Sainte-Marie)', 'Catholique', 'Libreville', 'Bord de mer, face au Port Môle', 0.3905, 9.4425, {
    note: 'Église-mère de l’archidiocèse de Libreville et siège de l’archevêque. Fermée à partir de juin 2025 pour réhabilitation, elle a rouvert du 13 au 15 août 2026.',
    source: [SRC.cathedrale, SRC.pratique],
  }),
  e('st-michel-nkembo', 'Paroisse Saint-Michel de Nkembo', 'Catholique', 'Libreville', 'Nkembo (2e arrondissement), près de la gare routière', 0.417, 9.456, {
    note: 'Première pierre posée en 1949, paroisse érigée le 6 janvier 1964, église consacrée le 2 octobre 1964. Fondée par la Congrégation du Saint-Esprit. Peut accueillir jusqu’à 3 000 personnes.',
    source: [SRC.wikiNkembo, SRC.lonely],
  }),
  e('ndl-lourdes', 'Paroisse Notre-Dame de Lourdes', 'Catholique', 'Libreville', 'Carrefour STFO', 0.416, 9.459),
  e('ndl-victoires', 'Paroisse Notre-Dame des Victoires', 'Catholique', 'Libreville', 'Plaine Niger', 0.421, 9.462),
  e('st-andre', 'Paroisse Saint-André', 'Catholique', 'Libreville', 'Face à Citibank', 0.3935, 9.4505),
  e('st-jean-baptiste', 'Paroisse Saint-Jean-Baptiste', 'Catholique', 'Libreville', 'Nzeng-Ayong', 0.434, 9.478),
  e('st-joseph-lalala', 'Paroisse Saint-Joseph', 'Catholique', 'Libreville', 'Lalala', 0.426, 9.468),
  e('st-pierre', 'Paroisse Saint-Pierre', 'Catholique', 'Libreville', 'Face à la Présidence', 0.401, 9.445),
  e('ste-jeanne-d-arc', 'Paroisse Sainte-Jeanne d’Arc', 'Catholique', 'Libreville', 'Likouala', 0.409, 9.465),
  e('rois-mages', 'Paroisse des Rois Mages', 'Catholique', 'Libreville', 'Akébé Ville', 0.383, 9.468),

  e('eeg-akebe', 'Paroisse Akébé', 'Protestante (EEG)', 'Libreville', 'Akébé, face au B2', 0.385, 9.47),
  e('eeg-baraka', 'Paroisse Baraka Mission', 'Protestante (EEG)', 'Libreville', 'Glass', 0.404, 9.452),
  e('eeg-gros-bouquet', 'Paroisse de Gros Bouquet', 'Protestante (EEG)', 'Libreville', 'Château d’eau de Gros Bouquet', 0.399, 9.464),
  e('eeg-jericho', 'Paroisse de Jéricho', 'Protestante (EEG)', 'Libreville', 'Lalala, à gauche', 0.429, 9.47),
  e('eeg-la-peyrie', 'Paroisse de La Peyrie', 'Protestante (EEG)', 'Libreville', 'Face au dispensaire de La Peyrie', 0.412, 9.469),
  e('eeg-foyer-protestant', 'Paroisse du Foyer Protestant', 'Protestante (EEG)', 'Libreville', '9 étages', 0.3965, 9.455),

  e('adventiste-libreville', 'Église adventiste', 'Adventiste', 'Libreville', 'Lieu précis non communiqué', null, null),
  e('neo-apostolique-glass', 'Église néo-apostolique', 'Néo-apostolique', 'Libreville', 'Glass, à côté de la pharmacie', 0.403, 9.454),

  // ---------- Owendo ----------
  e('owendo-ste-croix', 'Notre-Dame du Port et de la Nomba – Paroisse Sainte-Croix', 'Catholique', 'Owendo', 'Cité SNI', 0.294, 9.503),
  e('owendo-eeg-sni', 'Paroisse d’Owendo – SNI', 'Protestante (EEG)', 'Owendo', 'Owendo (cité SNI)', 0.295, 9.504),

  // ---------- Akanda ----------
  e('okala-mikolongo', 'Paroisse Marie-Auxiliatrice d’Okala-Mikolongo', 'Catholique', 'Akanda', 'Okala-Mikolongo', 0.495, 9.433, {
    note: 'Petite mission catholique inscrite dans l’œuvre de Don Bosco, avec des activités pour les jeunes.',
    source: [SRC.okala],
  }),
]

export const getChurch = (id) => CHURCHES.find((c) => c.id === id)

export const DENOMINATIONS = [...new Set(CHURCHES.map((c) => c.denomination))]

export const norm = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export const itineraire = (c) =>
  c.lat == null ? null : `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
