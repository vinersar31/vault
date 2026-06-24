"use client";

// Gates the application behind Google sign-in. Shows a loading state while the
// auth status resolves, a sign-in screen for anonymous visitors, and the app
// itself once authenticated.

import { useState } from "react";
import { FileText, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      console.error(err);
      setError(
        "Sign-in failed. Check your Firebase configuration and that this domain is authorized."
      );
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <FileText className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vault</h1>
        <p className="mt-2 text-slate-500">
          Your private document archive. Sign in to continue.
        </p>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-4 py-3 rounded-xl transition-colors"
        >
          {signingIn ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LogIn size={18} />
          )}
          <span>Continue with Google</span>
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Only you can see your documents.
        </p>
      </div>
    </div>
  );
}
