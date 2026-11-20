
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/axiosAdmin";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await adminApi.post("/token/", {
        username: username.trim(),
        password,
      });

      const accessToken = response.data?.access;
      const refreshToken = response.data?.refresh;

      if (!accessToken) {
        throw new Error("The server did not return an access token.");
      }

      // Save authentication tokens
      localStorage.setItem("admin_access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("admin_refresh_token", refreshToken);
      } else {
        localStorage.removeItem("admin_refresh_token");
      }

      // Navigate to admin dashboard
      router.replace("/admin/dashboard");

    } catch (err: unknown) {
      console.error("Admin login error:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as {
          response?: {
            status?: number;
            data?: {
              detail?: string;
              message?: string;
            };
          };
        };

        const status = axiosError.response?.status;
        const serverMessage =
          axiosError.response?.data?.detail ||
          axiosError.response?.data?.message;

        if (status === 401) {
          setError("Invalid username or password.");
        } else if (status === 404) {
          setError("Login API endpoint not found. Please check the backend URL.");
        } else if (status && status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(serverMessage || "Login failed. Please try again.");
        }
      } else {
        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-[#171126] to-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/20 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Fimiku Admin
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to your administration panel
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500 disabled:opacity-50"
              placeholder="Enter admin username"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
              className="w-full rounded-lg border border-purple-500/20 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-purple-500 disabled:opacity-50"
              placeholder="Enter admin password"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}
