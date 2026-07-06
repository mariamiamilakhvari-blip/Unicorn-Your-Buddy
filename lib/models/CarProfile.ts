import mongoose, { Schema, Document } from 'mongoose'

export interface ICarProfile extends Document {
  userId: mongoose.Types.ObjectId
  carMake?: string
  carModel?: string
  carYear?: number
  shortBio?: string
  city?: string
  // Opt-in contact, revealed ONLY to confirmed matches, never during browsing.
  // Deliberately not auto-filled from the account email/phone.
  contactHandle?: string
  visibility: 'active' | 'hidden'
  createdAt: Date
  updatedAt: Date
}

const CarProfileSchema = new Schema<ICarProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  carMake: String,
  carModel: String,
  carYear: Number,
  shortBio: String,
  city: String,
  contactHandle: String,
  visibility: { type: String, enum: ['active', 'hidden'], default: 'active' },
}, { timestamps: true })

export default mongoose.models.CarProfile || mongoose.model<ICarProfile>('CarProfile', CarProfileSchema)
