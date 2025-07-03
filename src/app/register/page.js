"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, User } from "lucide-react";
import bcrypt from "bcryptjs";
import Link from "next/link";
export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  };
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create an account
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <div className="flex items-center border px-3 py-2 rounded-md">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="flex items-center border px-3 py-2 rounded-md">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="flex items-center border px-3 py-2 rounded-md">
            <Lock className="w-4 h-4 mr-2 text-gray-400" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full outline-none"
            />
          </div>
        </div>
        <p className="text-md text-gray-600 text-center pb-3">
          Already have an account?{" "}
          <Link className="text-blue-600 hover:text-blue-700" href="/login">
            Login Here!
          </Link>
        </p>
        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
        )}

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full mb-4"
        >
          Register
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded w-full"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
