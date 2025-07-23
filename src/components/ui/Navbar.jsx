import Link from "next/link";
import Image from "next/image";
import { CircleUserRound, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useState } from "react";

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      {/* <Link
        href="/dashboard"
        className="hover:text-blue-600 block py-2 md:py-0"
      >
        Overview
      </Link> */}
      <Link
        href="/dashboard/accounts"
        className="hover:text-orange block py-2 md:py-0"
      >
        Accounts
      </Link>
      <Link
        href="/dashboard/transactions"
        className="hover:text-orange block py-2 md:py-0"
      >
        Transactions
      </Link>
      <Link
        href="/dashboard/budgets"
        className="hover:text-orange block py-2 md:py-0"
      >
        Budgets
      </Link>
      <Link
        href="/dashboard/visualization"
        className="hover:text-orange block py-2 md:py-0"
      >
        Analytics
      </Link>
    </>
  );

  return (
    <nav className="bg-white shadow px-4 md:px-6 py-4 flex items-center justify-between relative z-40">
      {/* Logo */}
      <div className="flex items-center lg:space-x-6 space-x-4">
        <div className="flex items-center flex-shrink-0">
          <Link href="/dashboard">
            <img
              src="/Logo-Full.png"
              alt="Spenza Logo"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-around space-x-6 font-semibold text-gray-700">
          {navLinks}
        </div>
      </div>

      {/* User/Sign Out */}
      <div className="flex items-center xl:space-x-4 space-x-2">
        <div className="hidden md:flex items-center text-sm text-gray-600">
          <CircleUserRound className="w-5 h-5 mr-1" />
          {user.name}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="hidden md:block text-sm border px-4 py-2 rounded bg-gradient-to-r from-teal to-teal-light hover:from-teal/90 hover:to-teal-light/90 text-white"
        >
          Sign Out
        </button>
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t flex flex-col items-center md:hidden animate-fade-up z-50">
          <div className="flex flex-col w-full font-semibold text-gray-700 px-6 py-4  ">
            {navLinks}
            <hr className="w-full border-gray-200 mt-3 mb-1"/>
            <div className="flex items-center text-sm text-gray-600 mt-4 mb-4 ">
              <CircleUserRound className="w-5 h-5 mr-1" />
              {user.name}
            </div>
           
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className=" text-sm bg-gradient-to-r from-teal to-teal-light hover:from-teal/90 hover:to-teal-light/90 text-white px-4 py-2 rounded w-fit"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
