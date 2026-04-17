"use client";

import Image from "next/image";
import { useUser } from "@/lib/user-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#9b9a97]/30 border-t-[#9b9a97]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-sm space-y-8 px-6">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/content-planner/bossinfo-logo.svg"
              alt="Boss Info"
              width={160}
              height={35}
              className="brightness-0 invert opacity-80"
            />
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold text-[#e8e8e8]">AI Content Planner</h1>
              <p className="text-[13px] text-[#9b9a97]">Sign in to continue</p>
            </div>
          </div>

          <button
            onClick={signIn}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-white/[0.06] px-4 py-2.5 text-[14px] font-medium text-[#e8e8e8] transition-colors hover:bg-white/[0.1]"
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
              <path d="M10 0H0V10H10V0Z" fill="#F25022" />
              <path d="M21 0H11V10H21V0Z" fill="#7FBA00" />
              <path d="M10 11H0V21H10V11Z" fill="#00A4EF" />
              <path d="M21 11H11V21H21V11Z" fill="#FFB900" />
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
