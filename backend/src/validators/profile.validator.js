const URL_REGEX = /^https?:\/\/.+/i
const PHONE_REGEX = /^[+0-9()\-\s]{7,20}$/

function isString(value) {
  return typeof value === 'string'
}

function parseList(value, label, errors) {
  if (value === undefined) {
    return undefined
  }

  const items = Array.isArray(value)
    ? value
    : isString(value)
      ? value.split(',')
      : null

  if (!items) {
    errors.push(`${label} must be a list of text values`)
    return undefined
  }

  const cleaned = items.map((item) => String(item).trim()).filter(Boolean)

  if (cleaned.length > 20) {
    errors.push(`${label} cannot have more than 20 items`)
  }

  if (cleaned.some((item) => item.length > 80)) {
    errors.push(`Each ${label.toLowerCase()} item must be 80 characters or fewer`)
  }

  return cleaned
}

function validateSharedProfile(body, errors) {
  const { name, avatar, phone, bio } = body

  if (name !== undefined) {
    if (!isString(name) || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters')
    } else if (name.trim().length > 80) {
      errors.push('Name cannot exceed 80 characters')
    }
  }

  if (avatar !== undefined && avatar !== '') {
    if (!isString(avatar) || !URL_REGEX.test(avatar.trim())) {
      errors.push('Avatar must be a valid http or https URL')
    } else if (avatar.trim().length > 500) {
      errors.push('Avatar URL cannot exceed 500 characters')
    }
  }

  if (phone !== undefined && phone !== '') {
    if (!isString(phone) || !PHONE_REGEX.test(phone.trim())) {
      errors.push('Phone must be 7 to 20 characters and contain only numbers and + ( ) -')
    }
  }

  if (bio !== undefined) {
    if (!isString(bio)) {
      errors.push('Bio must be text')
    } else if (bio.trim().length > 500) {
      errors.push('Bio cannot exceed 500 characters')
    }
  }
}

function sendValidation(res, errors) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
  })
}

export function validateStudentProfile(req, res, next) {
  const errors = []
  const body = req.body ?? {}

  validateSharedProfile(body, errors)

  if (body.preferences !== undefined) {
    const preferences = body.preferences

    if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
      errors.push('Preferences must be an object')
    } else {
      const { timezone, language, learningGoal } = preferences

      if (timezone !== undefined && (!isString(timezone) || timezone.trim().length > 80)) {
        errors.push('Timezone cannot exceed 80 characters')
      }

      if (language !== undefined && (!isString(language) || language.trim().length > 40)) {
        errors.push('Language cannot exceed 40 characters')
      }

      if (learningGoal !== undefined && (!isString(learningGoal) || learningGoal.trim().length > 300)) {
        errors.push('Learning goal cannot exceed 300 characters')
      }
    }
  }

  if (errors.length > 0) {
    return sendValidation(res, errors)
  }

  next()
}

export function validateTutorProfile(req, res, next) {
  const errors = []
  const body = req.body ?? {}

  validateSharedProfile(body, errors)

  req.parsedLists = {
    qualifications: parseList(body.qualifications, 'Qualifications', errors),
    expertise: parseList(body.expertise, 'Expertise', errors),
    subjects: parseList(body.subjects, 'Subjects', errors),
  }

  if (body.experience !== undefined && body.experience !== '') {
    const experience = Number(body.experience)

    if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
      errors.push('Experience must be a whole number of years from 0 to 80')
    }
  }

  if (body.hourlyRate !== undefined && body.hourlyRate !== '') {
    const hourlyRate = Number(body.hourlyRate)

    if (!Number.isFinite(hourlyRate) || hourlyRate < 0 || hourlyRate > 10000) {
      errors.push('Hourly rate must be a number from 0 to 10000')
    }
  }

  if (errors.length > 0) {
    return sendValidation(res, errors)
  }

  next()
}
