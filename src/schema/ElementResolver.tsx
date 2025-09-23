"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { AnyObj, DropdownElement, FormElement, InputElement, UIElement } from "./types-bridges";
import { ElementType, Alignment, InputType, ButtonVariant } from "./types-bridges";
import { resolveBinding, isVisible, classesFromStyleProps, getAccessibilityProps, motionFromAnimation, deepResolveBindings, cn } from "../lib/utils";

// shadcn imports
import { AccordionRenderer } from "../components/ui/accordion";
import {
    AlertDialogRenderer,
} from "../components/ui/alert-dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage, AvatarRenderer } from "../components/ui/avatar";
import { Badge, BadgeRenderer } from "../components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbRenderer, BreadcrumbSeparator } from "../components/ui/breadcrumb";
import { Button, ButtonRenderer } from "../components/ui/button";
import { Calendar, CalendarRenderer } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription, CardRenderer } from "../components/ui/card";
import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    CarouselRenderer,
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
import {
    AccordionElement,
    AlertElement,
    AvatarElement,
    BreadcrumbElement,
    ButtonElement,
    CallElement,
    CalendarElement,
    CardElement, CarouselElement,
    ChartElement,
    ContainerElement,
    ContextMenuElement,
    DataGridElement,
    ModalElement,
    DrawerElement,
    DropdownMenuElement,
    EditorElement,
    FileUploadElement,
    FooterElement,
    HeaderElement,
    IconElement,
    ImageElement,
    PaymentElement,
    QRCodeElement, SliderElement, StepWizardElement, TableElement, TabsElement, TextElement, VideoElement, VoiceElement, WalletElement, WalletConnectButtonElement,
    AlertDialogElement,
    BadgeElement
} from "../types";

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
        case ElementType.accordion:
            return wrapWithMotion(
                <AccordionRenderer
                    element={resolvedElement as AccordionElement}
                    runtime={runtime}
                />
            )

        case ElementType.alert:
            const alert = resolvedElement as AlertElement;
            return wrapWithMotion(
                <Alert dismissible={alert.dismissible} variant={alert.variant || 'default'}>
                    <AlertDescription>{resolveBinding(alert.message, state, t)}</AlertDescription>
                </Alert>
            );

        case ElementType.alert_dialog:
            return wrapWithMotion(
                <AlertDialogRenderer element={resolvedElement as AlertDialogElement} runtime={runtime} />
            )


        case ElementType.avatar:
            const avatar = resolvedElement as AvatarElement;
            return wrapWithMotion(
                <AvatarRenderer element={resolvedElement as AvatarElement} />
            );

        case ElementType.badge:
            return wrapWithMotion(<BadgeRenderer element={resolvedElement as BadgeElement} runtime={runtime} />)

        case ElementType.breadcrumb:
            return wrapWithMotion(
                <BreadcrumbRenderer element={resolvedElement as BreadcrumbElement} runtime={runtime} />
            )

        case ElementType.button:
            return wrapWithMotion(
                <ButtonRenderer element={resolvedElement as ButtonElement} runtime={runtime} />
            )


        case ElementType.call:
            const call = resolvedElement as CallElement;
            return wrapWithMotion(
                <div>Unsupported: Call (requires WebRTC)</div>
            );

        case ElementType.calendar:
            return wrapWithMotion(
                <CalendarRenderer element={resolvedElement as CalendarElement} runtime={runtime} />
            )

        case ElementType.card:
            return wrapWithMotion(
                <CardRenderer element={resolvedElement as CardElement} runtime={runtime} />
            )

        case ElementType.carousel:
            const carousel = resolvedElement as CarouselElement;
            return wrapWithMotion(
                <CarouselRenderer element={resolvedElement as CarouselElement} runtime={runtime} state={state} t={t} />
            )

        case ElementType.chart:
            const chart = resolvedElement as ChartElement;
            return wrapWithMotion(
                <Chart
                    chartType={chart.chartType}
                    data={resolveBinding(chart.data, state, t)}
                    options={chart.options}
                />
            );

        case ElementType.checkbox:
            const checkbox = resolvedElement as InputElement;
            return wrapWithMotion(
                <Checkbox
                    checked={resolveBinding(checkbox.value, state, t)}
                    onCheckedChange={(checked) => runEventHandler(checkbox.onChange, { value: checked })}
                />
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

        case ElementType.custom:
            const custom = resolvedElement as CustomElement;
            const CustomComp = runtime.customComponents?.[custom.component] || (() => (
                <div>Custom Component: {custom.component}</div>
            ));
            return wrapWithMotion(
                <CustomComp {...resolveBinding(custom.props, state, t)} />
            );

        case ElementType.datagrid:
            return <DataGrid element={resolvedElement as DataGridElement} runtime={runtime} />;

        case ElementType.dialog:
            const dialog = resolvedElement as ModalElement;
            return wrapWithMotion(
                <Dialog open={resolveBinding(dialog.isOpen, state, t)} onOpenChange={(open) => !open && runEventHandler(dialog.onClose)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{resolveBinding(dialog.title, state, t)}</DialogTitle>
                        </DialogHeader>
                        {renderChildren(dialog.content)}
                        {dialog.closeButton && <ElementResolver element={dialog.closeButton} runtime={runtime} />}
                    </DialogContent>
                </Dialog>
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

        case ElementType.editor:
            const editor = resolvedElement as EditorElement;
            return wrapWithMotion(
                <div>Unsupported: Editor (requires react-quill or similar)</div>
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

        case ElementType.footer:
            const footer = resolvedElement as FooterElement;
            return wrapWithMotion(
                <footer className={cn(`text-${footer.alignment || 'left'}`)}>
                    {renderChildren()}
                </footer>
            );

        case ElementType.form:
            return <FormResolver element={resolvedElement as FormElement} />;

        case ElementType.header:
            const header = resolvedElement as HeaderElement;
            return wrapWithMotion(
                <header className={cn(`text-${header.alignment || 'left'}`)}>
                    {renderChildren()}
                </header>
            );

        case ElementType.hover_card:
            const hoverCard = resolvedElement as HoverCardElement;
            return wrapWithMotion(
                <HoverCard>
                    <HoverCardTrigger asChild>
                        {hoverCard.trigger && <ElementResolver element={hoverCard.trigger} runtime={runtime} />}
                    </HoverCardTrigger>
                    <HoverCardContent>
                        {renderChildren(hoverCard.content)}
                    </HoverCardContent>
                </HoverCard>
            );

        case ElementType.icon:
            const icon = resolvedElement as IconElement;
            const IconComp = runtime.icons?.[icon.name] || Loader2; // Fallback to Loader2
            return wrapWithMotion(
                <IconComp size={icon.size} aria-label={resolveBinding(icon.label, state, t)} />
            );

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

        case ElementType.input:
            const input = resolvedElement as InputElement;
            const value = resolveBinding(input.value, state, t);
            const options = resolveBinding(input.options, state, t) || [];

            const handleInputChange = (newValue: any) => {
                if (input.onChange) {
                    runEventHandler(input.onChange, { value: newValue });
                }
            };

            const inputProps = {
                value,
                placeholder: resolveBinding(input.placeholder, state, t),
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    handleInputChange(e.target.value),
                min: input.min,
                max: input.max,
                step: input.step,
                accept: input.accept,
                multiple: input.multiple,
            };

            const renderInput = () => {
                switch (input.inputType) {
                    case InputType.text:
                    case InputType.email:
                    case InputType.password:
                    case InputType.number:
                    case InputType.date:
                    case InputType.datetime_local:
                    case InputType.time:
                    case InputType.month:
                    case InputType.week:
                    case InputType.search:
                    case InputType.tel:
                    case InputType.url:
                    case InputType.color:
                        return <Input type={input.inputType} {...inputProps} />;

                    case InputType.checkbox:
                        return <Checkbox checked={value} onCheckedChange={handleInputChange} />;

                    case InputType.radio:
                        return (
                            <RadioGroup value={value} onValueChange={handleInputChange}>
                                {options.map((opt: any) => (
                                    <div key={opt.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={opt.value} id={opt.value} />
                                        <Label htmlFor={opt.value}>{resolveBinding(opt.label, state, t)}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        );

                    case InputType.select:
                        return (
                            <Select value={value} onValueChange={handleInputChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder={inputProps.placeholder} />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((opt: any) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {resolveBinding(opt.label, state, t)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );

                    case InputType.file:
                        return (
                            <Input
                                type="file"
                                {...inputProps}
                                onChange={(e) => handleInputChange(e.target.files)}
                            />
                        );

                    case InputType.textarea:
                        return <Textarea {...inputProps} />;

                    case InputType.multiselect:
                        return (
                            <TagsInput
                                value={value || []}
                                onChange={handleInputChange}
                                options={options}
                            />
                        );

                    case InputType.slider:
                        return (
                            <Slider
                                value={[value || 0]}
                                min={input.min}
                                max={input.max}
                                step={input.step}
                                onValueChange={(v) => handleInputChange(v[0])}
                            />
                        );

                    case InputType.toggle:
                        return <Toggle pressed={value} onPressedChange={handleInputChange} />;

                    case InputType.switch:
                        return <Switch checked={value} onCheckedChange={handleInputChange} />;

                    case InputType.otp:
                        return (
                            <InputOTP
                                maxLength={input.max ?? 6}
                                value={value}
                                onChange={handleInputChange}
                            >
                                <InputOTPGroup>
                                    {Array.from({ length: input.max ?? 6 }).map((_, i) => (
                                        <InputOTPSlot key={i} index={i} />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        );

                    case InputType.createselect:
                        return (
                            <CreateSelect
                                options={options}
                                value={value}
                                onChange={handleInputChange}
                                onCreate={(newOpt) => runEventHandler(input.onCreate, { newOption: newOpt })}
                            />
                        );

                    case InputType.calendar:
                        return (
                            <Calendar
                                selected={value ? new Date(value) : undefined}
                                onSelect={(date) => handleInputChange(date)}
                            />
                        );

                    case InputType.rating:
                        return <RatingInput value={value} onChange={handleInputChange} />;

                    case InputType.signature:
                        return <SignatureInput value={value} onChange={handleInputChange} />;

                    case InputType.richtext:
                        return <RichtextInput value={value} onChange={handleInputChange} />;

                    case InputType.code:
                        return <CodeInput value={value} onChange={handleInputChange} />;

                    case InputType.markdown:
                        return <MarkdownInput value={value} onChange={handleInputChange} />;

                    case InputType.tags:
                        return <TagsInput value={value || []} onChange={handleInputChange} />;

                    case InputType.currency:
                        return (
                            <CurrencyInput
                                value={value}
                                onChange={handleInputChange}
                                currency={resolveBinding(input.currency, state, t)}
                            />
                        );

                    case InputType.credit_card:
                        return <CreditCardInput value={value} onChange={handleInputChange} />;

                    default:
                        return <Input {...inputProps} />;
                }
            };

            return wrapWithMotion(
                <div className="space-y-1">
                    {input.label && <Label htmlFor={input.id}>{resolveBinding(input.label, state, t)}</Label>}
                    {renderInput()}
                </div>
            );

        case ElementType.menubar:
            const menubar = resolvedElement as MenubarElement;
            return wrapWithMotion(
                <Menubar>
                    {menubar.menus.map((menu) => (
                        <MenubarMenu key={menu.id}>
                            <MenubarTrigger>{resolveBinding(menu.label, state, t)}</MenubarTrigger>
                            <MenubarContent>
                                {menu.items.map((item) => (
                                    <MenubarItem
                                        key={item.id}
                                        onSelect={() => runEventHandler(item.onSelect)}
                                    >
                                        {resolveBinding(item.label, state, t)}
                                    </MenubarItem>
                                ))}
                            </MenubarContent>
                        </MenubarMenu>
                    ))}
                </Menubar>
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

        case ElementType.navigation_menu:
            const navMenu = resolvedElement as NavigationMenuElement;
            return wrapWithMotion(
                <NavigationMenu>
                    <NavigationMenuList>
                        {navMenu.items.map((item) => (
                            <NavigationMenuItem key={item.id}>
                                <NavigationMenuTrigger>{resolveBinding(item.label, state, t)}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    {renderChildren(item.content)}
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            );

        case ElementType.pagination:
            const pagination = resolvedElement as PaginationElement;
            return wrapWithMotion(
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => runEventHandler(pagination.onPrevious)} />
                        </PaginationItem>
                        {pagination.pages.map((page, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    isActive={page.active}
                                    onClick={() => runEventHandler(pagination.onPageChange, { page: page.number })}
                                >
                                    {page.number}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext onClick={() => runEventHandler(pagination.onNext)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            );

        case ElementType.payment:
            const payment = resolvedElement as PaymentElement;
            return wrapWithMotion(
                <div>
                    Unsupported: Payment (requires {payment.provider} integration)
                </div>
            );

        case ElementType.popover:
            const popover = resolvedElement as PopoverElement;
            return wrapWithMotion(
                <Popover>
                    <PopoverTrigger asChild>
                        {popover.trigger && <ElementResolver element={popover.trigger} runtime={runtime} />}
                    </PopoverTrigger>
                    <PopoverContent>
                        {renderChildren(popover.content)}
                    </PopoverContent>
                </Popover>
            );

        case ElementType.progress:
            const progress = resolvedElement as ProgressElement;
            return wrapWithMotion(
                <Progress value={resolveBinding(progress.value, state, t)} />
            );

        case ElementType.qr_code:
            const qrCode = resolvedElement as QRCodeElement;
            return wrapWithMotion(
                <div>Unsupported: QR Code (requires qrcode.react)</div>
            );

        case ElementType.radio_group:
            const radioGroup = resolvedElement as RadioGroupElement;
            return wrapWithMotion(
                <RadioGroup
                    value={resolveBinding(radioGroup.value, state, t)}
                    onValueChange={(v) => runEventHandler(radioGroup.onChange, { value: v })}
                >
                    {(resolveBinding(radioGroup.options, state, t) || []).map((opt: any) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={opt.value} />
                            <Label htmlFor={opt.value}>{resolveBinding(opt.label, state, t)}</Label>
                        </div>
                    ))}
                </RadioGroup>
            );

        case ElementType.resizable:
            const resizable = resolvedElement as ResizableElement;
            return wrapWithMotion(
                <ResizablePanelGroup direction={resizable.direction || 'horizontal'}>
                    {resizable.panels.map((panel, i) => (
                        <React.Fragment key={i}>
                            <ResizablePanel>{renderChildren(panel.content)}</ResizablePanel>
                            {i < resizable.panels.length - 1 && <ResizableHandle />}
                        </React.Fragment>
                    ))}
                </ResizablePanelGroup>
            );

        case ElementType.scroll_area:
            return wrapWithMotion(
                <ScrollArea>
                    {renderChildren()}
                </ScrollArea>
            );

        case ElementType.separator:
            return wrapWithMotion(
                <Separator />
            );

        case ElementType.sheet:
            const sheet = resolvedElement as SheetElement;
            return wrapWithMotion(
                <Sheet
                    open={resolveBinding(sheet.isOpen, state, t)}
                    onOpenChange={(open) => runEventHandler(sheet.onOpenChange, { open })}
                >
                    {sheet.trigger && (
                        <SheetTrigger asChild>
                            <ElementResolver element={sheet.trigger} runtime={runtime} />
                        </SheetTrigger>
                    )}
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{resolveBinding(sheet.title, state, t)}</SheetTitle>
                            {sheet.description && (
                                <SheetDescription>{resolveBinding(sheet.description, state, t)}</SheetDescription>
                            )}
                        </SheetHeader>
                        {renderChildren(sheet.content)}
                        {sheet.footer && <SheetFooter>{renderChildren(sheet.footer)}</SheetFooter>}
                    </SheetContent>
                </Sheet>
            );

        case ElementType.sidebar:
            const sidebar = resolvedElement as SidebarElement;
            return wrapWithMotion(
                <Sidebar>
                    <SidebarHeader>{sidebar.header && <ElementResolver element={sidebar.header} runtime={runtime} />}</SidebarHeader>
                    <SidebarContent>
                        {sidebar.groups.map((group) => (
                            <SidebarGroup key={group.id}>
                                <SidebarGroupLabel>{resolveBinding(group.label, state, t)}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {group.items.map((item) => (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton asChild>
                                                    <ElementResolver element={item} runtime={runtime} />
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>
                    <SidebarFooter>{sidebar.footer && <ElementResolver element={sidebar.footer} runtime={runtime} />}</SidebarFooter>
                </Sidebar>
            );

        case ElementType.skeleton:
            return wrapWithMotion(
                <Skeleton />
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

        case ElementType.switch:
            const switchEl = resolvedElement as InputElement;
            return wrapWithMotion(
                <Switch
                    checked={resolveBinding(switchEl.value, state, t)}
                    onCheckedChange={(checked) => runEventHandler(switchEl.onChange, { value: checked })}
                />
            );

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

        case ElementType.text:
            const text = resolvedElement as TextElement;
            const TextTag = text.tag || 'p';
            const MotionText = motion[TextTag] || motion.div;
            return (
                <MotionText
                    className={cn(className, `text-${text.alignment || 'left'}`, text.fontWeight ? `font-${text.fontWeight}` : '')}
                    {...accessibilityProps}
                    {...animationProps}
                    dangerouslySetInnerHTML={text.contentFormat === 'html' ? { __html: resolveBinding(text.content, state, t) } : undefined}
                >
                    {text.contentFormat !== 'html' ? resolveBinding(text.content, state, t) : null}
                </MotionText>
            );

        case ElementType.textarea:
            const textarea = resolvedElement as InputElement;
            return wrapWithMotion(
                <Textarea
                    value={resolveBinding(textarea.value, state, t)}
                    onChange={(e) => runEventHandler(textarea.onChange, { value: e.target.value })}
                    placeholder={resolveBinding(textarea.placeholder, state, t)}
                />
            );

        case ElementType.three_d_model:
            return wrapWithMotion(
                <div>Unsupported: 3D Model (requires @react-three/fiber)</div>
            );

        case ElementType.toggle:
            const toggle = resolvedElement as InputElement;
            return wrapWithMotion(
                <Toggle
                    pressed={resolveBinding(toggle.value, state, t)}
                    onPressedChange={(pressed) => runEventHandler(toggle.onChange, { value: pressed })}
                />
            );

        case ElementType.toggle_group:
            const toggleGroup = resolvedElement as ToggleGroupElement;
            return wrapWithMotion(
                <ToggleGroup
                    type="multiple"
                    value={resolveBinding(toggleGroup.value, state, t) || []}
                    onValueChange={(value) => runEventHandler(toggleGroup.onChange, { value })}
                >
                    {(resolveBinding(toggleGroup.options, state, t) || []).map((opt: any) => (
                        <ToggleGroupItem key={opt.value} value={opt.value}>
                            {resolveBinding(opt.label, state, t)}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            );

        case ElementType.tooltip:
            const tooltip = resolvedElement as TooltipElement;
            return wrapWithMotion(
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {tooltip.trigger && <ElementResolver element={tooltip.trigger} runtime={runtime} />}
                        </TooltipTrigger>
                        <TooltipContent>
                            {resolveBinding(tooltip.content, state, t)}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
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

        case ElementType.voice:
            const voice = resolvedElement as VoiceElement;
            return wrapWithMotion(
                <div>Unsupported: Voice (requires Web Speech API)</div>
            );

        case ElementType.wallet:
            const wallet = resolvedElement as WalletElement;
            return wrapWithMotion(
                <div>Unsupported: Wallet (requires {wallet.provider} integration)</div>
            );

        case ElementType.wallet_connect_button:
            const walletButton = resolvedElement as WalletConnectButtonElement;
            return wrapWithMotion(
                <Button onClick={() => runEventHandler({ action: 'wallet_connect' as any, params: { projectId: walletButton.projectId, chainId: walletButton.chainId } })}>
                    Connect Wallet
                </Button>
            );

        default:
            return wrapWithMotion(
                <div>Unsupported element type: {resolvedElement.type}</div>
            );
    }
}