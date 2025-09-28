// src/preview/PreviewApp.tsx
"use client";

import { useState } from "react";
import { ElementType, UIProject, AnyObj, ActionType } from "../types";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { ScreenRuntime } from "../schema/ScreenRenderer";
import { StateProvider } from "../schema/StateContext";
import { ElementResolver } from "../schema/ElementResolver";

// Mock project for preview
export const mockProject: UIProject = {
    brand: { name: "Preview App", href: "/" },
    routeList: { routes: [], metadata: { basePath: "", generatedAt: "", totalRoutes: 0 }, navStyle: {} },
    state: {
        keys: {
            sampleData: { dataType: "array", defaultValue: [{ id: "1", name: "Sample Item" }] },
            user: { dataType: "object", defaultValue: { name: "John Doe" } },
        },
    },
    translations: { en: { "sample.label": "Sample Label" } },
    version: "1.0.0",
};

export const mockRuntime: ScreenRuntime = {
    navigate: (href) => console.log("Navigate to", href),
    toast: (msg, variant) => console.log(`Toast: ${msg} (${variant})`),
    openModal: (id) => console.log("Open modal", id),
    closeModal: (id) => console.log("Close modal", id),
};

export const mockElements: any = {
    [ElementType.accordion]: {
        type: ElementType.accordion,
        id: "accordion-preview",
        name: "Accordion",
        items: [
            { id: "item1", title: "Item 1", content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Content 1", alignment: "left" }] },
            { id: "item2", title: "Item 2", content: [{ type: ElementType.text, id: "text2", name: "Text", content: "Content 2", alignment: "left" }] },
        ],
        collapsible: true,
        multiple: true,
    },
    [ElementType.alert]: {
        type: ElementType.alert,
        id: "alert-preview",
        name: "Alert",
        message: "This is a sample alert",
        variant: "info",
        dismissible: true,
    },
    [ElementType.alert_dialog]: {
        type: ElementType.alert_dialog,
        id: "alert-dialog-preview",
        name: "Alert Dialog",
        title: "Confirm Action",
        description: "Are you sure?",
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Dialog content", alignment: "left" }],
        isOpen: false,
        dismissible: true,
        actionButton: {
            type: ElementType.button,
            id: "action-btn",
            name: "Action Button",
            text: "Confirm",
            variant: "primary",
        },
    },
    [ElementType.audio]: {
        type: ElementType.audio,
        id: "audio-preview",
        name: "Audio",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        controls: true,
        autoplay: false,
        loop: false,
    },
    [ElementType.avatar]: {
        type: ElementType.avatar,
        id: "avatar-preview",
        name: "Avatar",
        src: "https://example.com/avatar.jpg",
        alt: "User Avatar",
        shape: "circle",
        size: "48px",
        onlineStatus: "online",
    },
    [ElementType.badge]: {
        type: ElementType.badge,
        id: "badge-preview",
        name: "Badge",
        text: "New",
        variant: "default",
        size: "md",
        onClick: { params: { msg: "Badge clicked", variant: "info" } },
    },
    [ElementType.breadcrumb]: {
        type: ElementType.breadcrumb,
        id: "breadcrumb-preview",
        name: "Breadcrumb",
        items: [
            { id: "home", label: "Home", href: "/" },
            { id: "category", label: "Category" },
        ],
        separator: "chevron",
    },
    [ElementType.button]: {
        type: ElementType.button,
        id: "button-preview",
        name: "Button",
        text: "Click Me",
        variant: "primary",
        onClick: { action: ActionType.update_state, params: { path: "clicked", value: true } },
    },
    [ElementType.calendar]: {
        type: ElementType.calendar,
        id: "calendar-preview",
        name: "Calendar",
        events: [
            {
                type: ElementType.calendar_event,
                id: "event1",
                name: "Event",
                title: "Meeting",
                start: "2025-09-28T10:00:00",
                end: "2025-09-28T11:00:00",
            },
        ],
        onSelect: { params: { msg: "Date selected", variant: "info" } },
        selectionMode: "single",
    },
    [ElementType.calendar_event]: {
        type: ElementType.calendar_event,
        id: "calendar-event-preview",
        name: "Calendar Event",
        title: "Sample Event",
        start: "2025-09-28T10:00:00",
        end: "2025-09-28T11:00:00",
        description: "Team meeting",
        color: "blue",
    },
    [ElementType.call]: {
        type: ElementType.call,
        id: "call-preview",
        name: "Call",
        callType: "video",
        peerId: "peer123",
        signalingServer: "wss://example.com/signaling",
        onConnect: { params: { msg: "Call connected", variant: "success" } },
    },
    [ElementType.card]: {
        type: ElementType.card,
        id: "card-preview",
        name: "Card",
        title: { type: ElementType.text, id: "card-title", name: "Title", content: "Sample Card", alignment: "left" },
        content: [{ type: ElementType.text, id: "card-text", name: "Text", content: "Card content", alignment: "left" }],
        variant: "default",
    },
    [ElementType.carousel]: {
        type: ElementType.carousel,
        id: "carousel-preview",
        name: "Carousel",
        items: [
            { type: ElementType.image, id: "img1", name: "Image 1", src: "https://example.com/img1.jpg", alt: "Image 1" },
            { type: ElementType.image, id: "img2", name: "Image 2", src: "https://example.com/img2.jpg", alt: "Image 2" },
        ],
        autoPlay: true,
        interval: 3000,
        showControls: true,
    },
    [ElementType.chart]: {
        type: ElementType.chart,
        id: "chart-preview",
        name: "Chart",
        chartType: "bar",
        data: [
            { label: "A", value: 10 },
            { label: "B", value: 20 },
        ],
        options: { legend: true, xKey: "label", yKey: "value" },
    },
    [ElementType.chat]: {
        type: ElementType.chat,
        id: "chat-preview",
        name: "Chat",
        historyDataSourceId: "chatMessages",
        placeholder: "Type a message...",
        showAvatars: true,
        onSend: { action: ActionType.update_state, params: { path: "chatMessages", value: { binding: "state.chatMessages" } } },
    },
    [ElementType.code]: {
        type: ElementType.code,
        id: "code-preview",
        name: "Code",
        value: "console.log('Hello World');",
    },
    [ElementType.collapsible]: {
        type: ElementType.collapsible,
        id: "collapsible-preview",
        name: "Collapsible",
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Collapsible content", alignment: "left" }],
        open: false,
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Toggle", variant: "outline" },
    },
    [ElementType.command]: {
        type: ElementType.command,
        id: "command-preview",
        name: "Command",
        groups: [
            {
                heading: "Actions",
                items: [
                    { id: "cmd1", label: "Command 1", onSelect: { params: { msg: "Command 1 selected", variant: "info" } } },
                ],
            },
        ],
        placeholder: "Type a command...",
    },
    [ElementType.comments]: {
        type: ElementType.comments,
        id: "comments-preview",
        name: "Comments",
        threadId: "thread1",
        allowReplies: true,
        onPost: { params: { msg: "Comment posted", variant: "success" } },
    },
    [ElementType.container]: {
        type: ElementType.container,
        id: "container-preview",
        name: "Container",
        layout: "flex",
        justify: "center",
        children: [{ type: ElementType.text, id: "text1", name: "Text", content: "Inside container", alignment: "center" }],
    },
    [ElementType.context_menu]: {
        type: ElementType.context_menu,
        id: "context-menu-preview",
        name: "Context Menu",
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Right-click Me", variant: "outline" },
        items: [
            { id: "item1", type: "item", label: "Action", onSelect: { params: { msg: "Action selected", variant: "info" } } },
        ],
    },
    [ElementType.custom]: {
        type: ElementType.custom,
        id: "custom-preview",
        name: "Custom",
        component: "CustomComponent",
        props: { text: "Custom Content" },
    },
    [ElementType.datagrid]: {
        type: ElementType.datagrid,
        id: "datagrid-preview",
        name: "DataGrid",
        columns: [
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
        ],
        rows: [{ binding: "state.sampleData" }],
    },
    [ElementType.drawer]: {
        type: ElementType.drawer,
        id: "drawer-preview",
        name: "Drawer",
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Drawer content", alignment: "left" }],
        direction: "right",
        isOpen: false,
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Open Drawer", variant: "outline" },
    },
    [ElementType.dropdown]: {
        type: ElementType.dropdown,
        id: "dropdown-preview",
        name: "Dropdown",
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Dropdown", variant: "outline" },
        items: [
            { id: "item1", label: "Option 1", onSelect: { params: { msg: "Option 1 selected", variant: "info" } } },
        ],
    },
    [ElementType.editor]: {
        type: ElementType.editor,
        id: "editor-preview",
        name: "Editor",
        content: "Sample text",
        placeholder: "Type here...",
        toolbar: { bold: true, italic: true },
    },
    [ElementType.file_upload]: {
        type: ElementType.file_upload,
        id: "file-upload-preview",
        name: "File Upload",
        accept: "image/*",
        presignUrl: "https://example.com/upload",
        onUploaded: { params: { msg: "File uploaded", variant: "success" } },
    },
    [ElementType.footer]: {
        type: ElementType.footer,
        id: "footer-preview",
        name: "Footer",
        alignment: "center",
        children: [{ type: ElementType.text, id: "text1", name: "Text", content: "Footer content", alignment: "center" }],
    },
    [ElementType.form]: {
        type: ElementType.form,
        id: "form-preview",
        name: "Form",
        formFields: [
            {
                id: "input1",
                fieldType: "input",
                input: {
                    id: "input1",
                    name: "input1",
                    inputType: "text",
                    placeholder: "Enter text",
                    value: { binding: "state.formData.input" },
                },
            },
        ],
        onSubmit: { params: { msg: "Form submitted", variant: "success" } },
        submitLabel: "Submit",
    },
    [ElementType.header]: {
        type: ElementType.header,
        id: "header-preview",
        name: "Header",
        alignment: "center",
        children: [{ type: ElementType.text, id: "text1", name: "Text", content: "Header content", alignment: "center" }],
    },
    [ElementType.icon]: {
        type: ElementType.icon,
        id: "icon-preview",
        name: "star",
        size: 24,
        label: "Star Icon",
    },
    [ElementType.image]: {
        type: ElementType.image,
        id: "image-preview",
        name: "Image",
        src: "https://example.com/image.jpg",
        alt: "Sample Image",
        width: "200px",
        height: "100px",
    },
    [ElementType.list]: {
        type: ElementType.list,
        id: "list-preview",
        name: "List",
        ordered: false,
        items: [
            { type: ElementType.list_item, id: "item1", name: "Item 1", text: "Item 1" },
            { type: ElementType.list_item, id: "item2", name: "Item 2", text: "Item 2" },
        ],
    },
    [ElementType.list_item]: {
        type: ElementType.list_item,
        id: "list-item-preview",
        name: "List Item",
        text: "Sample Item",
        icon: { type: ElementType.icon, id: "icon1", name: "check", size: 16 },
    },
    [ElementType.lottie]: {
        type: ElementType.lottie,
        id: "lottie-preview",
        name: "Lottie",
        src: "https://example.com/animation.json",
        autoplay: true,
        loop: true,
    },
    [ElementType.map]: {
        type: ElementType.map,
        id: "map-preview",
        name: "Map",
        center: [40.7128, -74.0060], // New York
        zoom: 10,
        provider: "google",
        google: { apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY },
        markers: [
            { id: "1", lat: 40.7128, lng: -74.0060, popup: "New York City" },
        ],
        controls: { fullscreen: true, zoom: true },
        height: 400,
    },
    [ElementType.menu]: {
        type: ElementType.menu,
        id: "menu-preview",
        name: "Menu",
        variant: "menubar",
        items: [
            { id: "item1", type: "item", label: "Menu Item 1", onSelect: { params: { msg: "Menu item selected", variant: "info" } } },
        ],
    },
    [ElementType.modal]: {
        type: ElementType.modal,
        id: "modal-preview",
        name: "Modal",
        title: "Sample Modal",
        description: "Modal content",
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Inside modal", alignment: "left" }],
        isOpen: false,
        onClose: { action: ActionType.close_modal, params: { id: "modal-preview" } },
    },
    [ElementType.pagination]: {
        type: ElementType.pagination,
        id: "pagination-preview",
        name: "Pagination",
        currentPage: 1,
        totalPages: 5,
        pages: [
            { number: 1, active: true },
            { number: 2, active: false },
            { number: 3, active: false },
        ],
        showEllipsis: true,
    },
    [ElementType.payment]: {
        type: ElementType.payment,
        id: "payment-preview",
        name: "Payment",
        buttonLabel: "Pay Now",
        checkoutUrl: "https://example.com/checkout",
        mode: "payment",
        publicKey: "pk_test_123",
    },
    [ElementType.popover]: {
        type: ElementType.popover,
        id: "popover-preview",
        name: "Popover",
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Open Popover", variant: "outline" },
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Popover content", alignment: "left" }],
        open: false,
    },
    [ElementType.progress]: {
        type: ElementType.progress,
        id: "progress-preview",
        name: "Progress",
        value: 50,
        label: "Progress",
        labelPosition: "outside",
    },
    [ElementType.qr_reader]: {
        type: ElementType.qr_reader,
        id: "qr-reader-preview",
        name: "QR Reader",
        mode: "generate",
        value: "https://example.com",
        size: 128,
    },
    [ElementType.radio_group]: {
        type: ElementType.radio_group,
        id: "radio-group-preview",
        name: "Radio Group",
        options: [
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
        ],
        value: "option1",
    },
    [ElementType.rating]: {
        type: ElementType.rating,
        id: "rating-preview",
        name: "Rating",
        value: { binding: "state.formData.rating" },
        max: 5,
        iconSet: "star",
    },
    [ElementType.resizable]: {
        type: ElementType.resizable,
        id: "resizable-preview",
        name: "Resizable",
        direction: "horizontal",
        panels: [
            { id: "panel1", content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Panel 1", alignment: "left" }], defaultSize: 50 },
            { id: "panel2", content: [{ type: ElementType.text, id: "text2", name: "Text", content: "Panel 2", alignment: "left" }], defaultSize: 50 },
        ],
    },
    [ElementType.scroll_area]: {
        type: ElementType.scroll_area,
        id: "scroll-area-preview",
        name: "Scroll Area",
        children: [{ type: ElementType.text, id: "text1", name: "Text", content: "Scrollable content", alignment: "left" }],
        orientation: "vertical",
        size: "md",
    },
    [ElementType.search]: {
        type: ElementType.search,
        id: "search-preview",
        name: "Search",
        placeholder: { binding: "translations.search.placeholder" },
        onSearch: { params: { msg: "Search triggered", variant: "info" } },
    },
    [ElementType.separator]: {
        type: ElementType.separator,
        id: "separator-preview",
        name: "Separator",
    },
    [ElementType.sheet]: {
        type: ElementType.sheet,
        id: "sheet-preview",
        name: "Sheet",
        content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Sheet content", alignment: "left" }],
        direction: "right",
        isOpen: false,
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Open Sheet", variant: "outline" },
    },
    [ElementType.sidebar]: {
        type: ElementType.sidebar,
        id: "sidebar-preview",
        name: "Sidebar",
        groups: [
            {
                id: "group1",
                label: "Navigation",
                items: [{ type: ElementType.button, id: "btn1", name: "Button", text: "Link 1", variant: "ghost" }],
            },
        ],
    },
    [ElementType.signature_pad]: {
        type: ElementType.signature_pad,
        id: "signature-pad-preview",
        name: "Signature Pad",
        clearButton: true,
        saveButton: true,
        onSave: { action: ActionType.wallet_sign, params: { msg: "Signature saved", variant: "success" } },
    },
    [ElementType.skeleton]: {
        type: ElementType.skeleton,
        id: "skeleton-preview",
        name: "Skeleton",
        lines: 3,
        animation: "pulse",
    },
    [ElementType.step_wizard]: {
        type: ElementType.step_wizard,
        id: "step-wizard-preview",
        name: "Step Wizard",
        steps: [
            { id: "step1", title: "Step 1", content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Step 1 content", alignment: "left" }] },
            { id: "step2", title: "Step 2", content: [{ type: ElementType.text, id: "text2", name: "Text", content: "Step 2 content", alignment: "left" }] },
        ],
        current: 0,
    },
    [ElementType.switch]: {
        type: ElementType.switch,
        id: "switch-preview",
        name: "Switch",
        inputType: "switch",
        value: false,
        onChange: { action: ActionType.update_state, params: { path: "clicked", value: true } },
    },
    [ElementType.table]: {
        type: ElementType.table,
        id: "table-preview",
        name: "Table",
        headers: ["ID", "Name"],
        rows: [{ binding: "state.sampleData" }],
    },
    [ElementType.tabs]: {
        type: ElementType.tabs,
        id: "tabs-preview",
        name: "Tabs",
        activeTab: "tab1",
        tabs: [
            { id: "tab1", label: "Tab 1", content: [{ type: ElementType.text, id: "text1", name: "Text", content: "Tab 1 content", alignment: "left" }] },
            { id: "tab2", label: "Tab 2", content: [{ type: ElementType.text, id: "text2", name: "Text", content: "Tab 2 content", alignment: "left" }] },
        ],
    },
    [ElementType.text]: {
        type: ElementType.text,
        id: "text-preview",
        name: "Text",
        content: "Sample Text",
        alignment: "left",
        tag: "p",
    },
    [ElementType.three_d_model]: {
        type: ElementType.three_d_model,
        id: "three-d-model-preview",
        name: "3D Model",
        src: "https://example.com/model.gltf",
        autoplay: true,
    },
    [ElementType.timeline]: {
        type: ElementType.timeline,
        id: "timeline-preview",
        name: "Timeline",
        items: [
            { id: "event1", title: "Event 1", timestamp: "2025-09-28T10:00:00", description: "First event" },
        ],
        orientation: "vertical",
    },
    [ElementType.toggle]: {
        type: ElementType.toggle,
        id: "toggle-preview",
        name: "Toggle",
        label: "Toggle Me",
        pressed: false,
        onToggle: { action: ActionType.update_state, params: { path: "clicked", value: true } },
    },
    [ElementType.toggle_group]: {
        type: ElementType.toggle_group,
        id: "toggle-group-preview",
        name: "Toggle Group",
        options: [
            { type: ElementType.toggle, id: "toggle1", name: "Toggle 1", label: "Option 1", pressed: false },
            { type: ElementType.toggle, id: "toggle2", name: "Toggle 2", label: "Option 2", pressed: false },
        ],
        multiple: true,
        value: [],
    },
    [ElementType.tooltip]: {
        type: ElementType.tooltip,
        id: "tooltip-preview",
        name: "Tooltip",
        content: "Tooltip content",
        trigger: { type: ElementType.button, id: "trigger", name: "Trigger", text: "Hover Me", variant: "outline" },
    },
    [ElementType.tree]: {
        type: ElementType.tree,
        id: "tree-preview",
        name: "Tree",
        nodes: [
            { type: ElementType.tree, id: "node1", name: "Node 1", label: "Parent", children: [{ type: ElementType.tree, id: "node2", name: "Node 2", label: "Child" }] },
        ],
    },
    [ElementType.video]: {
        type: ElementType.video,
        id: "video-preview",
        name: "Video",
        src: "https://example.com/sample.mp4",
        controls: true,
        autoPlay: false,
    },
    [ElementType.voice]: {
        type: ElementType.voice,
        id: "voice-preview",
        name: "Voice",
        language: "en-US",
        onRecognize: { action: ActionType.voice_command, params: { msg: "Voice recognized", variant: "info" } },
    },
    [ElementType.wallet]: {
        type: ElementType.wallet,
        id: "wallet-preview",
        name: "Wallet",
        provider: "metamask",
        chainId: 1,
        onConnect: { action: ActionType.wallet_connect, params: { msg: "Wallet connected", variant: "success" } },
    },
};

export function PreviewApp() {
    const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);

    // Mock state for dataSourceId and bindings
    const mockState: AnyObj = {
        sampleData: [{ id: "1", name: "Sample Item", lat: 40.7128, lng: -74.0060 }],
        user: { name: "John Doe" },
        clicked: false,
    };

    // Generate element list
    const elementList = Object.values(ElementType).map((type) => ({
        type,
        element: {
            ...mockElements[type],
            styles: { className: "p-4 border rounded shadow-sm" },
        },
    }));

    return (
        <StateProvider project={mockProject} initialState={mockState}>
            <div className="flex min-h-screen">
                {/* Sidebar for element selection */}
                <ScrollArea className="w-64 border-r p-4">
                    <h2 className="text-lg font-bold mb-4">UI Elements</h2>
                    {elementList.map(({ type }) => (
                        <Button
                            key={type}
                            variant={selectedElement === type ? "default" : "ghost"}
                            className="w-full justify-start mb-2"
                            onClick={() => setSelectedElement(type)}
                        >
                            {type}
                        </Button>
                    ))}
                </ScrollArea>

                {/* Main preview area */}
                <div className="flex-1 p-8">
                    <h1 className="text-2xl font-bold mb-6">Element Preview</h1>
                    {selectedElement ? (
                        <div>
                            <h3 className="text-xl font-semibold mb-4">{selectedElement}</h3>
                            <ElementResolver
                                element={elementList.find((e) => e.type === selectedElement)!.element}
                                runtime={mockRuntime}
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {elementList.map(({ type, element }) => (
                                <div key={type} className="border p-4 rounded">
                                    <h3 className="text-lg font-semibold mb-2">{type}</h3>
                                    <ElementResolver element={element} runtime={mockRuntime} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StateProvider>
    );
}