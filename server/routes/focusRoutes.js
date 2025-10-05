import express from 'express'
import { listAirports, createSession, getSession, startSession, completeSession } from '../controllers/focusController.js'

const router = express.Router()

router.get('/airports', listAirports)
router.post('/sessions', createSession)
router.get('/sessions/:id', getSession)
router.post('/sessions/:id/start', startSession)
router.post('/sessions/:id/complete', completeSession)

export default router
