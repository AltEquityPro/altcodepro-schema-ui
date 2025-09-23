"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AnyObj, DropdownElement, FormElement, InputElement, UIElement } from "./types-bridges";
import { ElementType, Alignment, InputType, ButtonVariant } from "./types-bridges";
import { resolveBinding, isVisible, classesFromStyleProps, getAccessibilityProps, motionFromAnimation, deepResolveBindings, cn } from "../lib/utils";

// shadcn imports
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import {
    AlertDialog,
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
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "../components/ui/command";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "../components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "../components/ui/drawer";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../components/ui/hover-card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "../components/ui/menubar";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink } from "../components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext } from "../components/ui/pagination";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Progress } from "../components/ui/progress";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../components/ui/resizable";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "../components/ui/sheet";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../components/ui/sidebar";
import { Skeleton } from "../components/ui/skeleton";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Toggle } from "../components/ui/toggle";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../components/ui/tooltip";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useActionHandler } from "./Actions";
import { useAppState } from "./StateContext";
import { useDataSources } from "./Datasource";
import { FormResolver } from "../components/ui/form-resolver";
import { DataGrid } from "../components/ui/datagrid";
import { CodeInput } from "../components/ui/code-input";
import { CreateSelect } from "../components/ui/create-select";
import { CreditCardInput } from "../components/ui/credit-cart-input";
import { CurrencyInput } from "../components/ui/currency-input";
import { MarkdownInput } from "../components/ui/markdown-input";
import { RatingInput } from "../components/ui/rating-input";
import { SignatureInput } from "../components/ui/signature-input";
import { TagsInput } from "../components/ui/tags-input";
import { CustomElement } from "react-hook-form";
import { HeaderElement, FooterElement, ButtonElement, ModalElement, IconElement, TextElement, ImageElement, CardElement, ContainerElement, TableElement, DataGridElement, AlertElement, BreadcrumbElement, DrawerElement, DropdownMenuElement, ContextMenuElement, TabsElement, AccordionElement, CarouselElement, LoaderElement, VideoElement, PaymentElement, ChartElement, AvatarElement, VoiceElement, CallElement, SliderElement, WalletElement, EditorElement, QuizElement, CalendarElement, QRCodeElement, StepWizardElement, WalletConnectButtonElement, FileUploadElement } from "../types";
import { RichTextInput } from "@/all_src_code_combined";

interface ElementResolverProps {
    element: UIElement;
    runtime?: AnyObj;
}

export function ElementResolver({ element, runtime = {} }: ElementResolverProps) {
    const { state, t } = useAppState();
    const { runEventHandler } = useActionHandler({
        globalConfig: runtime.globalConfig,
        screen: runtime.screen,
        runtime,
    });
    const dataSources = useDataSources({
        dataSources: runtime.screen?.dataSources || [],
        globalConfig: runtime.globalConfig,
        screen: runtime.screen,
    });
    const isMobile = useIsMobile();

    if (!isVisible(element.visibility, state, t)) return null;

    const className = classesFromStyleProps(element.styles);
    const accessibilityProps = getAccessibilityProps(element.accessibility);
    const animationProps = motionFromAnimation(element.animations);
    const resolvedElement = useMemo(() => deepResolveBindings(element, state, t), [element, state, t]);

    const renderChildren = (children: UIElement[] = resolvedElement.children || []) => (
        <>
            {children.map((child) => (
                <ElementResolver key={child.id} element={child} runtime={runtime} />
            ))}
        </>
    );

    const MotionComponent = animationProps ? motion.div : 'div';

    const wrapWithMotion = (children: React.ReactNode) => (
        <MotionComponent className={className} {...accessibilityProps} {...animationProps}>
            {children}
        </MotionComponent>
    );

    switch (resolvedElement.type) {
        case ElementType.header:
            const header = resolvedElement as HeaderElement;
            return wrapWithMotion(
                <header className={cn(`text-${header.alignment || 'left'}`)}>
                    {renderChildren()}
                </header>
            );

        case ElementType.footer:
            const footer = resolvedElement as FooterElement;
            return wrapWithMotion(
                <footer className={cn(`text-${footer.alignment || 'left'}`)}>
                    {renderChildren()}
                </footer>
            );

        case ElementType.button:
            const button = resolvedElement as ButtonElement;
            return wrapWithMotion(
                <Button
                    variant={(button.variant || ButtonVariant.primary) as any}
                    disabled={resolveBinding(button.disabled, state, t)}
                    onClick={() => runEventHandler(button.onClick)}
                >
                    {button.icon && <ElementResolver element={button.icon} runtime={runtime} />}
                    {resolveBinding(button.text, state, t)}
                </Button>
            );


        case ElementType.three_d_model:
            return wrapWithMotion(
                <div>Unsupported: 3D Model (requires @react-three/fiber)</div>
            );

        case ElementType.modal:
            const modal = resolvedElement as ModalElement;
            return wrapWithMotion(
                <Dialog open={resolveBinding(modal.isOpen, state, t)} onOpenChange={(open) => !open && runEventHandler(modal.onClose)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{resolveBinding(modal.title, state, t)}</DialogTitle>
                        </DialogHeader>
                        {renderChildren(modal.content)}
                        {modal.closeButton && <ElementResolver element={modal.closeButton} runtime={runtime} />}
                    </DialogContent>
                </Dialog>
            );

        case ElementType.icon:
            const icon = resolvedElement as IconElement;
            const IconComp = runtime.icons?.[icon.name] || Loader2; // Fallback to Loader2
            return wrapWithMotion(
                <IconComp size={icon.size} aria-label={resolveBinding(icon.label, state, t)} />
            );

        case ElementType.text:
            const text = resolvedElement as TextElement;
            const TextTag = text.tag || 'p';
            const MotionText = motion(TextTag);

            if (text.contentFormat === 'html') {
                // Use regular React element for dangerouslySetInnerHTML
                return React.createElement(
                    TextTag,
                    {
                        className: cn(className, `text-${text.alignment || 'left'}`, text.fontWeight ? `font-${text.fontWeight}` : ''),
                        ...accessibilityProps,
                        dangerouslySetInnerHTML: { __html: resolveBinding(text.content, state, t) },
                    }
                );
            } else {
                // Use motion component for non-HTML content
                return (
                    <MotionText
                        {...accessibilityProps}
                        {...animationProps}
                    >
                        {resolveBinding(text.content, state, t)}
                    </MotionText>
                );
            }

        case ElementType.image:
            const image = resolvedElement as ImageElement;
            return wrapWithMotion(
                <img
                    src={resolveBinding(image.src, state, t)}
                    alt={resolveBinding(image.alt, state, t)}
                    width={image.width}
                    height={image.height}
                />
            );

        case ElementType.card:
            const card = resolvedElement as CardElement;
            return wrapWithMotion(
                <Card>
                    {card.header && <CardHeader><ElementResolver element={card.header} runtime={runtime} /></CardHeader>}
                    <CardContent>{renderChildren(card.content)}</CardContent>
                    {card.footer && <CardFooter>{renderChildren(card.footer)}</CardFooter>}
                </Card>
            );

        case ElementType.map:
            return wrapWithMotion(
                <div>Unsupported: Map (requires react-leaflet or similar)</div>
            );

        case ElementType.container:
            const container = resolvedElement as ContainerElement;
            const layoutClass = {
                flex: 'flex',
                grid: 'grid',
                block: 'block',
                row: 'flex flex-row',
                column: 'flex flex-col',
            }[container.layout] || 'flex';
            return wrapWithMotion(
                <div className={cn(layoutClass, container.gap ? `gap-${container.gap}` : '')}>
                    {renderChildren()}
                </div>
            );

        case ElementType.collapsible:
            return wrapWithMotion(
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        {resolvedElement.children?.[0] && <ElementResolver element={resolvedElement.children[0]} runtime={runtime} />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>{renderChildren(resolvedElement.children?.slice(1))}</CollapsibleContent>
                </Collapsible>
            );

        case ElementType.command:
            return wrapWithMotion(
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {renderChildren()}
                    </CommandList>
                </Command>
            );

        case ElementType.form:
            return <FormResolver element={resolvedElement as FormElement} />;

        case ElementType.table:
            const table = resolvedElement as TableElement;
            const headers = resolveBinding(table.headers, state, t) || [];
            const rows = resolveBinding(table.rows, state, t) || [];
            return wrapWithMotion(
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header: string, i: number) => (
                                <TableHead key={i}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row: any, i: number) => (
                            <TableRow key={i}>
                                {(row.cells || []).map((cell: any, j: number) => (
                                    <TableCell key={j}>{resolveBinding(cell, state, t)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );

        case ElementType.datagrid:
            return <DataGrid element={resolvedElement as DataGridElement} runtime={runtime} />;

        case ElementType.alert:
            const alert = resolvedElement as AlertElement;
            return wrapWithMotion(
                <Alert variant={(alert.variant || 'default') as any}>
                    <AlertDescription>{resolveBinding(alert.message, state, t)}</AlertDescription>
                </Alert>
            );

        case ElementType.badge:
            return wrapWithMotion(
                <Badge>{resolveBinding((resolvedElement as any).message, state, t) || 'Badge'}</Badge>
            );

        case ElementType.breadcrumb:
            const breadcrumb = resolvedElement as BreadcrumbElement;
            return wrapWithMotion(
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumb.items.map((item, i) => (
                            <React.Fragment key={item.id}>
                                <BreadcrumbItem>
                                    {item.href ? (
                                        <BreadcrumbLink href={resolveBinding(item.href, state, t)}>
                                            {resolveBinding(item.label, state, t)}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{resolveBinding(item.label, state, t)}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {i < breadcrumb.items.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            );

        case ElementType.dropdown:
            const dropdown = resolvedElement as DropdownElement;
            return wrapWithMotion(
                <Select
                    value={resolveBinding(dropdown.selectedValue, state, t)}
                    onValueChange={(v) => runEventHandler(dropdown.onChange, { value: v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={resolveBinding(dropdown.label, state, t)} />
                    </SelectTrigger>
                    <SelectContent>
                        {(resolveBinding(dropdown.options, state, t) || []).map((opt: any) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {resolveBinding(opt.label, state, t)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case ElementType.drawer:
            const drawer = resolvedElement as DrawerElement;
            return wrapWithMotion(
                <Drawer
                    open={resolveBinding(drawer.isOpen, state, t)}
                    onOpenChange={(open) => runEventHandler(drawer.onOpenChange, { open })}
                >
                    {drawer.trigger && (
                        <DrawerTrigger asChild>
                            <ElementResolver element={drawer.trigger} runtime={runtime} />
                        </DrawerTrigger>
                    )}
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle>{resolveBinding(drawer.title, state, t)}</DrawerTitle>
                            {drawer.description && (
                                <DrawerDescription>{resolveBinding(drawer.description, state, t)}</DrawerDescription>
                            )}
                        </DrawerHeader>
                        {renderChildren(drawer.content)}
                        {drawer.footer && <DrawerFooter>{renderChildren(drawer.footer)}</DrawerFooter>}
                    </DrawerContent>
                </Drawer>
            );

        case ElementType.dropdown_menu:
            const dropdownMenu = resolvedElement as DropdownMenuElement;
            return wrapWithMotion(
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <ElementResolver element={dropdownMenu.trigger} runtime={runtime} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {dropdownMenu.items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onSelect={() => runEventHandler(item.onSelect)}
                                className={item.variant === 'destructive' ? 'text-red-600' : ''}
                            >
                                {item.icon && <span className={item.icon} />}
                                {resolveBinding(item.label, state, t)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );

        case ElementType.context_menu:
            const contextMenu = resolvedElement as ContextMenuElement;
            return wrapWithMotion(
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <ElementResolver element={contextMenu.trigger} runtime={runtime} />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        {contextMenu.items.map((item) => {
                            switch (item.type) {
                                case 'item':
                                    return (
                                        <ContextMenuItem
                                            key={item.id}
                                            onSelect={() => runEventHandler(item.onSelect)}
                                        >
                                            {resolveBinding(item.label, state, t)}
                                        </ContextMenuItem>
                                    );
                                case 'checkbox':
                                    return (
                                        <ContextMenuCheckboxItem
                                            key={item.id}
                                            checked={resolveBinding(item.checked, state, t)}
                                            onSelect={() => runEventHandler(item.onSelect)}
                                        >
                                            {resolveBinding(item.label, state, t)}
                                        </ContextMenuCheckboxItem>
                                    );
                                case 'radio':
                                    return (
                                        <ContextMenuRadioItem
                                            key={item.id}
                                            value={item.value}
                                            onSelect={() => runEventHandler(item.onSelect)}
                                        >
                                            {resolveBinding(item.label, state, t)}
                                        </ContextMenuRadioItem>
                                    );
                                case 'label':
                                    return (
                                        <ContextMenuLabel key={item.id}>
                                            {resolveBinding(item.label, state, t)}
                                        </ContextMenuLabel>
                                    );
                                case 'separator':
                                    return <ContextMenuSeparator key={item.id} />;
                                case 'sub':
                                    return (
                                        <ContextMenuSub key={item.id}>
                                            <ContextMenuSubTrigger>
                                                {resolveBinding(item.label, state, t)}
                                            </ContextMenuSubTrigger>
                                            <ContextMenuSubContent>
                                                {item.items.map((subItem) => (
                                                    <ContextMenuItem
                                                        key={subItem.id}
                                                        onSelect={() => runEventHandler(subItem.onSelect)}
                                                    >
                                                        {resolveBinding(subItem.label, state, t)}
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
            );

        case ElementType.tabs:
            const tabs = resolvedElement as TabsElement;
            return wrapWithMotion(
                <Tabs
                    value={tabs.activeTab}
                    onValueChange={(v) => runEventHandler(tabs.onChange, { value: v })}
                >
                    <TabsList>
                        {tabs.tabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id}>
                            {renderChildren(tab.content)}
                        </TabsContent>
                    ))}
                </Tabs>
            );

        case ElementType.accordion:
            const accordion = resolvedElement as AccordionElement;
            return wrapWithMotion(
                <Accordion
                    type="single"
                    value={resolveBinding(accordion.expandedItem, state, t)}
                    onValueChange={(v) => runEventHandler(accordion.onChange, { value: v })}
                >
                    {accordion.items.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger>{resolveBinding(item.title, state, t)}</AccordionTrigger>
                            <AccordionContent>{renderChildren(item.content)}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            );

        case ElementType.carousel:
            const carousel = resolvedElement as CarouselElement;
            const [api, setApi] = useState<CarouselApi>();
            useEffect(() => {
                if (carousel.autoPlay && api) {
                    const interval = setInterval(() => api.scrollNext(), carousel.interval || 3000);
                    return () => clearInterval(interval);
                }
            }, [api, carousel.autoPlay, carousel.interval]);
            return wrapWithMotion(
                <Carousel setApi={setApi}>
                    <CarouselContent>
                        {(resolveBinding(carousel.items, state, t) || []).map((item: any, i: number) => (
                            <CarouselItem key={i}>
                                {typeof item === 'object' && 'type' in item ? (
                                    <ElementResolver element={item} runtime={runtime} />
                                ) : (
                                    item
                                )}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            );

        case ElementType.loader:
            const loader = resolvedElement as LoaderElement;
            return wrapWithMotion(
                <Loader2
                    className={cn("animate-spin", loader.size ? `h-${loader.size} w-${loader.size}` : '')}
                />
            );

        case ElementType.video:
            const video = resolvedElement as VideoElement;
            return wrapWithMotion(
                <video
                    src={resolveBinding(video.src, state, t)}
                    width={video.width}
                    height={video.height}
                    autoPlay={video.autoPlay}
                    loop={video.loop}
                    controls={video.controls}
                />
            );

        case ElementType.payment:
            const payment = resolvedElement as PaymentElement;
            return wrapWithMotion(
                <div>
                    Unsupported: Payment (requires {payment.provider} integration)
                </div>
            );

        case ElementType.chart:
            const chart = resolvedElement as ChartElement;
            return wrapWithMotion(
                <Chart
                    chartType={chart.chartType}
                    data={resolveBinding(chart.data, state, t)}
                    options={chart.options}
                />
            );

        case ElementType.custom:
            const custom = resolvedElement;
            const CustomComp = runtime.customComponents?.[custom.component] || (() => (
                <div>Custom Component: {custom.component}</div>
            ));
            return wrapWithMotion(
                <CustomComp {...resolveBinding(custom.props, state, t)} />
            );

        case ElementType.avatar:
            const avatar = resolvedElement as AvatarElement;
            return wrapWithMotion(
                <Avatar>
                    <AvatarImage src={resolveBinding(avatar.src, state, t)} />
                    <AvatarFallback>{avatar.src ? '' : 'AV'}</AvatarFallback>
                </Avatar>
            );

        case ElementType.voice:
            const voice = resolvedElement as VoiceElement;
            return wrapWithMotion(
                <div>Unsupported: Voice (requires Web Speech API)</div>
            );

        case ElementType.call:
            const call = resolvedElement as CallElement;
            return wrapWithMotion(
                <div>Unsupported: Call (requires WebRTC)</div>
            );

        case ElementType.slider:
            const slider = resolvedElement as SliderElement;
            return wrapWithMotion(
                <Carousel>
                    <CarouselContent>
                        {slider.elements.map((el, i) => (
                            <CarouselItem key={i}>
                                <ElementResolver element={el} runtime={runtime} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            );

        case ElementType.wallet:
            const wallet = resolvedElement as WalletElement;
            return wrapWithMotion(
                <div>Unsupported: Wallet (requires {wallet.provider} integration)</div>
            );

        case ElementType.editor:
            const editor = resolvedElement as EditorElement;
            return wrapWithMotion(
                <div>Unsupported: Editor (requires react-quill or similar)</div>
            );

        case ElementType.quiz:
            const quiz = resolvedElement as QuizElement;
            return wrapWithMotion(
                <div>
                    {quiz.questions.map((q) => (
                        <div key={q.id}>
                            <p>{resolveBinding(q.question, state, t)}</p>
                            <RadioGroup onValueChange={(v) => runEventHandler(quiz.onSubmit, { answer: v })}>
                                {q.options.map((opt) => (
                                    <div key={opt.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.value} id={opt.value} />
                                        <Label htmlFor={opt.value}>{resolveBinding(opt.label, state, t)}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                </div>
            );

        case ElementType.calendar:
            const calendar = resolvedElement as CalendarElement;
            return wrapWithMotion(
                <Calendar
                    mode="single"
                    required={false}
                    selected={calendar.value ? new Date(resolveBinding(calendar.value, state, t)) : undefined}
                    onSelect={(date) => runEventHandler(calendar.onSelect, { date })}
                />
            );

        case ElementType.qr_code:
            const qrCode = resolvedElement as QRCodeElement;
            return wrapWithMotion(
                <div>Unsupported: QR Code (requires qrcode.react)</div>
            );

        case ElementType.step_wizard:
            const wizard = resolvedElement as StepWizardElement;
            const [currentStep, setCurrentStep] = useState(wizard.current || 0);
            const step = wizard.steps[currentStep];
            return wrapWithMotion(
                <div>
                    <div>Step {currentStep + 1}: {step.title}</div>
                    {renderChildren(step.content)}
                    <div className="flex space-x-2 mt-4">
                        <Button
                            onClick={() => {
                                if (step.onPrev) runEventHandler(step.onPrev);
                                setCurrentStep((prev) => Math.max(0, prev - 1));
                            }}
                            disabled={currentStep === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() => {
                                if (step.validate && step.validateAction) runEventHandler(step.validateAction);
                                if (currentStep === wizard.steps.length - 1) {
                                    if (step.onComplete) runEventHandler(step.onComplete);
                                } else {
                                    if (step.onNext) runEventHandler(step.onNext);
                                    setCurrentStep((prev) => prev + 1);
                                }
                            }}
                        >
                            {currentStep === wizard.steps.length - 1 ? 'Complete' : 'Next'}
                        </Button>
                    </div>
                </div>
            );

        case ElementType.wallet_connect_button:
            const walletButton = resolvedElement as WalletConnectButtonElement;
            return wrapWithMotion(
                <Button onClick={() => runEventHandler({ action: 'wallet_connect' as any, params: { projectId: walletButton.projectId, chainId: walletButton.chainId } })}>
                    Connect Wallet
                </Button>
            );

        case ElementType.file_upload:
            const fileUpload = resolvedElement as FileUploadElement;
            return wrapWithMotion(
                <Input
                    type="file"
                    accept={fileUpload.accept}
                    multiple={fileUpload.multiple}
                    onChange={(e) => runEventHandler(fileUpload.onUploaded, { files: e.target.files })}
                />
            );

        default:
            return wrapWithMotion(
                <div>Unsupported element type: {resolvedElement.type}</div>
            );
    }
}