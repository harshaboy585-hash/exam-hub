import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { AdSlot } from "./AdSlot";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const PUBLIC_ROUTES = new Set(["/auth", "/admin/login"]);

function AuthRequiredScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy text-white">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-navy">පිවිසීම අවශ්‍යයි</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          TechMaster website එක භාවිතා කරන්න මුලින්ම account එකක් create කරලා sign in වෙන්න.
        </p>
        <Link to="/auth" className="mt-5 inline-flex w-full">
          <Button className="w-full btn-gold">Sign in / Sign up</Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="rounded-2xl border border-border bg-card px-6 py-4 text-sm text-muted-foreground shadow-card">
        Loading account...
      </div>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const needsAuth = !isPublicRoute;

  useEffect(() => {
    if (!loading && needsAuth && !user) {
      navigate({ to: "/auth" });
    }
  }, [loading, needsAuth, user, navigate]);

  let content = children;
  if (needsAuth && loading) content = <LoadingScreen />;
  if (needsAuth && !loading && !user) content = <AuthRequiredScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="mx-auto w-full max-w-7xl px-4 py-3">
        <AdSlot label="Google AdSense — header slot" className="py-4" />
      </div>
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  );
}
