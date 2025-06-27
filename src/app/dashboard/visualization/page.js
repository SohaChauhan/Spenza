"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
} from "recharts";
import { useEffect, useState } from "react";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff6b6b",
  "#00C49F",
  "#FFBB28",
];

export default function VisualizationPage() {
  const [data, setData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  useEffect(() => {
    const fetchAndSummarize = async () => {
      const res = await fetch("/api/transactions");
      const transactions = await res.json();

      const categorySummary = {};

      transactions
        .filter((tx) => tx.type === "expense")
        .forEach((tx) => {
          const cat = tx.category || "Uncategorized";
          categorySummary[cat] = (categorySummary[cat] || 0) + tx.amount;
        });

      const pieData = Object.entries(categorySummary).map(([name, value]) => ({
        name,
        value,
      }));

      setData(pieData);
      const monthlySummary = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed (0 = Jan)
        const key = `${year}-${month}`; // for sorting

        if (!monthlySummary[key]) {
          monthlySummary[key] = {
            key,
            month: `${monthNames[month]} ${year}`,
            income: 0,
            expense: 0,
          };
        }

        if (tx.type === "income") {
          monthlySummary[key].income += tx.amount;
        } else {
          monthlySummary[key].expense += tx.amount;
        }
      });

      // ✅ Sort correctly by actual key, not month label
      const sortedLineData = Object.values(monthlySummary).sort((a, b) => {
        const [yearA, monthA] = a.key.split("-").map(Number);
        const [yearB, monthB] = b.key.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      });

      setLineData(sortedLineData);

      setLineData(sortedLineData);
      const [budgetsRes] = await Promise.all([fetch("/api/budgets")]);

      const budgets = await budgetsRes.json();
      const progressData = budgets.map((budget) => {
        const spent = transactions
          .filter(
            (tx) => tx.type === "expense" && tx.category === budget.category
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        return {
          category: budget.category,
          budget: budget.amount,
          spent,
          percent: Math.min(100, Math.round((spent / budget.amount) * 100)),
          over: spent > budget.amount,
        };
      });

      setBudgetProgress(progressData);
    };

    fetchAndSummarize();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Visual Insights</h1>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          Income vs Expense Over Time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#82ca9d"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ff6b6b"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white mt-10 p-6 rounded-xl shadow-md max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Budget Progress</h2>
        <div className="space-y-4">
          {budgetProgress.map((item) => (
            <div key={item.category} className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{item.category}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    ₹{item.spent} / ₹{item.budget}
                  </span>
                  {item.over && (
                    <span className="text-red-600 font-semibold animate-pulse">
                      ⚠ Over Budget!
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.over ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${item.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
