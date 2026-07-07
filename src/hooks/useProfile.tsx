import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type ProfileContextValue = {
  profile: Profile | null;
  loadingProfile: boolean;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  refreshProfile: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
};

const ProfileCtx = createContext<ProfileContextValue | null>(null);

function makeInitials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "Student").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function fallbackNameFromEmail(email?: string | null) {
  return email?.split("@")[0] || "Student";
}

function normalizeAvatarUrl(url?: string | null) {
  if (!url) return null;
  const clean = url.trim();
  return clean.length ? clean : null;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    setLoadingProfile(true);
    const fallbackFullName = user.user_metadata?.full_name || fallbackNameFromEmail(user.email);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const row = {
          id: user.id,
          full_name: fallbackFullName,
          email: user.email ?? null,
          avatar_url: null,
        };
        const { data: inserted } = await supabase
          .from("profiles")
          .upsert(row, { onConflict: "id" })
          .select("id, full_name, email, avatar_url")
          .maybeSingle();
        setProfile((inserted as Profile | null) ?? row);
        return;
      }

      setProfile({
        id: user.id,
        full_name: (data as Profile).full_name || fallbackFullName,
        email: (data as Profile).email || user.email || null,
        avatar_url: normalizeAvatarUrl((data as Profile).avatar_url),
      });
    } catch (error) {
      console.error("Profile load failed", error);
      setProfile({
        id: user.id,
        full_name: fallbackFullName,
        email: user.email ?? null,
        avatar_url: null,
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    const refresh = () => void refreshProfile();
    window.addEventListener("techmaster-profile-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("techmaster-profile-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refreshProfile]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Please sign in first.");
      if (!file.type.startsWith("image/")) throw new Error("Image file එකක් තෝරන්න.");

      const safeExt = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${user.id}/profile-${Date.now()}.${safeExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      const fallbackFullName = profile?.full_name || user.user_metadata?.full_name || fallbackNameFromEmail(user.email);

      const { data: savedProfile, error: saveError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fallbackFullName,
            email: user.email ?? null,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select("id, full_name, email, avatar_url")
        .maybeSingle();

      if (saveError) throw saveError;

      const nextProfile = (savedProfile as Profile | null) ?? {
        id: user.id,
        full_name: fallbackFullName,
        email: user.email ?? null,
        avatar_url: publicUrl,
      };

      setProfile({ ...nextProfile, avatar_url: publicUrl });
      window.dispatchEvent(new Event("techmaster-profile-updated"));
      return publicUrl;
    },
    [profile?.full_name, user],
  );

  const removeAvatar = useCallback(async () => {
    if (!user) throw new Error("Please sign in first.");
    const fallbackFullName = profile?.full_name || user.user_metadata?.full_name || fallbackNameFromEmail(user.email);

    const { data: savedProfile, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fallbackFullName,
          email: user.email ?? null,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("id, full_name, email, avatar_url")
      .maybeSingle();

    if (error) throw error;
    setProfile((savedProfile as Profile | null) ?? { id: user.id, full_name: fallbackFullName, email: user.email ?? null, avatar_url: null });
    window.dispatchEvent(new Event("techmaster-profile-updated"));
  }, [profile?.full_name, user]);

  const displayName = profile?.full_name?.trim() || user?.user_metadata?.full_name || fallbackNameFromEmail(user?.email);
  const initials = makeInitials(displayName, user?.email ?? null);
  const avatarUrl = normalizeAvatarUrl(profile?.avatar_url);

  const value = useMemo(
    () => ({ profile, loadingProfile, displayName, initials, avatarUrl, refreshProfile, uploadAvatar, removeAvatar }),
    [profile, loadingProfile, displayName, initials, avatarUrl, refreshProfile, uploadAvatar, removeAvatar],
  );

  return <ProfileCtx.Provider value={value}>{children}</ProfileCtx.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
