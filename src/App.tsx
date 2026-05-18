import { useEffect, useState } from 'react'
import PublicSite from './pages/PublicSite'
import AdminApp from './components/admin/AdminApp'
import SupabaseBanner from './components/SupabaseBanner'

function isAdminRoute(): boolean {
  const hash = window.location.hash || ''
  return hash.startsWith('#/admin') || hash === '#admin'
}

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute())

  useEffect(() => {
    function onHash() {
      setAdmin(isAdminRoute())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      {admin ? <AdminApp /> : <PublicSite />}
      <SupabaseBanner />
    </>
  )
}
