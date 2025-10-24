import { useMemo } from "react";
export function useT(translations: Record<string, Record<string, string>>, locale: string) {
    return (key: string) => translations[locale]?.[key] ?? key;
}

export function useI18n(translations: Record<string, Record<string, string>> | undefined, locale = "en") {
    return useMemo(() => useT(translations || {}, locale), [translations, locale]);
}
