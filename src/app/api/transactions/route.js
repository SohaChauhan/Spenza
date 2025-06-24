import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { type, category, amount, accountId, note, date } = await req.json();
  await connectToDatabase();

  const transaction = await Transaction.create({
    type,
    category,
    amount,
    accountId,
    userId: session.user.id,
    note,
    createdAt: date ? new Date(date) : new Date(), // 🆕 handle custom date
  });

  // 🧮 Adjust balance
  const account = await Account.findById(accountId);
  if (!account) return new Response("Account not found", { status: 404 });

  if (type === "expense") {
    account.balance -= amount;
  } else {
    account.balance += amount;
  }

  await account.save();

  return new Response(JSON.stringify(transaction), { status: 201 });
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectToDatabase();
    const transactions = await Transaction.find({
      userId: session.user.id,
    }).populate("accountId");

    return new Response(JSON.stringify(transactions), {
      status: 200,
      headers: { "Content-Type": "application/json" }, // ✅ important
    });
  } catch (err) {
    console.error("TRANSACTION GET ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch transactions" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }, // ✅ important
      }
    );
  }
}
