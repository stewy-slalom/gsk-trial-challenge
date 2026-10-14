"use client";

import type { ReactNode } from "react";
import { Bell, LogOut, Search } from "@/components/ui/icons";
import { signOut } from "./AuthGate";

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface StaffUser {
  name: string;
  role: string;
  initials: string;
}

// Shared chrome for the two staff experiences (§11): left fixed sidebar with
// Acme Medical lockup + brand block, top bar with page title + search, and a user
// profile at the foot of the sidebar. Active nav uses a tinted fill and weight
// change, never a border stripe (§3 ban).
export function StaffLayout({
  title,
  subtitle,
  brandTitle,
  brandSubtitle,
  user,
  nav,
  active,
  onNav,
  searchPlaceholder = "Search",
  children,
  headerRight,
}: {
  title: string;
  subtitle?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  user?: StaffUser;
  nav: NavItem[];
  active: string;
  onNav: (id: string) => void;
  searchPlaceholder?: string;
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface lg:pl-60">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        <div className="flex items-center px-5 pt-5">
          <img src="/acme-logo.svg" alt="Acme Medical" className="h-7 w-auto" />
        </div>
        {brandTitle && (
          <div className="px-5 pb-4 pt-3">
            <p className="text-sm font-semibold text-ink">{brandTitle}</p>
            {brandSubtitle && (
              <p className="text-[12px] text-meta">{brandSubtitle}</p>
            )}
          </div>
        )}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {nav.map((n) => {
            const isActive = n.id === active;
            return (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                aria-current={isActive}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-orange/10 font-semibold text-brand-orange"
                    : "font-normal text-body hover:bg-surface"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          {user && (
            <div className="mb-1 flex items-center gap-2.5 px-2 py-1.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[13px] font-semibold text-white">
                {user.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-[11px] text-meta">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-body hover:bg-surface"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white/95 px-5 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-ink">{title}</h1>
          {subtitle && <p className="truncate text-[12px] text-meta">{subtitle}</p>}
        </div>
        <div className="ml-auto hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 md:flex">
          <Search size={15} className="text-meta" />
          <input
            placeholder={searchPlaceholder}
            className="w-44 bg-transparent text-sm outline-none placeholder:text-meta"
          />
        </div>
        {headerRight}
        <button
          className="relative rounded-full p-2 text-body hover:bg-surface"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-escalated" />
        </button>
        {user && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/15 text-[13px] font-semibold text-brand-orange lg:hidden">
            {user.initials}
          </span>
        )}
      </header>

      {/* Mobile nav (staff experiences are desktop-first but responsive) */}
      <div className="flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 lg:hidden no-scrollbar">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => onNav(n.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] ${
              n.id === active
                ? "bg-brand-orange/10 font-semibold text-brand-orange"
                : "text-body"
            }`}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
      </div>

      <main className="mx-auto max-w-[1280px] px-5 py-6 pb-28">{children}</main>
    </div>
  );
}
