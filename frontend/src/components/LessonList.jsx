import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import { getApiError } from '../utils/auth.js'

function LessonList({ title, endpoint }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const { data } = await api.get(endpoint)
        setLessons(data.data.lessons || [])
      } catch (err) {
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [endpoint])

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {loading ? <p className="mt-6 text-sm text-slate-500">Loading lessons...</p> : null}
      {error ? <p className="mt-6 text-sm text-rose-700">{error}</p> : null}
      {!loading && !error && lessons.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No lessons yet.</p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link to={`/lessons/${lesson.id}`} className="block rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50">
              <span className="font-medium text-slate-900">{lesson.title}</span>
              <span className="mt-1 block text-sm text-slate-600">
                {lesson.date} · {lesson.startTime}–{lesson.endTime} · {lesson.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default LessonList
