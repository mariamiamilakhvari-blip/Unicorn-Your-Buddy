import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

// True only when the user holds an ACTIVE Premium Plus (Car Dating) add-on.
// Independent of the base Unicorn Premium subscription.
export async function hasActivePremiumPlus(userId: string): Promise<boolean> {
  await connectDB()
  const user = await User.findById(userId).select('premiumPlus')
  return !!(user?.premiumPlus?.active && user.premiumPlus.status === 'active')
}

// Normalised, sorted pair for Match records so (A,B) and (B,A) are the same row.
export function sortedPair(a: string, b: string): [mongoose.Types.ObjectId, mongoose.Types.ObjectId] {
  const [x, y] = a < b ? [a, b] : [b, a]
  return [new mongoose.Types.ObjectId(x), new mongoose.Types.ObjectId(y)]
}
