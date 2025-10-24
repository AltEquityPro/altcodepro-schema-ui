import { AnyObj, IRoute, NavigationAPI } from "../../types";
import { resolveBinding } from "../../lib/utils";
import clsx from "clsx";
import { DynamicIcon } from "./dynamic-icon";

export function NavLink({
    route,
    active,
    nav,
    pathname,
    className,
    activeClassName,
    inactiveClassName,
    state,
    t,
}: {
    route: IRoute;
    active: boolean;
    pathname: string;
    nav?: NavigationAPI;
    className: string;
    activeClassName: string;
    inactiveClassName: string;
    state: AnyObj;
    t: (key: string) => string
}) {
    const label = resolveBinding(route.label, state, t) || route.label;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (nav && nav.push) {
            nav.push(route.href);
        } else {
            window.location.href = route.href;
        }
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
            {route.icon && <DynamicIcon name={route.icon} />}  {label}
        </button>
    );
}
