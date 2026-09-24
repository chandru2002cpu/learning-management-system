import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getApiError } from '../../utils/auth.js'
import TextInput from '../../components/forms/TextInput.jsx'
import TextArea from '../../components/forms/TextArea.jsx'
import SubmitButton from '../../components/forms/SubmitButton.jsx'

const emptyForm = {
  name: '',
  avatar: '',
  phone: '',
  bio: '',
  qualifications: '',
  expertise: '',
  experience: '0',
  subjects: '',
  hourlyRate: '0',
}

function toList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function validate(values) {
  const errors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (values.avatar.trim() && !/^https?:\/\/.+/i.test(values.avatar.trim())) {
    errors.avatar = 'Avatar must be a valid http or https URL'
  }

  if (values.phone.trim() && !/^[+0-9()\-\s]{7,20}$/.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number'
  }

  if (values.bio.trim().length > 500) {
    errors.bio = 'Bio cannot exceed 500 characters'
  }

  const experience = Number(values.experience)
  if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
    errors.experience = 'Experience must be a whole number from 0 to 80'
  }

  const hourlyRate = Number(values.hourlyRate)
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 10000) {
    errors.hourlyRate = 'Hourly rate must be a number from 0 to 10000'
  }

  return errors
}

function TutorProfilePage() {
  const { setUser } = useAuth()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/tutor/profile')
        const { user, tutorProfile } = data.data.profile
        setValues({
          name: user.name || '',
          avatar: user.avatar || '',
          phone: user.phone || '',
          bio: user.bio || '',
          qualifications: (tutorProfile.qualifications || []).join(', '),
          expertise: (tutorProfile.expertise || []).join(', '),
          experience: String(tutorProfile.experience ?? 0),
          subjects: (tutorProfile.subjects || []).join(', '),
          hourlyRate: String(tutorProfile.hourlyRate ?? 0),
        })
      } catch (error) {
        toast.error(getApiError(error))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSaving(true)

    try {
      const { data } = await api.put('/tutor/profile', {
        name: values.name.trim(),
        avatar: values.avatar.trim(),
        phone: values.phone.trim(),
        bio: values.bio.trim(),
        qualifications: toList(values.qualifications),
        expertise: toList(values.expertise),
        experience: Number(values.experience),
        subjects: toList(values.subjects),
        hourlyRate: Number(values.hourlyRate),
      })
      setUser(data.data.profile.user)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(getApiError(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="px-4 py-12 text-sm text-slate-500">Loading profile...</p>
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Tutor profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update your teaching details. Separate list items with commas.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <TextInput id="name" name="name" label="Name" value={values.name} onChange={handleChange} error={errors.name} />
        <TextInput
          id="avatar"
          name="avatar"
          label="Avatar URL"
          value={values.avatar}
          onChange={handleChange}
          error={errors.avatar}
          placeholder="https://example.com/avatar.jpg"
        />
        <TextInput id="phone" name="phone" label="Phone" value={values.phone} onChange={handleChange} error={errors.phone} />
        <TextArea id="bio" name="bio" label="Bio" rows={4} value={values.bio} onChange={handleChange} error={errors.bio} />
        <TextInput
          id="qualifications"
          name="qualifications"
          label="Qualifications"
          value={values.qualifications}
          onChange={handleChange}
          placeholder="MSc Mathematics, BEd"
        />
        <TextInput
          id="expertise"
          name="expertise"
          label="Expertise"
          value={values.expertise}
          onChange={handleChange}
          placeholder="Algebra, Calculus"
        />
        <TextInput
          id="experience"
          name="experience"
          type="number"
          min="0"
          label="Experience (years)"
          value={values.experience}
          onChange={handleChange}
          error={errors.experience}
        />
        <TextInput
          id="subjects"
          name="subjects"
          label="Subjects"
          value={values.subjects}
          onChange={handleChange}
          placeholder="Math, Physics"
        />
        <TextInput
          id="hourlyRate"
          name="hourlyRate"
          type="number"
          min="0"
          step="0.01"
          label="Hourly rate"
          value={values.hourlyRate}
          onChange={handleChange}
          error={errors.hourlyRate}
        />
        <SubmitButton loading={saving}>Save profile</SubmitButton>
      </form>
    </section>
  )
}

export default TutorProfilePage
