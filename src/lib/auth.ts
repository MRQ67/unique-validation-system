import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Define hardcoded admin credentials for the hackathon demo
const ADMIN_USERNAME = "abdellah";
const ADMIN_PASSWORD = "abde123";

// Extend the User type to include role
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check if credentials match the hardcoded admin credentials
        if (
          credentials?.username === ADMIN_USERNAME &&
          credentials?.password === ADMIN_PASSWORD
        ) {
          return {
            id: "1",
            name: ADMIN_USERNAME,
            email: "admin@example.com",
            role: "admin"
          } as ExtendedUser;
        }
        
        // Return null if credentials are invalid
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-for-hackathon-demo",
};
