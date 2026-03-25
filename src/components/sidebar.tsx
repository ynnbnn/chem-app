"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Package,
  Map,
  Users,
  Settings,
  LogOut,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    organizationName?: string;
    role?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new", label: "Neue Anwendung", icon: PlusCircle },
  { href: "/applications", label: "Anwendungen", icon: ClipboardList },
  { href: "/products", label: "Produkte", icon: Package },
  { href: "/fields", label: "Flächen", icon: Map },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-[var(--sidebar)] text-white px-4 h-14">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          <span className="font-bold">ChemComply</span>
        </div>
        <MobileMenu pathname={pathname} user={user} />
      </div>
      <div className="md:hidden h-14" />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-[var(--sidebar)] text-white">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <Leaf className="h-6 w-6" />
          <span className="text-lg font-bold">ChemComply</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="text-sm font-medium truncate">{user.name || user.email}</div>
          <div className="text-xs text-white/60 truncate">{user.organizationName}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}

function MobileMenu({ pathname, user }: { pathname: string | null; user: SidebarProps["user"] }) {
  return (
    <div className="relative group">
      <button className="p-2">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="hidden group-focus-within:block absolute right-0 top-full mt-1 w-56 bg-[var(--sidebar)] rounded-lg shadow-xl border border-white/10 py-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm",
                isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="border-t border-white/10 mt-2 pt-2 px-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white py-2"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
