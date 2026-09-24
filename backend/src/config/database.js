import mongoose from 'mongoose'

function sanitizeErrorMessage(message) {
  return String(message).replace(/mongodb(\+srv)?:\/\/\S+/gi, '[REDACTED]')
}

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Add it to your .env file.')
  }

  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected successfully')
  } catch (error) {
    const details = sanitizeErrorMessage(error?.message || 'Unknown database error')

    console.error('MongoDB connection failed.')

    if (process.env.NODE_ENV === 'development') {
      console.error('Development error:', details)
      console.error(
        'Check that MONGO_URI is valid, credentials are correct, and the cluster is reachable.',
      )
    }

    throw new Error('Failed to connect to MongoDB')
  }
}
