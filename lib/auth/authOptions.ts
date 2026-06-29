// lib/auth/authOptions.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validators/auth.validators";

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
      // On sign in, attach role and id to the token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id and role to the session object
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};