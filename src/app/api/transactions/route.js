import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { type, category, amount, accountId, fromAccountId, toAccountId, note, date } = await req.json();
  await connectToDatabase();

  try {
    let transaction;
    
    if (type === 'transfer') {
      // For transfers, we need to validate both accounts
      const [fromAccount, toAccount] = await Promise.all([
        Account.findById(fromAccountId),
        Account.findById(toAccountId)
      ]);
      
      if (!fromAccount || !toAccount) {
        return new Response("One or both accounts not found", { status: 404 });
      }
      
      if (fromAccount.balance < amount) {
        return new Response("Insufficient balance in source account", { status: 400 });
      }
      
      // Create transfer transaction
      transaction = await Transaction.create({
        type: 'transfer',
        amount,
        fromAccountId,
        toAccountId,
        userId: session.user.id,
        note: note || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
        createdAt: date ? new Date(date) : new Date(),
      });
      
      // Update account balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      
      await Promise.all([fromAccount.save(), toAccount.save()]);
    } else {
      // For regular income/expense transactions
      transaction = await Transaction.create({
        type,
        category,
        amount,
        accountId,
        userId: session.user.id,
        note,
        createdAt: date ? new Date(date) : new Date(),
      });
      
      // Update account balance
      const account = await Account.findById(accountId);
      if (!account) return new Response("Account not found", { status: 404 });
      
      if (type === "expense") {
        account.balance -= amount;
      } else {
        account.balance += amount;
      }
      
      await account.save();
    }
    
    return new Response(JSON.stringify(transaction), { 
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return new Response("Failed to create transaction", { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectToDatabase();
    // First, get all transactions for the user
    let transactions = await Transaction.find({
      userId: session.user.id,
    }).lean(); // Use lean() for better performance

    // Get all unique account IDs from the transactions
    const accountIds = new Set();
    transactions.forEach(t => {
      if (t.accountId) accountIds.add(t.accountId.toString());
      if (t.fromAccountId) accountIds.add(t.fromAccountId.toString());
      if (t.toAccountId) accountIds.add(t.toAccountId.toString());
    });

    // Fetch all accounts in a single query
    const accounts = await Account.find({
      _id: { $in: Array.from(accountIds) }
    });

    // Create a map of account IDs to account objects
    const accountMap = accounts.reduce((map, account) => {
      map[account._id.toString()] = account;
      return map;
    }, {});

    // Attach account details to each transaction
    transactions = transactions.map(t => ({
      ...t,
      accountId: t.accountId ? accountMap[t.accountId.toString()] : null,
      fromAccountId: t.fromAccountId ? accountMap[t.fromAccountId.toString()] : null,
      toAccountId: t.toAccountId ? accountMap[t.toAccountId.toString()] : null
    }));

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
