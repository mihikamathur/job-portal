import express from 'express'
import { ChangePolicyApplicationsStatus, changeVisiblity, getCompanyData, getCompanyPolicyApplicants, getCompanyPostedPolicies, loginCompany, postPolicy, registerCompany } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

// Company login
router.post('/login', loginCompany)

// Get company data
router.get('/company', protectCompany, getCompanyData)

// Post a policy
router.post('/post-policy', protectCompany, postPolicy)

// Get Applicants Data of Company
router.get('/applicants', protectCompany, getCompanyPolicyApplicants)

// Get  Company Policy List
router.get('/list-policies', protectCompany, getCompanyPostedPolicies)

// Change Applcations Status 
router.post('/change-status', protectCompany, ChangePolicyApplicationsStatus)

// Change Applcations Visiblity 
router.post('/change-visiblity', protectCompany, changeVisiblity)

export default router