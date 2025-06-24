import { connectToDatabase } from "@/lib/db";
import UserModel from "@/models/UserModel";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required." }),
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return new Response(JSON.stringify({ message: "User already exists." }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    return new Response(JSON.stringify({ message: "User registered." }), {
      status: 201,
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Something went wrong." }), {
      status: 500,
    });
  }
}
