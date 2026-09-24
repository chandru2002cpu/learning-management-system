import {
  createRecording,
  deleteRecording,
  getRecordingForUser,
  listRecordings,
  openRecordingStream,
  updateRecording,
} from '../services/recording.service.js'
import { assertVideoFile } from '../services/storage.service.js'

function sendError(res, error, fallback) {
  const status = error.status || 500
  return res.status(status).json({
    success: false,
    message: status === 500 ? fallback : error.message,
  })
}

export async function getRecordings(req, res) {
  try {
    const recordings = await listRecordings(req.user)
    return res.status(200).json({
      success: true,
      message: 'Recordings retrieved',
      data: { recordings },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to load recordings')
  }
}

export async function getRecording(req, res) {
  try {
    const recording = await getRecordingForUser(req.params.id, req.user)
    return res.status(200).json({
      success: true,
      message: 'Recording retrieved',
      data: { recording },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to load recording')
  }
}

export async function postRecording(req, res) {
  try {
    assertVideoFile(req.file)
    const recording = await createRecording(req.user, req.file, req.body ?? {})
    return res.status(201).json({
      success: true,
      message: 'Recording uploaded',
      data: { recording },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to upload recording')
  }
}

export async function patchRecording(req, res) {
  try {
    const recording = await updateRecording(req.params.id, req.user, req.body ?? {})
    return res.status(200).json({
      success: true,
      message: 'Recording updated',
      data: { recording },
    })
  } catch (error) {
    return sendError(res, error, 'Unable to update recording')
  }
}

export async function removeRecording(req, res) {
  try {
    await deleteRecording(req.params.id, req.user)
    return res.status(200).json({
      success: true,
      message: 'Recording deleted',
    })
  } catch (error) {
    return sendError(res, error, 'Unable to delete recording')
  }
}

export async function streamRecording(req, res) {
  try {
    await openRecordingStream(req.params.id, req.user, res)
  } catch (error) {
    if (res.headersSent) return
    return sendError(res, error, 'Unable to play recording')
  }
}
