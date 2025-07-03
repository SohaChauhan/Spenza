"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import ExpensesByCategoryChart from "./ui/ExpensesByCategoryChart";
import RecentTransactions from "./ui/RecentTransactions";
import {
  CalendarDays,
  CirclePlus,
  CircleMinus,
  ArrowLeftRight,
} from "lucide-react";
import Navbar from "./ui/Navbar";
export default function DashboardPage({ user }) {
  const router = useRouter();
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    balance: "",
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    type: "",
    category: "",
    amount: "",
    accountId: "",
    note: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    time: new Date().toTimeString().slice(0, 5), // HH:MM
  });

  const [allCategories, setAllCategories] = useState([]);

  const [customCategory, setCustomCategory] = useState("");
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
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          time: new Date().toTimeString().slice(0, 5), // HH:MM
        }));
        setCustomCategory("");
        setShowTransactionModal(false);
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
  const [filter, setFilter] = useState("month");
  const timeFilters = [
    { label: "This month", value: "month" },
    { label: "Last month", value: "lastMonth" },
    { label: "This year", value: "year" },
    { label: "Last 12 months", value: "last12" },
  ];
  // Compute expenses by category
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      const cat = curr.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += curr.amount;
      return acc;
    }, {});

  const pieData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      category,
      amount,
    })
  );
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <Navbar user={user}></Navbar>
      <div className="py-10 px-16 mx-auto ">
        {/* Header */}
        <div className="flex justify-between pb-10">
          <h2 className="text-4xl font-bold">Welcome, {user.name}!</h2>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            {timeFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-sm px-3 py-1 rounded border ${
                  filter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50 text-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
            <button className="text-sm px-3 py-1 rounded border bg-white hover:bg-blue-50 flex items-center gap-1">
              <CalendarDays size={14} /> Select Period
            </button>
          </div>
        </div>
        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Balance */}
          <div className="bg-white shadow rounded-xl py-8 px-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Balance
            </h3>
            <p className="text-3xl font-semibold text-blue-600">
              ₹ {totalBalance.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Income */}
          <div className="bg-white shadow rounded-xl py-8 px-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Income</h3>
            <p className="text-3xl font-semibold text-black">
              ₹ {totalIncome.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white shadow rounded-xl py-8 px-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Expenses</h3>
            <p className="text-3xl font-semibold text-black">
              ₹ {totalExpense.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Add Income */}
          <button
            onClick={() => {
              setShowTransactionModal(true);
              setForm((prev) => ({ ...prev, type: "income" }));
            }}
            className="flex items-center gap-2 bg-white shadow rounded-xl p-6 cursor-pointer"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <CirclePlus className="text-green-800" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold ">Add Income</p>
              <p className="text-xs text-gray-600">Create an income manually</p>
            </div>
          </button>

          {/* Add Expense */}
          <button
            onClick={() => {
              setForm((prev) => ({ ...prev, type: "expense" }));
              setShowTransactionModal(true);
            }}
            className="flex items-center gap-2 bg-white shadow rounded-xl p-6 cursor-pointer"
          >
            <div className="p-2 bg-red-100 rounded-lg">
              <CircleMinus className="text-red-800" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold ">Add Expense</p>
              <p className="text-xs text-gray-600">
                Create an expense manually
              </p>
            </div>
          </button>

          {/* Transfer Money */}
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 bg-white shadow rounded-xl p-6 cursor-pointer"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowLeftRight className="text-blue-800" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold ">Transfer Money</p>
              <p className="text-xs text-gray-600">
                Move your money across your accounts
              </p>
            </div>
          </button>
        </div>
        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-black"
              >
                ✕
              </button>

              {/* Use your existing transaction form code here */}
              {/* Set form.type = transactionType */}
              {/* Optionally auto-focus on amount or category */}
              {/* You can copy and reuse your existing add transaction form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold">Add Transaction</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      disabled
                      className="w-full border px-3 py-2 rounded disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-500"
                    >
                      <option value={form.type}>{form.type}</option>
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
                        .filter(
                          (cat) => cat.type === form.type || cat.type === "both"
                        )
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
                      <label className="block text-sm mb-1 mt-2">
                        Custom Category
                      </label>
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
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowTransferModal(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-black"
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-4">Transfer Money</h3>

              {/* Add form for:
          - From Account
          - To Account
          - Amount
          - Optional Note
        And on submit:
          - Create two transactions: expense in From and income in To
          - Adjust balances accordingly
      */}
            </div>
          </div>
        )}

        <div className="flex gap-5">
          <ExpensesByCategoryChart data={pieData} transactions={transactions} />
          <RecentTransactions transactions={transactions} />
        </div>
        {/* Add Account Form
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
        </form> */}

        {/* Add Transaction
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
                  .filter(
                    (cat) => cat.type === form.type || cat.type === "both"
                  )
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
                <label className="block text-sm mb-1 mt-2">
                  Custom Category
                </label>
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
        </form> */}

        {/* Filter Dropdown
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
        </div> */}

        {/* Transactions List
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
        </div> */}
      </div>
    </>
  );
}
