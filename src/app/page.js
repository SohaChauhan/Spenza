"use client";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Wallet, PieChart } from "lucide-react";
import { CheckCircle, TrendingDown, Clock, Heart } from "lucide-react";
import { ArrowRight, Star } from "lucide-react";
import {
  BarChart3,
  Target,
  Bell,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";
export default function Home() {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-teal" />,
      title: "Smart Analytics",
      description:
        "Get detailed insights into your spending patterns with interactive charts and reports.",
    },
    {
      icon: <Target className="h-8 w-8 text-orange" />,
      title: "Budget Goals",
      description:
        "Set personalized budgets and track your progress with intelligent recommendations.",
    },
    {
      icon: <Bell className="h-8 w-8 text-navy" />,
      title: "Smart Alerts",
      description:
        "Receive timely notifications when you're approaching your budget limits.",
    },
    {
      icon: <Shield className="h-8 w-8 text-teal" />,
      title: "Bank-Grade Security",
      description:
        "Your financial data is protected with enterprise-level encryption and security.",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-orange" />,
      title: "Mobile-First",
      description:
        "Track expenses on-the-go with our beautiful and intuitive mobile experience.",
    },
    {
      icon: <Globe className="h-8 w-8 text-navy" />,
      title: "Multi-Currency",
      description:
        "Support for 150+ currencies with real-time exchange rates and conversion.",
    },
  ];
  const benefits = [
    {
      icon: <TrendingDown className="h-12 w-12 text-teal" />,
      title: "Reduce Spending by 30%",
      description:
        "Users report saving an average of 30% on unnecessary expenses within the first month.",
    },
    {
      icon: <Clock className="h-12 w-12 text-orange" />,
      title: "Save 5 Hours Per Week",
      description:
        "Automated expense tracking and categorization saves you hours of manual work.",
    },
    {
      icon: <Heart className="h-12 w-12 text-navy" />,
      title: "Reduce Financial Stress",
      description:
        "Feel confident about your finances with clear insights and actionable recommendations.",
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-teal" />,
      title: "Achieve Financial Goals",
      description:
        "97% of users reach their savings goals faster with Spenza's smart guidance system.",
    },
  ];
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logofull.png"
              alt="Spenza Logo"
              className="h-10 w-auto"
              width={100}
              height={100}
            />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-navy hover:text-teal transition-colors"
            >
              Features
            </a>
            <a
              href="#benefits"
              className="text-navy hover:text-teal transition-colors"
            >
              Benefits
            </a>
            <Link href="/register">
              <button className="bg-teal hover:bg-teal/90 text-white px-6 py-2 rounded">
                Get Started
              </button>
            </Link>
          </nav>
        </div>
      </header>
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-teal/20 via-white to-navy/10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-teal/30 animate-float">
          <TrendingUp size={40} />
        </div>
        <div
          className="absolute top-40 right-20 text-orange/30 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <Wallet size={35} />
        </div>
        <div
          className="absolute bottom-40 left-20 text-navy/30 animate-float"
          style={{ animationDelay: "2s" }}
        >
          <PieChart size={45} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 animate-[fade-up_0.8s_ease-out]">
          <h1 className="text-6xl md:text-7xl font-bold text-navy mb-6 leading-tight">
            Take Control of Your
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal to-orange block">
              Expenses
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Spenza helps you track, analyze, and optimize your spending with
            intelligent insights and beautiful visualizations. Your financial
            freedom starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button
                size="lg"
                className="bg-linear-to-r from-teal to-teal-light hover:from-teal/90 hover:to-teal-light/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Tracking Free
              </button>
            </Link>
          </div>
        </div>
      </section>
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Powerful Features for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-orange block">
                Smart Money Management
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to take control of your finances in one
              beautiful, easy-to-use app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg  bg-card text-card-foreground  hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 shadow-md"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col space-y-1.5 p-6 text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <div className=" leading-none tracking-tight text-xl font-semibold text-navy">
                    {feature.title}
                  </div>
                </div>
                <div className="p-6 pt-0 text-center">
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="benefits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-navy mb-4">
              Why Choose Spenza?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial lives
              with Spenza.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="rounded-lg bg-card text-card-foreground p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start space-x-6 p-0">
                  <div className="flex-shrink-0">{benefit.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-r from-navy to-navy-light text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-orange block">
                Financial Future?
              </span>
            </h2>

            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of smart savers who use Spenza to take control of
              their expenses and build wealth for the future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <button className="w-fit bg-gradient-to-r from-teal to-teal-light hover:from-teal/90 hover:to-teal-light/90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Your Free Trial
                </button>
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>
                🔒 Your data is secure • ✨ No fees • 📱 Works on all devices
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
