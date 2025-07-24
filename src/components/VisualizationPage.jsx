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
import Navbar from "./ui/Navbar";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import "react-calendar-heatmap/dist/styles.css";
import { format, subDays } from "date-fns";

const COLORS = [
  "#4fd1c7",
  "#ff6b6b",
  "#ffbf00",
  "#fd79a8",
  "#636e72",
  "#1abc9c",
  "#2980b9",
  "#2c2c54",
];

export default function VisualizationPage({ user }) {
  const [data, setData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);


  useEffect(() => {
    const fetchAndSummarize = async () => {
      const res = await fetch("/api/transactions");
      const transactions = await res.json();

      const categorySummary = {};
      const dailySummary = {};

      transactions
        .filter((tx) => tx.type === "expense")
        .forEach((tx) => {
          const cat = tx.category || "Uncategorized";
          categorySummary[cat] = (categorySummary[cat] || 0) + tx.amount;

          // Heatmap
          const day = format(new Date(tx.createdAt), "yyyy-MM-dd");
          dailySummary[day] = (dailySummary[day] || 0) + tx.amount;
        });

      // Pie chart
      const pieData = Object.entries(categorySummary).map(([name, value]) => ({
        name,
        value,
      }));
      setData(pieData);

      // Heatmap data
      const heatData = Object.entries(dailySummary).map(([date, count]) => ({
        date,
        count,
      }));
      setHeatmapData(heatData);

      // Line chart data
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

      // Find the min and max month/year in transactions
      let minDate = null;
      let maxDate = null;
      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      });

      // If there are transactions, fill in all months in range
      if (minDate && maxDate) {
        let year = minDate.getFullYear();
        let month = minDate.getMonth();
        const endYear = maxDate.getFullYear();
        const endMonth = maxDate.getMonth();
        while (year < endYear || (year === endYear && month <= endMonth)) {
          const key = `${year}-${month}`;
          if (!monthlySummary[key]) {
            monthlySummary[key] = {
              key,
              month: `${monthNames[month]} ${year}`,
              income: 0,
              expense: 0,
            };
          }
          // Increment month
          month++;
          if (month > 11) {
            month = 0;
            year++;
          }
        }
      }

      // Summarize transactions
      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;
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

      const sortedLineData = Object.values(monthlySummary).sort((a, b) => {
        const [yearA, monthA] = a.key.split("-").map(Number);
        const [yearB, monthB] = b.key.split("-").map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
      });

       setLineData(sortedLineData);
      // Budget progress
      const budgetsRes = await fetch("/api/budgets");
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
  console.log(lineData)

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Visual Insights
        </h1>

        {/* First Row */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md flex items-center flex-col">
            <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
            <div style={{ width: "350px", height: "320px" }}>
              {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#4fd1c7"
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No valid data found</div>
              )}
            </div>
          </div>
          {/* Line Chart */}
          <div className="bg-white md:p-6 p-0 rounded-xl shadow-md flex-1">
            <h2 className="text-xl p-6 md:p-0 font-semibold mb-4">
              Income vs Expense Over Time
            </h2>
            <div className="w-full mx-auto pr-4">
              {lineData && lineData.length > 0 ? (
  <ResponsiveContainer width="100%" height={320}>
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
) : (
  <div className="flex items-center justify-center h-80 text-gray-500">No valid data found</div>
)}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Heatmap - Now in the first row with more width */}
          <div className="bg-white p-6 rounded-xl shadow-md flex-1 ">
            <h2 className="text-xl font-semibold mb-4">
              Spending Intensity (Last 12 Months)
            </h2>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                {heatmapData && heatmapData.length > 0 ? (
  <>
    <CalendarHeatmap
      startDate={subDays(new Date(), 365)}
      endDate={new Date()}
      values={heatmapData}
      classForValue={(value) => {
        if (!value || value.count === 0) {
          return "color-empty";
        }
        if (value.count < 100) return "color-scale-1";
        if (value.count < 300) return "color-scale-2";
        if (value.count < 500) return "color-scale-3";
        return "color-scale-4";
      }}
      tooltipDataAttrs={value => {
        if(value.date){
          return {
            'data-tooltip-content': `${value.date+ ": ₹"+ value.count} `,
            'data-tooltip-id': "my-tooltip" 
          };
        }
      }}
      tooltip
      showWeekdayLabels
      gutterSize={2}
    />
    <ReactTooltip id="my-tooltip"/>
  </>
) : (
  <div className="flex items-center justify-center h-40 text-gray-500">No valid data found</div>
)}
              </div>
            </div>
          </div>

          {/* Budget Progress - Moved to second row */}
          <div className="bg-white p-6 rounded-xl shadow-md w-full lg:w-140">
            <h2 className="text-xl font-semibold mb-4">Budget Progress</h2>
            <div className="space-y-4  overflow-y-auto pr-2">
  {budgetProgress && budgetProgress.length > 0 ? (
    budgetProgress.map((item) => (
      <div key={item.category} className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-sm">{item.category}</span>
          <div className="flex items-center gap-2 text-xs">
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
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              item.over ? "bg-red-500" : "bg-green-500"
            }`}
            style={{ width: `${item.percent}%` }}
          ></div>
        </div>
      </div>
    ))
  ) : (
    <div className="flex items-center justify-center h-24 text-gray-500">No valid data found</div>
  )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
