import { connectToDatabase } from "@/lib/db";
import Account from "@/models/Account";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = params;
  const { name, type, balance } = await req.json();
  await connectToDatabase();
  const updated = await Account.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { name, type, balance },
    { new: true }
  );
  if (!updated) return new Response("Account not found", { status: 404 });
  return new Response(JSON.stringify(updated), { status: 200 });
}

import Transaction from "@/models/Transaction";

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = params;
  await connectToDatabase();
  const deleted = await Account.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!deleted) return new Response("Account not found", { status: 404 });
  // Delete all transactions involving this account
  await Transaction.deleteMany({
    userId: session.user.id,
    $or: [
      { accountId: id },
      { fromAccountId: id },
      { toAccountId: id }
    ]
  });
  return new Response(null, { status: 204 });
}
