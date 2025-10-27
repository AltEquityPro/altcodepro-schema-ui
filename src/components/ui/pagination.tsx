"use client";
import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn, resolveBinding, variants } from "../../lib/utils"
import { Button } from "./button"
import wrapWithMotion from "./wrapWithMotion"
import { AnyObj, EventHandler, PaginationElement } from "../../types"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        variants({
          variant: isActive ? "outline" : "ghost",

        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"

      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"

      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}


interface PageRendererProps {
  element: PaginationElement;
  runEventHandler?: (
    handler?: EventHandler,
    dataOverride?: AnyObj
  ) => Promise<void>;
  state: AnyObj;
  t: (key: string) => string;
}

function PageRenderer({
  element,
  runEventHandler,
  state,
  t,
}: PageRendererProps) {
  const pagination = element;
  const total = resolveBinding(pagination.totalPages, state, t);
  const current = resolveBinding(pagination.currentPage, state, t);

  // Keyboard navigation
  const navRef = React.useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!navRef.current) return;
    const focusable = Array.from(
      navRef.current.querySelectorAll<HTMLAnchorElement>(
        "[role='link'][tabindex='0']"
      )
    );

    const currentIndex = focusable.findIndex(
      (el) => el === document.activeElement
    );

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = focusable[(currentIndex + 1) % focusable.length];
      next?.focus();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev =
        focusable[(currentIndex - 1 + focusable.length) % focusable.length];
      prev?.focus();
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (document.activeElement as HTMLAnchorElement)?.click();
    }
  };

  return wrapWithMotion(
    element,
    <Pagination>
      <PaginationContent ref={navRef} onKeyDown={handleKeyDown}>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            role="link"
            tabIndex={0}
            onClick={() => runEventHandler?.(pagination.onPrevious)}
          />
        </PaginationItem>

        {/* Pages */}
        {pagination.pages?.map((page, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              role="link"
              tabIndex={0}
              isActive={page.active}
              aria-current={page.active ? "page" : undefined}
              onClick={() =>
                runEventHandler?.(pagination.onPageChange, { page: page.number })
              }
            >
              {page.number}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Optional ellipsis */}
        {pagination.showEllipsis && total && total > pagination.pages.length && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            role="link"
            tabIndex={0}
            onClick={() => runEventHandler?.(pagination.onNext)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export {
  PageRenderer,
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
