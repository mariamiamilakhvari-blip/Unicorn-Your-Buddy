import mongoose, { Schema, Document } from 'mongoose'

export interface IInterest extends Document {
  fromUserId: mongoose.Types.ObjectId
  toUserId: mongoose.Types.ObjectId
  status: 'pending' | 'matched'
  createdAt: Date
  updatedAt: Date
}

const InterestSchema = new Schema<IInterest>({
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'matched'], default: 'pending' },
}, { timestamps: true })

// One interest per direction per pair.
InterestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true })

export default mongoose.models.Interest || mongoose.model<IInterest>('Interest', InterestSchema)
