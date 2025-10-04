// @/hooks/useClickOutside.ts
import { useEffect } from "react";
import { RefObject } from "react";

export function useClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: () => void,
    options?: boolean | AddEventListenerOptions
): void {
    useEffect(() => {
        const mouseListener = (event: MouseEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        const touchListener = (event: TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        document.addEventListener("mousedown", mouseListener, options);
        document.addEventListener("touchstart", touchListener, options);

        return () => {
            document.removeEventListener("mousedown", mouseListener, options);
            document.removeEventListener("touchstart", touchListener, options);
        };
    }, [ref, handler, options]);
}