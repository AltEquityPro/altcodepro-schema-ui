"use client";
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn, resolveBinding } from "../../lib/utils"
import wrapWithMotion from "./wrapWithMotion"
import { RenderChildren } from "../../schema/RenderChildren"
import { AnyObj, DropdownElement, DropdownItem, EventHandler } from "../../types"
import { DynamicIcon } from "./dynamic-icon"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "z-[9999] min-w-[10rem] overflow-hidden rounded-lg bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]",
          "shadow-lg ring-1 ring-[var(--acp-border)] ring-opacity-20",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "max-h-[var(--radix-dropdown-menu-content-available-height)] origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-y-auto p-1",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  sideOffset = 6,
  alignOffset = -4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      {...props}
      data-slot="dropdown-menu-sub-content"
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      className={cn(
        "z-[9999] min-w-[10rem] rounded-lg bg-[var(--acp-background)] dark:bg-[var(--acp-background-dark)] text-[var(--acp-foreground)] dark:text-[var(--acp-foreground-dark)]",
        "shadow-lg ring-1 ring-[var(--acp-border)] ring-opacity-20 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        "origin-[var(--radix-dropdown-menu-content-transform-origin)] overflow-hidden p-1",
        className
      )}
    />
  )
}

function renderDropdownItems(
  items: DropdownItem[],
  state: AnyObj,
  t: (key: string) => string,
  runEventHandler?: (h?: EventHandler, dataOverride?: AnyObj) => Promise<void>,
): React.ReactNode {
  const groups = items?.reduce<Record<string, DropdownItem[]>>((acc, item) => {
    if (item.type === "radio" && item.group) {
      acc[item.group] = acc[item.group] || []
      acc[item.group].push(item)
    }
    return acc
  }, {})

  return items?.map((item) => {
    const label = item.label ? resolveBinding(item.label, state, t) : null
    const heading = item.heading ? resolveBinding(item.heading, state, t) : null

    switch (item.type) {
      case "separator":
        return <DropdownMenuSeparator key={item.id} />

      case "label":
        return (
          <DropdownMenuLabel key={item.id}>
            {label}
          </DropdownMenuLabel>
        )

      case "group":
        return (
          <DropdownMenuGroup key={item.id}>
            {heading && (
              <DropdownMenuLabel inset>{heading}</DropdownMenuLabel>
            )}
            {item.children &&
              renderDropdownItems(item.children, state, t, runEventHandler)}
          </DropdownMenuGroup>
        )

      case "checkbox": {
        const checked = resolveBinding(item.checked, state, t) ?? false
        return (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={checked}
            disabled={item.disabled}
            onCheckedChange={(val) =>
              runEventHandler?.(item.onSelect, { checked: val })
            }
          >
            {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
            {label}
            {item.shortcut && (
              <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
            )}
          </DropdownMenuCheckboxItem>
        )
      }

      case "radio": {
        if (!item.group || groups[item.group][0].id !== item.id) return null
        return (
          <DropdownMenuRadioGroup
            key={item.group}
            value={
              groups[item.group].find((r) =>
                resolveBinding(r.checked, state, t)
              )?.value
            }
            onValueChange={(val) => {
              const selected = item.group ? groups[item.group].find((r) => r.value === val) : null
              if (selected?.onSelect) runEventHandler?.(selected.onSelect)
            }}
          >
            {groups[item.group]?.map((radio) => (
              <DropdownMenuRadioItem
                key={radio.id}
                value={radio.value || ""}
                disabled={radio.disabled}
              >
                {radio.icon && (
                  <DynamicIcon name={radio.icon} className="size-4" />
                )}
                {resolveBinding(radio.label, state, t)}
                {radio.shortcut && (
                  <DropdownMenuShortcut>{radio.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )
      }

      case "submenu":
        return (
          <DropdownMenuSub key={item.id}>
            <DropdownMenuSubTrigger inset>
              {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
              {label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {item.children &&
                renderDropdownItems(item.children, state, t, runEventHandler)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )

      case "item":
      default:
        return (
          <DropdownMenuItem
            key={item.id}
            disabled={item.disabled}
            onSelect={() =>
              item.onSelect ? runEventHandler?.(item.onSelect) : undefined
            }
            className={item.variant === "destructive" ? "text-red-600" : ""}
          >
            {item.icon && <DynamicIcon name={item.icon} className="size-4" />}
            {label}
            {item.shortcut && (
              <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        )
    }
  })
}


function DropdownRenderer({
  dropdown,
  setState,
  runEventHandler,
  state,
  t,
}: {
  dropdown: DropdownElement
  state: AnyObj;
  setState: (path: string, value: any) => void;
  t: (key: string) => string
  runEventHandler?: (h?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}) {
  return wrapWithMotion(dropdown,
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
        >
          <RenderChildren
            children={[dropdown.trigger]}
            state={state}
            t={t}
            setState={setState}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {renderDropdownItems(dropdown.items, state, t, runEventHandler)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


export {
  DropdownRenderer,
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
