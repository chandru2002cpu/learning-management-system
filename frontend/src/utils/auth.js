export const TOKEN_KEY = 'lms_token'

export function getProfilePath(role) {
  if (role === 'tutor') {
    return '/tutor/profile'
  }

  if (role === 'student') {
    return '/student/profile'
  }

  return null
}

export function getDashboardPath(role) {
  if (role === 'tutor') {
    return '/tutor/dashboard'
  }

  if (role === 'admin') {
    return '/admin/dashboard'
  }

  return '/student/dashboard'
}

export function getApiError(error) {
  const data = error?.response?.data

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join('. ')
  }

  if (data?.message) {
    return data.message
  }

  return 'Something went wrong. Please try again.'
}
