"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { AnyObj, CommandElement, EventHandler } from "../../types"
import { RenderChildren } from "../../schema/RenderChildren"
import { DynamicIcon } from "./dynamic-icon"

/* ------------------------------------------------------------------
 * Base Command Wrapper
 * ------------------------------------------------------------------*/
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------
 * Command Dialog with keyboard + mobile shortcuts
 * ------------------------------------------------------------------*/
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  global = false,
  showMobileButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  global?: boolean
  showMobileButton?: boolean
}) {
  const [open, setOpen] = React.useState(false)

  // Keyboard shortcut ⌘K / Ctrl+K
  React.useEffect(() => {
    if (!global) return
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [global])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} {...props}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogContent
          className={cn("overflow-hidden p-0", className)}
          showCloseButton={showCloseButton}
        >
          <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3">
            {children}
          </Command>
        </DialogContent>
      </Dialog>

      {/* Mobile Floating Action Button */}
      {showMobileButton && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-accent p-3 shadow-lg lg:hidden"
          aria-label="Open Command Palette"
        >
          <SearchIcon className="size-6 text-accent-foreground" />
        </button>
      )}
    </>
  )
}

/* ------------------------------------------------------------------
 * Building blocks
 * ------------------------------------------------------------------*/
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList(props: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className="max-h-[300px] scroll-py-1 overflow-y-auto"
      {...props}
    />
  )
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup(props: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className="text-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
      {...props}
    />
  )
}

function CommandSeparator(props: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className="bg-border -mx-1 h-px"
      {...props}
    />
  )
}

function CommandItem(props: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:opacity-50"
      {...props}
    />
  )
}

function CommandShortcut(props: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className="text-muted-foreground ml-auto text-xs tracking-widest"
      {...props}
    />
  )
}

/* ------------------------------------------------------------------
 * Renderer from schema
 * ------------------------------------------------------------------*/
function CommandRenderer({
  element,
  runEventHandler,
  state,
  setState,
  t
}: {
  state: AnyObj,
  t: (key: string) => string,
  setState: (path: string, value: any) => void;
  element: CommandElement
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}) {
  const {
    placeholder = "Search…",
    emptyMessage = "No results found.",
    groups = [],
    children,
    title = "Command Palette",
    description = "Search for a command to run…",
    global = false,
    showMobileButton = false,
  } = element

  const [open, setOpen] = React.useState(false)

  // ⌘K / Ctrl+K shortcut
  React.useEffect(() => {
    if (!global) return
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [global])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogContent
          showCloseButton
          className="overflow-hidden p-0"
        >
          <CommandPrimitive
            data-slot="command"
            className={cn(
              "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
            )}
          >
            {/* Input */}
            <div
              data-slot="command-input-wrapper"
              className="flex h-9 items-center gap-2 border-b px-3"
            >
              <SearchIcon className="size-4 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                placeholder={placeholder}
                data-slot="command-input"
                className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* List */}
            <CommandPrimitive.List
              data-slot="command-list"
              className="max-h-[300px] scroll-py-1 overflow-y-auto"
            >
              <CommandPrimitive.Empty
                data-slot="command-empty"
                className="py-6 text-center text-sm"
              >
                {emptyMessage}
              </CommandPrimitive.Empty>

              {groups?.map((group, i) => (
                <CommandPrimitive.Group
                  key={i}
                  heading={group.heading}
                  data-slot="command-group"
                  className="text-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium"
                >
                  {group?.items?.map(item => (
                    <CommandPrimitive.Item
                      key={item.id}
                      disabled={item.disabled}
                      onSelect={() => runEventHandler?.(item.onSelect)}
                      data-slot="command-item"
                      className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:opacity-50"
                    >
                      {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
                      {item.label}
                      {item.shortcut && (
                        <span
                          data-slot="command-shortcut"
                          className="text-muted-foreground ml-auto text-xs tracking-widest"
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              ))}

              {children && <RenderChildren children={children} state={state} setState={setState} t={t} />}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </DialogContent>
      </Dialog>

      {/* Mobile Floating Button */}
      {showMobileButton && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-accent p-3 shadow-lg lg:hidden"
          aria-label="Open Command Palette"
        >
          <SearchIcon className="size-6 text-accent-foreground" />
        </button>
      )}
    </>
  )
}

export {
  CommandRenderer,
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
