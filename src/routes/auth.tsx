import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { AlertCircle, CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "පිවිසෙන්න — TechMaster" }] }),
  component: Page,
});

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const SUBJECT_OPTIONS = [
  "Engineering Technology",
  "Science for Technology",
  "Bio Systems Technology",
  "ICT",
];

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed"))
    return "ඔබගේ email එක තවම verify කරලා නැහැ. Inbox එකට ගිහින් confirmation link එක click කරන්න.";
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials") ||
    lower.includes("invalid")
  )
    return "Email හෝ password වැරදියි. නැවත පරීක්ෂා කරන්න.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "මෙම email එකෙන් account එකක් දැනටමත් තියෙනවා. Login වෙන්න.";
  if (lower.includes("password"))
    return "Password එක අවම අකුරු 6කට වැඩි strong password එකක් විය යුතුයි.";
  return message;
}

function Page() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
            <img
              src="/techmaster-logo.png"
              alt="TechMaster logo"
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="mt-3 text-center text-2xl font-bold">TechMaster</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {t("Email verify කරලා ආරක්ෂිතව පිවිසෙන්න", "Login securely with email verification")}
          </p>

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
            <div className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {t(
                  "Google login remove කරලා තියෙනවා. Register වුණාට පස්සේ email inbox එකට යන confirmation link එක click කරලා පස්සේ login වෙන්න.",
                  "Google login has been removed. After registration, click the confirmation link sent to your email inbox, then log in.",
                )}
              </p>
            </div>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "login" | "register")}
            className="mt-5"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("පිවිසෙන්න", "Login")}</TabsTrigger>
              <TabsTrigger value="register">{t("ලියාපදිංචිය", "Register")}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onDone={() => navigate({ to: "/dashboard" })} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm
                onDone={(hasSession) => {
                  if (hasSession) navigate({ to: "/dashboard" });
                  else setTab("login");
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SiteLayout>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const trimmedEmail = email.trim().toLowerCase();

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg("");
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        setBusy(false);
        if (error) {
          const friendly = friendlyAuthError(error.message);
          setMsg(friendly);
          toast.error(friendly);
          return;
        }
        toast.success(t("Login සාර්ථකයි!", "Login successful!"));
        onDone();
      }}
    >
      {msg && <Notice type="error" text={msg} />}
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? t("පිවිසෙමින්...", "Logging in...") : t("පිවිසෙන්න", "Login")}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!trimmedEmail || resendBusy}
        onClick={async () => {
          setMsg("");
          setResendBusy(true);
          const { error } = await supabase.auth.resend({
            type: "signup",
            email: trimmedEmail,
            options: { emailRedirectTo: `${window.location.origin}/dashboard` },
          });
          setResendBusy(false);
          if (error) {
            const friendly = friendlyAuthError(error.message);
            setMsg(friendly);
            toast.error(friendly);
            return;
          }
          const ok = t(
            "Confirmation email එක නැවත යවා ඇත. Inbox/Spam බලන්න.",
            "Confirmation email resent. Check your Inbox/Spam.",
          );
          setMsg(ok);
          toast.success(ok);
        }}
      >
        <Send className="mr-2 h-4 w-4" />
        {resendBusy
          ? t("යවමින්...", "Sending...")
          : t("Confirmation email නැවත යවන්න", "Resend confirmation email")}
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: (hasSession: boolean) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    district: "",
    school: "",
    stream: "Technology",
    subject_1: "",
    subject_2: "",
    subject_3: "",
    phone: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedSubjects = [form.subject_1, form.subject_2, form.subject_3].filter(Boolean);
  const hasThreeSubjects = selectedSubjects.length === 3;
  const hasDuplicateSubjects = new Set(selectedSubjects).size !== selectedSubjects.length;
  const subjectCombination = [form.subject_1, form.subject_2, form.subject_3].join(", ");

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg("");
        if (!hasThreeSubjects) {
          const m = t(
            "Subject 3ම තෝරන්න. Subject 3ක් නැතුව register වෙන්න බැහැ.",
            "Please select all 3 subjects. You cannot register without 3 subjects.",
          );
          setMsg(m);
          toast.error(m);
          return;
        }
        if (hasDuplicateSubjects) {
          const m = t(
            "එකම subject එක දෙවරක් තෝරන්න බැහැ.",
            "You cannot select the same subject twice.",
          );
          setMsg(m);
          toast.error(m);
          return;
        }
        if (form.password !== form.confirm_password) {
          const m = t("Password දෙක එක සමාන නැහැ.", "Passwords do not match.");
          setMsg(m);
          toast.error(m);
          return;
        }
        setBusy(true);
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: form.full_name.trim(),
              district: form.district,
              school: form.school.trim(),
              stream: form.stream,
              subject_combination: subjectCombination,
              phone: form.phone.trim(),
            },
          },
        });
        setBusy(false);
        if (error) {
          const friendly = friendlyAuthError(error.message);
          setMsg(friendly);
          toast.error(friendly);
          return;
        }

        if (data.session) {
          toast.success(t("ලියාපදිංචිය සාර්ථකයි!", "Registration successful!"));
          onDone(true);
          return;
        }

        const verifyMsg = t(
          "ලියාපදිංචිය සාර්ථකයි. දැන් ඔබගේ email inbox/spam බලලා confirmation link එක click කරන්න. Verify කළාට පස්සේ මෙතනින් login වෙන්න.",
          "Registration successful. Check your email inbox/spam and click the confirmation link. After verification, log in here.",
        );
        setMsg(verifyMsg);
        toast.success(t("Email confirmation link එක යවා ඇත!", "Email confirmation link sent!"));
        onDone(false);
      }}
    >
      {msg && (
        <Notice
          type={msg.includes("සාර්ථකයි") || msg.includes("successful") ? "success" : "info"}
          text={msg}
        />
      )}
      <div>
        <Label>{t("සම්පූර්ණ නම", "Full name")}</Label>
        <Input
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />
      </div>
      <div>
        <Label>Password</Label>
        <Input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label>{t("Password නැවත දාන්න", "Confirm Password")}</Label>
        <Input
          type="password"
          required
          minLength={6}
          value={form.confirm_password}
          onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          autoComplete="new-password"
        />
      </div>
      <div>
        <Label>{t("දිස්ත්‍රික්කය", "District")}</Label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        >
          <option value="">{t("තෝරන්න", "Select")}</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>{t("පාසල", "School")}</Label>
        <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
      </div>
      <div className="grid gap-3">
        <Label>
          {t(
            "Subject Combination — subject 3ක් අනිවාර්යයි",
            "Subject Combination — 3 subjects required",
          )}
        </Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <SubjectSelectBox
            label={t("Subject 1", "Subject 1")}
            value={form.subject_1}
            selectedSubjects={selectedSubjects}
            onChange={(value) => setForm({ ...form, subject_1: value })}
          />
          <SubjectSelectBox
            label={t("Subject 2", "Subject 2")}
            value={form.subject_2}
            selectedSubjects={selectedSubjects}
            onChange={(value) => setForm({ ...form, subject_2: value })}
          />
          <SubjectSelectBox
            label={t("Subject 3", "Subject 3")}
            value={form.subject_3}
            selectedSubjects={selectedSubjects}
            onChange={(value) => setForm({ ...form, subject_3: value })}
          />
        </div>
        {hasDuplicateSubjects && (
          <p className="text-xs font-semibold text-red-600">
            {t("එකම subject එක දෙවරක් තෝරන්න බැහැ.", "You cannot select the same subject twice.")}
          </p>
        )}
      </div>
      <div>
        <Label>{t("Phone (optional)", "Phone (optional)")}</Label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <Button
        type="submit"
        className="w-full btn-gold"
        disabled={busy || !hasThreeSubjects || hasDuplicateSubjects}
      >
        {busy ? t("ලියාපදිංචි වෙමින්...", "Registering...") : t("ලියාපදිංචි වන්න", "Register")}
      </Button>
    </form>
  );
}

function SubjectSelectBox({
  label,
  value,
  selectedSubjects,
  onChange,
}: {
  label: string;
  value: string;
  selectedSubjects: string[];
  onChange: (value: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      <select
        required
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{t("තෝරන්න", "Select")}</option>
        {SUBJECT_OPTIONS.map((subject) => {
          const isAlreadySelected = selectedSubjects.includes(subject) && subject !== value;
          return (
            <option key={subject} value={subject} disabled={isAlreadySelected}>
              {subject}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function Notice({ type, text }: { type: "error" | "success" | "info"; text: string }) {
  const isError = type === "error";
  const isSuccess = type === "success";
  return (
    <div
      className={`rounded-lg border p-3 text-xs ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : isSuccess
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
    >
      <div className="flex gap-2">
        {isError ? (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        ) : isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <Mail className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <p>{text}</p>
      </div>
    </div>
  );
}
