import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await connectToDatabase();

  const categories = await Category.find({
    $or: [
      { userId: session.user.id },
      { userId: null }, // Global defaults
    ],
  });

  return new Response(JSON.stringify(categories), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await connectToDatabase();

  const { name, type } = await req.json();

  const existing = await Category.findOne({
    name,
    userId: session.user.id,
  });

  if (existing) {
    return new Response("Category already exists", { status: 200 });
  }

  const newCategory = await Category.create({
    name,
    type,
    userId: session.user.id,
  });
  console.log("Created category:", newCategory); // ✅ Debug
  return new Response(JSON.stringify(newCategory), { status: 201 });
}
