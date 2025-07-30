// components/StatementUploader.jsx

"use client";

import { useState, useEffect } from "react";

export default function FileUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user's accounts when the component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts"); // Assuming you have an endpoint to get accounts
        if (!response.ok) throw new Error("Failed to fetch accounts");
        const data = await response.json();
        setAccounts(data);
        if (data.length > 0) {
          setSelectedAccount(data[0]._id); // Default to the first account
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };
    fetchAccounts();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedAccount) {
      setMessage("Please select an account and a file.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", selectedAccount); // <-- Send the account ID

    try {
      const response = await fetch("/api/transactions/upload", {
        // <-- New API route
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      setMessage(`Success! ${data.count} transactions were added.`);
      // window.location.reload(); // Or trigger a state refresh to show new transactions
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hover:text-orange block md:hover:text-black py-2 md:py-0 md:px-3  md:bg-teal md:text-white md:rounded md:shadow md:text-sm md:hover:bg-teal/90"
      >
        Extract from Bank Statement
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-100/90 bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative mx-5">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-black"
              aria-label="Close"
            >
              ✕
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold">Upload Bank Statement</h2>

              {/* Account Selector */}
              <div>
                <label htmlFor="account" className="block text-sm mb-1">
                  Select Account
                </label>
                <select
                  id="account"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} (Balance: {account.balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* File Input */}
              <div>
                <label
                  htmlFor="file-upload"
                  className="block text-sm mb-1 mt-2"
                >
                  Select PDF File
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <button
                type="submit"
                disabled={!file || isLoading || !selectedAccount}
                className="px-4 py-2 rounded text-white w-full"
                style={{
                  background: "var(--color-teal)",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Processing..." : "Upload and Record"}
              </button>
            </form>
            {message && (
              <p className="mt-4 text-center text-sm text-gray-600">
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
