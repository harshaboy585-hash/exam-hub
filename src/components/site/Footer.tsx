import { Mail, MessageCircle, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-3">
        <a
          href="https://toolcorex.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-2xl transition-opacity hover:opacity-90 md:justify-self-start"
          aria-label="Powered by ToolCoreX"
        >
          <img
            src="/toolcorex-logo.png"
            alt="ToolCoreX logo"
            className="h-11 w-11 rounded-full object-contain shadow-sm"
          />
          <div className="leading-tight text-left">
            <div className="text-[11px] opacity-75">Powered by</div>
            <div className="text-base font-bold">ToolCoreX</div>
          </div>
        </a>

        <p className="text-center text-xs text-white/75 md:justify-self-center">
          © 2026 TechMaster Solution. All Rights Reserved.
        </p>

        <div className="flex items-center justify-center gap-3 md:justify-self-end">
          <a
            href="https://www.youtube.com/@toolcorex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:bg-white/15"
            aria-label="ToolCoreX YouTube"
          >
            <Youtube className="h-4 w-4" />
          </a>
          <a
            href="https://wa.me/94743255234"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:bg-white/15"
            aria-label="WhatsApp +94743255234"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href="mailto:toolcorex1@gmail.com"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:bg-white/15"
            aria-label="Email toolcorex1@gmail.com"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
