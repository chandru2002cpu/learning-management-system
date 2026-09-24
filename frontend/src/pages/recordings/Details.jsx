import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../services/api.js'
import { getApiError } from '../../utils/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'

function RecordingDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [recording, setRecording] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let objectUrl = ''

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/recordings/${id}`)
        setRecording(data.data.recording)
        const stream = await api.get(`/recordings/${id}/stream`, { responseType: 'blob' })
        objectUrl = URL.createObjectURL(stream.data)
        setVideoUrl(objectUrl)
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  if (loading) return <p className="px-4 py-12 text-sm text-slate-500">Loading recording...</p>
  if (error) return <p className="px-4 py-12 text-sm text-rose-700">{error}</p>

  const back = user?.role === 'tutor' ? '/tutor/recordings' : '/student/recordings'

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{recording.title}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {recording.lesson?.title} · {recording.duration} seconds
      </p>
      <video className="mt-6 w-full rounded-xl bg-slate-900" controls src={videoUrl}>
        Your browser cannot play this video.
      </video>
      <Link to={back} className="mt-6 inline-block text-sm text-indigo-600">
        Back to recordings
      </Link>
    </section>
  )
}

export default RecordingDetails
