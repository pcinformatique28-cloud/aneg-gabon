import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'visiteur', label: 'Visiteur', cls: 'blue' },
  { id: 'membre', label: 'Membre', cls: 'green' },
  { id: 'eglise', label: 'Église / Responsable', cls: 'orange' },
  { id: 'admin', label: '🔒 Administrateur', cls: 'purple' },
]

const DATA = {
  visiteur: {
    intro: 'Vous découvrez ANEG sans compte.',
    peux: ['Parcourir l’annuaire des églises du Gabon.', 'Voir les lieux de culte sur la carte, ou autour de vous.', 'Consulter l’agenda et les statistiques.'],
    dois: ['Créer un compte pour recevoir des alertes et avoir un profil.', 'Renseigner des informations exactes à l’inscription.'],
    faire: ['Ouvrez le menu ☰ puis « Se connecter / S’inscrire ».', 'Remplissez le formulaire puis validez.', 'Connectez-vous ensuite avec votre compte.'],
  },
  membre: {
    intro: 'Vous avez un compte ANEG.',
    peux: ['Gérer votre profil et votre photo.', 'Recevoir les alertes sous la cloche 🔔.', 'Utiliser l’annuaire, la carte et l’agenda.'],
    dois: ['Rester connecté pour retrouver vos alertes.', 'Garder vos informations à jour.'],
    faire: ['Touchez l’icône profil en haut à droite.', 'Modifiez vos informations puis enregistrez.'],
  },
  eglise: {
    intro: 'Vous représentez une église ou un lieu de culte.',
    peux: ['Inscrire votre église dans l’annuaire.', 'Mettre à jour ses informations et ses événements.'],
    dois: ['Avoir un compte et être connecté.', 'Donner des informations exactes (nom, commune, dénomination, contact).'],
    faire: ['Ouvrez le menu ☰ puis « Inscrire / gérer mon église ».', 'Remplissez la fiche puis enregistrez.'],
  },
}

export default function HelpGuide({ isAdminAccount }) {
  const { user } = useAuth()
  const [tab, setTab] = useState(user ? 'membre' : 'visiteur')
  const d = DATA[tab]
  return (
    <div className="hg">
      <div className="hg-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`hg-tab ${t.cls} ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab === 'admin' ? (
        isAdminAccount ? (
          <div className="hg-body">
            <p className="hg-intro">Espace administrateur de l’annuaire.</p>
            <h3>✅ Ce que je peux faire</h3>
            <ul><li>Accéder à l’administration et gérer le contenu de l’annuaire.</li></ul>
            <h3>🔧 Comment faire</h3>
            <ul><li>Touchez le bouclier dans l’en-tête, ou « Administration » dans le menu ☰.</li></ul>
          </div>
        ) : (
          <div className="hg-body">
            <p className="hg-intro">🔒 Cette fonction est réservée à l’administrateur de l’annuaire.</p>
          </div>
        )
      ) : (
        <div className="hg-body">
          <p className="hg-intro">{d.intro}</p>
          <h3>✅ Ce que je peux faire</h3>
          <ul>{d.peux.map((x) => <li key={x}>{x}</li>)}</ul>
          <h3>⚠️ Ce que je dois faire</h3>
          <ul>{d.dois.map((x) => <li key={x}>{x}</li>)}</ul>
          <h3>🔧 Comment faire</h3>
          <ul>{d.faire.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
