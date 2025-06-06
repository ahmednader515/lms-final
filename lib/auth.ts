import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const auth = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  return {
    userId: session.user.id,
    user: session.user,
  };
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phoneNumber: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.emailVerified) {
          throw new Error("EmailNotVerified");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture ?? undefined;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        role: dbUser.role,
      };
    },
  },
}; 