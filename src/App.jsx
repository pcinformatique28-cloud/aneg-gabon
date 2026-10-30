import { NavLink, Routes, Route } from 'react-router-dom'
import logo from './assets/logo-aneg.png'

function Accueil() {
  return (
    <>
      <section className="hero">
        <img src={logo} alt="Logo ANEG" />
        <h1>Annuaire National des Églises du Gabon</h1>
        <div className="devise">Référencer · Informer · Connecter</div>
      </section>
      <div className="recherche">
        <input type="search" placeholder="Rechercher une église, une ville…" />
        <button className="bouton">Chercher</button>
      </div>
      <div className="cartes">
        <div className="carte"><h3>Annuaire</h3>Trouver une église par province, ville ou dénomination.</div>
        <div className="carte"><h3>Carte</h3>Voir les églises autour de moi.</div>
        <div className="carte"><h3>Agenda</h3>Cultes, conférences, séminaires et croisades.</div>
      </div>
    </>
  )
}

function Bientot({ titre }) {
  return (
    <section>
      <h2>{titre}</h2>
      <p>Cette page arrive bientôt.</p>
    </section>
  )
}

export default function App() {
  return (
    <>
      <header>
        <div className="bande" />
        <div className="entete">
          <img src={logo} alt="" />
          <strong>ANEG</strong>
        </div>
        <nav>
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/annuaire">Annuaire</NavLink>
          <NavLink to="/carte">Carte</NavLink>
          <NavLink to="/agenda">Agenda</NavLink>
          <NavLink to="/connexion">Connexion</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/annuaire" element={<Bientot titre="Annuaire des églises" />} />
          <Route path="/carte" element={<Bientot titre="Carte interactive" />} />
          <Route path="/agenda" element={<Bientot titre="Agenda" />} />
          <Route path="/connexion" element={<Bientot titre="Connexion" />} />
        </Routes>
      </main>
      <footer>ANEG · Créé par PC-INFORMATIQUE</footer>
    </>
  )
}
