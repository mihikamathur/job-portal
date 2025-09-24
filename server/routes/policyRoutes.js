import express from 'express'
import { getPolicies, getPolicyById } from '../controllers/policyController.js';

const router = express.Router()

// Route to get all policies data
router.get('/', getPolicies)

// Route to get a single policy by ID
router.get('/:id', getPolicyById)

export default router;
