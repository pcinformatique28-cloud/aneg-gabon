import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Directory from './pages/Directory'
import ChurchDetail from './pages/ChurchDetail'
import MapPage from './pages/MapPage'
import Login from './pages/Login'
import Profile from './pages/Profile'
import { Agenda, Stats, About } from './pages/Simple'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="annuaire" element={<Directory />} />
        <Route path="eglise/:id" element={<ChurchDetail />} />
        <Route path="carte" element={<MapPage />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="statistiques" element={<Stats />} />
        <Route path="a-propos" element={<About />} />
        <Route path="connexion" element={<Login />} />
        <Route path="profil" element={<Profile />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
