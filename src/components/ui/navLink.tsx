import { resolveBinding } from "@/lib/utils";
import clsx from "clsx";

export function NavLink({
    route,
    active,
    nav,
    className,
    activeClassName,
    inactiveClassName,
    state,
    t,
}: any) {
    const label = resolveBinding(route.label, state, t) || route.label;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        nav?.push?.(route.href);
    };

    return (
        <button
            onClick={handleClick}
            className={clsx(
                "inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200",
                active ? activeClassName : inactiveClassName,
                className
            )}
        >
            {label}
        </button>
    );
}
