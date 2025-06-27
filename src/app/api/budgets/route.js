import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Budget from "@/models/Budget";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await connectToDatabase();
  const budgets = await Budget.find({ userId: session.user.id });
  return new Response(JSON.stringify(budgets), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { category, amount } = await req.json();
  await connectToDatabase();

  const budget = await Budget.create({
    userId: session.user.id,
    category,
    amount,
  });

  return new Response(JSON.stringify(budget), { status: 201 });
}
