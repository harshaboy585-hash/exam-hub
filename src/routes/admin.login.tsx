import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — TechMaster" }] }),
  component: AdminLoginPage,
});

async function isAdmin(userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).some((row) => row.role === "admin");
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (loading || !user) return;
    isAdmin(user.id)
      .then((ok) => {
        if (ok) navigate({ to: "/admin" });
      })
      .catch(() => null);
  }, [user, loading, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Login failed.");
      const ok = await isAdmin(userId);
      if (!ok) {
        setMessage("මෙම account එකට admin access නැහැ. Supabase user_roles table එකේ admin role එක add කරන්න.");
        toast.error("Admin access අවශ්‍යයි.");
        return;
      }
      toast.success("Admin login successful!");
      navigate({ to: "/admin" });
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text.toLowerCase().includes("email not confirmed") ? "Email verify කරලා නැහැ. Inbox එකේ confirmation link එක click කරන්න." : text);
      toast.error("Admin login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold">TechMaster Admin Login</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Admin panel එකට යන්න admin role තියෙන account එකෙන් login වෙන්න.
          </p>
          {message && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <Label>Admin Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full btn-gold" disabled={busy}>
              <LockKeyhole className="mr-2 h-4 w-4" /> {busy ? "Checking..." : "Admin Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/auth" className="text-navy font-semibold hover:underline">Student login page</Link>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
