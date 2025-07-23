"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import { Edit, Trash } from "lucide-react";

const AccountPage = ({ user }) => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ name: "", type: "", balance: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Edit/Delete state
  const [editAccountId, setEditAccountId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "", balance: "" });
  const [deleteAccountId, setDeleteAccountId] = useState(null);

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/accounts");
      if (!res.ok) throw new Error("Failed to fetch accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      setError("Could not load accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.type) {
      setError("Please fill all required fields.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          balance: parseFloat(form.balance) || 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to add account");
      setForm({ name: "", type: "", balance: "" });
      setSuccess("Account added successfully!");
      fetchAccounts();
    } catch (err) {
      setError("Could not add account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={user} />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: "var(--color-navy)" }}
        >
          Accounts
        </h1>

        {/* Add Account Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 mb-8 space-y-4"
          style={{ background: "var(--color-card)" }}
        >
          <h2 className="text-xl font-semibold mb-2">Add New Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Account Name"
              value={form.name}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-input)",
                color: "var(--color-foreground)",
              }}
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-input)",
                color: "var(--color-foreground)",
              }}
            >
              <option value="">Type</option>
              <option value="Bank">Bank</option>
              <option value="Cash">Cash</option>
            </select>
            <input
              type="number"
              name="balance"
              placeholder="Opening Balance"
              value={form.balance}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-input)",
                color: "var(--color-foreground)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded text-white cursor-pointer"
            style={{
              background: "var(--color-teal)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Adding..." : "Add Account"}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}
        </form>

        {/* List of Accounts */}
        <div
          className="bg-white rounded-lg shadow p-6"
          style={{ background: "var(--color-card)" }}
        >
          <h2 className="text-xl font-semibold mb-4">Your Accounts</h2>
          {loading ? (
            <p>Loading...</p>
          ) : accounts.length === 0 ? (
            <p style={{ color: "var(--color-muted-foreground)" }}>
              No accounts found.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {accounts.map((acc) => (
                <li
                  key={acc._id || acc.name}
                  className="py-4 flex justify-between items-center"
                >
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--color-navy)" }}
                    >
                      {editAccountId === acc._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="border px-2 py-1 rounded w-32 mr-2"
                        />
                      ) : (
                        acc.name
                      )}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {editAccountId === acc._id ? (
                        <select
                          name="type"
                          value={editForm.type}
                          onChange={(e) =>
                            setEditForm({ ...editForm, type: e.target.value })
                          }
                          className="border px-2 py-1 rounded w-24"
                        >
                          <option value="Bank">Bank</option>
                          <option value="Cash">Cash</option>
                        </select>
                      ) : (
                        acc.type
                      )}
                    </p>
                  </div>
                  <div className="text-right flex space-x-2 items-center gap-1">
                    {editAccountId === acc._id ? (
                      <input
                        type="number"
                        name="balance"
                        value={editForm.balance}
                        onChange={(e) =>
                          setEditForm({ ...editForm, balance: e.target.value })
                        }
                        className="border px-2 py-1 rounded w-28 mb-1"
                      />
                    ) : (
                      <span
                        className="font-semibold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        ₹
                        {acc.balance?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    )}
                    <div className="flex items-center gap-2 ">
                      {editAccountId === acc._id ? (
                        <>
                          <button
                            className="px-3 py-1.5 bg-teal text-white rounded text-sm cursor-pointer"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const res = await fetch(
                                  `/api/accounts/${acc._id}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      name: editForm.name,
                                      type: editForm.type,
                                      balance:
                                        parseFloat(editForm.balance) || 0,
                                    }),
                                  }
                                );
                                if (!res.ok)
                                  throw new Error("Failed to update account");
                                setEditAccountId(null);
                                setEditForm({
                                  name: "",
                                  type: "",
                                  balance: "",
                                });
                                fetchAccounts();
                              } catch (err) {
                                setError("Could not update account.");
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1.5 bg-white text-red-500 border-red-500 border rounded text-sm cursor-pointer"
                            onClick={() => {
                              setEditAccountId(null);
                              setEditForm({ name: "", type: "", balance: "" });
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-navy cursor-pointer"
                            title="Edit"
                            onClick={() => {
                              setEditAccountId(acc._id);
                              setEditForm({
                                name: acc.name,
                                type: acc.type,
                                balance: acc.balance,
                              });
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-navy cursor-pointer text-red-500"
                            title="Delete"
                            onClick={() => setDeleteAccountId(acc._id)}
                          >
                            <Trash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Delete Confirmation Dialog */}
        {deleteAccountId && (
          <div className="fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50 ">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
              <h3 className="text-lg font-semibold mb-3">Delete Account?</h3>
              <p className="mb-4 text-sm">
                Are you sure you want to delete this account? This action cannot
                be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                  onClick={() => setDeleteAccountId(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded cursor-pointer"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const res = await fetch(
                        `/api/accounts/${deleteAccountId}`,
                        {
                          method: "DELETE",
                        }
                      );
                      if (!res.ok) throw new Error("Failed to delete account");
                      setDeleteAccountId(null);
                      fetchAccounts();
                    } catch (err) {
                      setError("Could not delete account.");
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
    </>
  );
};

export default AccountPage;
