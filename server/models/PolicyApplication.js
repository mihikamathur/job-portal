import mongoose from "mongoose";

const PolicyApplicationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    status: { type: String, default: 'Pending' },
    date: { type: Number, required: true }
})

const PolicyApplication = mongoose.model('PolicyApplication', PolicyApplicationSchema)

export default PolicyApplication
