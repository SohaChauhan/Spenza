"use client";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = [
  "#D00000",
  "#F05A29",
  "#FFBA08",
  "#8FE388",
  "#73B7B8",
  "#1B998B",
  "#50B99B",
  "#3185FC",
  "#CC3399",
  "#990066",
  "#5D2E8C",
  "#46237A",
  "#FF7B9C",
  "#FF9B85",
];

export default function ExpensesByCategoryChart({ data, transactions }) {
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const hasData = data && data.length > 0 && totalExpense > 0;
  return (
    <div className="bg-white p-6 rounded-xl shadow flex flex-col w-full md:w-fit">
      <h3 className="text-2xl font-semibold mb-4 ">Expenses by Category</h3>
      {hasData ? (
        <>
          <PieChart width={250} height={250} className="mx-auto">
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
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          {/* Custom Legend */}
          <div className="mt-4 w-fit space-y-1 text-sm mx-auto">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 mr-10">{entry.category}</span>
                <span className="ml-auto font-medium text-gray-900 ">
                  {((entry.amount / totalExpense) * 100).toFixed(2)} %
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-500">
          No valid data found
        </div>
      )}
    </div>
  );
}
