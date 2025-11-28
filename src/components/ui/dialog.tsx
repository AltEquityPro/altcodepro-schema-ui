"use client";
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn, resolveBinding } from "../../lib/utils"
import { ElementResolver } from "../../schema/ElementResolver"
import { RenderChildren } from "../../schema/RenderChildren"
import { ModalElement, AnyObj, EventHandler } from "../../types"
import wrapWithClassName from "./wrapWithClassName"
import { useModalState } from "../../schema/useModalState";

function Dialog({ isOpen, onOpenChange, className, title, description, children }: {
  className?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        "bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
    >
      {title && <DialogPrimitive.Title className="text-lg leading-none font-medium text-mauve12" data-slot="dialog-title">{title}</DialogPrimitive.Title>}
      {description && <DialogPrimitive.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-muted-foreground text-sm" data-slot="dialog-description">{description}</DialogPrimitive.Description>}

      <DialogPrimitive.Close data-slot="dialog-close"
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <span className="sr-only">Close</span>
        <XIcon className="size-4" />
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Root>
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal">
      <DialogPrimitive.Overlay className="fixed inset-0 bg-blackA6 data-[state=open]:animate-overlayShow" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-(--acp-background) dark:bg-(--acp-background-dark) text-(--acp-foreground) dark:text-(--acp-foreground-dark) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
interface ModalRendererProps {
  element: ModalElement
  state: AnyObj;
  setState: (path: string, value: any) => void;
  t: (key: string) => string,
  runEventHandler?: (handler?: EventHandler, dataOverride?: AnyObj) => Promise<void>
}

function ModalRenderer({ element, setState, state, t, runEventHandler }: ModalRendererProps) {
  const modal = element;
  const title = resolveBinding(modal.title, state, t);
  const description = resolveBinding(modal.description, state, t);
  const { isOpen, close } = useModalState(modal.id);
  const handleClose = React.useCallback(async () => {
    close();
    if (modal.onClose) {
      await runEventHandler?.(modal.onClose);
    }
  }, [modal.onClose, runEventHandler, close]);

  const handleActionWrapper = React.useCallback(
    async (handler?: EventHandler, dataOverride?: AnyObj) => {
      await runEventHandler?.(handler, dataOverride);
      if (
        handler?.action === "close_modal" ||
        handler?.action === "api_call" ||
        handler?.action === "crud_create" ||
        handler?.action === "crud_update"
      ) {
        close();
      }
    },
    [runEventHandler, close]
  );

  return wrapWithClassName(
    element,
    <DialogPrimitive.Root open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className={cn(modal.styles?.className)}
        style={{ zIndex: modal.zIndex }}
        showCloseButton={!!modal.closeButton}
      >
        {title && <DialogPrimitive.Title className="text-lg leading-none font-medium text-mauve12" data-slot="dialog-title">{title}</DialogPrimitive.Title>}
        {description && <DialogPrimitive.Description className="mb-5 mt-2.5 text-[15px] leading-normal text-muted-foreground text-sm" data-slot="dialog-description">{description}</DialogPrimitive.Description>}
        <RenderChildren
          state={state}
          setState={setState}
          t={t}
          children={modal.content}
          runEventHandler={handleActionWrapper}
        />
        <div
          data-slot="dialog-footer"
          className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {modal.closeButton ? <ElementResolver
            setState={setState}
            state={state}
            t={t}
            element={modal.closeButton}
            runEventHandler={handleActionWrapper}
          /> : <DialogPrimitive.Close data-slot="dialog-close"
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Close</span>
            <XIcon className="size-4" />
          </DialogPrimitive.Close>}
        </div>
      </DialogContent>
    </DialogPrimitive.Root >
  );
}

export {
  ModalRenderer,
  Dialog
}
