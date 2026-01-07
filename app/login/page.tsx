"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    setUser(data.user);
  };

  const signIn = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return setError(error.message);
    setUser(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-gray-900">
          🌍 Story Map
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Share your adventures with the world
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
              Logged in as <strong>{user.email}</strong>
            </p>
            <button
              onClick={signOut}
              className="w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={signIn}
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <button
              onClick={signUp}
              disabled={loading}
              className="w-full rounded-xl border border-indigo-600 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to share adventures responsibly.
        </p>
      </div>
    </main>
  );
}
