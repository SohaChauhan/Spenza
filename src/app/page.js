"use client";
import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";
import { TrendingUp, Wallet, PieChart } from "lucide-react";
export default function Home() {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/Logo-Full.png"
              alt="Spenza Logo"
              className="h-10 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-[#2C3E50] hover:text-[#4FD1C7] transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-[#2C3E50] hover:text-\[#4FD1C7] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#contact"
              className="text-[#2C3E50] hover:text-[#4FD1C7] transition-colors"
            >
              Contact
            </a>
            <button className="bg-[#4FD1C7] hover:bg-[#4FD1C7]/90 text-white px-6 py-2 rounded">
              Get Started
            </button>
          </nav>
        </div>
      </header>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4FD1C7]/20 via-white to-[#2C3E50]/10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-[#4FD1C7]/30 animate-[float_3s_ease-in-out_infinite]">
          <TrendingUp size={40} />
        </div>
        <div
          className="absolute top-40 right-20 text-[#F39C12]/30 animate-[float_3s_ease-in-out_infinite]"
          style={{ animationDelay: "1s" }}
        >
          <Wallet size={35} />
        </div>
        <div
          className="absolute bottom-40 left-20 text-[#2C3E50]/30 animate-[float_3s_ease-in-out_infinite]"
          style={{ animationDelay: "2s" }}
        >
          <PieChart size={45} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-6xl md:text-7xl font-bold text-[#2C3E50] mb-6 leading-tight">
            Take Control of Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4FD1C7] to-[#F39C12] block">
              Expenses
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Spenza helps you track, analyze, and optimize your spending with
            intelligent insights and beautiful visualizations. Your financial
            freedom starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              size="lg"
              className="bg-gradient-to-r from-[#4FD1C7] to-[#6EE7B7] hover:from-[#4FD1C7]/90 hover:to-[#6EE7B7]/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Tracking Free
            </button>
            <button
              variant="outline"
              size="lg"
              className="border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
            >
              Watch Demo
            </button>
          </div>

          <div className="mt-12 text-sm text-gray-500">
            <p>✨ No credit card required • Free forever plan available</p>
          </div>
        </div>
      </section>
    </>
  );
}
