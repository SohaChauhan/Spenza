"use client";

import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = [
  "#845EF7",
  "#F03E3E",
  "#339AF0",
  "#51CF66",
  "#5C7CFA",
  "#FCC419",
];

export default function ExpensesByCategoryChart({ data, transactions }) {
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return (
    <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
      <h3 className="text-2xl font-semibold mb-4">Expenses by Category</h3>
      <PieChart width={250} height={250}>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* Custom Legend */}
      <div className="mt-4 w-full space-y-1 text-sm">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-700">{entry.category}</span>
            <span className="ml-auto font-medium text-gray-900">
              {((entry.amount / totalExpense) * 100).toFixed(2)} %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
