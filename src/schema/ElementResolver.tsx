"use client";

import { Suspense, lazy } from "react";
import {
    resolveBinding,
    isVisible,
    classesFromStyleProps,
    deepResolveBindings,
    cn,
    getAccessibilityProps
} from "../lib/utils";
// Lazy load shadcn components
import { AccordionRenderer } from "../components/ui/accordion";
import { Input } from "../components/ui/input";
import { AlertDialogRenderer } from "../components/ui/alert-dialog";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AvatarRenderer } from "../components/ui/avatar";
import { BadgeRenderer } from "../components/ui/badge";
import { BreadcrumbRenderer } from "../components/ui/breadcrumb";
import { ButtonRenderer } from "../components/ui/button";
import { CalendarRenderer } from "../components/ui/calendar";
import { CardRenderer } from "../components/ui/card";
import { CollapsibleRenderer } from "../components/ui/collapsible";
import { CommandRenderer } from "../components/ui/command";
import { ContextMenuRenderer } from "../components/ui/context-menu";
import { ModalRenderer } from "../components/ui/dialog";
import { DrawerRenderer } from "../components/ui/drawer";
import { DropdownRenderer } from "../components/ui/dropdown-menu";
import { PopoverRenderer } from "../components/ui/popover";
import { ProgressRenderer } from "../components/ui/progress";
import { RadioGroupRenderer } from "../components/ui/radio-group";
import { ResizableRenderer } from "../components/ui/resizable";
import { ScrollAreaRenderer } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { SheetRenderer } from "../components/ui/sheet";
import { SidebarRenderer } from "../components/ui/sidebar";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table";
import { TabRender } from "../components/ui/tabs";
import { ToggleGroup } from "../components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { ContainerRenderer } from "../components/ui/container";
import { DynamicIcon } from "../components/ui/dynamic-icon";
import CustomComponentRender from "../components/ui/custom-component";
import { MenuRenderer } from "../components/ui/menu-render";
import StepWizardRenderer from "../components/ui/stepper";
import { ListRenderer } from "../components/ui/list";
import { RatingInput } from "../components/ui/rating-input";
import { SearchRenderer } from "../components/ui/search";
import { FormResolver } from "../components/ui/form-resolver";
import { DataGrid } from "../components/ui/datagrid";
import { CodeInput } from "../components/ui/code-input";

import { RenderChildren } from "./RenderChildren";
import { Toggle } from "../components/ui/toggle";
import { PageRenderer } from "../components/ui/pagination";

const CarouselRenderer = lazy(() => import("../components/ui/carousel").then(module => ({ default: module.Carousel })));
const Chart = lazy(() => import("../components/ui/chart").then(module => ({ default: module.Chart })));
const RichTextEditor = lazy(() => import("../components/ui/richtext-input").then(module => ({ default: module.RichTextEditor })));
const FileUploadRenderer = lazy(() => import("../components/ui/file-upload").then(module => ({ default: module.FileUploadRenderer })));
const VideoRenderer = lazy(() => import("../components/ui/videoplayer").then(module => ({ default: module.VideoRenderer })));
const CallRenderer = lazy(() => import("../components/ui/call-renderer").then(module => ({ default: module.CallRenderer })));
const QRCodeRenderer = lazy(() => import("../components/ui/qr-code").then(module => ({ default: module.QRCodeRenderer })));
const WalletRenderer = lazy(() => import("../components/ui/wallet-renderer").then(module => ({ default: module.WalletRenderer })));
const PaymentFormRenderer = lazy(() => import("../components/ui/payment-renderer").then(module => ({ default: module.PaymentFormRenderer })));
const VoiceRenderer = lazy(() => import("../components/ui/voice-renderer").then(module => ({ default: module.VoiceRenderer })));
const ThreeDRenderer = lazy(() => import("../components/ui/threed-render").then(module => ({ default: module.ThreeDRenderer })));
const CalendarEventRenderer = lazy(() => import("../components/ui/calendar_event_render").then(module => ({ default: module.CalendarEventRenderer })));
const AudioRenderer = lazy(() => import("../components/ui/audio-render").then(module => ({ default: module.AudioRenderer })));
const ChatRenderer = lazy(() => import("../components/ui/chat").then(module => ({ default: module.ChatRenderer })));
const CommentsRenderer = lazy(() => import("../components/ui/comments").then(module => ({ default: module.CommentsRenderer })));
const LottieRenderer = lazy(() => import("../components/ui/lottie").then(module => ({ default: module.LottieRenderer })));
const SignaturePadRenderer = lazy(() => import("../components/ui/signature").then(module => ({ default: module.SignaturePadRenderer })));
const TimelineRenderer = lazy(() => import("../components/ui/timeline").then(module => ({ default: module.TimelineRenderer })));
const TreeRenderer = lazy(() => import("../components/ui/tree").then(module => ({ default: module.TreeRenderer })));
const MapRenderer = lazy(() => import("../components/ui/map-renderer").then(module => ({ default: module.MapRenderer })));

import {
    AnyObj,
    UIElement,
    ElementType,
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
    DropdownElement,
    FormElement,
    EditorElement,
    FileUploadElement,
    IconElement,
    ImageElement,
    QRReaderElement,
    TableElement,
    TabsElement,
    TextElement,
    VideoElement,
    InputElement,
    VoiceElement,
    WalletElement,
    AlertDialogElement,
    BadgeElement,
    CollapsibleElement,
    CommandElement,
    TooltipElement,
    ToggleGroupElement,
    BaseElement,
    MenuElement,
    ToggleElement,
    AudioElement,
    CalendarEventElement,
    ChatElement,
    CommentsElement,
    ListElement,
    LottieElement,
    RatingElement,
    SearchElement,
    SignaturePadElement,
    TimelineElement,
    TreeElement,
    UIProject,
    DataSource,
    FooterElement,
    HeaderElement,
    EventHandler,
    DynamicElement
} from "../types";
import { MarkdownRender } from "../components/ui/markdown-input";
import { DynamicContentRenderer } from "../components/dynamic-content";


interface ElementResolverProps {
    element: UIElement;
    globalConfig?: UIProject['globalConfig'];
    dataSources?: DataSource[];
    state: AnyObj
    setState: (path: string, value: any) => void;
    t: (key: string, defaultLabel?: string) => string
    runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj | undefined) => Promise<void>;
    CustomElementResolver?: (
        element: UIElement,
        ctx: {
            state: AnyObj;
            t: (k: string) => string;
            runEventHandler?: (ev: any, payload?: AnyObj) => void;
        }
    ) => React.ReactNode;
}

export function ElementResolver({ element, state, setState, t, runEventHandler, CustomElementResolver }: ElementResolverProps) {
    if (!element) return null;
    if (!isVisible(element.visibility, state, t)) return null;

    const LazyComponent = ({ children }: { children: React.ReactNode }) => (
        <Suspense fallback={<Skeleton />}>
            {children}
        </Suspense>
    );
    const accessibilityProps = getAccessibilityProps(element.accessibility);
    const className = classesFromStyleProps(element.styles);
    switch (element.type) {
        case ElementType.accordion:
            return <LazyComponent>
                <AccordionRenderer
                    state={state}
                    t={t}
                    setState={setState}
                    element={element as AccordionElement}
                    runEventHandler={runEventHandler}
                />
            </LazyComponent>
        case ElementType.alert:
            const alert = element as AlertElement;
            return <LazyComponent>
                <Alert dismissible={alert.dismissible} variant={alert.variant || 'default'} className={className}{...accessibilityProps} >
                    <AlertDescription>{resolveBinding(alert.message, state, t)}</AlertDescription>
                </Alert>
            </LazyComponent>
        case ElementType.alert_dialog:
            return <LazyComponent>
                <AlertDialogRenderer
                    state={state}
                    t={t}
                    setState={setState}
                    element={element as AlertDialogElement}
                    className={className}{...accessibilityProps}
                    runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.audio:
            return (
                <LazyComponent>
                    <AudioRenderer element={element as AudioElement} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.avatar:
            return <LazyComponent>
                <AvatarRenderer
                    state={state}
                    t={t}
                    element={element as AvatarElement} />
            </LazyComponent>
        case ElementType.badge:
            return <LazyComponent>
                <BadgeRenderer
                    state={state}
                    t={t}
                    element={element as BadgeElement} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.breadcrumb:
            return <LazyComponent>
                <BreadcrumbRenderer
                    state={state}
                    t={t}
                    setState={setState}
                    element={element as BreadcrumbElement} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.button:
            return <ButtonRenderer
                state={state}
                t={t}
                element={element as ButtonElement} runEventHandler={runEventHandler} />

        case ElementType.calendar:
            return <LazyComponent>
                <CalendarRenderer element={element as CalendarElement} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.calendar_event:
            return (
                <LazyComponent>
                    <CalendarEventRenderer element={element as CalendarEventElement} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.call: {
            const call = element as CallElement;
            return <LazyComponent>
                <CallRenderer element={call} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>
        }
        case ElementType.card:
            return <LazyComponent>
                <CardRenderer setState={setState} element={element as CardElement} runEventHandler={runEventHandler} state={state} t={t} />
            </LazyComponent>
        case ElementType.carousel:
            const carousel = element as CarouselElement;
            return <LazyComponent>
                <CarouselRenderer setState={setState} element={carousel} runEventHandler={runEventHandler} state={state} t={t} />
            </LazyComponent>
        case ElementType.chat:
            return (
                <LazyComponent>
                    <ChatRenderer element={element as ChatElement} setState={setState} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.chart: {
            const chart = element as ChartElement
            return <LazyComponent>
                <Chart element={chart} state={state} t={t} />
            </LazyComponent>
        }

        case ElementType.code as any: {
            return <LazyComponent>
                <CodeInput value={resolveBinding((element as BaseElement).value, state, t)} />
            </LazyComponent>
        }
        case ElementType.collapsible:
            return <LazyComponent>
                <CollapsibleRenderer
                    element={element as CollapsibleElement}
                    setState={setState}
                    state={state}
                    t={t}
                    runEventHandler={runEventHandler}
                />
            </LazyComponent>
        case ElementType.command:
            return <LazyComponent>
                <CommandRenderer
                    setState={setState}
                    state={state}
                    t={t}
                    element={element as CommandElement} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.comments:
            return (
                <LazyComponent>
                    <CommentsRenderer element={element as CommentsElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.container:
            const container = element as ContainerElement;
            return <ContainerRenderer
                setState={setState}
                state={state}
                t={t} element={container} runEventHandler={runEventHandler} />
        case ElementType.context_menu:
            const contextMenu = element as ContextMenuElement;
            return (
                <LazyComponent>
                    <ContextMenuRenderer setState={setState} element={contextMenu} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            )

        case ElementType.custom: {
            return (
                <LazyComponent>
                    <CustomComponentRender element={element as CustomElement} setState={setState} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            )
        }

        case ElementType.datagrid:
            return (
                <LazyComponent>
                    <DataGrid
                        element={element as DataGridElement}
                        state={state}
                        setState={setState}
                        t={t}
                        runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.drawer:
            return <LazyComponent>
                <DrawerRenderer
                    state={state}
                    setState={setState}
                    t={t}
                    element={element as DrawerElement} runEventHandler={runEventHandler} />
            </LazyComponent>

        case (ElementType as any).select:
        case ElementType.dropdown:
            return <DropdownRenderer
                setState={setState}
                dropdown={element as DropdownElement}
                runEventHandler={runEventHandler}
                state={state}
                t={t} />

        case ElementType.editor: {
            const editor = element as EditorElement
            const content = resolveBinding(editor.content, state, t) || ""
            const placeholder = resolveBinding(editor.placeholder, state, t)

            return <LazyComponent>
                <RichTextEditor
                    value={content}
                    placeholder={placeholder}
                    toolbar={editor.toolbar}
                    onChange={(val) => runEventHandler?.(editor.onChange, { value: val })}
                    className={editor.styles?.className}
                />
            </LazyComponent>
        }
        case ElementType.file_upload: {
            const el = element as FileUploadElement
            return (
                <LazyComponent>
                    <FileUploadRenderer
                        state={state}
                        t={t}
                        element={el}
                        runEventHandler={runEventHandler}
                    />
                </LazyComponent>
            )
        }
        case ElementType.footer:
            const footer = element as FooterElement;
            return <footer className={cn(`text-${footer.alignment || 'left'}`, className)}>
                {footer.children && <RenderChildren children={footer.children} state={state} setState={setState} t={t} runEventHandler={runEventHandler} />}
            </footer>

        case ElementType.form:
            return <LazyComponent>
                <FormResolver element={element as FormElement} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>
        case (ElementType as any).input:
            return <Input  {...element as any} value={state[element.id]} onChange={(e) => setState(element.id, e.target.value)} />

        case ElementType.header:
            const header = element as HeaderElement;
            return <LazyComponent>
                <header className={cn(className, `text-${(element as HeaderElement).alignment || "left"}`)} {...accessibilityProps}>
                    {element.children && <RenderChildren state={state} setState={setState} t={t} children={element.children} runEventHandler={runEventHandler} />}
                </header>
            </LazyComponent>

        case ElementType.icon:
            const icon = element as IconElement;
            return <LazyComponent>
                <DynamicIcon name={icon.name} size={icon.size} aria-label={resolveBinding(icon.label, state, t)} />
            </LazyComponent>

        case ElementType.image: {
            const image = element as ImageElement;
            const accessibilityProps = getAccessibilityProps(image.accessibility, state, t);
            if (!image.src)
                return null

            return (
                <img
                    src={resolveBinding(image.src, state, t)}
                    alt={resolveBinding(image.alt, state, t)}
                    width={image.width}
                    height={image.height}
                    className={className}
                    {...accessibilityProps}
                />
            );
        }
        case ElementType.list:
            return (
                <LazyComponent>
                    <ListRenderer
                        state={state}
                        setState={setState}
                        t={t} element={element as ListElement}
                        runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.lottie:
            return (
                <LazyComponent>
                    <LottieRenderer
                        state={state}
                        t={t}
                        element={element as LottieElement} />
                </LazyComponent>
            );

        case ElementType.map:
            return <LazyComponent>
                <MapRenderer element={element} state={state} t={t} />
            </LazyComponent>
        case ElementType.menu:
            const menubar = element as MenuElement;
            return (
                <LazyComponent>
                    <MenuRenderer element={menubar} runEventHandler={runEventHandler} state={state} t={t} setState={setState} />
                </LazyComponent>
            )

        case ElementType.modal:
            const modal = element as ModalElement;
            return (
                <LazyComponent>
                    <ModalRenderer
                        state={state}
                        setState={setState}
                        t={t}
                        element={modal} runEventHandler={runEventHandler} />
                </LazyComponent>
            )

        case ElementType.pagination:
            return (
                <LazyComponent>
                    <PageRenderer element={element} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.payment:
            return <LazyComponent>
                <PaymentFormRenderer
                    element={element} runEventHandler={runEventHandler} state={state} t={t}
                />
            </LazyComponent>

        case ElementType.popover:
            return (
                <LazyComponent>
                    <PopoverRenderer setState={setState} element={element} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.progress:
            return (
                <LazyComponent>
                    <ProgressRenderer element={element} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.qr_reader:
            const qr = element as QRReaderElement;
            return <LazyComponent>
                <QRCodeRenderer element={qr} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        case ElementType.radio_group:
            return (
                <LazyComponent>
                    <RadioGroupRenderer element={element} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )
        case ElementType.rating: {
            const el = element as RatingElement;
            const value = resolveBinding(el.value, state, t) || 0;
            return (
                <LazyComponent>
                    <RatingInput
                        {...el}
                        value={value}
                        onChange={(val) => runEventHandler?.(el.onChange, { value: val })}
                    />
                </LazyComponent>
            );
        }
        case ElementType.resizable:
            return (
                <LazyComponent>
                    <ResizableRenderer setState={setState} element={element} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.scroll_area:
            return (
                <LazyComponent>
                    <ScrollAreaRenderer
                        state={state}
                        setState={setState}
                        t={t} element={element} />
                </LazyComponent>
            )
        case ElementType.search:
            return (
                <LazyComponent>
                    <SearchRenderer element={element as SearchElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.separator as any:
            return <LazyComponent>
                <Separator />
            </LazyComponent>

        case ElementType.sheet:
            return (
                <LazyComponent>
                    <SheetRenderer setState={setState} element={element} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.sidebar:
            return (
                <LazyComponent>
                    <SidebarRenderer element={element} runEventHandler={runEventHandler} state={state} setState={setState} t={t} />
                </LazyComponent>
            )
        case ElementType.signature_pad:
            return (
                <LazyComponent>
                    <SignaturePadRenderer
                        state={state}
                        t={t}
                        element={element as SignaturePadElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.skeleton:
            return <LazyComponent>
                <Skeleton />
            </LazyComponent>

        case ElementType.step_wizard:
            return (
                <LazyComponent>
                    <StepWizardRenderer
                        state={state}
                        setState={setState}
                        t={t}
                        element={element} runEventHandler={runEventHandler} />
                </LazyComponent>
            )

        case (ElementType as any).checkbox:
        case (ElementType as any).switch:
            const switchEl = element as InputElement;
            return <LazyComponent>
                <Switch
                    checked={resolveBinding(switchEl.value, state, t)}
                    onCheckedChange={(checked) => runEventHandler?.(switchEl.onChange, { value: checked })}
                />
            </LazyComponent>

        case ElementType.table:
            const table = element as TableElement;
            const headers = resolveBinding(table.headers, state, t) || [];
            const rows = resolveBinding(table.rows, state, t) || [];
            return <LazyComponent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers?.map((header: string, i: number) => (
                                <TableHead key={`header_${i}_${header}`}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows?.map((row: any, i: number) => (
                            <TableRow key={`row_${i}`}>
                                {(row.cells || [])?.map((cell: any, j: number) => (
                                    <TableCell key={`row_cell_${i}_${j}`}>{resolveBinding(cell, state, t)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </LazyComponent>

        case ElementType.tabs:
            const tabs = element as TabsElement;
            return <TabRender
                tabs={tabs}
                state={state}
                setState={setState}
                t={t}
                runEventHandler={runEventHandler}
            />
        case ElementType.text: {
            const text = element as TextElement;
            const Tag = (text.tag as React.ElementType) || "div";
            let resolvedContent = deepResolveBindings(text.content, state, t);

            // 🧩 Normalize undefined/null at root
            if (
                resolvedContent === undefined ||
                resolvedContent === null ||
                resolvedContent === "undefined" ||
                resolvedContent === "null"
            ) {
                resolvedContent = "";
            }

            // 🧹 Remove "undefined" or "null" words *inside* the text string
            if (typeof resolvedContent === "string") {
                resolvedContent = resolvedContent
                    .replace(/\bundefined\b/g, "")
                    .replace(/\bnull\b/g, "")
                    .replace(/\s{2,}/g, " ") // clean double spaces after replacements
                    .trim();
            } else {
                resolvedContent = String(resolvedContent ?? "");
            }

            // 🧠 If still empty after cleanup, skip rendering
            if (resolvedContent === "") return null;
            if (text.contentFormat == 'markdown') {
                return <MarkdownRender content={resolvedContent} className={className} />
            }
            if (text.contentFormat == 'html' || text.contentFormat == 'rich') {
                return (<div id={text.id}
                    className={cn(className, text.alignment && `text-${text.alignment}`)}
                    {...accessibilityProps}>
                    <div
                        data-text-format='html'
                        dangerouslySetInnerHTML={{
                            __html: resolvedContent.replace(/\bundefined\b/g, "").replace(/\bnull\b/g, "")
                        }}
                    />
                </div>)
            }
            return (
                <Tag
                    id={text.id}
                    className={cn(className, text.alignment && `text-${text.alignment}`)}
                    {...accessibilityProps}
                >
                    {resolvedContent}
                </Tag>
            );
        }

        case ElementType.three_d_model:
            return (
                <LazyComponent>
                    <ThreeDRenderer threeElement={element} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )
        case ElementType.timeline:
            return (
                <LazyComponent>
                    <TimelineRenderer
                        state={state}
                        t={t}
                        element={element as TimelineElement} />
                </LazyComponent>
            );
        case ElementType.tree:
            return (
                <LazyComponent>
                    <TreeRenderer
                        state={state}
                        t={t}
                        element={element as TreeElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.toggle: {
            const toggle = element as ToggleElement
            return <LazyComponent>
                <Toggle
                    variant={toggle.variant}
                    size={toggle.size}
                    pressed={resolveBinding(toggle.pressed, state, t)}
                    onPressedChange={(pressed) =>
                        runEventHandler?.(toggle.onToggle, { pressed })
                    }
                >
                    {toggle.icon && <DynamicIcon name={toggle.icon} className="size-4" />}
                    {toggle.label && resolveBinding(toggle.label, state, t)}
                </Toggle>
            </LazyComponent>
        }

        case ElementType.toggle_group: {
            const toggleGroup = element as ToggleGroupElement
            return <LazyComponent>
                <ToggleGroup
                    type={toggleGroup.multiple ? "multiple" : "single"}
                    value={resolveBinding(toggleGroup.value, state, t) || []}
                    onValueChange={(value: any) =>
                        runEventHandler?.(toggleGroup.onChange, { value })
                    }
                >
                    {toggleGroup.options?.map((opt) => (
                        <Toggle
                            key={opt.id}
                            variant={opt.variant}
                            size={opt.size}
                            value={opt.pressed ? "on" : opt.id}
                            pressed={resolveBinding(opt.pressed, state, t)}
                        >
                            {opt.icon && <DynamicIcon name={opt.icon} className="size-4" />}
                            {opt.label && resolveBinding(opt.label, state, t)}
                        </Toggle>
                    ))}
                </ToggleGroup>
            </LazyComponent>
        }

        case ElementType.tooltip:
            const tooltip = element as TooltipElement;
            return <LazyComponent>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {tooltip.trigger && <RenderChildren
                            state={state}
                            setState={setState}
                            t={t} children={[tooltip.trigger]} runEventHandler={runEventHandler} />}
                    </TooltipTrigger>
                    <TooltipContent
                        side={tooltip.side || "top"}
                        sideOffset={tooltip.sideOffset ?? 4}
                    >
                        {resolveBinding(tooltip.content, state, t)}
                    </TooltipContent>
                </Tooltip>
            </LazyComponent>

        case ElementType.video:
            const video = element as VideoElement;
            if (!video)
                return null
            return <LazyComponent>
                <VideoRenderer element={video} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        case ElementType.voice:
            const voice = element as VoiceElement;
            return (
                <LazyComponent>
                    <VoiceRenderer element={voice} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            )
        case ElementType.dynamic:
            const el = element as DynamicElement;
            const url = resolveBinding(el.url, state, t)
            const content = resolveBinding(el.content, state, t)
            return <LazyComponent>
                <DynamicContentRenderer url={url} content={content} contentType={el.contentType} ext={el.ext} state={state} t={t} setState={setState} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.wallet:
            const wallet = element as WalletElement;
            return <LazyComponent>
                <WalletRenderer element={wallet} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        default:
            if (CustomElementResolver) {
                const maybeNode = CustomElementResolver(element, {
                    state,
                    t,
                    runEventHandler,
                });
                if (maybeNode) return <>{maybeNode}</>;
            }
            return (
                <div>
                    Unsupported element type: {(element as any).type}
                </div>
            );
    }
}