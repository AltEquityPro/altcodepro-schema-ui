'use client';

import React, { useState } from "react";
import { resolveBinding } from "../../lib/utils";
import { DynamicIcon } from "./dynamic-icon";
import { X, Share2, Copy, Check } from "lucide-react";
import { ShareElement } from "../../types";

interface ShareRendererProps {
    element: ShareElement;
    state: any;
    t: (key: string) => string;
    runEventHandler?: any;
}

export function ShareRenderer({ element, state, t, runEventHandler }: ShareRendererProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const title = resolveBinding(element.title || document.title, state, t);
    const text = resolveBinding(element.text || "Check this out!", state, t);
    const url = resolveBinding(element.url || (typeof window !== "undefined" ? window.location.href : ""), state, t);

    const shareData = { title, text, url };
    const canNativeShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare?.(shareData);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            runEventHandler?.({
                action: "toast",
                params: { msg: t("Link copied!"), variant: "success" }
            });
        } catch {
            runEventHandler?.({
                action: "toast",
                params: { msg: t("Failed to copy"), variant: "error" }
            });
        }
    };

    const openNativeShare = async () => {
        try {
            await navigator.share(shareData);
            setIsOpen(false);
        } catch (err: any) {
            if (err.name !== "AbortError") console.error("Share failed:", err);
        }
    };

    // Official brand colors — only icons are hardcoded
    const socialShares = [
        { name: "WhatsApp", icon: "message-circle", color: "text-[#25D366]" },
        { name: "X (Twitter)", icon: "twitter", color: "text-[#000000] dark:text-[#FFFFFF]" },
        { name: "Facebook", icon: "facebook", color: "text-[#1877F2]" },
        { name: "LinkedIn", icon: "linkedin", color: "text-[#0A66C2]" },
        { name: "Telegram", icon: "send", color: "text-[#229ED9]" },
        { name: "Email", icon: "mail", color: "text-muted-foreground" },
        { name: "Pinterest", icon: "message-square-heart", color: "text-[#E60023]" },
        { name: "Instagram", icon: "instagram", color: "text-[#E4405F]" },
    ];

    const socialUrls: Record<string, string> = {
        "WhatsApp": `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
        "X (Twitter)": `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        "Facebook": `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        "LinkedIn": `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        "Telegram": `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        "Email": `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
        "Pinterest": `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
        "Instagram": "instagram://app",
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${element.variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          ${element.variant === "outline" || !element.variant ? "border border-border bg-background hover:bg-muted/50" : ""}
          ${element.variant === "ghost" ? "bg-transparent hover:bg-muted/50" : ""}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 
          ${element.styles?.className}
        `}
            >
                {element.icon && <DynamicIcon name={element.icon.name} className="w-5 h-5" />}
                {!element.icon && <span>{resolveBinding(element.label || "Share", state, t)}</span>}
            </button>

            {/* Bottom Sheet */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-9999 flex flex-col justify-end  backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="relative w-full max-w-lg mx-auto bg-background border-t border-border rounded-t-3xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header + Close Button */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">{t("Share")}</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                                aria-label={t("Close")}
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Handle */}
                        <div className="flex justify-center py-3">
                            <div className="w-12 h-1 bg-muted rounded-full" />
                        </div>

                        <div className="px-6 pb-8 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Native Share */}
                            {canNativeShare && (
                                <button
                                    onClick={openNativeShare}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-md"
                                >
                                    <Share2 className="w-5 h-5" />
                                    {t("Share with apps...")}
                                </button>
                            )}

                            {/* Copy Link */}
                            <button
                                onClick={copyToClipboard}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Copy className="w-5 h-5 text-muted-foreground" />
                                )}
                                <span className="font-medium text-foreground">
                                    {copied ? t("Copied!") : t("Copy Link")}
                                </span>
                            </button>

                            {/* Social Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {socialShares.map((social) => (
                                    <a
                                        key={social.name}
                                        href={socialUrls[social.name]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted transition-all group"
                                        onClick={(e) => {
                                            if (social.name === "Instagram") {
                                                e.preventDefault();
                                                window.open(socialUrls["Instagram"], "_blank");
                                            }
                                            setIsOpen(false);
                                        }}
                                    >
                                        <DynamicIcon
                                            name={social.icon}
                                            className={`w-8 h-8 ${social.color} group-hover:scale-110 transition-transform`}
                                        />
                                        <span className="text-xs text-muted-foreground text-center">
                                            {social.name.replace(" (Twitter)", "")}
                                        </span>
                                    </a>
                                ))}
                            </div>

                            {/* URL Preview */}
                            <div className="p-4 bg-muted/20 rounded-xl border border-border">
                                <p className="text-sm text-muted-foreground break-all font-mono text-center">
                                    {url}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}