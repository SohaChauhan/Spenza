"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
export default function DashboardPage({ user }) {
  const router = useRouter();
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    balance: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    accountId: "",
    note: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    time: new Date().toTimeString().slice(0, 5), // HH:MM
  });
  const [allCategories, setAllCategories] = useState([]);

  const [customCategory, setCustomCategory] = useState("");
  const [customCategories, setCustomCategories] = useState([]);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setAllCategories(data);
  };

  const [filterAccount, setFilterAccount] = useState("all");
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchCategories(); // 🆕
  }, []);
  const fetchAccounts = async () => {
    const res = await fetch("/api/accounts");
    const data = await res.json();
    setAccounts(data);
    // default to first account for new transaction
    if (data.length && !form.accountId) {
      setForm((prev) => ({ ...prev, accountId: data[0]._id }));
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      const text = await res.text(); // catch invalid JSON
      const data = JSON.parse(text);
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sorted);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullDateTime = new Date(`${form.date}T${form.time}:00`);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: form.category === "Other" ? customCategory : form.category,
          amount: Number(form.amount),
          date: fullDateTime, // ✅ send combined date-time
        }),
      });
      const result = await res.json(); // catch errors

      if (res.ok) {
        if (form.category === "Other" && customCategory.trim()) {
          const name = customCategory.trim();
          const alreadyExists = allCategories.some(
            (cat) => cat.name.toLowerCase() === name.toLowerCase()
          );

          if (!alreadyExists) {
            await fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                type: form.type, // 🚨 important
              }),
            });
          }
          console.log("Saving custom category:", {
            name: customCategory,
            type: form.type,
          });
          // Set the actual category name (not "Other")
          form.category = name;
        }

        setForm((prev) => ({
          ...prev,
          category: "",
          amount: "",
          note: "",
          date: new Date().toISOString().slice(0, 16),
        }));

        await fetchTransactions();
        await fetchAccounts();
        await fetchCategories();
      } else {
        console.error("Transaction creation failed:", result);
      }
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  const filteredTransactions =
    filterAccount === "all"
      ? transactions
      : transactions.filter((t) => t.accountId._id === filterAccount);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-red-600 border px-3 py-1 rounded hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
      {/* Add Account Form */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: newAccount.name,
              type: newAccount.type,
              balance: parseFloat(newAccount.balance) || 0,
            }),
          });
          if (res.ok) {
            fetchAccounts();
            setNewAccount({ name: "", type: "", balance: "" });
          }
        }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Add New Account</h2>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Account Name"
            value={newAccount.name}
            onChange={(e) =>
              setNewAccount((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className="border px-3 py-2 rounded col-span-1"
          />
          <select
            value={newAccount.type}
            onChange={(e) =>
              setNewAccount((prev) => ({ ...prev, type: e.target.value }))
            }
            required
            className="border px-3 py-2 rounded col-span-1"
          >
            <option value="">Type</option>
            <option value="Bank">Bank</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
          </select>
          <input
            type="number"
            placeholder="Opening Balance"
            value={newAccount.balance}
            onChange={(e) =>
              setNewAccount((prev) => ({ ...prev, balance: e.target.value }))
            }
            className="border px-3 py-2 rounded col-span-1"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Account
        </button>
      </form>

      {/* List of Accounts */}
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">Your Accounts</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {accounts.map((acc) => (
            <li
              key={acc._id}
              className="border rounded p-4 flex justify-between items-center bg-white shadow-sm"
            >
              <div>
                <p className="font-medium">{acc.name}</p>
                <p className="text-sm text-gray-500">{acc.type}</p>
              </div>
              <p className="text-right font-semibold">₹ {acc.balance}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Transaction */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold">Add Transaction</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            >
              {allCategories
                .filter((cat) => cat.type === form.type || cat.type === "both")
                .map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {form.category === "Other" && (
            <div>
              <label className="block text-sm mb-1 mt-2">Custom Category</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category"
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="₹"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Account</label>
            <select
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Note (optional)</label>
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="e.g. Paid by cash"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Transaction
        </button>
      </form>

      {/* Filter Dropdown */}
      <div>
        <label className="block text-sm mb-1">Filter by Account</label>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All Accounts</option>
          {accounts.map((acc) => (
            <option key={acc._id} value={acc._id}>
              {acc.name} ({acc.type})
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Transactions</h2>
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTransactions.map((t) => (
              <li
                key={t._id}
                className={`border rounded p-4 flex justify-between items-center ${
                  t.type === "income" ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    {t.category} –{" "}
                    <span className="text-sm text-gray-600">
                      {t.accountId.name}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(t.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>

                  {t.note && (
                    <p className="text-xs text-gray-500 mt-1">{t.note}</p>
                  )}
                </div>
                <span
                  className={`font-medium ${
                    t.type === "income" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}₹{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
