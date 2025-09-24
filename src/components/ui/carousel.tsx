"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn, resolveBinding } from "@/src/lib/utils"
import { Button } from "./button"
import { CarouselElement, UIElement } from "@/src/types"
import { ElementResolver } from "@/src/schema/ElementResolver"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within a <Carousel />")
  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api?.off("select", onSelect)
      api?.off("reInit", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()
  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

interface CarouselRendererProps {
  element: CarouselElement
  runtime?: Record<string, any>
  state?: Record<string, any>
  t?: (key: string) => string
}

function CarouselRenderer({
  element,
  runtime = {},
  state = {},
  t = (s) => s,
}: CarouselRendererProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [slideCount, setSlideCount] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [videoDurations, setVideoDurations] = React.useState<Record<number, number>>({})
  const [paused, setPaused] = React.useState(false)

  const autoplayEnabled = !!element.autoPlay
  const globalInterval = element.interval || 5000

  const items =
    (resolveBinding(element.items, state, t) as (UIElement & { interval?: number })[]) || []

  // 🔹 Pause on swipe
  React.useEffect(() => {
    if (!api) return
    const handlePointerDown = () => setPaused(true)
    const handlePointerUp = () => setPaused(false)

    api.on("pointerDown", handlePointerDown)
    api.on("pointerUp", handlePointerUp)

    return () => {
      api.off("pointerDown", handlePointerDown)
      api.off("pointerUp", handlePointerUp)
    }
  }, [api])

  // 🔹 AutoPlay + Progress with pause
  React.useEffect(() => {
    if (!autoplayEnabled || !api || paused) return

    let start = Date.now()
    let frame: number
    let active = true

    const tick = () => {
      const currentItem = items[selectedIndex]
      const currentInterval =
        videoDurations[selectedIndex] || currentItem?.interval || globalInterval
      const elapsed = Date.now() - start
      const ratio = Math.min(elapsed / currentInterval, 1)

      setProgress(ratio * 100)

      if (ratio >= 1) {
        api.scrollNext()
        start = Date.now()
        setProgress(0)
      }

      if (active) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      active = false
      cancelAnimationFrame(frame)
    }
  }, [api, autoplayEnabled, paused, selectedIndex, globalInterval, items, videoDurations])

  // 🔹 Track slide index
  React.useEffect(() => {
    if (!api) return
    const update = () => {
      setSelectedIndex(api.selectedScrollSnap())
      setSlideCount(api.scrollSnapList().length)
      setProgress(0)
    }
    update()
    api.on("select", update)
    api.on("reInit", update)
    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  const handleVideoMetadata = (i: number, duration: number) => {
    setVideoDurations((prev) => ({ ...prev, [i]: duration * 1000 }))
  }

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <Carousel
        setApi={setApi}
        orientation={element.orientation || "horizontal"}
        opts={{ loop: element.loop }}
      >
        <CarouselContent>
          {items.map((item, i) => (
            <CarouselItem key={i} className="flex justify-center">
              {item.type === "video" ? (
                <video
                  src={resolveBinding((item as any).src, runtime.state, runtime.t)}
                  onLoadedMetadata={(e) =>
                    handleVideoMetadata(i, (e.currentTarget as HTMLVideoElement).duration)
                  }
                  controls
                  className="max-h-[500px] rounded-lg"
                />
              ) : item.type === "image" ? (
                <img
                  src={resolveBinding((item as any).src, runtime.state, runtime.t)}
                  alt={resolveBinding((item as any).alt, runtime.state, runtime.t)}
                  className="max-h-[500px] rounded-lg object-contain"
                />
              ) : (
                <ElementResolver element={item} runtime={runtime} />
              )}
            </CarouselItem>
          ))}
        </CarouselContent>

        {element.showControls !== false && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>

      {/* Dots */}
      {element.showIndicators && slideCount > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i === selectedIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/40 hover:bg-muted-foreground/70"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress */}
      {element.showProgress && autoplayEnabled && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-muted-foreground/20">
          <div
            className="h-1 bg-primary transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export {
  CarouselRenderer,
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
