import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await User.findOne({ email: (credentials.email as string).toLowerCase() })
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null
        if (user.active === false) { user.active = true; await user.save() }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          onboardingCompleted: user.onboardingCompleted,
          role: user.role ?? 'user',
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Apple({
      clientId: process.env.APPLE_ID ?? '',
      clientSecret: process.env.APPLE_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'apple') {
        await connectDB()
        const existing = await User.findOne({ email: user.email })
        if (!existing) {
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            googleId: account.provider === 'google' ? account.providerAccountId : undefined,
            appleId: account.provider === 'apple' ? account.providerAccountId : undefined,
            subscription: {
              plan: 'free_trial',
              status: 'active',
              trialEndsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            },
          })
          user.id = newUser._id.toString()
          user.onboardingCompleted = false
          user.role = 'user'
        } else {
          if (existing.active === false) { existing.active = true; await existing.save() }
          user.id = existing._id.toString()
          user.onboardingCompleted = existing.onboardingCompleted
          user.role = existing.role ?? 'user'
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ''
        token.onboardingCompleted = user.onboardingCompleted ?? false
        token.role = user.role ?? 'user'
        return token
      }
      // Refresh role/onboarding from the DB on every request. If token.id no
      // longer resolves (e.g. the database was rebuilt and the account got a
      // new _id), self-heal by looking the user up via their email and
      // repairing token.id, so existing sessions don't silently break.
      await connectDB()
      type Lean = { _id: unknown; role?: 'user' | 'admin'; onboardingCompleted?: boolean; image?: string } | null
      let dbUser: Lean = token.id
        ? (await User.findById(token.id).select('role onboardingCompleted image').lean() as Lean)
        : null
      if (!dbUser && token.email) {
        dbUser = await User.findOne({ email: token.email }).select('role onboardingCompleted image').lean() as Lean
        if (dbUser) token.id = String(dbUser._id)
      }
      if (dbUser) {
        token.role = dbUser.role ?? 'user'
        token.onboardingCompleted = dbUser.onboardingCompleted ?? false
        if (dbUser.image) token.picture = dbUser.image
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.onboardingCompleted = token.onboardingCompleted
      session.user.role = token.role ?? 'user'
      if (token.picture) session.user.image = token.picture
      return session
    },
  },
})
