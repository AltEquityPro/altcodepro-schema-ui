"use client";

import { Suspense, lazy, useMemo } from "react";
import {
    resolveBinding,
    isVisible,
    classesFromStyleProps,
    deepResolveBindings,
    cn,
    getAccessibilityProps
} from "../lib/utils";
// Lazy load shadcn components
const AccordionRenderer = lazy(() => import("../components/ui/accordion").then(module => ({ default: module.AccordionRenderer })));
const AlertDialogRenderer = lazy(() => import("../components/ui/alert-dialog").then(module => ({ default: module.AlertDialogRenderer })));
const Alert = lazy(() => import("../components/ui/alert").then(module => ({ default: module.Alert })));
const AlertDescription = lazy(() => import("../components/ui/alert").then(module => ({ default: module.AlertDescription })));
const AvatarRenderer = lazy(() => import("../components/ui/avatar").then(module => ({ default: module.AvatarRenderer })));
const BadgeRenderer = lazy(() => import("../components/ui/badge").then(module => ({ default: module.BadgeRenderer })));
const BreadcrumbRenderer = lazy(() => import("../components/ui/breadcrumb").then(module => ({ default: module.BreadcrumbRenderer })));
const ButtonRenderer = lazy(() => import("../components/ui/button").then(module => ({ default: module.ButtonRenderer })));
const CalendarRenderer = lazy(() => import("../components/ui/calendar").then(module => ({ default: module.CalendarRenderer })));
const CardRenderer = lazy(() => import("../components/ui/card").then(module => ({ default: module.CardRenderer })));
const CarouselRenderer = lazy(() => import("../components/ui/carousel").then(module => ({ default: module.Carousel })));
const Chart = lazy(() => import("../components/ui/chart").then(module => ({ default: module.Chart })));
const CollapsibleRenderer = lazy(() => import("../components/ui/collapsible").then(module => ({ default: module.CollapsibleRenderer })));
const CommandRenderer = lazy(() => import("../components/ui/command").then(module => ({ default: module.CommandRenderer })));
const ContextMenuRenderer = lazy(() => import("../components/ui/context-menu").then(module => ({ default: module.ContextMenuRenderer })));
const ModalRenderer = lazy(() => import("../components/ui/dialog").then(module => ({ default: module.ModalRenderer })));
const DrawerRenderer = lazy(() => import("../components/ui/drawer").then(module => ({ default: module.DrawerRenderer })));
const DropdownRenderer = lazy(() => import("../components/ui/dropdown-menu").then(module => ({ default: module.DropdownRenderer })));
const PageRenderer = lazy(() => import("../components/ui/pagination").then(module => ({ default: module.PageRenderer })));
const PopoverRenderer = lazy(() => import("../components/ui/popover").then(module => ({ default: module.PopoverRenderer })));
const ProgressRenderer = lazy(() => import("../components/ui/progress").then(module => ({ default: module.ProgressRenderer })));
const RadioGroupRenderer = lazy(() => import("../components/ui/radio-group").then(module => ({ default: module.RadioGroupRenderer })));
const ResizableRenderer = lazy(() => import("../components/ui/resizable").then(module => ({ default: module.ResizableRenderer })));
const ScrollAreaRenderer = lazy(() => import("../components/ui/scroll-area").then(module => ({ default: module.ScrollAreaRenderer })));
const Separator = lazy(() => import("../components/ui/separator").then(module => ({ default: module.Separator })));
const SheetRenderer = lazy(() => import("../components/ui/sheet").then(module => ({ default: module.SheetRenderer })));
const SidebarRenderer = lazy(() => import("../components/ui/sidebar").then(module => ({ default: module.SidebarRenderer })));
const Skeleton = lazy(() => import("../components/ui/skeleton").then(module => ({ default: module.Skeleton })));
const Switch = lazy(() => import("../components/ui/switch").then(module => ({ default: module.Switch })));
const Table = lazy(() => import("../components/ui/table").then(module => ({ default: module.Table })));
const TableHeader = lazy(() => import("../components/ui/table").then(module => ({ default: module.TableHeader })));
const TableBody = lazy(() => import("../components/ui/table").then(module => ({ default: module.TableBody })));
const TableHead = lazy(() => import("../components/ui/table").then(module => ({ default: module.TableHead })));
const TableRow = lazy(() => import("../components/ui/table").then(module => ({ default: module.TableRow })));
const TableCell = lazy(() => import("../components/ui/table").then(module => ({ default: module.TableCell })));
const Tabs = lazy(() => import("../components/ui/tabs").then(module => ({ default: module.Tabs })));
const TabsList = lazy(() => import("../components/ui/tabs").then(module => ({ default: module.TabsList })));
const TabsTrigger = lazy(() => import("../components/ui/tabs").then(module => ({ default: module.TabsTrigger })));
const TabsContent = lazy(() => import("../components/ui/tabs").then(module => ({ default: module.TabsContent })));
const ToggleGroup = lazy(() => import("../components/ui/toggle-group").then(module => ({ default: module.ToggleGroup })));
const Toggle = lazy(() => import("../components/ui/toggle").then(module => ({ default: module.Toggle })));
const Tooltip = lazy(() => import("../components/ui/tooltip").then(module => ({ default: module.Tooltip })));
const TooltipTrigger = lazy(() => import("../components/ui/tooltip").then(module => ({ default: module.TooltipTrigger })));
const TooltipContent = lazy(() => import("../components/ui/tooltip").then(module => ({ default: module.TooltipContent })));

const ContainerRenderer = lazy(() => import("../components/ui/container").then(module => ({ default: module.ContainerRenderer })));
const DynamicIcon = lazy(() => import("../components/ui/dynamic-icon").then(module => ({ default: module.DynamicIcon })));
const CustomComponentRender = lazy(() => import("../components/ui/custom-component"));
const RichTextEditor = lazy(() => import("../components/ui/richtext-input").then(module => ({ default: module.RichTextEditor })));
const FileUploadRenderer = lazy(() => import("../components/ui/file-upload").then(module => ({ default: module.FileUploadRenderer })));
const MenuRenderer = lazy(() => import("../components/ui/menu-render").then(module => ({ default: module.MenuRenderer })));
const StepWizardRenderer = lazy(() => import("../components/ui/stepper"));
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
const ListRenderer = lazy(() => import("../components/ui/list").then(module => ({ default: module.ListRenderer })));
const ListItemRenderer = lazy(() => import("../components/ui/list_item").then(module => ({ default: module.ListItemRenderer })));
const LottieRenderer = lazy(() => import("../components/ui/lottie").then(module => ({ default: module.LottieRenderer })));
const RatingInput = lazy(() => import("../components/ui/rating-input").then(module => ({ default: module.RatingInput })));
const SearchRenderer = lazy(() => import("../components/ui/search").then(module => ({ default: module.SearchRenderer })));
const SignaturePadRenderer = lazy(() => import("../components/ui/signature").then(module => ({ default: module.SignaturePadRenderer })));
const TimelineRenderer = lazy(() => import("../components/ui/timeline").then(module => ({ default: module.TimelineRenderer })));
const TreeRenderer = lazy(() => import("../components/ui/tree").then(module => ({ default: module.TreeRenderer })));
const MapRenderer = lazy(() => import("../components/ui/map-renderer").then(module => ({ default: module.MapRenderer })));
const FormResolver = lazy(() => import("../components/ui/form-resolver").then(module => ({ default: module.FormResolver })));
const DataGrid = lazy(() => import("../components/ui/datagrid").then(module => ({ default: module.DataGrid })));
const CodeInput = lazy(() => import("../components/ui/code-input").then(module => ({ default: module.CodeInput })));

import { useActionHandler } from "./Actions";
import { useAppState } from "./StateContext";
import { RenderChildren } from "./RenderChildren";
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
    SidebarElement,
    BaseElement,
    MenuElement,
    ToggleElement,
    AudioElement,
    CalendarEventElement,
    ChatElement,
    CommentsElement,
    ListElement,
    ListItemElement,
    LottieElement,
    RatingElement,
    SearchElement,
    SignaturePadElement,
    TimelineElement,
    TreeElement,
    ActionRuntime,
    UIProject,
    DataSource,
    FooterElement,
    HeaderElement
} from "../types";

interface ElementResolverProps {
    element: UIElement;
    globalConfig?: UIProject['globalConfig'];
    dataSources?: DataSource[];
    runtime: ActionRuntime;
    CustomElementResolver?: (
        element: UIElement,
        ctx: {
            runtime: ActionRuntime;
            state: AnyObj;
            t: (k: string) => string;
            runEventHandler: (ev: any, payload?: AnyObj) => void;
        }
    ) => React.ReactNode;
}

export function ElementResolver({ element, globalConfig, dataSources, runtime = {}, CustomElementResolver }: ElementResolverProps) {
    const { state, t } = useAppState();
    const { runEventHandler } = useActionHandler({
        globalConfig: globalConfig,
        dataSources: dataSources,
        runtime,
    });

    if (!isVisible(element.visibility, state, t)) return null;

    const resolvedElement = useMemo(() => deepResolveBindings(element, state, t), [element, state, t]);

    const LazyComponent = ({ children }: { children: React.ReactNode }) => (
        <Suspense fallback={<Skeleton />}>
            {children}
        </Suspense>
    );
    const accessibilityProps = getAccessibilityProps(element.accessibility);
    const className = classesFromStyleProps(element.styles);
    switch (resolvedElement.type) {
        case ElementType.accordion:
            return <LazyComponent>
                <AccordionRenderer
                    element={resolvedElement as AccordionElement}
                    runtime={runtime}
                />
            </LazyComponent>
        case ElementType.alert:
            const alert = resolvedElement as AlertElement;
            return <LazyComponent>
                <Alert dismissible={alert.dismissible} variant={alert.variant || 'default'} className={className}{...accessibilityProps} >
                    <AlertDescription>{resolveBinding(alert.message, state, t)}</AlertDescription>
                </Alert>
            </LazyComponent>
        case ElementType.alert_dialog:
            return <LazyComponent>
                <AlertDialogRenderer element={resolvedElement as AlertDialogElement} className={className}{...accessibilityProps} runtime={runtime} />
            </LazyComponent>
        case ElementType.audio:
            return (
                <LazyComponent>
                    <AudioRenderer element={resolvedElement as AudioElement} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.avatar:
            return <LazyComponent>
                <AvatarRenderer element={resolvedElement as AvatarElement} />
            </LazyComponent>
        case ElementType.badge:
            return <LazyComponent>
                <BadgeRenderer element={resolvedElement as BadgeElement} runtime={runtime} />
            </LazyComponent>
        case ElementType.breadcrumb:
            return <LazyComponent>
                <BreadcrumbRenderer element={resolvedElement as BreadcrumbElement} runtime={runtime} />
            </LazyComponent>
        case ElementType.button:
            return <ButtonRenderer element={resolvedElement as ButtonElement} runtime={runtime} />

        case ElementType.calendar:
            return <LazyComponent>
                <CalendarRenderer element={resolvedElement as CalendarElement} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.calendar_event:
            return (
                <LazyComponent>
                    <CalendarEventRenderer element={resolvedElement as CalendarEventElement} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.call: {
            const call = resolvedElement as CallElement;
            return <LazyComponent>
                <CallRenderer element={call} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>
        }
        case ElementType.card:
            return <LazyComponent>
                <CardRenderer element={resolvedElement as CardElement} runtime={runtime} />
            </LazyComponent>
        case ElementType.carousel:
            const carousel = resolvedElement as CarouselElement;
            return <LazyComponent>
                <CarouselRenderer element={carousel} runtime={runtime} state={state} t={t} />
            </LazyComponent>
        case ElementType.chat:
            return (
                <LazyComponent>
                    <ChatRenderer element={resolvedElement as ChatElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.chart: {
            const chart = resolvedElement as ChartElement
            return <LazyComponent>
                <Chart element={chart} state={state} t={t} />
            </LazyComponent>
        }
        case ElementType.code: {
            return <LazyComponent>
                <CodeInput value={resolveBinding((resolvedElement as BaseElement).value, state, t)} />
            </LazyComponent>
        }
        case ElementType.collapsible:
            return <LazyComponent>
                <CollapsibleRenderer
                    element={resolvedElement as CollapsibleElement}
                    runtime={runtime}
                    state={state}
                    t={t}
                    runEventHandler={runEventHandler}
                />
            </LazyComponent>
        case ElementType.command:
            return <LazyComponent>
                <CommandRenderer element={resolvedElement as CommandElement} runEventHandler={runEventHandler} />
            </LazyComponent>
        case ElementType.comments:
            return (
                <LazyComponent>
                    <CommentsRenderer element={resolvedElement as CommentsElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.container:
            const container = resolvedElement as ContainerElement;
            return <ContainerRenderer element={container} runtime={runtime} />
        case ElementType.context_menu:
            const contextMenu = resolvedElement as ContextMenuElement;
            return (
                <LazyComponent>
                    <ContextMenuRenderer element={contextMenu} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            )

        case ElementType.custom: {
            return (
                <LazyComponent>
                    <CustomComponentRender element={resolvedElement as CustomElement} state={state} t={t} runtime={runtime} />
                </LazyComponent>
            )
        }

        case ElementType.datagrid:
            return (
                <LazyComponent>
                    <DataGrid element={resolvedElement as DataGridElement} runEventHandler={runEventHandler} runtime={runtime} />
                </LazyComponent>
            );

        case ElementType.drawer:
            return <LazyComponent>
                <DrawerRenderer element={resolvedElement as DrawerElement} runEventHandler={runEventHandler} />
            </LazyComponent>

        case ElementType.dropdown:
            const dropdown = resolvedElement as DropdownElement;
            return <LazyComponent>
                <DropdownRenderer dropdown={dropdown} runEventHandler={runEventHandler} state={state} t={t} />
            </LazyComponent>

        case ElementType.editor: {
            const editor = resolvedElement as EditorElement
            const content = resolveBinding(editor.content, state, t) || ""
            const placeholder = resolveBinding(editor.placeholder, state, t)

            return <LazyComponent>
                <RichTextEditor
                    value={content}
                    placeholder={placeholder}
                    toolbar={editor.toolbar}
                    onChange={(val) => runEventHandler(editor.onChange, { value: val })}
                    className={editor.styles?.className}
                />
            </LazyComponent>
        }
        case ElementType.file_upload: {
            const el = resolvedElement as FileUploadElement
            return (
                <LazyComponent>
                    <FileUploadRenderer
                        element={el}
                        runEventHandler={runEventHandler}
                    />
                </LazyComponent>
            )
        }
        case ElementType.footer:
            const footer = resolvedElement as FooterElement;
            return <footer className={cn(`text-${footer.alignment || 'left'}`, className)}>
                {footer.children && <RenderChildren children={footer.children} runtime={runtime} />}
            </footer>

        case ElementType.form:
            return <LazyComponent>
                <FormResolver element={resolvedElement as FormElement} runtime={runtime} />
            </LazyComponent>
        case ElementType.header:
            const header = resolvedElement as HeaderElement;
            return <LazyComponent>
                <header className={cn(className, `text-${(resolvedElement as HeaderElement).alignment || "left"}`)} {...accessibilityProps}>
                    {resolvedElement.children && <RenderChildren children={resolvedElement.children} runtime={runtime} />}
                </header>
            </LazyComponent>

        case ElementType.icon:
            const icon = resolvedElement as IconElement;
            return <LazyComponent>
                <DynamicIcon name={icon.name} size={icon.size} aria-label={resolveBinding(icon.label, state, t)} />
            </LazyComponent>

        case ElementType.image: {
            const image = resolvedElement as ImageElement;
            const accessibilityProps = getAccessibilityProps(image.accessibility, state, t);
            if (!image.src)
                return null

            return (
                <img
                    src={image.src}
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
                    <ListRenderer element={resolvedElement as ListElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );
        case ElementType.list_item:
            return (
                <LazyComponent>
                    <ListItemRenderer element={resolvedElement as ListItemElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.lottie:
            return (
                <LazyComponent>
                    <LottieRenderer element={resolvedElement as LottieElement} />
                </LazyComponent>
            );

        case ElementType.map:
            return <LazyComponent>
                <MapRenderer element={resolvedElement} state={state} t={t} />
            </LazyComponent>
        case ElementType.menu:
            const menubar = resolvedElement as MenuElement;
            return (
                <LazyComponent>
                    <MenuRenderer element={menubar} runEventHandler={runEventHandler} state={state} t={t} runtime={runtime} />
                </LazyComponent>
            )

        case ElementType.modal:
            const modal = resolvedElement as ModalElement;
            return (
                <LazyComponent>
                    <ModalRenderer element={modal} runEventHandler={runEventHandler} runtime={runtime} />
                </LazyComponent>
            )

        case ElementType.pagination:
            return (
                <LazyComponent>
                    <PageRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.payment:
            return <LazyComponent>
                <PaymentFormRenderer
                    element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t}
                />
            </LazyComponent>

        case ElementType.popover:
            return (
                <LazyComponent>
                    <PopoverRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} runtime={runtime} />
                </LazyComponent>
            )

        case ElementType.progress:
            return (
                <LazyComponent>
                    <ProgressRenderer element={resolvedElement} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.qr_reader:
            const qr = resolvedElement as QRReaderElement;
            return <LazyComponent>
                <QRCodeRenderer element={qr} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        case ElementType.radio_group:
            return (
                <LazyComponent>
                    <RadioGroupRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )
        case ElementType.rating: {
            const el = resolvedElement as RatingElement;
            const value = resolveBinding(el.value, state, t) || 0;
            return (
                <LazyComponent>
                    <RatingInput
                        {...el}
                        value={value}
                        onChange={(val) => runEventHandler(el.onChange, { value: val })}
                    />
                </LazyComponent>
            );
        }
        case ElementType.resizable:
            return (
                <LazyComponent>
                    <ResizableRenderer element={resolvedElement} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.scroll_area:
            return (
                <LazyComponent>
                    <ScrollAreaRenderer element={resolvedElement} />
                </LazyComponent>
            )
        case ElementType.search:
            return (
                <LazyComponent>
                    <SearchRenderer element={resolvedElement as SearchElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            );

        case ElementType.separator:
            return <LazyComponent>
                <Separator />
            </LazyComponent>

        case ElementType.sheet:
            return (
                <LazyComponent>
                    <SheetRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )

        case ElementType.sidebar:
            return (
                <LazyComponent>
                    <SidebarRenderer element={resolvedElement} runtime={runtime} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )
        case ElementType.signature_pad:
            return (
                <LazyComponent>
                    <SignaturePadRenderer element={resolvedElement as SignaturePadElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.skeleton:
            return <LazyComponent>
                <Skeleton />
            </LazyComponent>

        case ElementType.step_wizard:
            return (
                <LazyComponent>
                    <StepWizardRenderer element={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} runtime={runtime} />
                </LazyComponent>
            )

        case ElementType.switch:
            const switchEl = resolvedElement as InputElement;
            return <LazyComponent>
                <Switch
                    checked={resolveBinding(switchEl.value, state, t)}
                    onCheckedChange={(checked) => runEventHandler(switchEl.onChange, { value: checked })}
                />
            </LazyComponent>

        case ElementType.table:
            const table = resolvedElement as TableElement;
            const headers = resolveBinding(table.headers, state, t) || [];
            const rows = resolveBinding(table.rows, state, t) || [];
            return <LazyComponent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers?.map((header: string, i: number) => (
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
            </LazyComponent>

        case ElementType.tabs:
            const tabs = resolvedElement as TabsElement;
            return <LazyComponent>
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
                            <RenderChildren children={tab.content} runtime={runtime} />
                        </TabsContent>
                    ))}
                </Tabs>
            </LazyComponent>

        case ElementType.text: {
            const text = resolvedElement as TextElement;
            const Tag = (text.tag as React.ElementType) || "div";
            const resolvedContent = resolveBinding(text.content, state, t);
            return (
                <Tag
                    id={text.id}
                    className={cn(className, text.alignment && `text-${text.alignment}`)}
                    {...accessibilityProps}
                >
                    {text.contentFormat === "html" ? <div dangerouslySetInnerHTML={{ __html: resolvedContent }} /> : resolvedContent}
                </Tag>
            );
        }
        case ElementType.three_d_model:
            return (
                <LazyComponent>
                    <ThreeDRenderer threeElement={resolvedElement} runEventHandler={runEventHandler} state={state} t={t} />
                </LazyComponent>
            )
        case ElementType.timeline:
            return (
                <LazyComponent>
                    <TimelineRenderer element={resolvedElement as TimelineElement} />
                </LazyComponent>
            );
        case ElementType.tree:
            return (
                <LazyComponent>
                    <TreeRenderer element={resolvedElement as TreeElement} runEventHandler={runEventHandler} />
                </LazyComponent>
            );

        case ElementType.toggle: {
            const toggle = resolvedElement as ToggleElement
            return <LazyComponent>
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
            </LazyComponent>
        }

        case ElementType.toggle_group: {
            const toggleGroup = resolvedElement as ToggleGroupElement
            return <LazyComponent>
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
            const tooltip = resolvedElement as TooltipElement;
            return <LazyComponent>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {tooltip.trigger && <RenderChildren children={[tooltip.trigger]} runtime={runtime} />}
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
            const video = resolvedElement as VideoElement;
            if (!video)
                return null
            return <LazyComponent>
                <VideoRenderer element={video} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        case ElementType.voice:
            const voice = resolvedElement as VoiceElement;
            return (
                <LazyComponent>
                    <VoiceRenderer element={voice} state={state} t={t} runEventHandler={runEventHandler} />
                </LazyComponent>
            )

        case ElementType.wallet:
            const wallet = resolvedElement as WalletElement;
            return <LazyComponent>
                <WalletRenderer element={wallet} state={state} t={t} runEventHandler={runEventHandler} />
            </LazyComponent>

        default:
            if (CustomElementResolver) {
                const maybeNode = CustomElementResolver(resolvedElement, {
                    runtime,
                    state,
                    t,
                    runEventHandler,
                });
                if (maybeNode) return <>{maybeNode}</>;
            }
            return (
                <div>
                    Unsupported element type: {resolvedElement.type}
                </div>
            );
    }
}