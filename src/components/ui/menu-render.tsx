import * as React from "react"
import * as Dropdown from "@radix-ui/react-dropdown-menu"
import * as Context from "@radix-ui/react-context-menu"
import * as Menubar from "@radix-ui/react-menubar"
import * as Navigation from "@radix-ui/react-navigation-menu"
import { MenuIcon, ChevronRightIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn, resolveBinding } from "../../lib/utils"
import { RenderChildren } from "../../schema/RenderChildren"
import { AnyObj, MenuElement, EventHandler, MenuItem, ActionRuntime } from "../../types"
import wrapWithMotion from "./wrapWithMotion"
import { DynamicIcon } from "./dynamic-icon"

function MenuShortcut({ children }: { children: React.ReactNode }) {
  return <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{children}</span>
}

/** ------------------------------------------------
 * Desktop Item Renderer (Dropdown / Context / Menubar)
 * ------------------------------------------------ */
function renderItems(
  items: MenuElement["items"],
  runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
  state: AnyObj,
  t: (key: string) => string,
  Primitive: any,
  variant: Exclude<MenuElement["variant"], "navigation">
): React.ReactNode {
  return items.map((item) => {
    switch (item.type) {
      case "item": {
        return (
          <Primitive.Item
            key={item.id}
            className={cn(
              "px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              item.variant === "destructive" && "text-red-600 dark:text-red-400"
            )}
            onSelect={() => runEventHandler(item.onSelect)}
          >
            {item.icon && <DynamicIcon name={item.icon} className="size-5 mr-3" />}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveBinding(item.label, state, t) || item.label}
            </span>
            {"shortcut" in item && item.shortcut && (
              <MenuShortcut>{item.shortcut}</MenuShortcut>
            )}
          </Primitive.Item>
        )
      }
      case "checkbox":
        return (
          <Primitive.CheckboxItem
            key={item.id}
            checked={resolveBinding(item.checked, state, t)}
            onCheckedChange={() => runEventHandler(item.onSelect)}
            className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveBinding(item.label, state, t) || item.label}
            </span>
          </Primitive.CheckboxItem>
        )
      case "radio":
        return (
          <Primitive.RadioItem
            key={item.id}
            value={item.value}
            onSelect={() => runEventHandler(item.onSelect)}
            className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveBinding(item.label, state, t) || item.label}
            </span>
          </Primitive.RadioItem>
        )
      case "label":
        return (
          <Primitive.Label
            key={item.id}
            className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            {resolveBinding(item.label, state, t) || item.label}
          </Primitive.Label>
        )
      case "separator":
        return <Primitive.Separator key={item.id} className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
      case "sub":
        return (
          <Primitive.Sub key={item.id}>
            <Primitive.SubTrigger
              className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center"
              aria-haspopup="menu"
            >
              {item.icon && <DynamicIcon name={item.icon} className="size-5 mr-3" />}
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {resolveBinding(item.label, state, t) || item.label}
              </span>
              <ChevronRightIcon className="ml-auto size-5 text-gray-500 dark:text-gray-400" />
            </Primitive.SubTrigger>
            <Primitive.SubContent className="z-50 rounded-md border bg-gray-100 dark:bg-gray-800 p-1 shadow-lg">
              {renderItems(item.items, runEventHandler, state, t, Primitive, variant)}
            </Primitive.SubContent>
          </Primitive.Sub>
        )
      default:
        return null
    }
  })
}

/** ------------------------------------------------
 * Desktop Renderer for Navigation
 * ------------------------------------------------ */
function renderNavigationDesktop(
  items: MenuItem[],
  runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
  state: AnyObj,
  t: (key: string) => string,
  pathname: string,
  schemaClassName?: string
): React.ReactNode {
  return items.map((item: any) => {
    if (item.type === "sub") {
      return (
        <Navigation.Item key={item.id}>
          <Navigation.Trigger
            className={cn(
              "px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              schemaClassName,
              pathname === item.href && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.icon && <DynamicIcon name={item.icon} className="size-5 mr-3" />}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveBinding(item.label, state, t) || item.label}
            </span>
            <ChevronDownIcon className="ml-2 size-5 text-gray-500 dark:text-gray-400" />
          </Navigation.Trigger>
          <Navigation.Content className="absolute top-full left-0 mt-2 rounded-md border bg-gray-100 dark:bg-gray-800 shadow-lg p-2">
            <div className="grid gap-1 min-w-[12rem]">
              {renderNavigationDesktop(item.items, runEventHandler, state, t, pathname)}
            </div>
          </Navigation.Content>
        </Navigation.Item>
      )
    }

    if (item.type === "item") {
      const content = (
        <>
          {item.icon && <DynamicIcon name={item.icon} className="size-5 mr-3" />}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {resolveBinding(item.label, state, t) || item.label}
          </span>
          {"shortcut" in item && item.shortcut && (
            <MenuShortcut>{item.shortcut}</MenuShortcut>
          )}
        </>
      )
      return item.href ? (
        <Navigation.Item key={item.id}>
          <Navigation.Link
            asChild
            className={cn(
              "px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              schemaClassName,
              pathname === item.href && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            )}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <a
              href={item.href}
              onClick={(e) => {
                if (item.onSelect) {
                  e.preventDefault()
                  runEventHandler(item.onSelect)
                }
              }}
            >
              {content}
            </a>
          </Navigation.Link>
        </Navigation.Item>
      ) : (
        <Navigation.Item key={item.id}>
          <button
            className={cn(
              "px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              schemaClassName,
              item.variant === "destructive" && "text-red-600 dark:text-red-400"
            )}
            onClick={() => runEventHandler(item.onSelect)}
          >
            {content}
          </button>
        </Navigation.Item>
      )
    }

    if (item.type === "separator") {
      return <div key={item.id} className="my-1 h-px bg-gray-200 dark:bg-gray-700 w-full" aria-hidden />
    }

    if (item.type === "label") {
      return (
        <div
          key={item.id}
          className={cn("px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400", schemaClassName)}
        >
          {resolveBinding(item.label, state, t) || item.label}
        </div>
      )
    }

    if (item.type === "checkbox" || item.type === "radio") {
      return (
        <Navigation.Item key={item.id}>
          <button
            className={cn(
              "px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              schemaClassName
            )}
            onClick={() => runEventHandler(item.onSelect)}
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {resolveBinding(item.label, state, t) || item.label}
            </span>
          </button>
        </Navigation.Item>
      )
    }

    return null
  })
}

/** ------------------------
 * Mobile Drawer Submenu
 * ------------------------ */
function MobileSubMenu({
  item,
  runEventHandler,
  state,
  t,
  pathname,
  schemaClassName,
}: {
  item: any
  runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>
  state: AnyObj
  t: (key: string) => string
  pathname: string
  schemaClassName?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
          schemaClassName,
          pathname === item.href && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-current={pathname === item.href ? "page" : undefined}
      >
        {item.icon && <DynamicIcon name={item.icon} className="size-5" />}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {resolveBinding(item.label, state, t) || item.label}
        </span>
        <ChevronDownIcon
          className={cn("ml-auto size-5 text-gray-500 dark:text-gray-400 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-4 space-y-1">
          {renderMobileItems(item.items, runEventHandler, state, t, pathname, schemaClassName)}
        </div>
      )}
    </div>
  )
}

/** ------------------------
 * Mobile Drawer Renderer
 * ------------------------ */
function renderMobileItems(
  items: MenuElement["items"],
  runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>,
  state: AnyObj,
  t: (key: string) => string,
  pathname: string,
  schemaClassName?: string
): React.ReactNode {
  return items.map((item: any) => {
    if (item.type === "sub") {
      return (
        <MobileSubMenu
          key={item.id}
          item={item}
          runEventHandler={runEventHandler}
          state={state}
          t={t}
          pathname={pathname}
          schemaClassName={schemaClassName}
        />
      )
    }
    if (item.type === "separator") {
      return <div key={item.id} className="my-2 h-px bg-gray-300 dark:bg-gray-600" />
    }
    if (item.type === "label") {
      return (
        <div
          key={item.id}
          className={cn("px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400", schemaClassName)}
        >
          {resolveBinding(item.label, state, t) || item.label}
        </div>
      )
    }
    return item.href ? (
      <a
        key={item.id}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          schemaClassName,
          item.variant === "destructive" && "text-red-600 dark:text-red-400",
          pathname === item.href && "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        )}
        onClick={(e) => {
          if (item.onSelect) {
            e.preventDefault()
            runEventHandler(item.onSelect)
          }
        }}
        aria-current={pathname === item.href ? "page" : undefined}
      >
        {item.icon && <DynamicIcon name={item.icon} className="size-5" />}
        <span className="text-base text-gray-900 dark:text-gray-100">
          {resolveBinding(item.label, state, t) || item.label}
        </span>
        {"shortcut" in item && item.shortcut && <MenuShortcut>{item.shortcut}</MenuShortcut>}
      </a>
    ) : (
      <button
        key={item.id}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
          schemaClassName,
          item.variant === "destructive" && "text-red-600 dark:text-red-400"
        )}
        onClick={() => runEventHandler(item.onSelect)}
      >
        {item.icon && <DynamicIcon name={item.icon} className="size-5" />}
        <span className="text-base text-gray-900 dark:text-gray-100">
          {resolveBinding(item.label, state, t) || item.label}
        </span>
        {"shortcut" in item && item.shortcut && <MenuShortcut>{item.shortcut}</MenuShortcut>}
      </button>
    )
  })
}
/** ------------------------
 * Mobile Menu Component
 * ------------------------ */
function MobileMenu({
  element,
  isOpen,
  onClose,
  items,
  runEventHandler,
  state,
  t,
  pathname,
  schemaClassName,
}: {
  element: MenuElement,
  isOpen: boolean
  onClose: () => void
  items: MenuElement["items"]
  runEventHandler: (h?: EventHandler, d?: AnyObj) => Promise<void>
  state: AnyObj
  t: (key: string) => string
  pathname: string
  schemaClassName?: string
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 w-screen h-screen bg-gray-100 dark:bg-gray-900 z-[1000] flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {resolveBinding(element.label, state, t) || element.name || "Menu"}
        </span>
        <button
          className="p-2 text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
          aria-label="Close menu"
        >
          <XIcon className="size-6" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {renderMobileItems(items || [], runEventHandler, state, t, pathname, schemaClassName) || (
          <div className="text-gray-900 dark:text-gray-100 text-center py-4">
            No items to display
          </div>
        )}
      </nav>
    </div>
  )
}

/** ------------------------
 * Main MenuRenderer
 * ------------------------ */
export function MenuRenderer({
  element,
  runEventHandler,
  state,
  t,
  runtime
}: {
  element: MenuElement
  runEventHandler: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
  state: AnyObj
  t: (key: string) => string
  runtime: ActionRuntime
}) {
  const [pathname, setPathname] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)

  // Update pathname on mount and when window.location changes
  React.useEffect(() => {
    setPathname(window.location.pathname)
    const handlePopState = () => setPathname(window.location.pathname)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Debug logging for drawer state
  React.useEffect(() => {
  }, [isOpen])

  const handleTriggerClick = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  switch (element.variant || "navigation") {
    case "dropdown":
      return wrapWithMotion(
        element,
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            {element.trigger && <RenderChildren children={[element.trigger]} runtime={runtime} />}
          </Dropdown.Trigger>
          <Dropdown.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
            {renderItems(element.items, runEventHandler, state, t, Dropdown, "dropdown")}
          </Dropdown.Content>
        </Dropdown.Root>
      )

    case "context":
      return wrapWithMotion(
        element,
        <Context.Root>
          <Context.Trigger asChild>
            {element.trigger && <RenderChildren children={[element.trigger]} runtime={runtime} />}
          </Context.Trigger>
          <Context.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
            {renderItems(element.items, runEventHandler, state, t, Context, "context")}
          </Context.Content>
        </Context.Root>
      )

    case "menubar":
      return wrapWithMotion(
        element,
        <Menubar.Root className="bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs">
          {element.menus?.map((menu) => (
            <Menubar.Menu key={menu.id}>
              <Menubar.Trigger className="px-2 py-1 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground">
                {resolveBinding(menu.label, state, t) || menu.label}
              </Menubar.Trigger>
              <Menubar.Content className="z-50 rounded-md border bg-popover p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out">
                {renderItems(menu.items, runEventHandler, state, t, Menubar, "menubar")}
              </Menubar.Content>
            </Menubar.Menu>
          ))}
        </Menubar.Root>
      )

    case "navigation":
    default:
      return wrapWithMotion(
        element,
        <div className="w-full">
          {/* Desktop */}
          <div className="hidden lg:flex">
            <Navigation.Root className="relative z-10 w-full bg-background">
              <Navigation.List className={cn("flex items-center", element.styles?.className)}>
                {renderNavigationDesktop(
                  element.items || [],
                  runEventHandler,
                  state,
                  t,
                  pathname,
                  element.styles?.className
                )}
              </Navigation.List>
              <Navigation.Indicator className="absolute bottom-0 h-1 bg-primary transition-all" />
            </Navigation.Root>
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden">
            <button
              className="p-2 ml-0 flex justify-start"
              onClick={handleTriggerClick}
            >
              <MenuIcon className="size-6 text-gray-900 dark:text-gray-100" />
            </button>
            <MobileMenu
              element={element}
              isOpen={isOpen}
              onClose={handleClose}
              items={element.items}
              runEventHandler={runEventHandler}
              state={state}
              t={t}
              pathname={pathname}
              schemaClassName={element.styles?.className}
            />
          </div>
        </div>
      )
  }
}