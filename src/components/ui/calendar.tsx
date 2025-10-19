"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn, resolveBinding, variants } from "../../lib/utils"
import { Button } from "./button"
import {
  AnyObj,
  CalendarElement,
  CalendarEventElement,
  EventHandler,
} from "../../types"

/** ---------------------------
 * Calendar wrapper (DayPicker)
 * --------------------------- */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background text-foreground group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          variants({ variant: buttonVariant as any }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          variants({ variant: buttonVariant as any }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[1px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  )
}

/** ---------------------------
 * Custom Day Button with dot
 * --------------------------- */
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const eventColor = (props as any)["data-event-color"]

  return (
    <Button
      variant="ghost"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square w-full font-normal leading-none relative",
        "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      {day.date.getDate()}
      {modifiers.custom && (
        <span
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: eventColor || "var(--primary)" }}
        />
      )}
    </Button>
  )
}

/** ---------------------------
 * Calendar Renderer
 * --------------------------- */
interface CalendarRendererProps {
  element: CalendarElement
  state: AnyObj
  t: (key: string) => string
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

function CalendarRenderer({
  element,
  state,
  t,
  runEventHandler,
}: CalendarRendererProps) {
  const selectedDate = React.useMemo(() => {
    if (!element.selectedDate) return undefined
    const raw = resolveBinding(element.selectedDate, state, t)
    const d = raw ? new Date(raw) : undefined
    return d && !isNaN(d.getTime()) ? d : undefined
  }, [element.selectedDate, state, t])

  const parseDate = React.useCallback(
    (val: any) => {
      const resolved = resolveBinding(val, state, t)
      const d = resolved ? new Date(resolved) : null
      return d && !isNaN(d.getTime()) ? d : null
    },
    [state, t]
  )

  // safer color resolution: prefer explicit event.dotColor (if you add it),
  // else try styles.background.type === 'color' -> value, else fallback to CSS var
  const resolveEventColor = (evt: CalendarEventElement): string => {
    const anyEvt = evt as AnyObj
    const explicit = anyEvt.dotColor ? resolveBinding(anyEvt.dotColor, state, t) : null
    if (explicit) return String(explicit)

    const bg = evt.styles?.background
    if (bg && (bg as AnyObj).type === "color") {
      const v = (bg as AnyObj).value ? resolveBinding((bg as AnyObj).value, state, t) : null
      if (v) return String(v)
    }
    return "var(--primary)"
  }

  const events = React.useMemo(() => {
    return (element.events || []).map((evt: any) => {
      const start = parseDate(evt.start)
      const end = parseDate(evt.end)
      return {
        ...evt,
        title: resolveBinding(evt.title, state, t),
        start,
        end,
        location: evt.location ? resolveBinding(evt.location, state, t) : undefined,
        description: evt.description ? resolveBinding(evt.description, state, t) : undefined,
        btnLabel: evt.eventBtnLabel ? resolveBinding(evt.eventBtnLabel, state, t) : undefined,
        color: resolveEventColor(evt as CalendarEventElement),
        allDay: !!evt.allDay,
      }
    }).filter(e => !!e.start) // keep valid starts only
  }, [element.events, parseDate, state, t])

  // Build day → color map; cover full ranges (start → end), not just start day
  const dayEventColors = React.useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}

    const addRange = (start: Date, end: Date, color: string) => {
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const e = end
        ? new Date(end.getFullYear(), end.getMonth(), end.getDate())
        : new Date(start.getFullYear(), start.getMonth(), start.getDate())

      // Ensure e >= s
      const last = e >= s ? e : s
      for (
        let d = new Date(s.getTime());
        d <= last;
        d.setDate(d.getDate() + 1)
      ) {
        const key = d.toDateString()
        // prefer first color; if you want "last wins", replace with unconditional set
        if (!map[key]) map[key] = color
      }
    }

    events.forEach(e => {
      if (!e.start) return
      addRange(e.start, e.end || e.start, e.color)
    })
    return map
  }, [events])

  return (
    <div className="w-full">
      <Calendar
        mode={(element.selectionMode || "single") as any}
        selected={selectedDate}
        onSelect={(date: any) => element.onSelect && runEventHandler?.(element.onSelect, { date })}
        modifiers={{
          custom: (day: Date) => !!dayEventColors[day.toDateString()],
        }}
        components={{
          DayButton: (props) => (
            <CalendarDayButton
              {...props}
              data-event-color={dayEventColors[props.day.date.toDateString()]}
            />
          ),
        }}
      />

      {events.length > 0 && (
        <div className="mt-4 space-y-3">
          {events?.map((e) => (
            <div
              key={e.id}
              className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent/50 transition"
              role="button"
              tabIndex={0}
              onClick={() => e.onClick && runEventHandler?.(e.onClick, { id: e.id })}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  e.onClick && runEventHandler?.(e.onClick, { id: e.id })
                }
              }}
            >
              <div className="flex flex-col gap-1">
                <h4 className="font-medium leading-none">{e.title}</h4>
                <div className="text-xs text-muted-foreground">
                  {e.allDay
                    ? "All day"
                    : e.start && e.end
                      ? `${e.start.toLocaleString()} → ${e.end.toLocaleString()}`
                      : e.start
                        ? e.start.toLocaleString()
                        : null}
                </div>
                {e.location && <div className="text-xs text-muted-foreground">{e.location}</div>}
                {e.description && <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>}
              </div>
              {e.onClick && e.btnLabel && (
                <Button
                  variant="ghost"
                  className="mt-2"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    runEventHandler?.(e.onClick, { id: e.id })
                  }}
                >
                  {e.btnLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { CalendarRenderer, Calendar, CalendarDayButton }
