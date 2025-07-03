"use client";

export default function RecentTransactions({ transactions }) {
  const recent = transactions.slice(0, 6); // show latest 6 only

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full">
      <h3 className="text-2xl font-semibold mb-4">Recent Transactions</h3>
      <ul className="space-y-3">
        {recent.map((t) => (
          <li
            key={t._id}
            className="flex justify-between items-center border-b pb-2 last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium">
                {t.category}{" "}
                <span className="text-xs text-gray-500">
                  ({t.accountId?.name})
                </span>
              </p>
              <p className="text-xs text-gray-500">
                {new Date(t.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`text-sm font-semibold ${
                t.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {t.type === "income" ? "+" : "-"}₹{t.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
