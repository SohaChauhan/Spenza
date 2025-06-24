"use client";
import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-xl text-center bg-white p-10 rounded-2xl shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Welcome to Expense Buddy 💸
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Track your income, expenses, budgets, and get smart insights — all in
          one place.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
        >
          <LayoutDashboard className="w-5 h-5" />
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
