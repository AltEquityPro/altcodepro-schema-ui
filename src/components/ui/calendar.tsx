"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn, resolveBinding } from "@/src/lib/utils"
import { Button, buttonVariants } from "./button"
import {
  AnyObj,
  CalendarElement,
  CalendarEventElement,
  EventHandler,
} from "@/src/types"

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
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
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
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
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
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
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
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
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
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(className)}
            {...props}
          />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          }
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

  // read custom event color from dataset
  const eventColor = (props as any)["data-event-color"]

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={
        cn(
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
        ></span>
      )}
    </Button>
  )
}

interface CalendarRendererProps {
  element: CalendarElement
  state: AnyObj
  t: (key: string) => string
  runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

function CalendarRenderer({
  element,
  state,
  t,
  runEventHandler,
}: CalendarRendererProps) {
  const selectedDate = element.selectedDate
    ? new Date(resolveBinding(element.selectedDate, state, t))
    : undefined

  const parseDate = (val: any) => {
    const resolved = resolveBinding(val, state, t)
    const d = resolved ? new Date(resolved) : null
    return d && !isNaN(d.getTime()) ? d : null
  }

  const events = element.events.map((event) => ({
    ...event,
    title: resolveBinding(event.title, state, t),
    start: parseDate(event.start),
    end: parseDate(event.end),
    location: event.location ? resolveBinding(event.location, state, t) : undefined,
    description: event.description
      ? resolveBinding(event.description, state, t)
      : undefined,
    btnLabel: event.eventBtnLabel
      ? resolveBinding(event.eventBtnLabel, state, t)
      : undefined,
    color: event.styles?.background || "#0ea5e9",
  }))

  // map days to colors
  const dayEventColors: Record<string, string> = {}
  events.forEach((e: any) => {
    if (e.start) {
      dayEventColors[e.start.toDateString()] = e.color
    }
  })

  return (
    <div className="w-full">
      <Calendar
        mode={(element.selectionMode || "single") as any}
        selected={selectedDate}
        onSelect={(date: any) =>
          element.onSelect && runEventHandler(element.onSelect, { date })
        }
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
          {events.map((e) => (
            <div
              key={e.id}
              className="rounded-md border bg-card p-3 shadow-sm hover:bg-accent/50 transition"
              role="button"
              tabIndex={0}
              onClick={() => e.onClick && runEventHandler(e.onClick, { id: e.id })}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  e.onClick && runEventHandler(e.onClick, { id: e.id })
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
                      : null}
                </div>
                {e.location && (
                  <div className="text-xs text-muted-foreground">{e.location}</div>
                )}
                {e.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                )}
              </div>
              {e.onClick && e.btnLabel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    runEventHandler(e.onClick, { id: e.id })
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
