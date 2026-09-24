import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { getApiError } from '../../utils/auth.js'
import TutorCard from '../../components/TutorCard.jsx'
import TextInput from '../../components/forms/TextInput.jsx'
import SelectInput from '../../components/forms/SelectInput.jsx'

const emptyFilters = {
  subject: '',
  price: '',
  rating: '',
  availability: '',
}

function Tutors() {
  const [filters, setFilters] = useState(emptyFilters)
  const [applied, setApplied] = useState(emptyFilters)
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTutors = async () => {
      setLoading(true)
      setError('')

      const params = {}
      if (applied.subject.trim()) params.subject = applied.subject.trim()
      if (applied.price !== '') params.price = applied.price
      if (applied.rating !== '') params.rating = applied.rating
      if (applied.availability) params.availability = applied.availability

      try {
        const { data } = await api.get('/tutors', { params })
        setTutors(data.data.tutors || [])
      } catch (err) {
        setTutors([])
        setError(getApiError(err))
      } finally {
        setLoading(false)
      }
    }

    loadTutors()
  }, [applied])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setApplied(filters)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Find a tutor</h1>
      <p className="mt-2 text-sm text-slate-600">Browse tutors stored in the LMS database.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <TextInput id="subject" name="subject" label="Subject" value={filters.subject} onChange={handleChange} />
        <TextInput
          id="price"
          name="price"
          type="number"
          min="0"
          label="Max price"
          value={filters.price}
          onChange={handleChange}
        />
        <SelectInput id="rating" name="rating" label="Minimum rating" value={filters.rating} onChange={handleChange}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5</option>
        </SelectInput>
        <SelectInput
          id="availability"
          name="availability"
          label="Availability"
          value={filters.availability}
          onChange={handleChange}
        >
          <option value="">Any day</option>
          <option value="monday">Monday</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="thursday">Thursday</option>
          <option value="friday">Friday</option>
          <option value="saturday">Saturday</option>
          <option value="sunday">Sunday</option>
        </SelectInput>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Apply filters
          </button>
        </div>
      </form>

      {loading ? <p className="mt-10 text-sm text-slate-500">Loading tutors...</p> : null}

      {!loading && error ? (
        <div className="mt-10 rounded-lg border border-rose-200 bg-rose-50 px-4 py-6">
          <p className="text-sm text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => setApplied({ ...applied })}
            className="mt-3 text-sm font-medium text-rose-700 underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && tutors.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
          No tutors match these filters.
        </p>
      ) : null}

      {!loading && !error && tutors.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default Tutors