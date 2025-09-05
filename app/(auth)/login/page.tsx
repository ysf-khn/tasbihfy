"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

// Declare gtag type for Google Analytics tracking
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("[Login] Attempting signin with:", { email });
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      console.log("[Login] Signin result:", result);
      // Track successful login
      window.gtag?.('event', 'user_login', {
        event_category: 'Authentication',
        event_label: 'Email login successful',
        method: 'email'
      });
      router.push("/");
    } catch (err: any) {
      console.error("[Login] Signin error:", err);
      const errorMessage =
        err?.message ||
        err?.error?.message ||
        err?.response?.data?.message ||
        "An error occurred during login";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-2xl border border-base-300">
      <div className="card-body p-8">
        <div className="text-center mb-8 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Assalamu Alaikum
            </h1>
            <p className="text-lg text-base-content/80 mt-2">
              Welcome back to your dhikr journey
            </p>
          </div>
          <div className="alert alert-info">
            <SparklesIcon className="w-5 h-5" />
            <span className="text-sm">Continue your remembrance of Allah</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                Email
              </span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full pl-10 focus:input-primary transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="input input-bordered w-full pl-10 pr-10 focus:input-primary transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold">Sign in failed</h3>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-lg w-full shadow-lg hover:shadow-xl transition-all duration-200 ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Begin Your Dhikr Journey"}
          </button>
        </form>

        <div className="divider opacity-50">OR</div>

        <div className="text-center space-y-2">
          <p className="text-sm text-base-content/70">New to dhikr counting?</p>
          <Link
            href="/register"
            className="btn btn-outline btn-primary shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <SparklesIcon className="w-4 h-4" />
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
