"use client";
import { useState, useEffect } from "react";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const fetchBudgets = async () => {
    const res = await fetch("/api/budgets");
    const data = await res.json();
    setBudgets(data);
  };

  const fetchTransactions = async () => {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) return;

    await fetch("/api/budgets", {
      method: "POST",
      body: JSON.stringify({ category, amount: Number(amount) }),
    });

    setCategory("");
    setAmount("");
    fetchBudgets();
  };

  useEffect(() => {
    fetchBudgets();
    fetchTransactions();
  }, []);

  const getSpent = (cat) =>
    transactions
      .filter((tx) => tx.type === "expense" && tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Budgets</h1>

      <form onSubmit={handleSubmit} className="flex gap-4 items-end mb-8">
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded w-40"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border px-3 py-2 rounded w-40"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Add Budget
        </button>
      </form>

      <div className="grid gap-4 max-w-3xl">
        {budgets.map((budget) => {
          const spent = getSpent(budget.category);
          const remaining = budget.amount - spent;
          const over = remaining < 0;

          return (
            <div
              key={budget._id}
              className={`p-4 rounded-lg border shadow-sm ${
                over ? "border-red-500 bg-red-50" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{budget.category}</h2>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    over
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {over ? "Over Budget" : "Within Budget"}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Budget: ₹{budget.amount.toFixed(2)} <br />
                Spent: ₹{spent.toFixed(2)} <br />
                Remaining: ₹{remaining.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
