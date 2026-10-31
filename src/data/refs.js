// Listes de référence du formulaire d'inscription (termes usuels du domaine ecclésial).

export const ADMIN_EMAIL = 'pcinformatique28@gmail.com'

export const PROVINCES = [
  'Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga',
  'Ogooué-Ivindo', 'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem',
]

export const FAMILLES = [
  'Catholique', 'Protestante', 'Évangélique', 'Pentecôtiste', 'Charismatique',
  'Baptiste', 'Adventiste', 'Orthodoxe', 'Néo-apostolique', 'Église indépendante', 'Autre',
]

export const PRATIQUES = [
  'Baptême d’eau par immersion', 'Baptême des enfants', 'Sainte-Cène', 'Eucharistie',
  'Confirmation', 'Mariage religieux', 'Onction des malades', 'Dîme et offrandes',
  'Jeûne et prière', 'Prière de délivrance', 'École du dimanche', 'Louange et chorale',
]

export const LANGUES = [
  'Français', 'Anglais', 'Fang', 'Myènè', 'Punu', 'Nzébi', 'Téké', 'Kota', 'Obamba (Mbédé)', 'Autre',
]

export const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export const TYPES_CULTE = [
  'Culte principal', 'Messe', 'Culte de semaine', 'Étude biblique', 'Veillée de prière',
  'École du dimanche', 'Culte de jeunesse', 'Autre',
]

export const TITRES_AUTORITE = [
  'Archevêque', 'Évêque', 'Président du conseil', 'Président national', 'Surintendant',
  'Apôtre', 'Pasteur principal', 'Responsable général', 'Autre',
]

export const TITRES_MINISTERE = [
  'Archevêque', 'Évêque', 'Prêtre (curé)', 'Abbé', 'Diacre', 'Pasteur titulaire',
  'Pasteur assistant', 'Révérend', 'Apôtre', 'Prophète', 'Évangéliste', 'Ancien',
  'Catéchiste', 'Missionnaire', 'Autre',
]

export const NIVEAUX_FORMATION = [
  'Institut biblique', 'Faculté de théologie', 'Séminaire (petit ou grand)',
  'Formation pastorale', 'Formation missionnaire', 'Formation interne à l’église', 'Autre',
]

export const DIPLOMES = ['Attestation', 'Certificat', 'Diplôme', 'Licence', 'Master', 'Doctorat']

export const TYPES_DOCUMENTS = [
  'Autorisation d’exercer (ministère de l’Intérieur)',
  'Récépissé de déclaration',
  'Statuts et règlement intérieur',
  'Procès-verbal de l’assemblée constitutive',
  'Lettre de reconnaissance de la fédération ou de la hiérarchie',
  'Acte d’ordination ou de consécration',
  'Diplôme ou attestation de formation',
  'Autre document',
]

export const STATUTS = {
  en_attente: 'En attente de validation',
  referencee: 'Référencée',
  verifiee: 'Vérifiée',
  officielle: 'Officiellement documentée',
  rejetee: 'Rejetée',
}

export const STATUTS_DOC = { depose: 'Déposé', valide: 'Validé', refuse: 'Refusé' }

export const fmtDate = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null
    return d ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  } catch {
    return '—'
  }
}
