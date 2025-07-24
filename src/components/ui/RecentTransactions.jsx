"use client";
import React from "react";
export default function RecentTransactions({ transactions }) {
  // Debug: Log the first transaction to inspect its structure
  React.useEffect(() => {
    if (transactions.length > 0) {
      console.log('First transaction:', transactions[0]);
      if (transactions[0].type === 'transfer') {
        console.log('Transfer details:', {
          from: transactions[0].fromAccountId,
          to: transactions[0].toAccountId,
          raw: transactions[0]
        });
      }
    }
  }, [transactions]);

  const recent = transactions.slice(0, 10); // show latest 6 only

  const getAccountName = (account) => {
    if (!account) return 'Unknown';
    if (typeof account === 'object') return account.name || 'Unknown';
    return 'Loading...';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">
      <h3 className="text-2xl font-semibold mb-4">Recent Transactions</h3>
      {recent.length > 0 ? (
        <ul className="space-y-3">
          {recent.map((t) => {
            // Debug: Log each transfer transaction
            if (t.type === 'transfer') {
              console.log('Rendering transfer:', {
                id: t._id,
                from: t.fromAccountId,
                to: t.toAccountId,
                raw: JSON.stringify(t, null, 2)
              });
            }
            
            return (
              <li
                key={t._id}
                className="flex justify-between items-center border-b pb-2 last:border-b-0"
              >
                <div>
                  <p className="text-sm md:text-base font-medium">
                    {t.type === "transfer" ? (
                      <span>
                        Transfer
                        <span className="text-xs md:text-sm text-gray-500 ml-1">
                          ({getAccountName(t.fromAccountId)} → {getAccountName(t.toAccountId)})
                        </span>
                      </span>
                    ) : (
                      <span>
                        {t.category}
                        <span className="text-xs md:text-sm text-gray-500 ml-1">
                          ({getAccountName(t.accountId)})
                        </span>
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={`text-sm md:text-base font-semibold ${
                    t.type === "income"
                      ? "text-green-600"
                      : t.type === "transfer"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : t.type === "transfer" ? "" : "-"}₹{t.amount}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">No valid data found</div>
      )}
    </div>
  );
}
