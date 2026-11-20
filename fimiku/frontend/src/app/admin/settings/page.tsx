"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/axiosAdmin";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    try {
      const response = await adminApi.get("/account/");

      setUsername(response.data.username || "");
      setEmail(response.data.email || "");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Unable to load admin account information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      const payload: {
        username: string;
        current_password: string;
        new_password?: string;
      } = {
        username: username.trim(),
        current_password: currentPassword,
      };

      if (newPassword) {
        payload.new_password = newPassword;
      }

      const response = await adminApi.put(
        "/account/",
        payload
      );

      setMessage(
        response.data.detail ||
          "Account updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // If the password changed, the user must log in again.
      if (newPassword) {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");

        setTimeout(() => {
          router.replace("/admin/login");
        }, 1500);
      }
    } catch (err: any) {
      const responseError = err.response?.data?.detail;

      if (Array.isArray(responseError)) {
        setError(responseError.join(" "));
      } else if (typeof responseError === "string") {
        setError(responseError);
      } else {
        setError("Failed to update account. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b12] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">
            Loading account settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-purple-400 hover:text-purple-300 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">
            Account Settings
          </h1>

          <p className="text-gray-400 mt-2">
            Manage your administrator username and password.
          </p>
        </div>

        {/* Account Information */}
        <div className="bg-[#15151f] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-5">
            Administrator Profile
          </h2>

          <div className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0b0b12] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#0b0b12] border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />

              <p className="text-xs text-gray-500 mt-2">
                Email is currently read-only.
              </p>
            </div>

          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-[#15151f] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Change Password
          </h2>

          <p className="text-gray-400 text-sm mb-5">
            Leave the new password fields empty if you only
            want to change your username.
          </p>

          <div className="space-y-4">

            {/* Current Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="w-full bg-[#0b0b12] border border-white/10 rounded-xl px-4 py-3 pr-20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-400"
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                New Password
              </label>

              <div className="relative">
                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="w-full bg-[#0b0b12] border border-white/10 rounded-xl px-4 py-3 pr-20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-400"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full bg-[#0b0b12] border border-white/10 rounded-xl px-4 py-3 pr-20 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-purple-400"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-6">
            {message}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-4 transition-all"
        >
          {saving
            ? "Saving Changes..."
            : "Save Account Changes"}
        </button>

        <p className="text-gray-500 text-sm text-center mt-4">
          Changing your password will require you to log in again.
        </p>

      </div>
    </div>
  );
}