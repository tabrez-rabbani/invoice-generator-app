import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../../lib/mongodb';

// Configure NextAuth
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token, user }) {
      // Add user ID to the session
      session.user.id = token.sub || user.id;
      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to the JWT token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

// Export NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
