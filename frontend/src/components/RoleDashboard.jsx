import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js'
import { getApiError } from '../utils/auth.js'
import DashboardPlaceholder from './DashboardPlaceholder.jsx'

function RoleDashboard({ title, endpoint }) {
  const navigate = useNavigate()
  const [description, setDescription] = useState('Loading your workspace...')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get(endpoint)
        setDescription(data.message || 'Your workspace will appear here.')
        setError('')
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (err.response?.status === 403) {
          navigate('/unauthorized', { replace: true })
          return
        }

        setError(getApiError(err))
      }
    }

    loadDashboard()
  }, [endpoint, navigate])

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-rose-600">{error}</p>
      </section>
    )
  }

  return <DashboardPlaceholder title={title} description={description} />
}

export default RoleDashboard
