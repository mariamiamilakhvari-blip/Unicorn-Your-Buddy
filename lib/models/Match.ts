import mongoose, { Schema, Document } from 'mongoose'

export interface IMatch extends Document {
  // Stored as a sorted pair (userIdA < userIdB) so each match is unique.
  userIdA: mongoose.Types.ObjectId
  userIdB: mongoose.Types.ObjectId
  matchedAt: Date
  createdAt: Date
  updatedAt: Date
}

const MatchSchema = new Schema<IMatch>({
  userIdA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userIdB: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchedAt: { type: Date, default: Date.now },
}, { timestamps: true })

MatchSchema.index({ userIdA: 1, userIdB: 1 }, { unique: true })

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema)
