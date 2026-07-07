import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Eye, ImagePlus, LogOut, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  mode?: "navbar" | "dashboard" | "mobile";
  showDashboardLink?: boolean;
  showSignOut?: boolean;
};

export function ProfileMenu({ mode = "navbar", showDashboardLink = true, showSignOut = false }: ProfileMenuProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { signOut } = useAuth();
  const { displayName, initials, avatarUrl, uploadAvatar, removeAvatar } = useProfile();

  const avatarSize = mode === "dashboard" ? "h-28 w-28 border-4 text-3xl md:h-32 md:w-32" : mode === "mobile" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";

  async function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      toast.info("Profile image upload වෙමින් පවතී...");
      await uploadAvatar(file);
      toast.success("Profile image update වුණා.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Profile image upload කිරීමට නොහැකි විය");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    try {
      await removeAvatar();
      toast.success("Profile image remove වුණා.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Profile image remove කිරීමට නොහැකි විය");
    }
  }

  const avatar = (
    <Avatar className={cn("shrink-0 border-white/30 bg-white shadow-sm", avatarSize)}>
      <AvatarImage src={avatarUrl || undefined} alt={displayName} className="object-cover" />
      <AvatarFallback className="bg-gold-cta font-bold text-navy">{initials}</AvatarFallback>
    </Avatar>
  );

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {mode === "dashboard" ? (
            <button className="rounded-full focus:outline-none focus:ring-4 focus:ring-gold-cta/30" aria-label="Profile menu">
              {avatar}
            </button>
          ) : (
            <button
              className={cn(
                "flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 pr-3 text-sm transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30",
                mode === "mobile" && "w-full justify-start rounded-xl p-3",
              )}
              aria-label="Profile menu"
            >
              {avatar}
              <span className="font-semibold">Hello {displayName}</span>
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <UserRound className="h-4 w-4" /> Hello {displayName}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showDashboardLink && (
            <DropdownMenuItem asChild>
              <Link to="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
          )}
          {avatarUrl ? (
            <>
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" /> View image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => inputRef.current?.click()} disabled={uploading}>
                <Camera className="mr-2 h-4 w-4" /> Change image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemoveAvatar} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Remove image
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => inputRef.current?.click()} disabled={uploading}>
              <ImagePlus className="mr-2 h-4 w-4" /> Upload image
            </DropdownMenuItem>
          )}
          {showSignOut && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  const ok = window.confirm("Do you want to sign out?\n\nPress OK to sign out or Cancel to stay signed in.");
                  if (ok) void signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profile image</DialogTitle>
          </DialogHeader>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="max-h-[70vh] w-full rounded-2xl object-contain" />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SignOutIconButton() {
  const { signOut } = useAuth();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="secondary" size="icon" aria-label="Sign out" title="Sign out" className="h-10 w-10 rounded-xl">
          <LogOut className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-sm rounded-2xl border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to sign out of your account. You will need to sign in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => void signOut()} className="bg-navy text-white hover:bg-navy/90">
            OK, Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
