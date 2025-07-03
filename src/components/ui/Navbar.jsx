import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import { signOut } from "next-auth/react";
const Navbar = ({ user }) => {
  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <Image src="/Logo-Full.png" width={150} height={100} alt="logo" />
      </div>
      <div className="flex items-center justify-around space-x-6 font-semibold text-gray-700">
        <Link href="/dashboard" className="hover:text-blue-600">
          Overview
        </Link>
        <Link href="/dashboard/accounts" className="hover:text-blue-600">
          Accounts
        </Link>
        <Link href="/dashboard/transactions" className="hover:text-blue-600">
          Transactions
        </Link>

        <Link href="/dashboard/budgets" className="hover:text-blue-600">
          Budgets
        </Link>
        <Link href="/dashboard/visualization" className="hover:text-blue-600">
          Analytics
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-gray-600">
          <CircleUserRound className="w-5 h-5 mr-1" />
          {user.name}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-red-600 border px-3 py-1 rounded hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
