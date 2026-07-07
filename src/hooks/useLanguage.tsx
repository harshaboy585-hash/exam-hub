import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "si" | "en";

type LanguageCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (si: string, en: string) => string;
};

const Ctx = createContext<LanguageCtx>({
  lang: "si",
  setLang: () => {},
  toggleLang: () => {},
  t: (si) => si,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "si";
    return (localStorage.getItem("altech_lang") as Lang | null) || "si";
  });

  const setLang = (next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") localStorage.setItem("altech_lang", next);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "si" ? "si" : "en";
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang(lang === "si" ? "en" : "si"),
      t: (si: string, en: string) => (lang === "si" ? si : en),
    }),
    [lang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLanguage = () => useContext(Ctx);
