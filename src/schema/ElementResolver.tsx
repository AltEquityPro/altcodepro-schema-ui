"use client";

import React from "react";
import type { UIElement } from "./types-bridges";
import { ElementType, Alignment, InputType, ButtonVariant } from "./types-bridges";
import { resolveBinding, isVisible, classesFromStyleProps, getAccessibilityProps, motionFromAnimation } from "../lib/utils";
import { useMemo } from "react";

// shadcn imports
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from "../components/ui/alert-dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "../components/ui/card";
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "../components/ui/carousel";

import { Chart } from "../components/ui/chart";
import { Checkbox } from "../components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "../components/ui/command";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "../components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "../components/ui/drawer";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { Form } from "../components/ui/form";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../components/ui/hover-card";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../components/ui/input-otp";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Menubar,
    MenubarPortal,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarGroup,
    MenubarSeparator,
    MenubarLabel,
    MenubarItem,
    MenubarShortcut,
    MenubarCheckboxItem,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent,
} from "../components/ui/menubar";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
    navigationMenuTriggerStyle,
} from "../components/ui/navigation-menu";
import {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "../components/ui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";

import { Separator } from "../components/ui/separator";
import {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from "../components/ui/sheet";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "../components/ui/sidebar";

import { Skeleton } from "../components/ui/skeleton";
import { Slider } from "../components/ui/slider";
import { toast } from "../components/ui/sonner";
import { Switch } from "../components/ui/switch";
import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Toggle, toggleVariants } from "../components/ui/toggle";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { motion } from "framer-motion";
import { IconElement, VideoElement, PaymentElement, MapElement, FormElement, DataGridElement, LoaderElement, AvatarElement, VoiceElement, CallElement, SliderElement, WalletElement, EditorElement, QuizElement, QRCodeElement, StepWizardElement, WalletConnectButtonElement, FileUploadElement, CarouselElement } from "@/src/types";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useActionHandler } from "./Actions";
import { useAppState } from "./StateContext";
import { useDataSources } from "./Datasource";
import { FormResolver } from "../components/ui/form-resolver";

type Ctx = {
    state: any;
    setState: (path: string, value: any) => void;
    t: (k: string) => string;
    data: Record<string, any>;
};

function ElementResolver({ el, ctx }: { el: UIElement; ctx: Ctx }) {
    const { state, setState, t, data, runtime } = ctx;

    // visibility
    if (!isVisible(el.visibility, state, t)) return null;

    const className = classesFromStyleProps(el.styles);
    const a11y = getAccessibilityProps(el.accessibility, state, t);
    const motionProps = motionFromAnimation(el.animations);

    // small helpers
    const bind = (v: any) => resolveBinding(v, state, t);
    const handleEvent = (name: string) => async (e?: any) => {
        e?.preventDefault?.();
        const h = el.onEvent?.[name];
        await runEventHandler({ handler: h, state, t, data, runtime });
    };

    const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return el.animations ? <motion.div {...motionProps} className={className} {...a11y}>{children}</motion.div>
            : <div className={className} {...a11y}>{children}</div>;
    };

    switch (el.type) {
        case ElementType.accordion: {
            const items = (el as any).items || [];
            return (
                <Wrap>
                    <Accordion type="single" collapsible className="w-full">
                        {items.map((it: any) => (
                            <AccordionItem key={it.id} value={it.id}>
                                <AccordionTrigger>{resolveBinding(it.title, state, t)}</AccordionTrigger>
                                <AccordionContent>
                                    {it.content?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Wrap>
            );
        }

        case ElementType.alert: {
            const a = el as any;
            return (
                <Wrap>
                    <Alert>
                        <AlertDescription>{resolveBinding(a.message, state, t)}</AlertDescription>
                    </Alert>
                </Wrap>
            );
        }
        case ElementType.avatar: {
            const a = el as AvatarElement;
            const src = bind(a.src);
            return (
                <Wrap>
                    <Avatar>
                        <AvatarImage src={String(src || "")} />
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                </Wrap>
            );
        }
        case ElementType.badge: {
            const b = el as any;
            const text = resolveBinding(b.text, state, t);
            const variant = b.variant || "default";
            return (
                <Wrap>
                    <Badge variant={variant}>{text}</Badge>
                </Wrap>
            );
        }

        case ElementType.breadcrumb: {
            const bc = el as any;
            const items = bc.items || [];
            return (
                <Wrap>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {items.map((item: any, idx: number) => (
                                <React.Fragment key={item.id || idx}>
                                    <BreadcrumbItem>
                                        {item.href ? (
                                            <BreadcrumbLink href={resolveBinding(item.href, state, t)}>
                                                {resolveBinding(item.label, state, t)}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>
                                                {resolveBinding(item.label, state, t)}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {idx < items.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </Wrap>
            );
        }
        case ElementType.button: {
            const b = el as any;
            const v: ButtonVariant = b.variant || ButtonVariant.primary;
            const label = bind(b.text) || "Button";
            return (
                <Wrap>
                    <Button
                        className={className}
                        variant={v === ButtonVariant.outline ? "outline" : v === ButtonVariant.secondary ? "secondary" : "default"}
                        onClick={handleEvent("click")}
                        disabled={Boolean(bind(b.disabled))}
                    >
                        {label}
                    </Button>
                </Wrap>
            );
        }

        case ElementType.calendar: {
            const c = el as any;
            return (
                <Wrap>
                    <Calendar mode="single" onSelect={() => { }} className="rounded-md border" />
                </Wrap>
            );
        }

        case ElementType.call: {
            const c = el as CallElement;
            //TODO: In production, integrate with WebRTC
            return (
                <Wrap>
                    <Button onClick={handleEvent("connect")}>Start {c.callType} Call</Button> {/* Stub for call */}
                </Wrap>
            );
        }
        case ElementType.card: {
            const c = el as any;
            return (
                <Wrap>
                    <Card>
                        {c.header && (
                            <CardHeader>
                                <ElementResolver el={c.header} ctx={ctx} />
                            </CardHeader>
                        )}
                        <CardContent className="space-y-3">
                            {c.content?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                        </CardContent>
                        {c.footer && (
                            <CardFooter className="flex gap-2">
                                {c.footer?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                            </CardFooter>
                        )}
                    </Card>
                </Wrap>
            );
        }

        case ElementType.carousel: {
            const c = el as CarouselElement;
            const items = Array.isArray(c.items) ? c.items : [];
            return (
                <Wrap>
                    <div className="carousel">
                        {items.map((item, i) => <div key={i}>{typeof item === 'object' ? <ElementResolver el={item} ctx={ctx} /> : item}</div>)}
                    </div> {/* Stub for carousel */}
                </Wrap>
            );
        }
        case ElementType.chart: {
            const c = el as any;
            return (
                <Wrap>
                    <Chart type={c.chartType} data={c.data} options={c.options} />
                </Wrap>
            );
        }

        case ElementType.collapsible: {
            const c = el as any;
            const label = resolveBinding(c.label, state, t) || "Expand";
            const defaultOpen = Boolean(resolveBinding(c.defaultOpen, state, t));

            return (
                <Wrap>
                    <Collapsible defaultOpen={defaultOpen}>
                        <CollapsibleTrigger className="flex items-center gap-2 cursor-pointer">
                            {label}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                            {c.children?.map((child: any) => (
                                <ElementResolver key={child.id} el={child} ctx={ctx} />
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                </Wrap>
            );
        }
        case ElementType.command: {
            const c = el as any;

            const title = resolveBinding(c.title, state, t) || "Command Palette";
            // Define commands (can come from schema or state)
            const groups = Array.isArray(c.groups) ? c.groups : [];

            return (
                <Wrap>
                    <CommandDialog
                        title={title}
                        open={!!resolveBinding(c.isOpen, state, t)}
                        onOpenChange={(open) => {
                            if (c.dataSourceId) ctx.setState(c.dataSourceId, open);
                        }}
                    >
                        <CommandInput placeholder={resolveBinding(c.placeholder, state, t) || "Type a command..."} />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>

                            {groups.map((g: any) => (
                                <CommandGroup key={g.id} heading={resolveBinding(g.label, state, t)}>
                                    {g.items?.map((item: any) => (
                                        <CommandItem
                                            key={item.id}
                                            onSelect={() => runEventHandler({ handler: item.onSelect, state, t, data, runtime })}
                                        >
                                            {resolveBinding(item.label, state, t)}
                                            {item.shortcut && (
                                                <CommandShortcut>{item.shortcut}</CommandShortcut>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))}

                            {groups.length > 1 && <CommandSeparator />}
                        </CommandList>
                    </CommandDialog>
                </Wrap>
            );
        }

        case ElementType.container: {
            const c = el as any;
            const layout = c.layout || "block";
            const gap = c.gap ? `gap-${c.gap}` : "gap-3";
            const layoutCn = layout === "grid" ? `grid ${gap}` :
                layout === "flex" ? `flex ${gap} flex-wrap` :
                    layout === "row" ? `flex ${gap}` :
                        layout === "column" ? `flex ${gap} flex-col` : "";
            return (
                <Wrap>
                    <div className={layoutCn}>
                        {c.children?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                    </div>
                </Wrap>
            );
        }

        case ElementType.context_menu: {
            const cm = el as any;
            return (
                <Wrap>
                    <ContextMenu>
                        <ContextMenuTrigger asChild>
                            <ElementResolver el={cm.trigger} ctx={ctx} />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            {cm.items?.map((item: any) => {
                                switch (item.type) {
                                    case "item":
                                        return (
                                            <ContextMenuItem
                                                key={item.id}
                                                onSelect={() =>
                                                    runEventHandler({ handler: item.onSelect, state, t, data, runtime })
                                                }
                                            >
                                                {resolveBinding(item.label, state, t)}
                                                {item.shortcut && (
                                                    <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
                                                )}
                                            </ContextMenuItem>
                                        );
                                    case "checkbox":
                                        return (
                                            <ContextMenuCheckboxItem
                                                key={item.id}
                                                checked={!!resolveBinding(item.checked, state, t)}
                                                onCheckedChange={() =>
                                                    runEventHandler({ handler: item.onSelect, state, t, data, runtime })
                                                }
                                            >
                                                {resolveBinding(item.label, state, t)}
                                            </ContextMenuCheckboxItem>
                                        );
                                    case "radio":
                                        return (
                                            <ContextMenuRadioItem
                                                key={item.id}
                                                value={item.value}
                                                onSelect={() =>
                                                    runEventHandler({ handler: item.onSelect, state, t, data, runtime })
                                                }
                                            >
                                                {resolveBinding(item.label, state, t)}
                                            </ContextMenuRadioItem>
                                        );
                                    case "label":
                                        return (
                                            <ContextMenuLabel key={item.id}>
                                                {resolveBinding(item.label, state, t)}
                                            </ContextMenuLabel>
                                        );
                                    case "separator":
                                        return <ContextMenuSeparator key={item.id} />;
                                    case "sub":
                                        return (
                                            <ContextMenuSub key={item.id}>
                                                <ContextMenuSubTrigger>
                                                    {resolveBinding(item.label, state, t)}
                                                </ContextMenuSubTrigger>
                                                <ContextMenuSubContent>
                                                    {item.items?.map((sub: any) => (
                                                        <ContextMenuItem
                                                            key={sub.id}
                                                            onSelect={() =>
                                                                runEventHandler({
                                                                    handler: sub.onSelect,
                                                                    state,
                                                                    t,
                                                                    data,
                                                                    runtime,
                                                                })
                                                            }
                                                        >
                                                            {resolveBinding(sub.label, state, t)}
                                                        </ContextMenuItem>
                                                    ))}
                                                </ContextMenuSubContent>
                                            </ContextMenuSub>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </ContextMenuContent>
                    </ContextMenu>
                </Wrap>
            );
        }

        case ElementType.custom: {
            const c = el as any;
            const Comp = (c.component && (globalThis as any)[c.component]) || ((p: any) => <pre className="text-xs">{JSON.stringify(p.props, null, 2)}</pre>);
            const props = useMemo(() => {
                const out: any = {};
                Object.entries(c.props || {}).forEach(([k, v]) => out[k] = resolveBinding(v, state, t));
                return out;
            }, [c.props, state, t]);
            return <Wrap>
                <React.Suspense fallback={<Loader2 className="animate-spin" />}>
                    <Comp {...props} />
                </React.Suspense>
            </Wrap>;
        }

        case ElementType.datagrid: {
            const d = el as DataGridElement;
            // Use advanced data table library like TanStack Table in production
            return (
                <Wrap>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {d.columns.map((col) => <TableHead key={col.key}>{col.header}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {d.rows.map((row, i) => (
                                <TableRow key={i}>
                                    {d.columns.map((col) => <TableCell key={col.key}>{row[col.key]}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table> {/* Stub for datagrid using table */}
                </Wrap>
            );
        }
        case ElementType.dropdown: {
            const d = el as any;
            const options = Array.isArray(d.options) ? d.options : [];
            const selected = resolveBinding(d.selectedValue, state, t) ?? "";
            return (
                <Wrap>
                    <Label className="mb-1 block">{resolveBinding(d.label, state, t)}</Label>
                    <Select defaultValue={selected} onValueChange={(v) => d.onEvent?.change && ctx.setState(d.dataSourceId || `form.${d.id}`, v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {options.map((o: any) => <SelectItem key={o.value} value={o.value}>{resolveBinding(o.label, state, t)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Wrap>
            );
        }
        case ElementType.dropdown_menu: {
            const d = el as any;
            return (
                <Wrap>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <ElementResolver el={d.trigger} ctx={ctx} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {d.items?.map((item: any) => (
                                <DropdownMenuItem
                                    key={item.id}
                                    onSelect={() => runEventHandler({ handler: item.onSelect, state, t, data, runtime })}
                                >
                                    {resolveBinding(item.label, state, t)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Wrap>
            );
        }

        case ElementType.drawer: {
            const d = el as any;
            const isOpen = Boolean(resolveBinding(d.isOpen, state, t));
            return (
                <Wrap>
                    <Drawer open={isOpen} onOpenChange={(open) => {
                        ctx.setState(d.dataSourceId || `drawer.${d.id}`, open);
                        runEventHandler({ handler: d.onOpenChange, state, t, data, runtime });
                    }}>
                        {d.trigger && <DrawerTrigger asChild>
                            <ElementResolver el={d.trigger} ctx={ctx} />
                        </DrawerTrigger>}
                        <DrawerContent>
                            {(d.title || d.description) && (
                                <DrawerHeader>
                                    {d.title && <DrawerTitle>{resolveBinding(d.title, state, t)}</DrawerTitle>}
                                    {d.description && (
                                        <DrawerDescription>{resolveBinding(d.description, state, t)}</DrawerDescription>
                                    )}
                                </DrawerHeader>
                            )}
                            <div className="p-4 space-y-3">
                                {d.content?.map((child: any) => (
                                    <ElementResolver key={child.id} el={child} ctx={ctx} />
                                ))}
                            </div>
                            {d.footer && (
                                <DrawerFooter>
                                    {d.footer?.map((child: any) => (
                                        <ElementResolver key={child.id} el={child} ctx={ctx} />
                                    ))}
                                </DrawerFooter>
                            )}
                        </DrawerContent>
                    </Drawer>
                </Wrap>
            );
        }
        case ElementType.editor: {
            const e = el as EditorElement;
            const content = bind(e.content);
            return (
                <Wrap>
                    <Textarea defaultValue={content} onChange={handleEvent("change")} /> {/* Stub for rich editor */}
                </Wrap>
            );
        }
        case ElementType.file_upload: {
            const f = el as FileUploadElement;
            return (
                <Wrap>
                    <Input type="file" accept={f.accept} multiple={f.multiple} onChange={handleEvent("uploaded")} /> {/* Simple file upload */}
                </Wrap>
            );
        }
        case ElementType.footer: {
            const f = el as any;
            const align = f.alignment || Alignment.center;
            return (
                <Wrap>
                    <footer className={`p-4 border-t text-${align}`}>
                        {f.children?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                    </footer>
                </Wrap>
            );
        }
        case ElementType.form: {
            return (
                <Wrap>
                    <SchemaForm el={el as FormElement} ctx={ctx} />
                </Wrap>
            );
        }
        case ElementType.header: {
            const h = el as any;
            const align = h.alignment || Alignment.left;
            return (
                <Wrap>
                    <header className={`p-4 border-b text-${align}`}>
                        {h.children?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                    </header>
                </Wrap>
            );
        }
        case ElementType.icon: {
            const i = el as IconElement;
            const label = bind(i.label);
            // Assuming lucide-react or similar; in production, use dynamic icon resolver
            return (
                <Wrap>
                    <span className={`inline-block`} style={{ fontSize: i.size }}>{label || i.name}</span> {/* Stub for icon */}
                </Wrap>
            );
        }
        case ElementType.image: {
            const image = el as any;
            const alt = bind(image.alt) || "";
            return (
                <Wrap>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.src} alt={alt} width={image.width} height={image.height} className="max-w-full h-auto" />
                </Wrap>
            );
        }
        case ElementType.input: {
            const i = el as any;
            const label = bind(i.label);
            const placeholder = bind(i.placeholder);
            const name = i.name;
            const value = bind(i.value) ?? "";
            const onChange = (ev: any) => {
                if (i.onEvent?.change && i.name) {
                    ctx.setState(`form.${name}`, ev?.target?.value ?? ev);
                }
                ctx.setState(i.dataSourceId || `form.${name}`, ev?.target?.value ?? ev);
            };

            const field = (() => {
                switch (i.inputType) {
                    case InputType.textarea:
                        return <Textarea placeholder={placeholder} defaultValue={value} onChange={onChange} />;
                    case InputType.checkbox:
                        return (
                            <div className="flex items-center gap-2">
                                <Checkbox defaultChecked={!!value} onCheckedChange={onChange} />
                                {label && <Label htmlFor={name}>{label}</Label>}
                            </div>
                        );
                    default:
                        return <Input placeholder={placeholder} defaultValue={value} onChange={onChange} type={
                            i.inputType === InputType.password ? "password"
                                : i.inputType === InputType.email ? "email"
                                    : i.inputType === InputType.number ? "number"
                                        : i.inputType === InputType.date ? "date"
                                            : "text"} />;
                }
            })();

            return (
                <Wrap>
                    <div className="space-y-1">
                        {label && i.inputType !== InputType.checkbox && <Label htmlFor={name}>{label}</Label>}
                        {field}
                    </div>
                </Wrap>
            );
        }
        case ElementType.loader: {
            const l = el as LoaderElement;
            return (
                <Wrap>
                    <Loader2 className="animate-spin  h-5 w-5" size={l.size} />
                </Wrap>
            );
        }
        case ElementType.map: {
            const m = el as MapElement;
            return (
                <Wrap>
                    <div />
                </Wrap>
            );
        }
        case ElementType.modal: {
            const m = el as any;
            const isOpen = Boolean(resolveBinding(m.isOpen, state, t));
            const title = resolveBinding(m.title, state, t) || "";
            return (
                <Dialog open={isOpen} onOpenChange={(open) => {
                    // tie to state if desired
                    if (m.dataSourceId) ctx.setState(m.dataSourceId, open);
                }}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            {m.content?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                        </div>
                    </DialogContent>
                </Dialog>
            );
        }
        case ElementType.payment: {
            const p = el as PaymentElement;
            //TODO: In production, integrate with Stripe Elements or similar
            return (
                <Wrap>
                    <Button onClick={handleEvent("click")}>Pay {p.amount as any} {p.currency}</Button> {/* Stub for payment */}
                </Wrap>
            );
        }
        case ElementType.qr_code: {
            const q = el as QRCodeElement;
            const value = bind(q.value);
            // In production, use qrcode.react
            return (
                <Wrap>
                    <div>QR Code for {value}</div> {/* Stub for QR code */}
                </Wrap>
            );
        }
        case ElementType.quiz: {
            const q = el as QuizElement;
            return (
                <Wrap>
                    <form onSubmit={handleEvent("submit")}>
                        {q.questions.map((ques) => (
                            <div key={ques.id}>
                                <Label>{bind(ques.question)}</Label>
                                {ques.options.map((opt) => (
                                    <div key={opt.value}>
                                        <input type="radio" name={ques.id} value={opt.value} />
                                        {bind(opt.label)}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <Button type="submit">Submit Quiz</Button>
                    </form> {/* Simple stub for quiz */}
                </Wrap>
            );
        }
        case ElementType.slider: {
            const s = el as SliderElement;

            return (
                <Wrap>
                    <Slider />
                </Wrap>
            );
        }
        case ElementType.step_wizard: {
            const w = el as StepWizardElement;
            const current = w.current || 0;
            const step = w.steps[current];
            return (
                <Wrap>
                    <div>
                        <h3>{step.title}</h3>
                        {step.content?.map((child) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                        <Button onClick={handleEvent("prev")}>Prev</Button>
                        <Button onClick={handleEvent("next")}>Next</Button>
                    </div> {/* Simple stub for wizard */}
                </Wrap>
            );
        }
        case ElementType.table: {
            const tbl = el as any;
            const headers = (tbl.headers || []).map((h: any) => resolveBinding(h, state, t));
            const rows = Array.isArray(tbl.rows) ? tbl.rows : [];
            return (
                <Wrap>
                    <Table>
                        <TableHeader>
                            <TableRow>{headers.map((h: string, i: number) => <TableHead key={i}>{h}</TableHead>)}</TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((r: any, i: number) => (
                                <TableRow key={i}>
                                    {(r.cells || []).map((c: any, j: number) => <TableCell key={j}>{resolveBinding(c, state, t)}</TableCell>)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Wrap>
            );
        }
        case ElementType.tabs: {
            const tabs = (el as any).tabs || [];
            const active = (el as any).activeTab || tabs[0]?.id;
            return (
                <Wrap>
                    <Tabs defaultValue={active} className="w-full">
                        <TabsList>
                            {tabs.map((t1: any) => <TabsTrigger key={t1.id} value={t1.id}>{resolveBinding(t1.label, ctx.state, ctx.t)}</TabsTrigger>)}
                        </TabsList>
                        {tabs.map((t1: any) => (
                            <TabsContent key={t1.id} value={t1.id}>
                                {t1.content?.map((child: any) => <ElementResolver key={child.id} el={child} ctx={ctx} />)}
                            </TabsContent>
                        ))}
                    </Tabs>
                </Wrap>
            );
        }
        case ElementType.text: {
            const text = bind((el as any).content) ?? "";
            const Tag = ((el as any).tag || "p") as any;
            const align = (el as any).alignment || Alignment.left;
            return (
                <Wrap>
                    <Tag className={`text-inherit text-${align}`}>{text}</Tag>
                </Wrap>
            );
        }
        case ElementType.three_d_model: {
            const m = el as ThreeDModelElement;
            // In production, use three.js or similar
            return (
                <Wrap>
                    <div>3D Model: {bind(m.src)}</div> {/* Stub for 3D model */}
                </Wrap>
            );
        }
        case ElementType.video: {
            const v = el as VideoElement;
            const src = bind(v.src);
            return (
                <Wrap>
                    <video src={src} width={v.width} height={v.height} autoPlay={v.autoPlay} loop={v.loop} controls={v.controls} />
                </Wrap>
            );
        }
        case ElementType.voice: {
            const v = el as VoiceElement;
            // TODO:In production, integrate with Web Speech API
            return (
                <Wrap>
                    <Button onClick={handleEvent("recognize")}>Start Voice {v.mode}</Button> {/* Stub for voice */}
                </Wrap>
            );
        }
        case ElementType.wallet: {
            const w = el as WalletElement;
            //TODO: In production, integrate with Web3 library
            return (
                <Wrap>
                    <Button onClick={handleEvent("connect")}>Connect Wallet</Button> {/* Stub for wallet */}
                </Wrap>
            );
        }
        case ElementType.wallet_connect_button: {
            const w = el as WalletConnectButtonElement;
            // In production, use @walletconnect/web3-provider
            return (
                <Wrap>
                    <Button onClick={handleEvent("click")}>Connect Wallet</Button> {/* Stub for wallet connect */}
                </Wrap>
            );
        }
        default:
            return <Wrap><div>Unsupported element</div></Wrap>;
    }
}

export default React.memo(ElementResolver);