"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, Truck, BarChart3, Download, BookOpen, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Truck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/export", label: "Export", icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-emerald-700 px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-2">
          <BookOpen size={20} />
          <span className="font-semibold">SmartKarobar</span>
        </div>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">SmartKarobar</h1>
            <p className="text-xs text-slate-400">Digital Khata</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">
          <p className="text-xs text-slate-400">Built for Nepali businesses</p>
        </div>
      </aside>
    </>
  );
}
