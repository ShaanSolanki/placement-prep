"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { signInGoogle, signInEmail, signUpEmail } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const friendly = (code: string) => {
    if (code.includes("invalid-credential") || code.includes("wrong-password"))
      return "Email or password is incorrect.";
    if (code.includes("email-already-in-use"))
      return "That email is already registered — try signing in.";
    if (code.includes("weak-password"))
      return "Password should be at least 6 characters.";
    if (code.includes("invalid-email")) return "That email looks invalid.";
    if (code.includes("popup-closed")) return "Google sign-in was cancelled.";
    return "Something went wrong. Please try again.";
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    try {
      await signInGoogle();
      router.push("/dashboard");
    } catch (e) {
      setError(friendly(e instanceof Error ? e.message : ""));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "in") await signInEmail(email, password);
      else await signUpEmail(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <header className="max-w-6xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        <Brand />
        <Link
          href="/"
          className="text-sm text-bone-faint hover:text-bone flex items-center gap-1.5"
        >
          <ArrowLeft size={15} /> Home
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm animate-fadeUp">
          <h1 className="font-display text-3xl text-bone text-center">
            {mode === "in" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-center text-sm text-bone-dim mt-2">
            {mode === "in"
              ? "Sign in to sync your progress across devices."
              : "Start tracking your placement journey today."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="btn btn-ghost w-full mt-7 py-3"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.7 0-.7-.06-1.4-.18-2z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 5-.9 6.6-2.4l-3.4-2.6c-.9.6-2 1-3.2 1-2.5 0-4.6-1.7-5.3-4H3.2v2.6C4.8 19.8 8.1 22 12 22z"
              />
              <path
                fill="#FBBC05"
                d="M6.7 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.2C2.5 8.9 2.1 10.4 2.1 12s.4 3.1 1.1 4.5z"
              />
              <path
                fill="#4285F4"
                d="M12 6.1c1.4 0 2.7.5 3.7 1.5l2.8-2.8C16.9 3.2 14.6 2.3 12 2.3 8.1 2.3 4.8 4.5 3.2 7.5l3.5 2.6c.7-2.3 2.8-4 5.3-4z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-line flex-1" />
            <span className="text-xs text-bone-faint">or</span>
            <div className="h-px bg-line flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "up" && (
              <input
                className="input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="input"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p className="text-sm text-rust bg-rust/10 border border-rust/25 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary w-full py-3"
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-bone-dim mt-5">
            {mode === "in" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError("");
              }}
              className="text-clay-bright hover:underline"
            >
              {mode === "in" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="text-center text-xs text-bone-faint mt-4">
            You can also{" "}
            <Link href="/dashboard" className="underline hover:text-bone-dim">
              explore without an account
            </Link>{" "}
            — progress saves locally.
          </p>
        </div>
      </div>
    </div>
  );
}
