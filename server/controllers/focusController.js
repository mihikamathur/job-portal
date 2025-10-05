import FocusSession from '../models/FocusSession.js'
import airports from '../data/airports.js'
import { generatePnr } from '../utils/pnr.js'

export const listAirports = async (_req, res) => {
  res.json({ success: true, airports })
}

export const createSession = async (req, res) => {
  try {
    const userId = req.auth?.userId
    if (!userId) return res.json({ success: false, message: 'Unauthorized' })

    const { sourceCode, destinationCode, seat, durationMinutes } = req.body || {}

    if (!sourceCode || !destinationCode || !seat) {
      return res.json({ success: false, message: 'Missing required fields' })
    }

    if (sourceCode === destinationCode) {
      return res.json({ success: false, message: 'Source and destination must differ' })
    }

    const src = airports.find(a => a.code === sourceCode)
    const dst = airports.find(a => a.code === destinationCode)
    if (!src || !dst) {
      return res.json({ success: false, message: 'Invalid airport code(s)' })
    }

    const session = await FocusSession.create({
      userId,
      sourceCode,
      destinationCode,
      seat,
      durationMinutes: Number(durationMinutes) || 25,
      pnr: generatePnr(),
      status: 'created',
    })

    res.json({ success: true, session })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

export const getSession = async (req, res) => {
  try {
    const userId = req.auth?.userId
    const { id } = req.params

    const session = await FocusSession.findById(id)
    if (!session) return res.json({ success: false, message: 'Session not found' })
    if (session.userId !== userId) return res.json({ success: false, message: 'Forbidden' })

    res.json({ success: true, session })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

export const startSession = async (req, res) => {
  try {
    const userId = req.auth?.userId
    const { id } = req.params

    const session = await FocusSession.findById(id)
    if (!session) return res.json({ success: false, message: 'Session not found' })
    if (session.userId !== userId) return res.json({ success: false, message: 'Forbidden' })

    if (session.status === 'in_progress' || session.status === 'completed') {
      return res.json({ success: true, session })
    }

    session.status = 'in_progress'
    session.startTime = new Date()
    await session.save()

    res.json({ success: true, session })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}

export const completeSession = async (req, res) => {
  try {
    const userId = req.auth?.userId
    const { id } = req.params

    const session = await FocusSession.findById(id)
    if (!session) return res.json({ success: false, message: 'Session not found' })
    if (session.userId !== userId) return res.json({ success: false, message: 'Forbidden' })

    session.status = 'completed'
    await session.save()

    res.json({ success: true, session })
  } catch (err) {
    res.json({ success: false, message: err.message })
  }
}
