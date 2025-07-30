"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { Plus, EllipsisVertical, X, Trash } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import FileUpload from "./FileUpload";

export default function TransactionsPage({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteTransactionId, setDeleteTransactionId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    accountId: "",
    toAccountId: "",
    note: "",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    time: new Date().toTimeString().slice(0, 5), // HH:MM
  });
  const [showTransferFields, setShowTransferFields] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        // Sort transactions by date (most recent at top)
        setTransactions(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        setError("Could not load transactions.");
      } finally {
        setLoading(false);
      }
    };
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        setAccounts(data);
      } catch (err) {
        // Do not block UI if accounts fail
      }
    };
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setAllCategories(data);
    } catch (err) {
      // Do not block UI if categories fail
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      const isTransfer = value === "transfer";
      setShowTransferFields(isTransfer);

      // Reset form with new type
      setForm({
        type: value,
        category: "",
        amount: form.amount,
        accountId: form.accountId,
        toAccountId: "",
        note: form.note,
        date: form.date,
        time: form.time,
      });
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    // Basic validation
    if (!form.type || !form.amount || !form.accountId) {
      setFormError("Please fill all required fields.");
      return;
    }

    // Additional validation for transfer
    if (form.type === "transfer") {
      if (!form.toAccountId) {
        setFormError("Please select destination account.");
        return;
      }
      if (form.accountId === form.toAccountId) {
        setFormError("Source and destination accounts must be different.");
        return;
      }
    }
    // Additional validation for non-transfer
    else if (!form.category) {
      setFormError("Please select a category.");
      return;
    }
    try {
      setFormLoading(true);
      // Combine date and time to ISO string
      const fullDateTime = new Date(`${form.date}T${form.time}:00`);
      let categoryToUse = form.category;
      // Handle custom category
      if (form.category === "Other" && customCategory.trim()) {
        categoryToUse = customCategory.trim();
        // Add new category if not exists
        const alreadyExists = allCategories.some(
          (cat) => cat.name.toLowerCase() === categoryToUse.toLowerCase()
        );
        if (!alreadyExists) {
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: categoryToUse,
              type: form.type,
            }),
          });
          await fetchCategories();
        }
      }
      // Prepare request body based on transaction type
      let requestBody;
      if (form.type === "transfer") {
        // For transfers, use fromAccountId and toAccountId
        requestBody = {
          type: "transfer",
          amount: Number(form.amount),
          fromAccountId: form.accountId, // source account
          toAccountId: form.toAccountId, // destination account
          note: form.note,
          date: fullDateTime,
        };
      } else {
        // For income/expense, use the regular fields
        requestBody = {
          ...form,
          category: categoryToUse,
          amount: Number(form.amount),
          date: fullDateTime,
        };
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error("Failed to add transaction");
      // Reset form with appropriate defaults
      const defaultAccount = accounts.length ? accounts[0]._id : "";
      const nextForm = {
        type: "expense",
        category: "",
        amount: "",
        accountId: defaultAccount,
        toAccountId: accounts.length > 1 ? accounts[1]._id : defaultAccount,
        note: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
      };
      setForm(nextForm);
      setShowTransferFields(false);
      setShowTransferFields(false);
      setCustomCategory("");
      setFormSuccess("Transaction added successfully!");
      setShowModal(false);
      // Refresh transactions and categories
      const txRes = await fetch("/api/transactions");
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(
          txData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      }
      await fetchCategories();
    } catch (err) {
      setFormError("Could not add transaction.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex flex-row items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 w-fit">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-navy)" }}
            >
              Transactions
            </h1>
            <button
              className="p-2 rounded-full bg-teal hover:bg-teal-500 text-white shadow"
              title="Add Transaction"
              onClick={() => setShowModal(true)}
            >
              <Plus size={22} />
            </button>
          </div>
          <div className="flex flex-col items-end ">
          <button
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-fit"
            aria-label="Open menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            
              <EllipsisVertical className="w-6 h-6" />
            
          </button>
          {menuOpen && (
            <div className="absolute right-5 top-38 shadow-lg rounded w-fit bg-white  flex flex-col items-center md:hidden animate-fade-up z-50">
              <div className="flex flex-col w-fit font-semibold text-gray-700 px-6 py-4  ">
                <FileUpload></FileUpload>

                <button
                  className="hover:text-orange block py-2 md:py-0"
                  onClick={() => {
                    if (transactions.length === 0) return;
                    const exportData = transactions.map((t) => ({
                      Date: new Date(t.createdAt).toLocaleDateString(),
                      Type: t.type,
                      Category: t.type === "transfer" ? "-" : t.category,
                      Account:
                        t.type === "transfer"
                          ? `${t.fromAccountId?.name || ""} to ${
                              t.toAccountId?.name || ""
                            }`
                          : t.accountId?.name || "",
                      Amount: t.amount,
                      Note: t.note || "",
                    }));
                    exportToCSV(exportData, "transactions.csv");
                  }}
                  title="Export as CSV"
                >
                  Export CSV
                </button>
                <button
                  className="hover:text-orange block py-2 md:py-0"
                  onClick={() => {
                    if (transactions.length === 0) return;
                    const exportData = transactions.map((t) => ({
                      Date: new Date(t.createdAt).toLocaleDateString(),
                      Type: t.type,
                      Category: t.type === "transfer" ? "-" : t.category,
                      Account:
                        t.type === "transfer"
                          ? `${t.fromAccountId?.name || ""} → ${
                              t.toAccountId?.name || ""
                            }`
                          : t.accountId?.name || "",
                      Amount: t.amount,
                      Note: t.note || "",
                    }));
                    exportToPDF(exportData, "transactions.pdf", "Transactions");
                  }}
                  title="Export as PDF"
                >
                  Export PDF
                </button>
              </div>
            </div>
          )}</div>
          <div className=" gap-2 hidden md:flex">
            <FileUpload></FileUpload>

            <button
              className="px-3 py-1.5 bg-teal text-white rounded shadow text-sm hover:bg-teal/90"
              onClick={() => {
                if (transactions.length === 0) return;
                const exportData = transactions.map((t) => ({
                  Date: new Date(t.createdAt).toLocaleDateString(),
                  Type: t.type,
                  Category: t.type === "transfer" ? "-" : t.category,
                  Account:
                    t.type === "transfer"
                      ? `${t.fromAccountId?.name || ""} to ${
                          t.toAccountId?.name || ""
                        }`
                      : t.accountId?.name || "",
                  Amount: t.amount,
                  Note: t.note || "",
                }));
                exportToCSV(exportData, "transactions.csv");
              }}
              title="Export as CSV"
            >
              Export CSV
            </button>
            <button
              className="px-3 py-1.5 bg-orange text-white rounded shadow text-sm hover:bg-orange/90"
              onClick={() => {
                if (transactions.length === 0) return;
                const exportData = transactions.map((t) => ({
                  Date: new Date(t.createdAt).toLocaleDateString(),
                  Type: t.type,
                  Category: t.type === "transfer" ? "-" : t.category,
                  Account:
                    t.type === "transfer"
                      ? `${t.fromAccountId?.name || ""} → ${
                          t.toAccountId?.name || ""
                        }`
                      : t.accountId?.name || "",
                  Amount: t.amount,
                  Note: t.note || "",
                }));
                exportToPDF(exportData, "transactions.pdf", "Transactions");
              }}
              title="Export as PDF"
            >
              Export PDF
            </button>
          </div>
        </div>
        {/* Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 bg-opacity-40 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg animate-fade-in mx-5">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-gray-400 hover:text-black text-2xl font-bold"
                aria-label="Close"
              >
                ✕
              </button>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold">Add Transaction</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="border px-3 py-2 rounded w-full"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                  {!showTransferFields && (
                    <div>
                      <label className="block text-sm mb-1">Category</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        required
                        className="border px-3 py-2 rounded w-full"
                      >
                        <option value="">Select Category</option>
                        {allCategories
                          .filter(
                            (cat) =>
                              cat.type === form.type || cat.type === "both"
                          )
                          .map((cat) => (
                            <option key={cat._id || cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                  {form.category === "Other" && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1 mt-2">
                        Custom Category
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category"
                        required
                        className="border px-3 py-2 rounded w-full"
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
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">
                      {showTransferFields ? "From Account" : "Account"}
                    </label>
                    <select
                      name="accountId"
                      value={form.accountId}
                      onChange={handleChange}
                      required
                      className="border px-3 py-2 rounded w-full"
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option
                          key={acc._id}
                          value={acc._id}
                          disabled={
                            showTransferFields && acc._id === form.toAccountId
                          }
                        >
                          {acc.name} ({acc.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  {showTransferFields && (
                    <div>
                      <label className="block text-sm mb-1">To Account</label>
                      <select
                        name="toAccountId"
                        value={form.toAccountId}
                        onChange={handleChange}
                        required
                        className="border px-3 py-2 rounded w-full"
                      >
                        <option value="">Select Account</option>
                        {accounts
                          .filter((acc) => acc._id !== form.accountId)
                          .map((acc) => (
                            <option key={acc._id} value={acc._id}>
                              {acc.name} ({acc.type})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="e.g. Paid by cash"
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className="border px-3 py-2 rounded w-full"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded text-white w-full"
                  style={{
                    background: "var(--color-teal)",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading ? "Adding..." : "Add Transaction"}
                </button>
                {formError && <p className="text-red-600 mt-2">{formError}</p>}
                {formSuccess && (
                  <p className="text-green-600 mt-2">{formSuccess}</p>
                )}
              </form>
            </div>
          </div>
        )}
        {/* Transactions Table */}
        {loading ? (
          <div className="text-center py-10 text-lg text-gray-500">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No transactions found.
          </div>
        ) : (
          <div className="mb-8">
            {/* Card layout for mobile */}
            <div className="flex flex-col gap-4 md:hidden">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
                  style={{ background: "var(--color-card)" }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={
                        t.type === "income"
                          ? "text-green-600 font-semibold"
                          : t.type === "transfer"
                          ? "text-blue-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex w-full text-sm justify-between">
                    <div className="flex flex-col gap-y-2 w-fit">
                      <div>
                        <span className="font-medium text-gray-500">
                          Category:{" "}
                        </span>
                        {t.type === "transfer" ? "Transfer" : t.category}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Account:{" "}
                        </span>
                        {t.type === "transfer" ? (
                          <span>
                            {t.fromAccountId?.name || "Unknown"} →{" "}
                            {t.toAccountId?.name || "Unknown"}
                          </span>
                        ) : (
                          t.accountId?.name || "-"
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">
                          Amount:{" "}
                        </span>
                        <span
                          className={
                            t.type === "income"
                              ? "text-green-600 font-semibold"
                              : t.type === "transfer"
                              ? "text-blue-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {t.type === "income"
                            ? "+"
                            : t.type === "transfer"
                            ? ""
                            : "-"}
                          ₹{t.amount}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        className="text-red-500 cursor-pointer"
                        title="Delete"
                        onClick={() => setDeleteTransactionId(t._id)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                  {t.note && (
                    <div className="text-xs text-gray-500">Note: {t.note}</div>
                  )}
                </div>
              ))}
            </div>
            {/* Table for md+ screens */}
            <div
              className="overflow-x-auto bg-white rounded-lg shadow p-4 hidden md:block"
              style={{ background: "var(--color-card)" }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={
                            t.type === "income"
                              ? "text-green-600 font-semibold"
                              : t.type === "transfer"
                              ? "text-blue-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {t.type === "transfer" ? "-" : t.category}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {t.type === "transfer" ? (
                          <span>
                            {t.fromAccountId?.name || "Unknown"} →{" "}
                            {t.toAccountId?.name || "Unknown"}
                          </span>
                        ) : (
                          t.accountId?.name || "-"
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        {t.type === "income"
                          ? "+"
                          : t.type === "transfer"
                          ? ""
                          : "-"}
                        ₹{t.amount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                        {t.note || "-"}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap flex gap-2 items-center">
                        <button
                          className="text-red-500 cursor-pointer"
                          title="Delete"
                          onClick={() => setDeleteTransactionId(t._id)}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {deleteTransactionId && (
        <div className="fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50 ">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
            <h3 className="text-lg font-semibold mb-3">Delete Transaction?</h3>
            <p className="mb-4 text-sm">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                onClick={() => setDeleteTransactionId(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await fetch(
                      `/api/transactions/${deleteTransactionId}`,
                      {
                        method: "DELETE",
                      }
                    );
                    if (!res.ok)
                      throw new Error("Failed to delete transaction");
                    setDeleteTransactionId(null);
                    // Refresh transactions
                    const txRes = await fetch("/api/transactions");
                    if (txRes.ok) {
                      const txData = await txRes.json();
                      setTransactions(
                        txData.sort(
                          (a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        )
                      );
                    }
                    // Refresh accounts to update balances
                    const accRes = await fetch("/api/accounts");
                    if (accRes.ok) {
                      const accData = await accRes.json();
                      setAccounts(accData);
                    }
                  } catch (err) {
                    setError("Could not delete transaction.");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
