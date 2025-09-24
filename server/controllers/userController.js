import Policy from "../models/Policy.js"
import PolicyApplication from "../models/PolicyApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.auth.userId

    try {

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}


// Apply For Policy
export const applyForPolicy = async (req, res) => {

    const { policyId } = req.body

    const userId = req.auth.userId

    try {

        const isAlreadyApplied = await PolicyApplication.find({ policyId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const policyData = await Policy.findById(policyId)

        if (!policyData) {
            return res.json({ success: false, message: 'Policy Not Found' })
        }

        await PolicyApplication.create({
            companyId: policyData.companyId,
            userId,
            policyId,
            date: Date.now()
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserPolicyApplications = async (req, res) => {

    try {

        const userId = req.auth.userId

        const applications = await PolicyApplication.find({ userId })
            .populate('companyId', 'name email image')
            .populate('policyId', 'title description location category level salary')
            .exec()

        if (!applications) {
            return res.json({ success: false, message: 'No policy applications found for this user.' })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({ success: true, message: 'Resume Updated' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}