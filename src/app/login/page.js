"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Goo } from "lucide-react";
import Link from "next/link";
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res.error) {
      setError("Invalid email or password.");
    } else {
      console.log("Success");
      router.push("/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal/10 via-white to-navy/10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground p-10 rounded-2xl shadow-2xl w-full max-w-md border-0 animate-fade-up"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-navy tracking-tight">
          Sign in to Spenza
        </h2>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-navy">
            Email
          </label>
          <div className="flex items-center border border-border bg-muted/40 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-teal">
            <Mail className="w-4 h-4 mr-2 text-teal" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full outline-none bg-transparent text-navy placeholder-gray-400"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2 text-navy">
            Password
          </label>
          <div className="flex items-center border border-border bg-muted/40 px-3 py-2 rounded-lg focus-within:ring-2 focus-within:ring-teal">
            <Lock className="w-4 h-4 mr-2 text-teal" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full outline-none bg-transparent text-navy placeholder-gray-400"
            />
          </div>
        </div>
        <p className="text-md text-gray-600 text-center pb-3">
          Don&apos;t have an account?{" "}
          <Link
            className="text-teal hover:text-orange font-semibold transition-colors"
            href="/register"
          >
            Register Here!
          </Link>
        </p>
        {error && (
          <div className="text-red-600 text-sm mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="bg-gradient-to-r from-teal to-teal-light hover:from-teal/90 hover:to-teal-light/90 text-white font-semibold py-2 px-4 rounded-full w-full mb-4 shadow-md transition-all duration-200 text-lg"
        >
          Login
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="border-2 border-teal hover:bg-teal/10 text-navy font-semibold py-2 px-4 rounded-full w-full mb-2 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <img
            alt="svgImg"
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImIiIGN4PSIxLjQ3OSIgY3k9IjEyLjc4OCIgZng9IjEuNDc5IiBmeT0iMTIuNzg4IiByPSI5LjY1NSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCguODAzMiAwIDAgMS4wODQyIDIuNDU5IC0uMjkzKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iLjM2OCIgc3RvcC1jb2xvcj0iI2ZmY2YwOSIvPjxzdG9wIG9mZnNldD0iLjcxOCIgc3RvcC1jb2xvcj0iI2ZmY2YwOSIgc3RvcC1vcGFjaXR5PSIuNyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmY2YwOSIgc3RvcC1vcGFjaXR5PSIwIi8+PC9yYWRpYWxHcmFkaWVudD48cmFkaWFsR3JhZGllbnQgaWQ9ImMiIGN4PSIxNC4yOTUiIGN5PSIyMy4yOTEiIGZ4PSIxNC4yOTUiIGZ5PSIyMy4yOTEiIHI9IjExLjg3OCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxLjMyNzIgMCAwIDEuMDA3MyAtMy40MzQgLS42NzIpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuMzgzIiBzdG9wLWNvbG9yPSIjMzRhODUzIi8+PHN0b3Agb2Zmc2V0PSIuNzA2IiBzdG9wLWNvbG9yPSIjMzRhODUzIiBzdG9wLW9wYWNpdHk9Ii43Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMzRhODUzIiBzdG9wLW9wYWNpdHk9IjAiLz48L3JhZGlhbEdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iZCIgeDE9IjIzLjU1OCIgeTE9IjYuMjg2IiB4Mj0iMTIuMTQ4IiB5Mj0iMjAuMjk5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIuNjcxIiBzdG9wLWNvbG9yPSIjNDI4NWY0Ii8+PHN0b3Agb2Zmc2V0PSIuODg1IiBzdG9wLWNvbG9yPSIjNDI4NWY0IiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjxjbGlwUGF0aCBpZD0iYSI+PHBhdGggZD0iTTIyLjM2IDEwSDEydjQuMjZoNS45MmMtLjI2IDEuMzctMS4wNCAyLjUzLTIuMjEgMy4zMS0uOTguNjYtMi4yMyAxLjA2LTMuNzEgMS4wNi0yLjg2IDAtNS4yOS0xLjkzLTYuMTYtNC41M2gtLjAxM2wuMDEzLS4wMWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5Yy44Ny0yLjYgMy4zLTQuNTMgNi4xNi00LjUzIDEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgNy43IDEgMy45OSAzLjQ3IDIuMTggNy4wNyAxLjQzIDguNTUgMSAxMC4yMiAxIDEycy40MyAzLjQ1IDEuMTggNC45M3YuMDFDMy45OSAyMC41MyA3LjcgMjMgMTIgMjNjMi45NyAwIDUuNDYtLjk4IDcuMjgtMi42NiAyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOSAwLS43OC0uMDctMS41My0uMi0yLjI1IiBmaWxsPSJub25lIi8+PC9jbGlwUGF0aD48L2RlZnM+PHBhdGggZD0iTTIyLjM2IDEwSDEydjQuMjZoNS45MmMtLjI2IDEuMzctMS4wNCAyLjUzLTIuMjEgMy4zMS0uOTguNjYtMi4yMyAxLjA2LTMuNzEgMS4wNi0yLjg2IDAtNS4yOS0xLjkzLTYuMTYtNC41M2gtLjAxM2wuMDEzLS4wMWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5Yy44Ny0yLjYgMy4zLTQuNTMgNi4xNi00LjUzIDEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgNy43IDEgMy45OSAzLjQ3IDIuMTggNy4wNyAxLjQzIDguNTUgMSAxMC4yMiAxIDEycy40MyAzLjQ1IDEuMTggNC45M3YuMDFDMy45OSAyMC41MyA3LjcgMjMgMTIgMjNjMi45NyAwIDUuNDYtLjk4IDcuMjgtMi42NiAyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOSAwLS43OC0uMDctMS41My0uMi0yLjI1IiBmaWxsPSIjZmM0YzUzIi8+PGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj48ZWxsaXBzZSBjeD0iMy42NDYiIGN5PSIxMy41NzIiIHJ4PSI3Ljc1NSIgcnk9IjEwLjQ2OSIgZmlsbD0idXJsKCNiKSIvPjxlbGxpcHNlIGN4PSIxNS41MzgiIGN5PSIyMi43ODkiIHJ4PSIxNS43NjUiIHJ5PSIxMS45NjUiIHRyYW5zZm9ybT0icm90YXRlKC03LjEyIDE1LjUzOSAyMi43ODkpIiBmaWxsPSJ1cmwoI2MpIi8+PHBhdGggZmlsbD0idXJsKCNkKSIgZD0ibTExLjEwNSA4LjI4LjQ5MSA1LjU5Ni42MjMgMy43NDcgNy4zNjIgNi44NDggOC42MDctMTUuODk3eiIvPjwvZz48L3N2Zz4="
          />
          Continue with Google
        </button>
      </form>
    </div>
  );
}
