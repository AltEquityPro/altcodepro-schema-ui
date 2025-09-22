import { useMemo } from "react";
import { useTranslation as useT } from "./utils";

export function useI18n(translations: Record<string, Record<string, string>> | undefined, locale = "en") {
    return useMemo(() => useT(translations || {}, locale), [translations, locale]);
}
