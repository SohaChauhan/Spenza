import { connectToDatabase } from "@/lib/db";
import Account from "@/models/Account";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { name, type, balance } = await req.json();

  await connectToDatabase();
  const account = await Account.create({
    name,
    type,
    balance,
    userId: session.user.id,
  });

  return new Response(JSON.stringify(account), { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await connectToDatabase();
  const accounts = await Account.find({ userId: session.user.id });

  return new Response(JSON.stringify(accounts), { status: 200 });
}
