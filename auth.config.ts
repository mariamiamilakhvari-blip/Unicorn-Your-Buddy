import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  trustHost: true,
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' as const },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? ''
        token.onboardingCompleted = user.onboardingCompleted ?? false
        token.role = user.role ?? 'user'
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.onboardingCompleted = token.onboardingCompleted
      session.user.role = token.role ?? 'user'
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
