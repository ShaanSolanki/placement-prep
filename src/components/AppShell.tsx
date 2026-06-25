"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Calculator,
  MessagesSquare,
  Timer,
  LogOut,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { Brand } from "./Brand";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/code", label: "Code Judge", icon: Code2 },
  { href: "/dsa", label: "DSA Cards", icon: BookOpen },
  { href: "/aptitude", label: "Aptitude", icon: Calculator },
  { href: "/interview", label: "Interview", icon: MessagesSquare },
  { href: "/tests", label: "Test Center", icon: Timer },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { progress } = useProgress();
  const [open, setOpen] = useState(false);
  const streak = progress.streak?.count || 0;

  return (
    <div className="min-h-screen flex relative z-10">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-[248px] shrink-0 flex flex-col
          bg-stone/80 backdrop-blur-xl border-r border-line transition-transform
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="px-5 h-16 flex items-center border-b border-line">
          <Brand />
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors
                  ${
                    active
                      ? "bg-clay/12 text-bone border border-clay/30"
                      : "text-bone-dim hover:text-bone hover:bg-stone-2 border border-transparent"
                  }`}
              >
                <Icon
                  size={17}
                  className={active ? "text-clay-bright" : "text-bone-faint"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line">
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 mb-2 text-xs text-amber">
              <Flame size={15} /> {streak} day streak
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-2 px-1 py-1 rounded-[10px]">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 min-w-0 flex-1 px-1 py-1 rounded-lg hover:bg-stone-2 transition-colors"
                title="View profile"
              >
                <div className="w-8 h-8 rounded-full bg-clay/20 border border-clay/30 flex items-center justify-center text-clay-bright text-sm font-medium shrink-0">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-bone truncate">
                    {user.displayName || "Student"}
                  </div>
                  <div className="text-[10px] text-bone-faint truncate">
                    {user.email}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => logout()}
                title="Sign out"
                className="text-bone-faint hover:text-rust transition-colors p-1 shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary w-full">
              Sign in to save progress
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden h-16 px-4 flex items-center justify-between glass-nav sticky top-0 z-20">
          <Brand />
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-bone-dim"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
