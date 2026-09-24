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
  timezone: '',
  language: '',
  learningGoal: '',
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

  if (values.learningGoal.trim().length > 300) {
    errors.learningGoal = 'Learning goal cannot exceed 300 characters'
  }

  return errors
}

function StudentProfile() {
  const { setUser } = useAuth()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/student/profile')
        const profile = data.data.profile
        setValues({
          name: profile.name || '',
          avatar: profile.avatar || '',
          phone: profile.phone || '',
          bio: profile.bio || '',
          timezone: profile.preferences?.timezone || '',
          language: profile.preferences?.language || '',
          learningGoal: profile.preferences?.learningGoal || '',
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
      const { data } = await api.put('/student/profile', {
        name: values.name.trim(),
        avatar: values.avatar.trim(),
        phone: values.phone.trim(),
        bio: values.bio.trim(),
        preferences: {
          timezone: values.timezone.trim(),
          language: values.language.trim(),
          learningGoal: values.learningGoal.trim(),
        },
      })
      setUser(data.data.profile)
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
      <h1 className="text-2xl font-bold text-slate-900">Student profile</h1>
      <p className="mt-2 text-sm text-slate-600">Update your personal details and preferences.</p>

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
          id="timezone"
          name="timezone"
          label="Timezone"
          value={values.timezone}
          onChange={handleChange}
          placeholder="Asia/Kolkata"
        />
        <TextInput
          id="language"
          name="language"
          label="Preferred language"
          value={values.language}
          onChange={handleChange}
        />
        <TextArea
          id="learningGoal"
          name="learningGoal"
          label="Learning goal"
          rows={3}
          value={values.learningGoal}
          onChange={handleChange}
          error={errors.learningGoal}
        />
        <SubmitButton loading={saving}>Save profile</SubmitButton>
      </form>
    </section>
  )
}

export default StudentProfile
