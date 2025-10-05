import mongoose from 'mongoose'

const focusSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sourceCode: { type: String, required: true },
    destinationCode: { type: String, required: true },
    seat: { type: String, required: true },
    durationMinutes: { type: Number, default: 25, min: 1, max: 24 * 60 },
    startTime: { type: Date },
    status: {
      type: String,
      enum: ['created', 'in_progress', 'completed'],
      default: 'created',
    },
    pnr: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

const FocusSession = mongoose.model('FocusSession', focusSessionSchema)

export default FocusSession
