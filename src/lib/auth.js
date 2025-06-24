import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await connectToDatabase();

        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid password");

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      await connectToDatabase();
      const existingUser = await UserModel.findOne({ email: user.email });

      if (!existingUser && account.provider === "google") {
        await UserModel.create({
          name: user.name,
          email: user.email,
          image: user.image,
        });
      }

      return true;
    },

    async session({ session }) {
      await connectToDatabase();
      const dbUser = await UserModel.findOne({ email: session.user.email });
      if (dbUser) {
        session.user.id = dbUser._id.toString(); // ✅ add this manually
      }
      console.log(session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
