// lib/auth/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators/auth.validators";

type ExtendedToken = {
  id?: string;
  role?: string;
  tokenVersion?: number;
  invalidated?: boolean;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("Invalid credentials.");

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user) throw new Error("No account found with this email.");

        if (user.isLoginBlocked) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        const passwordMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatch) throw new Error("Incorrect password.");

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const customToken = token as ExtendedToken;

      // On sign in, attach id, role, and tokenVersion to the token
      if (user) {
        customToken.id = user.id;
        customToken.role = (user as any).role;
      }

      // If we have a signed-in user, verify the session is still valid
      if (customToken.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: customToken.id },
          select: { tokenVersion: true, isLoginBlocked: true },
        });

        if (!dbUser || dbUser.isLoginBlocked) {
          customToken.invalidated = true;
          return customToken as any;
        }

        const tokenVersion = customToken.tokenVersion;
        if (tokenVersion !== undefined && tokenVersion !== dbUser.tokenVersion) {
          customToken.invalidated = true;
          return customToken as any;
        }

        customToken.tokenVersion = dbUser.tokenVersion;
        delete customToken.invalidated;
      }

      return customToken as any;
    },
    async session({ session, token }) {
      const customToken = token as ExtendedToken;

      if (customToken.invalidated) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
            name: "",
            email: "",
            role: "",
          },
        };
      }
      // Expose id and role to the session object
      if (session.user) {
        session.user.id = customToken.id as string;
        session.user.role = customToken.role as string;
      }
      return session;
    },
  },
};
