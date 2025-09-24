import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Policy from "../models/Policy.js";
import PolicyApplication from "../models/PolicyApplication.js";

// Register a new company
export const registerCompany = async (req, res) => {

    const { name, email, password } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {

    try {

        const company = req.company

        res.json({ success: true, company })

    } catch (error) {
        res.json({
            success: false, message: error.message
        })
    }

}

// Post New Job
export const postPolicy = async (req, res) => {

    const { title, description, location, salary, level, category } = req.body

    const companyId = req.company._id

    try {

        const newPolicy = new Policy({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newPolicy.save()

        res.json({ success: true, newPolicy })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

// Get Company Job Applicants
export const getCompanyPolicyApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the user and populate related data
        const applications = await PolicyApplication.find({ companyId })
            .populate('userId', 'name image resume')
            .populate('policyId', 'title location category level salary')
            .exec()

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedPolicies = async (req, res) => {
    try {

        const companyId = req.company._id

        const policies = await Policy.find({ companyId })

        // Adding No. of applicants info in data
        const policiesData = await Promise.all(policies.map(async (policy) => {
            const applicants = await PolicyApplication.find({ policyId: policy._id });
            return { ...policy.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, policiesData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangePolicyApplicationsStatus = async (req, res) => {

    try {

        const { id, status } = req.body

        // Find Policy application and update status
        await PolicyApplication.findOneAndUpdate({ _id: id }, { status })

        res.json({ success: true, message: 'Status Changed' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const policy = await Policy.findById(id)

        if (companyId.toString() === policy.companyId.toString()) {
            policy.visible = !policy.visible
        }

        await policy.save()

        res.json({ success: true, policy })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}