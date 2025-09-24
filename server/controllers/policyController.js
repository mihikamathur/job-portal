import Policy from "../models/Policy.js"

// Get All Policies
export const getPolicies = async (req, res) => {
    try {

        const policies = await Policy.find({ visible: true })
            .populate({ path: 'companyId', select: '-password' })

        res.json({ success: true, policies })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Single Policy Using PolicyID
export const getPolicyById = async (req, res) => {
    try {

        const { id } = req.params

        const policy = await Policy.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!policy) {
            return res.json({
                success: false,
                message: 'Policy not found'
            })
        }

        res.json({
            success: true,
            policy
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
