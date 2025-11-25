// /app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Filter, Search, Zap, Lock, Clock } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = sessionStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard");
    } else {
      router.push("/register"); // Changed: now goes to register
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
            </div>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/login")}
                    className="text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 mb-40">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Manage Tasks,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Boost Productivity
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A powerful, intuitive task manager built with Next.js. Organize,
            filter, and track your tasks with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Managing Tasks
            </button>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  router.push("/dashboard");
                } else {
                  router.push("/login");
                }
              }}
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all text-lg font-semibold"
            >
              {isLoggedIn ? "View Dashboard" : "Login"}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their productivity with
            TaskFlow.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Free Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-white">TaskFlow</span>
          </div>
          <p className="text-sm">
            Built with Next.js, Prisma, and Tailwind CSS
          </p>
          <p className="text-sm mt-2">© 2025 TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
