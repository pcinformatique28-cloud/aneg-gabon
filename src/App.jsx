import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Directory from './pages/Directory'
import ChurchDetail from './pages/ChurchDetail'
import MapPage from './pages/MapPage'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ChurchForm from './pages/ChurchForm'
import Admin from './pages/Admin'
import Agenda from './pages/Agenda'
import ChurchCalendar from './pages/ChurchCalendar'
import { Stats, About } from './pages/Simple'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="annuaire" element={<Directory />} />
        <Route path="eglise/:id" element={<ChurchDetail />} />
        <Route path="carte" element={<MapPage />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="eglise/:id/calendrier" element={<ChurchCalendar />} />
        <Route path="statistiques" element={<Stats />} />
        <Route path="a-propos" element={<About />} />
        <Route path="connexion" element={<Login />} />
        <Route path="profil" element={<Profile />} />
        <Route path="inscrire-eglise" element={<ChurchForm />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/eglise/:id" element={<ChurchForm />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
