import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function ProfileDashboardLink({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { displayName, initials, avatarUrl } = useProfile();

  return (
    <Link
      to="/dashboard"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/10 p-1 text-sm transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30",
        mobile && "w-full justify-start gap-3 rounded-xl p-3",
      )}
      aria-label="Open dashboard"
      title="Dashboard"
    >
      <Avatar className={cn("shrink-0 border-white/30 bg-white shadow-sm", mobile ? "h-12 w-12 text-sm" : "h-14 w-14 text-sm")}>
        <AvatarImage src={avatarUrl || undefined} alt={displayName} className="object-cover" />
        <AvatarFallback className="bg-gold-cta font-bold text-navy">{initials}</AvatarFallback>
      </Avatar>
      {mobile && <span className="font-semibold">Dashboard</span>}
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const nav = [
    { to: "/", label: "Home" },
    { to: "/subjects", label: "Subjects" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/tools", label: "Tools" },
  ];

  const profileButton = user ? (
    <ProfileDashboardLink />
  ) : (
    <Link to="/auth">
      <Button variant="secondary" size="sm">Sign in</Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-navy text-navy-foreground shadow-md">
      <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="/techmaster-logo.png" alt="TechMaster logo" className="h-14 w-14 rounded-xl bg-white object-contain p-1.5 shadow-sm" />
          <span>TechMaster</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm hover:text-gold-cta transition-colors"
              activeProps={{ className: "text-gold-cta font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">{profileButton}</div>
        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/45" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[72vw] min-w-[280px] max-w-[380px] bg-navy text-navy-foreground shadow-2xl border-l border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setOpen(false)}>
                <img src="/techmaster-logo.png" alt="TechMaster logo" className="h-14 w-14 rounded-xl bg-white object-contain p-1.5 shadow-sm" />
                <span>TechMaster</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-white/10">
                <X />
              </button>
            </div>

            <div className="px-4 py-5 flex flex-col gap-4">
              {nav.map((n) => (
                <Link key={n.to} to={n.to} className="text-sm font-medium" onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              ))}
              <div className="my-1 border-t border-white/10" />
              {user ? (
                <ProfileDashboardLink mobile onClick={() => setOpen(false)} />
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
