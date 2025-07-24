"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit,
  Trash,
} from "lucide-react";
import Navbar from "./ui/Navbar";
import React from "react";

export default function BudgetsPage({ user }) {
  // Edit/Delete state
  const [editBudget, setEditBudget] = useState(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState(null);

  // Handler for edit
  const handleEditBudget = (budget) => {
    setEditBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setCustomCategory("");
    setShowModal(false);
    setIsModalOpen(true);
  };

  // Handler for delete
  const handleDeleteBudget = (budget) => {
    if (
      window.confirm(
        `Are you sure you want to delete the budget for ${budget.category}?`
      )
    ) {
      fetch(`/api/budgets/${budget._id}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          fetchBudgets();
        });
    }
  };

  // Handler for updating budget
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    if (!category.trim() || !amount) {
      setError("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/budgets/${editBudget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category === "Other" ? customCategory.trim() : category,
          amount: Math.max(0, Number(amount)),
        }),
      });
      if (!res.ok) throw new Error("Failed to update budget");
      setEditBudget(null);
      setIsModalOpen(false);
      setCategory("");
      setCustomCategory("");
      setAmount("");
      await fetchBudgets();
      await fetchCategories();
    } catch (err) {
      setError(err.message || "An error occurred while updating the budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");
      if (!res.ok) throw new Error("Failed to fetch budgets");
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching budgets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setAllCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const openModal = () => {
    setError("");
    setCategory("");
    setCustomCategory("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Small delay to allow modal close animation
    setTimeout(() => {
      setCategory("");
      setCustomCategory("");
      setAmount("");
      setError("");
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.trim() || !amount) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category === "Other" ? customCategory.trim() : category,
          amount: Math.max(0, Number(amount)),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (category === "Other" && customCategory.trim()) {
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
                type: "expense", // 🚨 important
              }),
            });
          }
          console.log("Saving custom category:", {
            name: customCategory,
            type: "expense",
          });
          // Set the actual category name (not "Other")
          setCategory(name);
        }

        setCategory("");
        setCustomCategory("");
        setAmount("");
        setIsModalOpen(false);
        await fetchBudgets();
        await fetchCategories();
      } else {
        throw new Error(data.message || "Failed to create budget");
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message || "An error occurred while creating the budget");
      console.error("Error creating budget:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchBudgets(), fetchTransactions(), fetchCategories()]);
  }, []);

  const getSpent = (cat) =>
    transactions
      .filter((tx) => tx.type === "expense" && tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);

  // Memoize metrics calculation to prevent unnecessary recalculations
  const metrics = React.useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let activeBudgets = 0;
    let overBudgetCount = 0;

    budgets.forEach((budget) => {
      if (!budget || typeof budget.amount !== "number") return;

      const spent = getSpent(budget.category) || 0;
      totalBudget += budget.amount;
      totalSpent += spent;
      activeBudgets++;
      if (spent > budget.amount) {
        overBudgetCount++;
      }
    });

    return {
      totalBudget,
      totalSpent,
      activeBudgets,
      overBudgetCount,
      avgUtilization:
        activeBudgets > 0 && totalBudget > 0
          ? Math.min(100, (totalSpent / totalBudget) * 100)
          : 0,
    };
  }, [budgets, transactions]);

  if (isLoading && budgets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-2">
              Track and manage your spending limits
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white  shadow rounded-xl py-2 px-1">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="p-3 bg-navy-light/15 rounded-lg">
                  <DollarSign className="h-6 w-6 text-navy" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Budgets
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.activeBudgets}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl py-2 px-1">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-800" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    On Track
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.activeBudgets - metrics.overBudgetCount}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white   shadow rounded-xl py-2 px-1`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 rounded-md p-3 ${
                    metrics.overBudgetCount > 0 ? "bg-red-200" : "bg-blue-200"
                  }`}
                >
                  <TrendingDown
                    className={`h-6 w-6 ${
                      metrics.overBudgetCount > 0
                        ? "text-red-800"
                        : "text-blue-800"
                    }`}
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metrics.overBudgetCount > 0
                      ? "Over Budget"
                      : "All On Track"}
                  </dt>
                  <dd className="flex items-baseline">
                    <div
                      className={`text-2xl font-semibold ${
                        metrics.overBudgetCount > 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {metrics.overBudgetCount}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Budgets
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Track your spending against each budget
            </p>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No budgets
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new budget.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={openModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  New Budget
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {budgets.map((budget) => {
                const spent = getSpent(budget.category);
                const remaining = budget.amount - spent;
                const progress = Math.min(100, (spent / budget.amount) * 100);
                const isOverBudget = remaining < 0;

                return (
                  <li key={budget._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-navy truncate">
                            {budget.category}
                          </p>
                          <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                            {isOverBudget ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Over Budget
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                On Track
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
                            <div
                              className={`h-2.5 rounded-full ${
                                isOverBudget ? "bg-red-500" : "bg-green-500"
                              }`}
                              style={{
                                width: `${isOverBudget ? 100 : progress}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{spent.toLocaleString("en-IN")}{" "}
                          <span className="text-gray-500">of</span> ₹
                          {budget.amount.toLocaleString("en-IN")}
                        </p>
                        <p
                          className={`text-sm ${
                            isOverBudget ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {isOverBudget ? (
                            <span>
                              Over by ₹
                              {Math.abs(remaining).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span>
                              ₹{remaining.toLocaleString("en-IN")} remaining
                            </span>
                          )}
                        </p>
                        {/* Edit & Delete Buttons */}
                        <div className="flex gap-2 mt-2">
                          <button
                            title="Edit Budget"
                            className="text-navy"
                            onClick={() => handleEditBudget(budget)}
                            aria-label="Edit Budget"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete Budget"
                            className="text-red-500"
                            onClick={() => handleDeleteBudget(budget)}
                            aria-label="Delete Budget"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isModalOpen && editBudget && (
        <div className="fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-5">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditBudget(null);
              }}
              className="absolute top-2 right-3 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <form onSubmit={handleUpdateBudget} className="space-y-4">
              <h2 className="text-xl font-semibold">Edit Budget</h2>
              <div>
                <label className="block text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm mb-1 mt-2">Budget Amount</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex justify-center items-center text-white px-4 py-2 rounded hover:bg-teal-500 bg-teal w-full ${
                    isSubmitting
                      ? "opacity-75 cursor-not-allowed disabled:bg-neutral-400"
                      : ""
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div
          className={`fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50 $ `}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-5">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-black"
            >
              ✕
            </button>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold">Add New</h2>
              <div>
                <label className="block text-sm mb-1">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  name="category"
                  required
                  className="w-full border px-3 py-2 rounded"
                >
                  {allCategories
                    .filter((cat) => cat.type === "expense")
                    .map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              {category === "Other" && (
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
                <label className="block text-sm mb-1 mt-2">Budget Amount</label>

                <input
                  type="number"
                  id="amount"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent negative numbers
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="0.00"
                  required
                />

                <p className="mt-1 text-xs text-gray-500">
                  Your monthly spending limit for this category
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex justify-center items-center text-white px-4 py-2 rounded hover:bg-teal-500 bg-teal w-full ${
                    isSubmitting
                      ? "opacity-75 cursor-not-allowed disabled:bg-neutral-400"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Budget"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
