import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { GetUser } from "@/app/data/Auth/GetUser";
import bcrypt from "bcryptjs";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  debug: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...token.user,
          id: token.sub,
        },
      };
    },
    jwt({ token, user, session }) {
      if (!!user) token.user = user;
      return token;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await GetUser(username);

          if (!user) return null;

          const pwMatch = await bcrypt.compare(
            password.trim(),
            user.passhash.trim(),
          );

          delete user.passhash;
          if (!!pwMatch)
          {
            return user;
          }
        }

        return null;
      },
    }),
  ],
});
