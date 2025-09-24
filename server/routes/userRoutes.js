import express from 'express'
import { applyForPolicy, getUserData, getUserPolicyApplications, updateUserResume } from '../controllers/userController.js'
import upload from '../config/multer.js'


const router = express.Router()

// Get user Data
router.get('/user', getUserData)

// Apply for a policy
router.post('/apply', applyForPolicy)

// Get applied policies data
router.get('/applications', getUserPolicyApplications)

// Update user profile (resume)
router.post('/update-resume', upload.single('resume'), updateUserResume)

export default router;