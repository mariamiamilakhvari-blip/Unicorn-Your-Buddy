import mongoose, { Schema, Document } from 'mongoose'

interface IMilestone {
  stage: string
  title: string
  targetMonth: number
  notificationSentAt?: Date
  completedAt?: Date
}

export interface IHobby extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  icon: string
  learningMethod: string
  startDate: Date
  status: 'active' | 'paused' | 'completed'
  milestones: IMilestone[]
  createdAt: Date
  updatedAt: Date
}

const MilestoneSchema = new Schema<IMilestone>({
  stage: { type: String, required: true },
  title: { type: String, required: true },
  targetMonth: { type: Number, required: true },
  notificationSentAt: Date,
  completedAt: Date,
})

const HobbySchema = new Schema<IHobby>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  learningMethod: { type: String, required: true },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  milestones: [MilestoneSchema],
}, { timestamps: true })

export default mongoose.models.Hobby || mongoose.model<IHobby>('Hobby', HobbySchema)
