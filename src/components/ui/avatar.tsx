import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn, resolveBinding } from "@/src/lib/utils"
import { useAppState } from "@/src/schema/StateContext"
import { AvatarElement } from "@/src/types"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}
function getInitials(text: string): string {
  if (!text) return "?"
  const parts = text.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function stringToGradient(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h1 = hash % 360
  const h2 = (hash * 37) % 360
  return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 70%, 50%))`
}

// Animated gradient CSS class
const animatedGradientClass =
  "bg-[linear-gradient(270deg,#ff6ec4,#7873f5,#4ade80,#facc15)] bg-[length:600%_600%] animate-[gradientShift_8s_ease_infinite]"

// Add global keyframes (can go in globals.css)
// @keyframes gradientShift {
//   0% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }

function AvatarRenderer({ element }: { element: AvatarElement }) {
  const { state, t } = useAppState()

  const src = resolveBinding(element.src, state, t)
  const alt = resolveBinding(element.alt, state, t)
  const fallback = resolveBinding(element.fallback, state, t)
  const status = resolveBinding(element.onlineStatus, state, t)

  const sizeClass =
    typeof element.size === "number"
      ? `w-[${element.size}px] h-[${element.size}px]`
      : element.size || "size-8"

  const shapeClass =
    element.shape === "square"
      ? "rounded-none"
      : element.shape === "rounded"
        ? "rounded-md"
        : "rounded-full"

  const ringClass = element.showRing
    ? "ring-2 ring-primary ring-offset-1"
    : ""

  const statusColor =
    status === true || status === "online"
      ? "bg-emerald-500"
      : status === "away"
        ? "bg-yellow-500"
        : status === false || status === "offline"
          ? "bg-gray-400"
          : ""

  const fallbackText = fallback || getInitials(alt || "") || "?"

  // If generation is set, enable animated gradient
  const isAnimated = Boolean(element.generation)
  const gradientBg = isAnimated
    ? undefined
    : stringToGradient(alt || fallbackText || "avatar")

  return (
    <div className="relative inline-flex">
      <Avatar
        className={cn(sizeClass, shapeClass, ringClass, "overflow-hidden")}
      >
        {src ? (
          <AvatarImage src={src} alt={alt || ""} />
        ) : (
          <AvatarFallback
            className={cn(
              "flex items-center justify-center font-semibold text-white",
              shapeClass,
              isAnimated ? animatedGradientClass : ""
            )}
            style={!isAnimated ? { backgroundImage: gradientBg } : undefined}
          >
            {fallbackText}
          </AvatarFallback>
        )}
      </Avatar>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block size-2.5 rounded-full ring-2 ring-background",
            statusColor
          )}
        />
      )}
    </div>
  )
}
export { AvatarRenderer, Avatar, AvatarImage, AvatarFallback }
