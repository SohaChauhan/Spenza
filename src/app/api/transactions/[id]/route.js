import { connectToDatabase } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = params;
  const updateData = await req.json();
  await connectToDatabase();
  const updated = await Transaction.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    updateData,
    { new: true }
  );
  if (!updated) return new Response("Transaction not found", { status: 404 });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = params;
  await connectToDatabase();
  // Find the transaction first
  const transaction = await Transaction.findOne({ _id: id, userId: session.user.id });
  if (!transaction) return new Response("Transaction not found", { status: 404 });

  let account, fromAccount, toAccount;
  try {
    if (transaction.type === "transfer") {
      // For transfers, reverse the transfer
      fromAccount = await (await import("@/models/Account")).default.findById(transaction.fromAccountId);
      toAccount = await (await import("@/models/Account")).default.findById(transaction.toAccountId);
      if (fromAccount && toAccount) {
        fromAccount.balance += transaction.amount;
        toAccount.balance -= transaction.amount;
        await Promise.all([fromAccount.save(), toAccount.save()]);
      }
    } else {
      account = await (await import("@/models/Account")).default.findById(transaction.accountId);
      if (account) {
        if (transaction.type === "expense") {
          account.balance += transaction.amount;
        } else if (transaction.type === "income") {
          account.balance -= transaction.amount;
        }
        await account.save();
      }
    }
    // Now delete the transaction
    await Transaction.deleteOne({ _id: id, userId: session.user.id });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Failed to update account balances on transaction delete:", err);
    return new Response("Failed to update account balances", { status: 500 });
  }
}

