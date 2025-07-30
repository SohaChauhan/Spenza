// /api/transactions/upload/route.js

import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import Category from "@/models/Category";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to convert file to base64
async function fileToGenerativePart(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    inlineData: { data: buffer.toString("base64"), mimeType: file.type },
  };
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  await connectToDatabase();
  const dbSession = await mongoose.startSession(); // Start a DB session for transaction

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const accountId = formData.get("accountId");

    if (!file || !accountId) {
      return new Response("File or account ID missing", { status: 400 });
    }

    // --- 1. Get transaction data from Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const prompt = `
      Analyze the bank statement. For each transaction, extract the following:
      - date: The date of the transaction (YYYY-MM-DD)
      - description: A clean, concise description of the merchant/payee
      - amount: The transaction amount
      - type: 'debit' or 'credit'
      - suggestedCategory: A relevant category name (e.g., 'Groceries', 'Dining', 'Salary')
      
      Return a valid JSON array of objects. Example:
      [{"date": "2025-07-25", "description": "Whole Foods Market", "amount": 55.20, "type": "debit", "suggestedCategory": "Groceries"}]
      
      Use these category names when appropriate:
      - Income: Salary, Freelance, Bonus, Refund, Interest
      - Housing: Rent, Mortgage, Utilities, Insurance, Maintenance
      - Transportation: Gas, Public Transit, Parking, Car Payment, Rideshare
      - Food: Groceries, Dining, Coffee, Fast Food
      - Shopping: Clothing, Electronics, Home, Gifts
      - Entertainment: Movies, Music, Games, Subscriptions
      - Health: Doctor, Pharmacy, Gym, Insurance
      - Personal: Haircut, Laundry, Spa, Self-care
      - Education: Tuition, Books, Courses
      - Travel: Flights, Hotels, Vacation
      - Transfer: Between Accounts, Credit Card Payment
      - Other: Any other expenses
      
      Be specific with categories based on the merchant name and context. Only return the JSON array, no other text.
    `;
    const filePart = await fileToGenerativePart(file);
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    const extractedTxs = JSON.parse(jsonString);

    if (!Array.isArray(extractedTxs)) {
      throw new Error("AI did not return a valid array of transactions.");
    }

    // --- 2. Get or create categories ---
    const userId = session.user.id;
    const existingCategories = await Category.find({ userId }).session(
      dbSession
    );
    const categoryMap = new Map();

    // Create a map of category names (lowercase) to their IDs
    existingCategories.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase(), cat._id);
    });
    console.log("categoryMap", categoryMap);
    // --- 3. Process transactions within a database transaction ---
    let newTransactionsCount = 0;
    const newCategories = [];

    await dbSession.withTransaction(async () => {
      const account = await Account.findById(accountId).session(dbSession);
      if (!account) {
        throw new Error("Account not found.");
      }
      if (account.userId.toString() !== userId) {
        throw new Error("User does not own this account.");
      }

      const newDbTransactions = [];

      for (const tx of extractedTxs) {
        // Map Gemini's 'debit'/'credit' to your 'expense'/'income' types
        const type = tx.type === "debit" ? "expense" : "income";
        const suggestedCategory = tx.suggestedCategory || "Other";
        const categoryName = suggestedCategory.trim();
        const categoryKey = categoryName.toLowerCase();
        console.log("suggestedCategory", suggestedCategory);
        // Find or create category
        let categoryId = categoryMap.get(categoryKey);

        if (!categoryId && categoryName) {
          // Create new category if it doesn't exist
          const newCategory = new Category({
            name: categoryName,
            type: type, // Use transaction type as category type
            userId,
          });

          await newCategory.save({ session: dbSession });
          categoryId = newCategory._id;
          categoryMap.set(categoryKey, categoryId);
          newCategories.push({
            id: categoryId,
            name: categoryName,
            type: type,
          });
        }

        // Update account balance
        if (type === "expense") {
          account.balance -= tx.amount;
        } else {
          account.balance += tx.amount;
        }

        // Prepare the new transaction document
        newDbTransactions.push({
          type,
          category: categoryName,
          amount: tx.amount,
          accountId,
          userId,
          note: tx.description,
          createdAt: new Date(tx.date), // Use date from statement
        });
      }
      console.log("newCategories:", newCategories);
      console.log("newDbTransactions:", newDbTransactions);
      // Save everything at once
      await Transaction.insertMany(newDbTransactions, { session: dbSession });
      await account.save({ session: dbSession });
      newTransactionsCount = newDbTransactions.length;
    });

    return new Response(
      JSON.stringify({
        message: "Transactions processed successfully!",
        count: newTransactionsCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("PDF Upload Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process statement.",
      }),
      { status: 500 }
    );
  } finally {
    await dbSession.endSession(); // Always end the session
  }
}
