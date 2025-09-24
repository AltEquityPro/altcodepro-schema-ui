"use client";

import { useMemo } from "react";
import type {
    AnyObj,
    DropdownElement,
    FormElement,
    InputElement,
    UIElement
} from "./types-bridges";
import { ElementType } from "./types-bridges";
import {
    resolveBinding,
    isVisible,
    classesFromStyleProps,
    deepResolveBindings,
    cn
} from "../lib/utils";

// shadcn imports
import { AccordionRenderer } from "../components/ui/accordion";
import {
    AlertDialogRenderer,
} from "../components/ui/alert-dialog";
import {
    Alert,
    AlertDescription
} from "../components/ui/alert";
import { AvatarRenderer } from "../components/ui/avatar";
import { BadgeRenderer } from "../components/ui/badge";
import { BreadcrumbRenderer } from "../components/ui/breadcrumb";
import { Button, ButtonRenderer } from "../components/ui/button";
import { CalendarRenderer } from "../components/ui/calendar";
import { CardRenderer } from "../components/ui/card";
import {
    CarouselRenderer,
} from "../components/ui/carousel";
import { Chart } from "../components/ui/chart";
import { CollapsibleRenderer } from "../components/ui/collapsible";
import { CommandRenderer } from "../components/ui/command";
import {
    ContextMenuRenderer
} from "../components/ui/context-menu";
import {
    ModalRenderer
} from "../components/ui/dialog";
import { DrawerRenderer } from "../components/ui/drawer";
import { DropdownRenderer } from "../components/ui/dropdown-menu";
import {
    PageRenderer
} from "../components/ui/pagination";
import { PopoverRenderer } from "../components/ui/popover";
import { ProgressRenderer } from "../components/ui/progress";
import { RadioGroupRenderer } from "../components/ui/radio-group";
import { ResizableRenderer } from "../components/ui/resizable";
import { ScrollAreaRenderer } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
    SheetRenderer
} from "../components/ui/sheet";
import {
    SidebarRenderer
} from "../components/ui/sidebar";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "../components/ui/table";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { ToggleGroup } from "../components/ui/toggle-group";
import { Toggle } from "../components/ui/toggle";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "../components/ui/tooltip";
import { motion } from "framer-motion";
import { useActionHandler } from "./Actions";
import { useAppState } from "./StateContext";
import { FormResolver } from "../components/ui/form-resolver";
import { DataGrid } from "../components/ui/datagrid";
import { CodeInput } from "../components/ui/code-input";
import {
    AccordionElement,
    AlertElement,
    AvatarElement,
    BreadcrumbElement,
    ButtonElement,
    CallElement,
    CalendarElement,
    CustomElement,
    CardElement, CarouselElement,
    ChartElement,
    ContainerElement,
    ContextMenuElement,
    DataGridElement,
    ModalElement,
    DrawerElement,
    EditorElement,
    FileUploadElement,
    FooterElement,
    HeaderElement,
    IconElement,
    ImageElement,
    PaymentElement,
    QRReaderlement,
    TableElement,
    TabsElement,
    TextElement,
    VideoElement,
    VoiceElement,
    WalletElement,
    AlertDialogElement,
    BadgeElement,
    CollapsibleElement,
    CommandElement,
    TooltipElement,
    ToggleGroupElement,
    SidebarElement,
    BaseElement,
    MenuElement,
    ToggleElement
} from "../types";
import { RenderChildren } from "./RenderChildren";
import { ContainerRenderer } from "../components/ui/container";
import { DynamicIcon } from "../components/ui/dynamic-icon";
import CustomComponentRender from "../components/ui/custom-component";
import { RichTextEditor } from "../components/ui/richtext-input";
import { FileUploadRenderer } from "../components/ui/file-upload";
import wrapWithMotion from "../components/ui/wrapWithMotion";
import { MenuRenderer } from "../components/ui/menu-render";
import StepWizardRenderer from "../components/ui/stepper";
import { VideoRenderer } from "../components/ui/videoplayer";
import { CallRenderer } from "../components/ui/call-renderer";
import { QRCodeRenderer } from "../components/ui/qr-code";
import { WalletRenderer } from "../components/ui/wallet-renderer";

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

    if (!isVisible(element.visibility, state, t)) return null;

    const className = classesFromStyleProps(element.styles);
    const resolvedElement = useMemo(() => deepResolveBindings(element, state, t), [element, state, t]);

    switch (resolvedElement.type) {
        case ElementType.accordion:
            return wrapWithMotion(resolvedElement,
                <AccordionRenderer
                    element={resolvedElement as AccordionElement}
                    runtime={runtime}
                />
            )
        case ElementType.alert:
            const alert = resolvedElement as AlertElement;
            return wrapWithMotion(alert,
                <Alert dismissible={alert.dismissible} variant={alert.variant || 'default'}>
                    <AlertDescription>{resolveBinding(alert.message, state, t)}</AlertDescription>
                </Alert>
            )
        case ElementType.alert_dialog:
            return wrapWithMotion(resolvedElement,
                <AlertDialogRenderer element={resolvedElement as AlertDialogElement} runtime={runtime} />
            )
        case ElementType.avatar:
            const avatar = resolvedElement as AvatarElement;
            return wrapWithMotion(resolvedElement,
                <AvatarRenderer element={resolvedElement as AvatarElement} />
            )
        case ElementType.badge:
            return wrapWithMotion(resolvedElement, <BadgeRenderer element={resolvedElement as BadgeElement} runtime={runtime} />)
        case ElementType.breadcrumb:
            return wrapWithMotion(resolvedElement,
                <BreadcrumbRenderer element={resolvedElement as BreadcrumbElement} runtime={runtime} />
            )
        case ElementType.button:
            return wrapWithMotion(resolvedElement,
                <ButtonRenderer element={resolvedElement as ButtonElement} runtime={runtime} />
            )
        // ElementResolver.tsx (switch case)
        case ElementType.call: {
            const call = resolvedElement as CallElement;
            return wrapWithMotion(resolvedElement,
                <CallRenderer element={call} state={state} t={t} runEventHandler={runEventHandler} />
            );
        }

        case ElementType.calendar:
            return wrapWithMotion(resolvedElement,
                <CalendarRenderer element={resolvedElement as CalendarElement} runtime={runtime} />
            )
        case ElementType.card:
            return wrapWithMotion(resolvedElement,
                <CardRenderer element={resolvedElement as CardElement} runtime={runtime} />
            )
        case ElementType.carousel:
            const carousel = resolvedElement as CarouselElement;
            return wrapWithMotion(carousel,
                <CarouselRenderer element={carousel} runtime={runtime} state={state} t={t} />
            )
        case ElementType.chart: {
            const chart = resolvedElement as ChartElement
            return wrapWithMotion(chart, <Chart element={chart} state={state} t={t} />)
        }
        case ElementType.code: {
            return wrapWithMotion(resolvedElement, <CodeInput value={resolveBinding((resolvedElement as BaseElement).value, state, t)} />)
        }
        case ElementType.collapsible:
            return wrapWithMotion(resolvedElement,
                <CollapsibleRenderer
                    element={resolvedElement as CollapsibleElement}
                    runtime={runtime}
                    state={state}
                    t={t}
                    runEventHandler={runEventHandler}
                />
            )
        case ElementType.command:
            return wrapWithMotion(resolvedElement,
                <CommandRenderer element={resolvedElement as CommandElement} runEventHandler={runEventHandler} />
            )

        case ElementType.container:
            const container = resolvedElement as ContainerElement;
            return wrapWithMotion(container,
                <ContainerRenderer element={container} />
            )

        case ElementType.context_menu:
            const contextMenu = resolvedElement as ContextMenuElement;
            return <ContextMenuRenderer element={contextMenu} state={state} t={t} runEventHandler={runEventHandler} />

        case ElementType.custom: {
            return <CustomComponentRender element={resolvedElement as CustomElement} state={state} t={t} runtime={runtime} />
        }

        case ElementType.datagrid:
            return <DataGrid element={resolvedElement as DataGridElement} runtime={runtime} />;


        case ElementType.drawer:
            return wrapWithMotion(resolvedElement,
                <DrawerRenderer element={resolvedElement as DrawerElement} runEventHandler={runEventHandler} />
            );

        case ElementType.dropdown:
            const dropdown = resolvedElement as DropdownElement;
            return wrapWithMotion(dropdown,
                <DropdownRenderer dropdown={dropdown} runEventHandler={runEventHandler} state={state} t={t} />
            );

        case ElementType.editor: {
            const editor = resolvedElement as EditorElement
            const content = resolveBinding(editor.content, state, t) || ""
            const placeholder = resolveBinding(editor.placeholder, state, t)

            return wrapWithMotion(editor,
                <RichTextEditor
                    value={content}
                    placeholder={placeholder}
                    toolbar={editor.toolbar}
                    onChange={(val) => runEventHandler(editor.onChange, { value: val })}
                    className={editor.styles?.className}
                />
            )
        }
        case ElementType.file_upload: {
            const el = resolvedElement as FileUploadElement
            return <FileUploadRenderer
                element={el}
                runEventHandler={runEventHandler}
            />
        }
        case ElementType.footer:
            const footer = resolvedElement as FooterElement;
            return wrapWithMotion(resolvedElement,
                <footer className={cn(`text-${footer.alignment || 'left'}`)}>
                    {footer.children && <RenderChildren children={footer.children} />}
                </footer>
            );

        case ElementType.form:
            return wrapWithMotion(resolvedElement, <FormResolver element={resolvedElement as FormElement} />);

        case ElementType.header:
            const header = resolvedElement as HeaderElement;
            return wrapWithMotion(resolvedElement,
                <header className={cn(`text-${header.alignment || 'left'}`)}>
                    {header.children && <RenderChildren children={header.children} />}
                </header>
            );

        case ElementType.icon:
            const icon = resolvedElement as IconElement;
            return wrapWithMotion(resolvedElement,
                <DynamicIcon name={icon.name} size={icon.size} aria-label={resolveBinding(icon.label, state, t)} />
            );

        case ElementType.image:
            const image = resolvedElement as ImageElement;
            return wrapWithMotion(resolvedElement,
                <img
                    src={resolveBinding(image.src, state, t)}
                    alt={resolveBinding(image.alt, state, t)}
                    width={image.width}
                    height={image.height}
                />
            );
        case ElementType.menu:
            const menubar = resolvedElement as MenuElement;
            return <MenuRenderer element={menubar} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.modal:
            const modal = resolvedElement as ModalElement;
            return <ModalRenderer element={modal} runEventHandler={runEventHandler} runtime={runtime} />

        case ElementType.pagination:
            return <PageRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.payment:
            const payment = resolvedElement as PaymentElement;
            return wrapWithMotion(element,
                <div>
                    Unsupported: Payment (requires {payment.provider} integration)
                </div>
            );

        case ElementType.popover:
            return <PopoverRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} runtime={runtime} />

        case ElementType.progress:
            return <ProgressRenderer element={resolvedElement} state={state} t={t} />

        case ElementType.qr_reader:
            const qr = resolvedElement as QRReaderlement;
            return wrapWithMotion(qr,
                <QRCodeRenderer element={qr} state={state} t={t} runEventHandler={runEventHandler} />
            );

        case ElementType.radio_group:
            return <RadioGroupRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.resizable:
            return <ResizableRenderer element={resolvedElement} state={state} t={t} />

        case ElementType.scroll_area:
            return <ScrollAreaRenderer element={resolvedElement} />

        case ElementType.separator:
            return wrapWithMotion(element,
                <Separator />
            );

        case ElementType.sheet:
            return <SheetRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.sidebar:
            const sidebar = resolvedElement as SidebarElement;
            return <SidebarRenderer element={resolvedElement} runtime={runtime} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.skeleton:
            return wrapWithMotion(element,
                <Skeleton />
            );

        case ElementType.step_wizard:
            return <StepWizardRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />

        case ElementType.switch:
            const switchEl = resolvedElement as InputElement;
            return wrapWithMotion(element,
                <Switch
                    checked={resolveBinding(switchEl.value, state, t)}
                    onCheckedChange={(checked) => runEventHandler(switchEl.onChange, { value: checked })}
                />
            );

        case ElementType.table:
            const table = resolvedElement as TableElement;
            const headers = resolveBinding(table.headers, state, t) || [];
            const rows = resolveBinding(table.rows, state, t) || [];
            return wrapWithMotion(element,
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
            return wrapWithMotion(element,
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
                            <RenderChildren children={tab.content} />
                        </TabsContent>
                    ))}
                </Tabs>
            );

        case ElementType.text:
            const text = resolvedElement as TextElement;
            const TextTag = text.tag || 'p';
            const MotionText = ((motion as any)[TextTag]) || motion.div;
            return (

                <MotionText
                    className={cn(className, `text-${text.alignment || 'left'}`, text.fontWeight ? `font-${text.fontWeight}` : '')}
                    dangerouslySetInnerHTML={text.contentFormat === 'html' ? { __html: resolveBinding(text.content, state, t) } : undefined}
                >
                    {text.contentFormat !== 'html' ? resolveBinding(text.content, state, t) : null}
                </MotionText>
            );

        case ElementType.textarea:
            const textarea = resolvedElement as InputElement;
            return wrapWithMotion(element,
                <Textarea
                    value={resolveBinding(textarea.value, state, t)}
                    onChange={(e) => runEventHandler(textarea.onChange, { value: e.target.value })}
                    placeholder={resolveBinding(textarea.placeholder, state, t)}
                />
            );

        case ElementType.three_d_model:
            return wrapWithMotion(element,
                <div>Unsupported: 3D Model (requires @react-three/fiber)</div>
            );

        case ElementType.toggle: {
            const toggle = resolvedElement as ToggleElement
            return wrapWithMotion(
                element,
                <Toggle
                    variant={toggle.variant}
                    size={toggle.size}
                    pressed={resolveBinding(toggle.pressed, state, t)}
                    onPressedChange={(pressed) =>
                        runEventHandler(toggle.onToggle, { pressed })
                    }
                >
                    {toggle.icon && <DynamicIcon name={toggle.icon} className="size-4" />}
                    {toggle.label && resolveBinding(toggle.label, state, t)}
                </Toggle>
            )
        }


        case ElementType.toggle_group: {
            const toggleGroup = resolvedElement as ToggleGroupElement
            return wrapWithMotion(
                element,
                <ToggleGroup
                    type={toggleGroup.multiple ? "multiple" : "single"}
                    value={resolveBinding(toggleGroup.value, state, t) || []}
                    onValueChange={(value: any) =>
                        runEventHandler(toggleGroup.onChange, { value })
                    }
                >
                    {toggleGroup.options.map((opt) => (
                        <Toggle
                            key={opt.id}
                            variant={opt.variant}
                            size={opt.size}
                            value={opt.pressed ? "on" : opt.id} // handle pressed vs. group selection
                            pressed={resolveBinding(opt.pressed, state, t)}
                        >
                            {opt.icon && <DynamicIcon name={opt.icon} className="size-4" />}
                            {opt.label && resolveBinding(opt.label, state, t)}
                        </Toggle>
                    ))}
                </ToggleGroup>
            )
        }

        case ElementType.tooltip:
            const tooltip = resolvedElement as TooltipElement;
            return wrapWithMotion(tooltip,
                <Tooltip>
                    <TooltipTrigger asChild>
                        {tooltip.trigger && <RenderChildren children={[tooltip.trigger]} />}
                    </TooltipTrigger>
                    <TooltipContent
                        side={tooltip.side || "top"}
                        sideOffset={tooltip.sideOffset ?? 4}
                    >
                        {resolveBinding(tooltip.content, state, t)}
                    </TooltipContent>
                </Tooltip>
            );

        case ElementType.video:
            const video = resolvedElement as VideoElement;
            return <VideoRenderer element={video} state={state} t={t} runEventHandler={runEventHandler} />

        case ElementType.voice:
            const voice = resolvedElement as VoiceElement;
            return wrapWithMotion(element,
                <div>Unsupported: Voice (requires Web Speech API)</div>
            );

        case ElementType.wallet:
            const wallet = resolvedElement as WalletElement;
            return wrapWithMotion(wallet,
                <WalletRenderer element={wallet} state={state} t={t} runEventHandler={runEventHandler} />
            );

        default:
            return wrapWithMotion(element,
                <div>Unsupported element type: {resolvedElement.type}</div>
            );
    }
}