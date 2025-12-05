import clsx from "clsx";

export function BrandBlock({ brand, placement }: any) {
    if (!brand) return null;

    const isCompact = placement === "bottom" || placement === "drawer";

    return (
        <a
            href={brand.href || "/"}
            className={clsx(
                "flex items-center gap-3 ",
                isCompact
                    ? "px-3 py-2 justify-center mb-2"
                    : "px-4 py-3 mr-2"
            )}
        >
            {brand.logoUrl && (
                <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className={clsx(
                        isCompact ? "h-6" : "h-8",
                        "w-auto object-contain"
                    )}
                />
            )}

            {!isCompact && brand.name && (
                <span className="font-semibold text-lg">{brand.name}</span>
            )}
        </a>
    );
}
