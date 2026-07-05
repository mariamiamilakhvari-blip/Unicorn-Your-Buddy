import { connectDB } from '@/lib/db'
import Hobby from '@/lib/models/Hobby'
import User from '@/lib/models/User'

// SINGLE shared read for "the user's current hobby". Used by GET /api/hobbies
// (which the hobbies page and Profile & Settings both call) so no page runs its
// own divergent query. The chat route reads the same wellbeingPlan.hobby field
// off its per-message user fetch, so all surfaces resolve the same DB record.
export async function getCurrentHobby(userId: string) {
  await connectDB()
  const [activeHobby, user] = await Promise.all([
    Hobby.findOne({ userId, status: { $ne: 'completed' } }).sort({ createdAt: -1 }),
    User.findById(userId).select('wellbeingPlan.hobby'),
  ])
  return { hobby: activeHobby, planHobby: user?.wellbeingPlan?.hobby ?? null }
}
