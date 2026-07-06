import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: 'user' | 'admin'
  provider: 'email' | 'google' | 'apple'
  googleId?: string
  appleId?: string
  image?: string
  resetToken?: string
  resetTokenExpiry?: Date
  onboardingCompleted: boolean
  active: boolean
  permissions: {
    notifications: boolean
    healthData: boolean
    smartwatch: boolean
  }
  smartwatchProvider?: 'garmin'
  profile: {
    genderIdentity?: string
    ageCohort?: string
    nationality?: string
    maritalStatus?: string
    relaxationTriggers: string[]
    fatigueState?: string
    microDesire?: string
    environmentalComfort?: string
    primaryMotivators: string[]
    stressCoping: string[]
    contentFilters: string[]
    focalPriority?: string
    productivityWindows: string[]
    targetIntervention?: string
  }
  subscription: {
    plan: 'free_trial' | 'monthly' | 'yearly' | 'premium' | 'none'
    status: 'active' | 'cancelled' | 'expired'
    trialEndsAt?: Date
    currentPeriodEnd?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    dodoCustomerId?: string
    dodoSubscriptionId?: string
  }
  // Premium Plus (Car Dating) add-on, billed and tracked independently of the
  // base subscription. A user can hold both at once.
  premiumPlus: {
    active: boolean
    plan: 'monthly' | 'yearly' | 'none'
    status: 'active' | 'cancelled' | 'expired'
    currentPeriodEnd?: Date
    dodoSubscriptionId?: string
  }
  chatMessageCount: number
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
  lastActive: Date
  lastInactivityPingAt?: Date
  wellbeingPlan?: {
    hobby: {
      name: string
      category: string
      duration: 6 | 9
      learningMethod: string
      description: string
      startedAt: Date
      status?: 'active' | 'paused' | 'completed'
      resumedAt?: Date
    }
    ritualIndex: number
    lastRitualAt?: Date
    lastReminderAt?: Date
    lastInvitationAt?: Date
    invitationIndex: number
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  provider: { type: String, enum: ['email', 'google', 'apple'], default: 'email' },
  googleId: String,
  appleId: String,
  image: String,
  resetToken: String,
  resetTokenExpiry: Date,
  onboardingCompleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  permissions: {
    notifications: { type: Boolean, default: false },
    healthData: { type: Boolean, default: false },
    smartwatch: { type: Boolean, default: false },
  },
  smartwatchProvider: { type: String, enum: ['garmin'] },
  profile: {
    genderIdentity: String,
    ageCohort: String,
    country: String,
    occupation: String,
    maritalStatus: String,
    carThoughts: String,
    neglectedArea: String,
    preferExperience: String,
    nudgeType: String,
    betterLife: String,
    emotionalState: String,
    needFromBuddy: String,
    timeframe: String,
    // legacy fields
    nationality: String,
    relaxationTriggers: [String],
    fatigueState: String,
    microDesire: String,
    environmentalComfort: String,
    primaryMotivators: [String],
    stressCoping: [String],
    contentFilters: [String],
    focalPriority: String,
    productivityWindows: [String],
    targetIntervention: String,
  },
  subscription: {
    plan: { type: String, enum: ['free_trial', 'monthly', 'yearly', 'premium', 'none'], default: 'free_trial' },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    trialEndsAt: Date,
    currentPeriodEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    dodoCustomerId: String,
    dodoSubscriptionId: String,
  },
  premiumPlus: {
    active: { type: Boolean, default: false },
    plan: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'expired' },
    currentPeriodEnd: Date,
    dodoSubscriptionId: String,
  },
  chatMessageCount: { type: Number, default: 0 },
  chatHistory: { type: [{ role: String, content: String, _id: false }], default: [] },
  lastActive: { type: Date, default: Date.now },
  lastInactivityPingAt: Date,
  wellbeingPlan: {
    hobby: {
      name: String,
      category: String,
      duration: Number,
      learningMethod: String,
      description: String,
      startedAt: Date,
      status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
      resumedAt: Date,
    },
    ritualIndex: { type: Number, default: 0 },
    lastRitualAt: Date,
    lastReminderAt: Date,
    lastInvitationAt: Date,
    invitationIndex: { type: Number, default: 0 },
  },
}, { timestamps: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
