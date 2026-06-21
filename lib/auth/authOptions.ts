import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'info@ridercomplex.com' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();

          // Find user in database
          const user = await User.findOne({ email: credentials.email }).select('+password +twoFactorSecret');

          if (!user) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          if (user.role !== 'admin') {
            return null;
          }

          if (user.twoFactorEnabled) {
            const providedCode = credentials.twoFactorCode?.trim();

            if (!providedCode || !user.twoFactorSecret) {
              throw new Error('TwoFactorCodeRequired');
            }

            const isTokenValid = speakeasy.totp.verify({
              secret: user.twoFactorSecret,
              encoding: 'base32',
              token: providedCode,
              window: 2,
            });

            if (!isTokenValid) {
              throw new Error('InvalidTwoFactorCode');
            }
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/auth-error',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token on sign in
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
