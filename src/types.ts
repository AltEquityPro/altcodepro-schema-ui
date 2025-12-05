export enum ActionType {
    ai_generate = 'ai_generate',
    api_call = 'api_call',
    audit_log = 'audit_log',
    close_modal = 'close_modal',
    crud_create = 'crud_create',
    crud_delete = 'crud_delete',
    crud_read = 'crud_read',
    crud_update = 'crud_update',
    export = 'export',
    export_json = 'export_json',
    export_pdf = 'export_pdf',
    export_ppt = 'export_ppt',
    export_word = 'export_word',
    graphql = 'graphql',
    graphql_mutation = 'graphql_mutation',
    graphql_query = 'graphql_query',
    graphql_subscription = 'graphql_subscription',
    initiate_call = 'initiate_call',
    navigation = 'navigation',
    open_modal = 'open_modal',
    run_script = 'run_script',
    update_state = 'update_state',
    voice_command = 'voice_command',
    wallet_connect = 'wallet_connect',
    wallet_sign = 'wallet_sign',
    toast = 'toast',
    websocket_call = 'websocket_call',
}
export interface ActionRuntime {
    /** Navigation & layout */
    openModal?: (id: string) => void;
    closeModal?: (id: string) => void;
    openDrawer?: (id: string) => void;
    closeDrawer?: (id: string) => void;
    openSidebar?: (id: string) => void;
    closeSidebar?: (id: string) => void;
    nav?: NavigationAPI; //  internal
    /** Scripts, forms, exports */
    runScript?: (name: string, args: any[]) => Promise<any> | any;
    toast?: (msg: string, variant?: "success" | "error" | "info" | "warning") => void;
    exportFile?: (
        type: "pdf" | "ppt" | "word" | "json" | "csv" | "xlsx",
        payload: AnyObj
    ) => Promise<void>;

    /** Web3 / wallet / crypto */
    connectWallet?: (provider: string, chainId: number, projectId?: string) => Promise<any>;
    signTransaction?: (provider: string, chainId: number, transaction: any) => Promise<any>;
    signMessage?: (provider: string, chainId: number, message: string) => Promise<any>;
    disconnectWallet?: () => Promise<void>;

    /** Real-time / comms */
    initiateCall?: (
        callType: "video" | "audio",
        peerId: string,
        signalingServer?: string
    ) => Promise<void>;
    endCall?: () => void;
    sendMessage?: (threadId: string, message: AnyObj) => Promise<void>;
    joinChatThread?: (threadId: string) => Promise<void>;
    leaveChatThread?: (threadId: string) => Promise<void>;
    voteComment?: (threadId: string, commentId: string, up: boolean) => Promise<void>;

    /** Voice / AI / media */
    processVoiceCommand?: (command: string, language: string, voiceModel?: string) => Promise<any>;
    transcribeAudio?: (file: File, language?: string) => Promise<string>;
    generateAIContent?: (prompt: string, type: "text" | "image" | "video" | "ui") => Promise<any>;

    /** Signature pad & drawing */
    saveSignature?: (dataUrl: string, exportType: "png" | "jpeg" | "svg") => Promise<void>;
    clearSignature?: () => void;

    /** Timeline / tree interactions */
    selectTimelineItem?: (id: string) => void;
    selectTreeNode?: (id: string, selected: boolean) => void;

    /** Generic state patcher (for form/datagrid etc.) */
    patchState?: (path: string, value: any) => void;
}
export interface ActionParams {
    /** General controls */
    timeout?: number;
    id?: string;
    retry?: {
        attempts: number;
        delay: number;
        strategy?: "exponential" | "linear" | "jitter";
    };
    optimisticState?: { path: string; value: any };
    resultMapping?: { jsonPath?: string; transform?: string };

    successMessage?: string;
    value?: Binding;
    path?: string;
    /** API / network */
    queryParams?: Record<string, string | number | boolean>;
    gqlQuery?: string;
    gqlQueryOverrides?: AnyObj;
    body?: AnyObj | FormData;
    headers?: Record<string, string>;
    statePath?: string; // where to save result in state
    responseType?: "data" | "blob" | "text";

    /** Navigation / transitions */
    href?: string;
    replace?: boolean;
    modalId?: string;
    drawerId?: string;
    sidebarId?: string;

    /** Form / validation */
    validate?: boolean;
    resetForm?: boolean;
    submitFormId?: string;

    /** File / uploads */
    file?: File | File[];
    accept?: string;
    maxSizeBytes?: number;
    multiple?: boolean;

    /** Chat / comments */
    threadId?: string;
    message?: AnyObj;
    commentId?: string;
    voteDirection?: "up" | "down";

    /** Timeline / tree */
    itemId?: string;
    nodeId?: string;
    selected?: boolean;

    /** Wallet / crypto */
    provider?: string;
    chainId?: number;
    projectId?: string;
    transaction?: AnyObj;
    messageToSign?: string;

    /** Voice / AI */
    command?: string;
    language?: string;
    voiceModel?: string;
    prompt?: string;
    type?: "text" | "image" | "video" | "ui";

    /** Export */
    exportType?: "pdf" | "ppt" | "word" | "json" | "csv" | "xlsx";
    exportConfig?: AnyObj;

    /** Signature pad */
    dataUrl?: string;
    format?: "png" | "jpeg" | "svg";

    /** Misc */
    args?: any[];
    event?: string; // audit log / custom
    metadata?: AnyObj;

    msg?: Binding;
    variant?: "success" | "error" | "info" | "warning";
    callType?: 'video' | 'audio';
    peerId?: Binding;
    signalingServer?: Binding;
    isAuthRoute?: boolean;
}

export enum Alignment {
    center = 'center',
    justify = 'justify',
    left = 'left',
    right = 'right',
}
export enum ElementType {
    accordion = 'accordion',
    alert = 'alert',
    alert_dialog = 'alert_dialog',
    audio = 'audio',
    avatar = 'avatar',
    badge = 'badge',
    breadcrumb = 'breadcrumb',
    button = 'button',
    calendar = 'calendar',
    calendar_event = 'calendar_event',
    call = 'call',
    card = 'card',
    carousel = 'carousel',
    chart = 'chart',
    chat = 'chat',
    code = 'code',
    composer = 'composer',
    collapsible = 'collapsible',
    command = 'command',
    comments = 'comments',
    container = 'container',
    context_menu = 'context_menu',
    custom = 'custom',
    dynamic = 'dynamic',
    datagrid = 'datagrid',
    drawer = 'drawer',
    dropdown = 'dropdown',
    editor = 'editor',
    file_upload = 'file_upload',
    footer = 'footer',
    form = 'form',
    header = 'header',
    icon = 'icon',
    image = 'image',
    list = 'list',
    list_item = 'list_item',
    lottie = 'lottie',
    map = 'map',
    menu = 'menu',
    modal = 'modal',
    navigation_menu = 'navigation_menu',
    pagination = 'pagination',
    payment = 'payment',
    popover = 'popover',
    progress = 'progress',
    qr_reader = 'qr_reader',
    radio_group = 'radio_group',
    rating = 'rating',
    resizable = 'resizable',
    scroll_area = 'scroll_area',
    search = 'search',
    separator = 'separator',
    sheet = 'sheet',
    sidebar = 'sidebar',
    signature_pad = 'signature_pad',
    skeleton = 'skeleton',
    share = 'share',
    step_wizard = 'step_wizard',
    table = 'table',
    tabs = 'tabs',
    text = 'text',
    three_d_model = 'three_d_model',
    timeline = 'timeline',
    toggle = 'toggle',
    toggle_group = 'toggle_group',
    tooltip = 'tooltip',
    tree = 'tree',
    video = 'video',
    voice = 'voice',
    wallet = 'wallet',
}

export enum FieldType {
    alert = 'alert',
    card = 'card',
    chart = 'chart',
    custom = 'custom',
    description = 'description',
    divider = 'divider',
    drawer = 'drawer',
    dropdown_menu = 'dropdown_menu',
    heading = 'heading',
    help = 'help',
    icon = 'icon',
    image = 'image',
    input = 'input',
    loader = 'loader',
    modal = 'modal',
    subheading = 'subheading',
    video = 'video',
}

export enum FormGroupType {
    card = 'card',
    container = 'container',
    single = 'single',
    step_wizard = 'step_wizard',
    tabs = 'tabs',
}

export enum InputType {
    calendar = 'calendar',
    checkbox = 'checkbox',
    code = 'code',
    color = 'color',
    createselect = 'createselect',
    credit_card = 'credit_card',
    currency = 'currency',
    date = 'date',
    datetime_local = 'datetime-local',
    email = 'email',
    file = 'file',
    image = 'image',
    markdown = 'markdown',
    month = 'month',
    multiselect = 'multiselect',
    number = 'number',
    otp = 'otp',
    password = 'password',
    radio = 'radio',
    range = 'range',
    rating = 'rating',
    richtext = 'richtext',
    search = 'search',
    slider = 'slider',
    select = 'select',
    signature = 'signature',
    switch = 'switch',
    tags = 'tags',
    tel = 'tel',
    text = 'text',
    textarea = 'textarea',
    time = 'time',
    toggle = 'toggle',
    url = 'url',
    voice = 'voice',
    week = 'week',
}

export enum LayoutType {
    Contact = 'contact',
    Cover = 'cover',
    Custom = 'custom',
    DataDashboard = 'data_dashboard',
    DataTableWithChart = 'data_table_with_chart',
    Datagrid = 'datagrid',
    FAQ = 'faq',
    FeatureCarousel = 'feature_carousel',
    FourColumns = 'four_columns',
    Gallery = 'gallery',
    Map = 'map',
    SingleColumn = 'single_column',
    StepWizard = 'step_wizard',
    ThreeColumns = 'three_columns',
    Timeline = 'timeline',
    TwoColumns = 'two_columns',
}

// === Base Types ===
export type AnyObj = Record<string, any>;

// Replace your current Binding with this:
export type Binding<T = any> = string | { binding: string } | null;


export type ButtonVariant =
    | 'default'
    | 'destructive'
    | 'ghost'
    | 'info'
    | 'link'
    | 'outline'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning';

export type ConditionOp = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'exists' | 'not_exists' | 'matches' | 'in' | 'not_in';

// === Element Types ===

export interface AccessibilityProps {
    ariaHidden?: boolean;
    ariaLabel?: Binding;
    ariaRole?: string;
    focusable?: boolean;
    screenReaderText?: Binding;
    tabIndex?: number;
    voiceSupport?: boolean;
}

export interface BaseElement {
    id: string;
    name: string;
    accessibility?: AccessibilityProps;
    children?: UIElement[];
    dataSourceId?: string;
    onEvent?: EventHandler;
    styles?: StyleProps;
    type: ElementType;
    value?: Binding;
    visibility?: VisibilityControl;
    zIndex?: number;
}

export interface AccordionElement extends BaseElement {
    type: ElementType.accordion;
    collapsible?: boolean;
    expandedItem?: string | string[];
    items: {
        id: string;
        title: Binding;
        content: UIElement[];
    }[];
    multiple?: boolean;
    onChange?: EventHandler;
}

export interface AlertElement extends BaseElement {
    type: ElementType.alert;
    dismissible?: boolean;
    message: Binding;
    variant: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'destructive';
}

export interface AlertDialogElement extends BaseElement {
    type: ElementType.alert_dialog;
    actionButton?: ButtonElement;
    actions?: Array<ButtonElement & { role?: 'default' | 'destructive' | 'cancel' }>;
    cancelButton?: ButtonElement;
    content: UIElement[];
    description?: Binding;
    dismissible?: boolean;
    isOpen: boolean | Binding;
    onOpenChange?: EventHandler;
    position?: 'center' | 'top' | 'bottom';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    title: Binding;
    trigger?: UIElement;
    variant?: 'default' | 'info' | 'warning' | 'danger' | 'success' | 'destructive';
}
export interface AudioElement extends BaseElement {
    type: ElementType.audio;
    src: Binding;
    autoplay?: boolean;
    controls?: boolean;
    loop?: boolean;
    volume?: number;
    muted?: boolean;
    onPlay?: EventHandler;
    onPause?: EventHandler;
    onEnded?: EventHandler;
}

export interface AvatarElement extends BaseElement {
    type: ElementType.avatar;
    alt?: Binding;
    fallback?: Binding;
    generation?: GenerationSpec;
    onlineStatus?: boolean | 'online' | 'offline' | 'away' | Binding;
    shape?: 'circle' | 'square' | 'rounded';
    showRing?: boolean;
    size?: number | string;
    src?: Binding;
}

export interface BadgeElement extends BaseElement {
    type: ElementType.badge;
    asChild?: boolean;
    iconLeft?: IconElement;
    iconRight?: IconElement;
    isDot?: boolean;
    maxLength?: number;
    onClick?: EventHandler;
    size?: 'sm' | 'md' | 'lg';
    text?: Binding;
    tooltip?: Binding;
    value?: Binding;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface BreadcrumbElement extends BaseElement {
    type: ElementType.breadcrumb;
    ellipsisAfter?: number;

    items: {
        id: string;
        href?: string | Binding;
        iconLeft?: UIElement;
        iconRight?: UIElement;
        label: Binding;
        onClick?: EventHandler;
    }[];
    separator?: 'chevron' | 'slash' | 'dot' | 'custom';
    tooltip?: boolean;
}
export interface ShareElement extends BaseElement {
    type: ElementType.share;
    /** Text shown on the button */
    label?: Binding;
    /** Title used when sharing */
    title?: Binding;
    /** Text/body of the share */
    text?: Binding;
    /** URL to share */
    url?: Binding;
    /** Files to share (mobile only) */
    files?: Binding<File[]>;
    /** Custom icon */
    icon?: IconElement;
    /** Button variant */
    variant?: ButtonVariant;
    /** Sheet position */
    sheetDirection?: 'bottom' | 'top' | 'left' | 'right';
}
export interface ButtonElement extends BaseElement {
    type: ElementType.button;
    htmlType: string;
    disabled?: boolean | Binding;
    iconLeft?: IconElement;
    iconRight?: IconElement;
    onClick?: EventHandler;
    isSubmit?: boolean;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    text: Binding;
    tooltip?: Binding;
    variant: ButtonVariant;
}

export interface CalendarElement extends BaseElement {
    type: ElementType.calendar;
    events: CalendarEventElement[];
    onSelect: EventHandler;
    selectedDate?: Binding;
    selectionMode?: 'single' | 'multiple' | 'range';
}
// types.ts
export interface CalendarEventElement extends BaseElement {
    type: ElementType.calendar_event
    title: Binding
    start: Binding
    end: Binding
    allDay?: boolean
    location?: Binding
    description?: Binding
    onClick?: EventHandler
    eventBtnLabel?: Binding
    color?: Binding
}


export interface CallElement extends BaseElement {
    type: ElementType.call;
    audioConstraints?: MediaTrackConstraints;
    autoplay?: boolean;
    callType: 'video' | 'audio';
    devicesMenu?: boolean;
    iceServers?: Array<{ urls: string | string[]; username?: string; credential?: string }>;
    maxPeers?: number;
    mirrorLocal?: boolean;
    mode?: 'mesh' | 'sfu';
    onConnect?: EventHandler;
    onDisconnect?: EventHandler;
    onError?: EventHandler;
    onPeerJoin?: EventHandler;
    onPeerLeave?: EventHandler;
    onStats?: EventHandler;
    peerId: Binding;
    screenShare?: boolean;
    sfu?: {
        url?: Binding;
        authToken?: Binding;
        autoSubscribe?: boolean;
    };
    showGridNames?: boolean;
    signalingServer: Binding;
    stats?: boolean;
    tracking?: {
        dataSourceId?: string;
        events?: Array<
            | 'join'
            | 'leave'
            | 'mute'
            | 'unmute'
            | 'camera_on'
            | 'camera_off'
            | 'screenshare_on'
            | 'screenshare_off'
            | 'device_change'
            | 'error'
        >;
        heartbeatInterval?: number;
    };
    videoConstraints?: MediaTrackConstraints;
}

export interface CardElement extends BaseElement {
    type: ElementType.card;
    action?: UIElement;
    badge?: UIElement;
    clickable?: boolean | Binding;
    content: UIElement[];
    description?: UIElement;
    footer?: UIElement[];
    header?: UIElement;
    href?: Binding;
    media?: UIElement;
    title?: UIElement;
    variant?: 'default' | 'outline' | 'ghost' | 'elevated' | 'borderless';
}

export interface CarouselElement extends BaseElement {
    type: ElementType.carousel;
    autoPlay?: boolean;
    interval?: number;
    items: UIElement[]
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    showControls?: boolean;
    showIndicators?: boolean;
    showProgress?: boolean;
}
export interface ComposerElement extends BaseElement {
    type: ElementType.composer;

    inputMode?: 'text' | 'textarea' | 'markdown' | 'richtext' | 'code';
    placeholder?: Binding;
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    autoFocus?: boolean;
    disabled?: boolean | Binding;

    /** 🎛️ Unified schema-managed actions (icons, buttons, submit, etc.) */
    actions?: ButtonElement[];
    editorClassName?: string;
    actionsContainerClassName?: string;

    /** 📎 Optional attachment & voice support */
    allowAttachments?: boolean;
    attachmentTypes?: string[]; // e.g. ["image/*", "application/pdf"]
    maxAttachments?: number;
    allowVoice?: boolean;

    /** ⚡ Event handlers */
    onSend?: EventHandler; // fires on enter or submit
    onChange?: EventHandler; // fires on input change
    onAttachmentAdd?: EventHandler;
    onAttachmentRemove?: EventHandler;
    onVoiceStart?: EventHandler;
    onVoiceStop?: EventHandler;
}


export interface ChatElement extends BaseElement {
    type: ElementType.chat;
    headers?: Record<string, string | Binding>;
    richResponses?: boolean; // predifned types for responses (cards, images, buttons, etc.)
    // AI/LLM
    placeholder?: string | Binding;
    historyDataSourceId?: string;
    onSend?: EventHandler;
    onReceive?: EventHandler;
    streaming?: boolean;
    streamMode?: "append" | "replace";
    dataMap?: {
        id?: string;                     // unique message id
        role?: string;                   // "user" | "assistant" | "system" etc.
        text?: string;                   // main text content
        createdAt?: string;              // timestamp field
        replyTo?: string;                // parent message id
        threadId?: string;               // thread/group id
        attachments?: string;            // path to attachments array
        actions?: string;                // array of available actions
        reactions?: string;              // emoji reactions
        children?: string;               // nested UI element structure
        author?: {                       // nested author mapping
            name?: string;
            avatarUrl?: string;
            role?: string;
        };
        tools?: string;                  // AI tool buttons
        status?: string;                 // message status
    }
    onStreamChunk?: EventHandler;

    // Suggestions
    suggestionsDataSourceId?: string;

    // Uploads
    onTyping?: EventHandler;
    accept?: string;
    maxSizeBytes?: number;
    multiple?: boolean;
    allowUploads?: boolean;
    allowPasteImages?: boolean;
    onUpload?: EventHandler;

    // Actions / buttons
    quickActions?: ButtonElement[];
    onMessageAction?: EventHandler;
    leftDrawer?: DropdownElement;
    rightDrawer?: DropdownElement;
    // Message utilities
    onDeleteMessage?: EventHandler;
    onCopyMessage?: EventHandler;

    // 🔹 Optional UI polish
    showTimestamps?: boolean;        // hide/show message timestamps
    showStatusIcons?: boolean;       // hide/show ✓✓ ticks
    showAvatars?: boolean;           // render user/assistant avatars
    typingIndicator?: boolean;       // force typing indicator on/off

    chatMode?: "ai" | "direct" | 'group';
    roleClasses?: "user" | "assistant" | "system" | "other";
    messageClassName?: string;
    showThreadHeaders?: boolean;
    inputMode?: "input" | "textarea" | "richtext" | "markdown";
    allowVoice?: boolean;
    voiceLanguage?: string;

    participantsDataSourceId?: string;
    showPresence?: boolean;
    onPresenceChange?: EventHandler;
    currentUserId?: Binding;
    commandSuggestions?: { id: string; label: string }[];
    moderationRules?: { regex: string; action: "block" | "flag" | "warn" }[];
    ttsUrl?: string;
    notificationSound?: string;
    maxMessages?: number;
    persistence?: { type: "local" | "remote"; dbName?: string; endpoint?: string };
    http?: { sendUrl: string; method?: "POST" | "PUT"; fetchInit?: RequestInit };
    sse?: { url: string };
    ws?: {
        url: string;
        protocol?: "graphql-ws" | "subscriptions-transport-ws" | "graphql-transport-ws";
        heartbeat?: { interval: number; message: any };
    };
}

export interface ChartElement extends BaseElement {
    type: ElementType.chart;
    chartType: 'bar' | 'line' | 'area' | 'pie' | 'radar' | 'radialBar' | 'scatter' | 'composed' | 'candlestick';
    data: Binding | any[];
    options?: {
        animation?: boolean | Record<string, any>;
        areaOpacity?: number;
        ariaLabel?: string | Binding;
        brush?: boolean | Record<string, any>;
        closeKey?: string;
        colors?: string[];
        description?: string | Binding;
        donut?: boolean;
        grid?: boolean | Record<string, any>;
        highKey?: string;
        legend?: boolean;
        lineDot?: boolean | Record<string, any>;
        lineStrokeWidth?: number;
        lowKey?: string;
        openKey?: string;
        radius?: number | string;
        referenceLines?: {
            x?: number[] | string[];
            y?: number[];
        };
        responsive?: boolean;
        series?: SeriesSpec[];
        stacked?: boolean;
        syncId?: string;
        tooltip?: boolean;
        tooltipFormatter?: string | Binding;
        valueKey?: string;
        xDomain?: any;
        xFormatter?: string | Binding;
        xKey?: string;
        yDomain?: any;
        yFormatter?: string | Binding;
        yKey?: string;
    };
}

export interface CollapsibleElement extends BaseElement {
    type: ElementType.collapsible;
    content?: UIElement[];
    open?: boolean | Binding;
    onOpenChange?: EventHandler;
    trigger?: UIElement;
}

export interface CommandElement extends BaseElement {
    type: ElementType.command;
    description?: string;
    emptyMessage?: string;
    global?: boolean;
    groups?: {
        heading: string;
        items: {
            id: string;
            disabled?: boolean;
            icon?: string;
            label: string;
            onSelect?: EventHandler;
            shortcut?: string;
        }[];
    }[];
    placeholder?: string;
    showMobileButton?: boolean;
    title?: string;
}
export interface CommentsElement extends BaseElement {
    type: ElementType.comments;
    threadId: string | Binding;

    // User features
    allowReplies?: boolean;
    allowVoting?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;

    // Moderator features
    allowFlagging?: boolean;
    allowModeration?: boolean;
    moderationView?: "all" | "flagged" | "hidden" | "pending";

    // Events
    onPost?: EventHandler;
    onReply?: EventHandler;
    onVote?: EventHandler;
    onEdit?: EventHandler;
    onDelete?: EventHandler;

    // Moderation hooks
    onFlag?: EventHandler;
    onApprove?: EventHandler;
    onHide?: EventHandler;
    onBanUser?: EventHandler;
    onModerateAction?: EventHandler;
}

export interface ContainerElement extends BaseElement {
    type: ElementType.container;
}

export type ContextMenuItem =
    | {
        id: string;
        type: 'item';
        disabled?: boolean;
        icon?: string;
        label: Binding;
        onSelect?: EventHandler;
        shortcut?: string;
        variant?: 'default' | 'destructive';
    }
    | {
        id: string;
        type: 'checkbox';
        checked?: Binding;
        disabled?: boolean;
        label: Binding;
        onSelect?: EventHandler;
    }
    | {
        id: string;
        type: 'radio';
        checked?: Binding;
        group: string;
        label: Binding;
        onSelect?: EventHandler;
        value: string;
    }
    | {
        id: string;
        type: 'label';
        inset?: boolean;
        label: Binding;
    }
    | {
        id: string;
        type: 'separator';
    }
    | {
        id: string;
        type: 'sub';
        icon?: string;
        items: ContextMenuItem[];
        label: Binding;
    };

export interface ContextMenuElement extends BaseElement {
    type: ElementType.context_menu;
    items: ContextMenuItem[];
    trigger: UIElement;
}

export interface CustomElement extends BaseElement {
    type: ElementType.custom;
    component: string | string[];
    groupLayout?: 'stack' | 'inline' | 'fragment';
    props?: Record<string, any>;
}

export type DataGridCol = {
    align?: Alignment;
    cellClass?: string | Binding | { condition: Binding; class: string }[] | ((row: any) => string);
    chartConfig?: {
        type: 'bar' | 'line' | 'pie' | 'sparkline';
        dataKey: string;
        options?: Record<string, any>;
    };
    customRender?: string;
    editable?: boolean;
    editorType?: InputType;
    filterType?: 'text' | 'select' | 'multi-select' | 'date' | 'datetime' | 'time' | 'number' | 'range' | 'bool';
    filterable?: boolean;
    footer?: string | Binding | { aggregate: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom'; customScript?: string };
    header: string | Binding;
    headerClass?: string | Binding;
    hidden?: boolean;
    key: string;
    maxWidth?: number | string;
    minWidth?: number | string;
    options?: { value: any; label: string | Binding }[] | Binding;
    pinned?: 'left' | 'right' | false;
    renderer?: 'text' | 'image' | 'link' | 'badge' | 'progress' | 'chart' | 'checkbox' | 'custom';
    resizable?: boolean;
    sortable?: boolean;
    width?: number | string;
};

export interface DataGridElement extends BaseElement {
    type: ElementType.datagrid;
    autoHeight?: boolean;
    columnVisibility?: Record<string, boolean> | Binding;
    columns: DataGridCol[];
    currentPage?: number | Binding;
    editForm?: FormElement;
    editingMode?: 'none' | 'cell' | 'row' | 'modal';
    emptyMessage?: Binding;
    expansionTemplate?: UIElement | string;
    filters?: Record<string, any> | Binding;
    globalFilter?: string | Binding;
    groupActions?: Array<{
        id: string;
        icon?: string;
        label: Binding;
        onClick: EventHandler;
        variant?: ButtonVariant;
    }>;
    height?: number | string;
    id: string;
    infinite?: boolean;
    loading?: boolean | Binding;
    onCellEdit?: EventHandler;
    onColumnReorder?: EventHandler;
    onColumnVisibilityChange?: EventHandler;
    onFilterChange?: EventHandler;
    onGlobalFilterChange?: EventHandler;
    onLoadMore?: EventHandler;
    onPageChange?: EventHandler;
    onRowClick?: EventHandler;
    onRowCollapse?: EventHandler;
    onRowExpand?: EventHandler;
    onSelectionChange?: EventHandler;
    onSortChange?: EventHandler;
    pageSize?: number;
    reorderable?: boolean;
    resizableColumns?: boolean;
    rowActions?: Array<{
        id: string;
        condition?: Binding;
        icon?: string;
        label: Binding;
        onClick: EventHandler;
        variant?: ButtonVariant;
    }>;
    rowClass?: string | Binding | { condition: Binding; class: string }[] | ((row: any) => string);
    rows?: any[];
    selectable?: boolean;
    selectionMode?: 'single' | 'multiple';
    serverSide?: boolean;
    sorting?: { column: string; direction: 'asc' | 'desc' }[] | Binding;
    subRowsKey?: string;
    totalCount?: number | Binding;
    virtualRowHeight?: number;
    virtualization?: boolean;
    zIndex?: number;
}

export interface DrawerElement extends BaseElement {
    type: ElementType.drawer;
    content: UIElement[];
    description?: Binding;
    direction?: 'top' | 'bottom' | 'left' | 'right';
    footer?: UIElement[];
    isOpen?: boolean | Binding;
    onOpenChange?: EventHandler;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg' | string;
    title?: Binding;
    trigger?: UIElement;
}

export type DropdownItem = {
    checked?: boolean | Binding;
    children?: DropdownItem[];
    disabled?: boolean;
    group?: string;
    heading?: Binding;
    icon?: string;
    id: string;
    label: Binding;
    shortcut?: string;
    type?: 'checkbox' | 'radio' | 'item' | 'submenu' | 'separator' | 'label' | 'group';
    value?: string;
    variant?: 'default' | 'destructive';
};

export interface DropdownElement extends BaseElement {
    type: ElementType.dropdown;
    items?: DropdownItem[];
    value?: string;
    onSelect?: EventHandler;
    idFeild?: string;
    labelField?: string;
    triggerButtonClassName?: string;
    trigger: UIElement;
    placeholder?: Binding;
}

export interface EditorElement extends BaseElement {
    type: ElementType.editor;
    content: Binding | string;
    onChange?: EventHandler;
    placeholder?: Binding | string;
    toolbar?: {
        bold?: boolean;
        bulletList?: boolean;
        codeBlock?: boolean;
        italic?: boolean;
        orderedList?: boolean;
        underline?: boolean;
    };
}
export interface FileUploadElement extends BaseElement {
    type: ElementType.file_upload;
    accept?: string;
    headers?: Record<string, string | Binding>;
    maxSize?: number;
    multiple?: boolean;
    onComplete?: EventHandler;
    onError?: EventHandler;
    onQueueChange?: EventHandler;
    onUploaded?: EventHandler;
    presignUrl: Binding;
}

export interface FooterElement extends BaseElement {
    type: ElementType.footer;
    alignment?: Alignment;
}

export type FormField =
    | {
        id: string;
        fieldType: FieldType.input;
        helpText?: Binding;
        hidden?: boolean | Binding;
        input: InputElement;
        label?: Binding;
        placeholder?: Binding;
        tooltip?: Binding;
        visibility?: VisibilityControl;
    }
    | {
        id: string;
        fieldType:
        | FieldType.alert
        | FieldType.card
        | FieldType.chart
        | FieldType.custom
        | FieldType.description
        | FieldType.divider
        | FieldType.drawer
        | FieldType.dropdown_menu
        | FieldType.heading
        | FieldType.help
        | FieldType.icon
        | FieldType.image
        | FieldType.loader
        | FieldType.modal
        | FieldType.subheading
        | FieldType.video;
        element: UIElement;
    };

export interface FormElement extends BaseElement {
    type: ElementType.form;
    cancelLabel?: Binding;
    description?: Binding;
    formFields: FormField[];
    formGroupType: FormGroupType;
    submit: ButtonElement;
    footerClassName?: string;
    actionsContainerClassName?: string;
    actions?: Array<ButtonElement>;
    tabsConfig?: {
        tabPosition?: 'top' | 'left' | 'right';
        variant?: 'default' | 'outline' | 'pills';
    };
    title?: Binding;
    validationSchema?: Record<string, any>;
    wizardConfig?: {
        linear?: boolean;
        showProgress?: boolean;
        steps: { id: string; title: Binding; description?: Binding }[];
    };
}

export interface HeaderElement extends BaseElement {
    type: ElementType.header;
    alignment?: Alignment;
}


export interface IconElement extends BaseElement {
    type: ElementType.icon;
    label?: Binding;
    name: string;
    size: number;
}

export interface ImageElement extends BaseElement {
    type: ElementType.image;
    alt: Binding;
    generation?: GenerationSpec;
    height?: number | string;
    src: string;
    width?: number | string;
}
export interface DynamicElement extends BaseElement {
    type: ElementType.dynamic;
    url?: string;
    contentType?: string;
    ext?: string;
    content?: string | object | null;
    embedPage?: boolean; // iframe to show differnt project
    embedProjectSchema?: UIProject; // for projects to preview
}
export interface InputElement {
    accept?: string;
    currency?: string | Binding;
    inputType: InputType;
    label?: Binding;
    max?: number;
    maxFractionDigits?: number;
    maxSize?: number;
    disabled?: boolean;
    min?: number;
    rows?: number; // for textarea
    minFractionDigits?: number;
    multiple?: boolean;
    name: string;
    onChange?: EventHandler;
    onCreate?: EventHandler;
    options?: { value: string; label: Binding }[];
    placeholder?: Binding;
    uploadUrl?: string;
    step?: number;
    validation?: {
        errorMessage?: Binding;
        max?: number;
        min?: number;
        regex?: string;
        regexErrorMessage?: Binding;
        required?: boolean;
    };
    value?: Binding;
    id: string;
    accessibility?: AccessibilityProps;
    children?: UIElement[];
    dataSourceId?: string;
    onEvent?: Record<string, EventHandler>;
    styles?: StyleProps;
    type: ElementType;
    visibility?: VisibilityControl;
    zIndex?: number;
}

export interface MapElement extends BaseElement {
    type: ElementType.map;
    center: [number, number];
    controls?: {
        fullscreen?: boolean;
        geolocate?: boolean;
        scale?: boolean;
        streetView?: boolean;
        zoom?: boolean;
    };
    dataSourceId?: string;
    google?: { apiKey?: string | Binding; mapId?: string };
    heatmap?: Array<[number, number, number?]>;
    height?: number;
    id: string;
    mapbox?: { accessToken?: string; styleId?: string };
    markerCluster?: boolean;
    markers?: Array<{ id?: string | number; lat: number; lng: number; popup?: string; iconUrl?: string }>;
    provider?: 'google' | 'mapbox' | 'osm';
    routes?: Array<{ id?: string | number; coords: Array<[number, number]> }>;
    tile?: 'osm' | 'mapbox';
    zoom?: number;
}
export interface ListElement extends BaseElement {
    type: ElementType.list;
    ordered?: boolean;
    items: UIElement[];
    virtualHeight?: number;
    orientation?: 'horizontal' | 'vertical';
    itemHeight?: number;
    showDividers?: boolean;
    density?: "comfortable" | "compact";
    virtualizeAfter?: number;//60
}

export interface LottieElement extends BaseElement {
    type: ElementType.lottie;
    src: Binding;                           // URL or inline JSON via binding

    // Playback controls
    autoplay?: boolean;
    loop?: boolean;                         // legacy boolean loop
    loopCount?: Binding<number>;            // finite count
    speed?: number;
    direction?: 1 | -1;
    isPlaying?: Binding<boolean>;
    progress?: Binding<number>;             // 0..1
    controlBinding?: Binding<{ cmd: string; args?: any; nonce?: any }>;

    // Segments & markers
    segments?: Binding<[number, number] | Array<[number, number]>>;
    markerStart?: Binding<string>;
    markerEnd?: Binding<string>;

    // Behavior
    playOnVisible?: boolean;
    pauseWhenHidden?: boolean;
    playOnHover?: boolean;
    pauseOnHover?: boolean;
    forceAutoplayEvenIfReducedMotion?: boolean;

    // Renderer / accessibility
    renderer?: "svg" | "canvas" | "html";
    rendererSettings?: Binding<AnyObj>;
    ariaLabel?: Binding<string>;
    title?: Binding<string>;

    // Events
    onComplete?: EventHandler;
    onLoop?: EventHandler;
    onEnterFrame?: EventHandler;    // payload: { id, frame, totalFrames }
    onSegmentStart?: EventHandler;
    onClick?: EventHandler;
    onHoverStart?: EventHandler;
    onHoverEnd?: EventHandler;
    onEnterViewport?: EventHandler;
    onLeaveViewport?: EventHandler;
    onDataReady?: EventHandler;
    onDomLoaded?: EventHandler;
    onConfigReady?: EventHandler;
    onError?: EventHandler;
}
export interface SkeletonElement extends BaseElement {
    type: ElementType.skeleton;
    lines?: number;                   // how many lines (for text)
    circular?: boolean;               // avatar-style
    width?: number | string;
    height?: number | string;
    animation?: "pulse" | "wave" | "none";
    radius?: number | string;         // border radius
}

export interface MenuElement extends BaseElement {
    type: ElementType.menu;
    items: MenuItem[];
    label?: Binding;
    menus?: Array<{
        id: string;
        items: MenuItem[];
        label: Binding;
    }>;
    activeStyle?: StyleProps;
    inactiveStyle?: StyleProps;
    trigger?: UIElement;
    variant: 'dropdown' | 'context' | 'menubar' | 'navigation';
}

export type MenuItem =
    | {
        id: string;
        type: 'item';
        href?: string;
        icon?: string;
        label: Binding;
        onSelect?: EventHandler;
        shortcut?: string;
        variant?: 'default' | 'destructive';
    }
    | {
        id: string;
        type: 'checkbox';
        checked?: Binding;
        label: Binding;
        onSelect?: EventHandler;
    }
    | {
        id: string;
        type: 'radio';
        label: Binding;
        onSelect?: EventHandler;
        value: string;
    }
    | {
        id: string;
        type: 'label';
        label: Binding;
    }
    | {
        id: string;
        type: 'separator';
    }
    | {
        id: string;
        type: 'sub';
        icon?: string;
        items: MenuItem[];
        label: Binding;
    };

export interface ModalElement extends BaseElement {
    type: ElementType.modal;
    closeButton?: ButtonElement;
    content: UIElement[];
    description: Binding;
    isOpen: boolean | Binding;
    onClose: EventHandler;
    title: Binding;
}

export interface PaginationElement extends BaseElement {
    type: ElementType.pagination;
    currentPage?: number | Binding;
    onNext?: EventHandler;
    onPageChange?: EventHandler;
    onPrevious?: EventHandler;
    pages: Array<{ number: number; active: boolean }>;
    showEllipsis?: boolean;
    totalPages?: number | Binding;
}

export interface PaymentElement extends BaseElement {
    type: ElementType.payment;
    buttonLabel?: Binding;
    cancelParam?: string;
    checkoutUrl?: Binding;
    mode?: 'payment' | 'subscription';
    onCancel?: EventHandler;
    onError?: EventHandler;
    onReturn?: EventHandler;
    onSuccess?: EventHandler;
    publicKey?: Binding;
    sessionId?: Binding;
    successParam?: string;
    zIndex?: number;
}

export interface PopoverElement extends BaseElement {
    type: ElementType.popover;
    align?: 'start' | 'center' | 'end';
    content: UIElement[];
    open?: boolean | Binding;
    onOpenChange?: EventHandler;
    side?: 'top' | 'bottom' | 'left' | 'right';
    trigger: UIElement;
}

export interface ProgressElement extends BaseElement {
    type: ElementType.progress;
    indeterminate?: boolean | Binding;
    label?: Binding;
    labelPosition?: 'inside' | 'outside' | 'none';
    srOnlyLabel?: boolean | Binding;
}

export interface QRReaderElement extends BaseElement {
    type: ElementType.qr_reader;
    mode?: 'generate' | 'scan';
    onScan?: EventHandler;
    size?: number;
    value: Binding;
}

export interface RadioGroupElement extends BaseElement {
    type: ElementType.radio_group;
    disabled?: boolean;
    onChange?: EventHandler;
    options: Array<{ value: string; label: Binding; disabled?: boolean }>;
    orientation?: 'horizontal' | 'vertical';
    value: Binding;
}
export interface RatingElement extends BaseElement {
    type: ElementType.rating;
    max?: number;
    readonly?: boolean;
    allowHalf?: boolean;
    precision?: number; // e.g., 0.5
    iconSet?: "star" | "heart" | "emoji" | "custom";
    icons?: string[]; // if custom/emoji (array of Lucide names, emoji, or URLs)
    labelsDataSourceId?: string; // optional datasource for tooltips ("Poor", "Excellent", etc.)
    onChange?: EventHandler;
}


export interface ResizableElement extends BaseElement {
    type: ElementType.resizable;
    direction: 'horizontal' | 'vertical';
    panels: Array<{
        id: string;
        collapsible?: boolean;
        content: UIElement[];
        defaultSize?: number;
        maxSize?: number;
        minSize?: number;
    }>;
    withHandle?: boolean;
}

export interface ScrollAreaElement extends BaseElement {
    type: ElementType.scroll_area;
    children?: UIElement[];
    orientation?: 'vertical' | 'horizontal' | 'both';
    scrollHide?: boolean;
    size?: 'sm' | 'md' | 'lg';
}
export interface SearchElement extends BaseElement {
    type: ElementType.search;

    // Bindings
    placeholder?: Binding;
    value?: Binding;

    // Behavior
    debounceMs?: number;              // debounce delay for onSearch
    minLength?: number;               // min chars before firing search
    autoFocus?: boolean;
    disabled?: boolean;

    // Features
    showClear?: boolean;
    showIcon?: boolean;
    allowVoice?: boolean;
    voiceLang?: string;

    // Suggestions (local & AI/remote)
    suggestionsDataSourceId?: string; // static or preloaded suggestions
    historyDataSourceId?: string;     // optional history store
    maxSuggestions?: number;
    allowHistory?: boolean;
    aiSuggestionsApi?: string;        // endpoint for autocomplete
    aiSuggestionsMethod?: "GET" | "POST";
    aiSuggestionsParam?: string;      // key for query param or body
    aiSuggestionsHeaders?: Record<string, string>; // auth, etc.

    // Styling
    variant?: "default" | "outlined" | "filled" | "underline";
    size?: "sm" | "md" | "lg";

    // Events
    onSearch: EventHandler;
    onClear?: EventHandler;
    onVoiceStart?: EventHandler;
    onVoiceEnd?: EventHandler;
    onSelectSuggestion?: EventHandler;
}


export interface SheetElement extends BaseElement {
    type: ElementType.sheet;
    content: UIElement[];
    description?: Binding;
    direction?: 'left' | 'right' | 'top' | 'bottom';
    footer?: UIElement[];
    isOpen?: boolean | Binding;
    onOpenChange?: EventHandler;
    showCloseButton?: boolean;
    shortcuts?: Array<{ key: string; action: 'close' | 'toggle' }>;
    title?: Binding;
    trigger?: UIElement;
}

export interface SidebarElement extends BaseElement {
    type: ElementType.sidebar;
    footer?: UIElement & {
        requiresAuth?: boolean;
    };
    groups: Array<{
        id: string;
        items: Array<UIElement & {
            requiresAuth?: boolean;
        }>;
        label: Binding;
        className?: string;
        headerClassName?: string;
        collapseContainerClassName?: string;
    }>;
    search?: SearchElement
    header?: UIElement & {
        requiresAuth?: boolean;
    };
}
export interface SignaturePadElement extends BaseElement {
    type: ElementType.signature_pad;

    // Export settings
    exportType?: "png" | "jpeg" | "svg";
    exportQuality?: number;

    // Drawing
    strokeColor?: string;
    backgroundColor?: string;
    minWidth?: number;
    maxWidth?: number;
    velocityFilterWeight?: number;
    readOnly?: boolean;

    // Multi-user signing
    multiSignatures?: boolean;
    participantsDataSourceId?: string;
    initialParticipantId?: string;

    // Persistence
    signatureDataSourceId?: string;
    resumeFromSaved?: boolean;

    // UI toggles
    clearButton?: boolean;
    undoButton?: boolean;
    saveButton?: boolean;
    preview?: boolean;
    exportButton?: boolean;          // 🆕 Show export bulk button

    // Autosave
    autosave?: boolean;
    autosaveDebounceMs?: number;

    // Events
    onChange?: EventHandler;
    onClear?: EventHandler;
    onUndo?: EventHandler;
    onSave?: EventHandler;
    onExport?: EventHandler;          // 🆕 Event when bulk export triggered
    onParticipantChange?: EventHandler;
}


export interface Step {
    id: string;
    content?: UIElement[];
    onComplete?: EventHandler;
    onNext?: EventHandler;
    onPrev?: EventHandler;
    shouldShow?: Binding;
    title: Binding;
    validate?: boolean;
    validateAction?: EventHandler;
}

export interface StepWizardElement extends BaseElement {
    type: ElementType.step_wizard;
    current?: number;
    id: string;
    steps: Step[];
    submit: ButtonElement;
    actions?: Array<ButtonElement>;
    zIndex?: number;
}

export interface TableElement extends BaseElement {
    type: ElementType.table;
    crudActions?: EventHandler[];
    headers: Binding[];
    pagination?: boolean;
    rows: Binding | { cells: Binding[] }[];
    sortable?: boolean;
}

export interface TabsElement extends BaseElement {
    type: ElementType.tabs;
    activeTab: string;
    onChange?: EventHandler;
    tabListStyle?: StyleProps;
    tabTriggerStyle?: StyleProps;
    activeTabStyle?: StyleProps;
    tabContentStyle?: StyleProps;
    tabs: { id: string; label: string; icon?: string; content: UIElement[] }[];
}

export interface TextElement extends BaseElement {
    type: ElementType.text;
    alignment: Alignment;
    content: Binding;
    contentFormat?: 'markdown' | 'html' | 'rich' | 'plain';
    fontWeight?: string;
    tag: string;
}

export interface ThreeDModelElement extends BaseElement {
    type: ElementType.three_d_model;
    autoplay?: boolean;
    environment?: {
        ground?: boolean;
        groundColor?: string;
        sky?: Binding;
    };
    hud?: {
        call?: CallElement;
        voice?: VoiceElement;
    };

    inSceneVideo?: {
        enabled: boolean;
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
        size?: [number, number];
        transparent?: boolean;
        videoId?: string;
    };
    loop?: boolean;
    streaming?: 'hls' | 'dash';
    stereo?: boolean;
    multiPeerSpawn?: {
        enabled: boolean;
        layout?: "circle" | "grid" | "spiral";
        shape?: "plane" | "sphere" | "avatar";  // NEW: avatar option
        size?: [number, number];                // for plane
        radius?: number;                        // for sphere
        transparent?: boolean;
        distance?: number;                      // spacing from center
        height?: number;                        // base Y position
        gridCols?: number;                      // for grid layout
        spiralStep?: number;                    // vertical step for spiral
        avatarModel?: string;                   // GLTF avatar model path
        faceAttachment?: [number, number, number]; // offset for video-textured face
    };

    mode?: '3d' | 'vr' | 'ar' | '360_video' | 'ar_marker';
    portals?: {
        color: string;
        onEvent?: EventHandler;
        opacity: number;
        position: [number, number, number];
    }[];
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    src?: Binding;
}
export interface TimelineElement extends BaseElement {
    type: ElementType.timeline;
    // Prefer dataSourceId on BaseElement for remote items. If provided,
    // state[dataSourceId] should resolve to an array of raw items.
    items?: {
        id: string;
        title: Binding;
        description?: Binding;
        timestamp?: Binding;        // ISO date/time or any parseable date
        icon?: string;              // lucide name or custom class
        color?: string;             // dot/line color
        badge?: Binding;            // small label
        meta?: Binding;             // right-side small text
        disabled?: Binding | boolean;
        onClick?: EventHandler;
    }[];
    orientation?: "horizontal" | "vertical";
    align?: "left" | "right" | "alternate" | "center";
    compact?: boolean;            // dense spacing
    showTimeAxis?: boolean;       // show axis for vertical
    showNowMarker?: boolean;      // "Now" pin on the axis
    groupBy?: "day" | "month" | "year" | "none";
    sort?: "asc" | "desc";        // by timestamp
    // Loading & empty states
    loading?: boolean | Binding;
    emptyText?: Binding;
    // Pagination / more
    hasMore?: Binding | boolean;
    onLoadMore?: EventHandler;    // load next page from DS
    // Item events (fallback if per-item onClick omitted)
    onItemClick?: EventHandler;
}
// === Extended Tree schema (suggested) ===
export interface TreeElement extends BaseElement {
    type: ElementType.tree;
    /** Root nodes (ignored if dataSourceId provided; those come from state[dataSourceId]) */
    nodes?: TreeNodeElement[];
    /** If provided, root nodes are read from state[dataSourceId] (schema or data layer populates). */
    dataSourceId?: string;
    colorizeFiles?: boolean;
    mapping?: {
        id?: string;
        label?: string;
        description?: string;
        badge?: string;
        icon?: string;
        children?: string;
    };

    /* Behavior */
    selectable?: boolean;            // default false
    multiple?: boolean;              // default false (single select)
    checkStrictly?: boolean;         // default false (if false, parent reflects child selection tri-state)
    disableToggleOnLabel?: boolean;  // default false (clicking label selects; caret toggles expand)

    /* UX / Features */
    searchable?: boolean;            // default false (renders search input)
    searchPlaceholder?: Binding;
    showBadges?: boolean;            // display badge if node.badge provided
    showDescriptions?: boolean;      // display description if provided
    draggable?: boolean;             // enable HTML5 DnD reordering (siblings only)
    emptyLabel?: Binding;            // shown when no items / empty filter
    loadingLabel?: Binding;          // shown while lazy children loading

    /* Event hooks (schema-driven) */
    onNodeSelect?: EventHandler;     // after selection toggled (payload: { id, selected })
    onNodeExpand?: EventHandler;     // after expand/collapse (payload: { id, expanded })
    onLoadChildren?: EventHandler;   // for lazy nodes; schema should callback(children)
    onContextMenu?: EventHandler;    // right click (payload: { id })
    onReorder?: EventHandler;        // after DnD sibling reordering (payload: { parentId, fromIndex, toIndex })
}

export interface TreeNodeElement extends BaseElement {
    type: ElementType.tree;     // (not required to render, but helps the schema)
    id: string;
    label: Binding;
    description?: Binding;
    icon?: string;                   // "folder" | "file" | custom key (see resolveIcon)
    color?: string;                  // tailwind color token or hex
    badge?: Binding | number;        // small count/label
    /** If true, do not load children until first expand. */
    lazy?: boolean;
    /** Mark initial expansion state. */
    expanded?: boolean;
    /** Disable selection for this node only. */
    disabled?: boolean;

    /** children: resolved in-place OR loaded via onLoadChildren or external dataSource */
    children?: TreeNodeElement[];

    /* Node-level event hooks */
    onSelect?: EventHandler;
    onExpand?: EventHandler;
    onContextMenu?: EventHandler;
    onAction?: EventHandler;         // for action buttons e.g. kebab menu (payload: { id, actionId })
    actions?: { id: string; label: Binding; icon?: string }[];
}


export interface ToggleElement extends BaseElement {
    type: ElementType.toggle;
    icon?: string;
    label?: Binding;
    onToggle?: EventHandler;
    pressed?: Binding | boolean;
    size?: 'default' | 'sm' | 'lg';
    variant?: 'default' | 'outline';
}

export interface ToggleGroupElement extends BaseElement {
    type: ElementType.toggle_group;
    multiple?: boolean;
    onChange?: EventHandler;
    options: ToggleElement[];
}

export interface TooltipElement extends BaseElement {
    type: ElementType.tooltip;
    content: Binding;
    delayDuration?: number;
    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
    trigger: UIElement;
}

export interface VideoElement extends BaseElement {
    type: ElementType.video;
    ads?: {
        midRoll?: Array<{ time: number; src: Binding }>;
        postRoll?: Binding[];
        preRoll?: Binding[];
        skippableAfter?: number;
    };
    analytics?: boolean;
    is360?: boolean;
    stereo?: boolean;
    autoPlay?: boolean;
    caching?: boolean;
    captions?: Array<{
        default?: boolean;
        label: string;
        src: Binding;
        srclang: string;
    }>;
    chapters?: Array<{ start: number; title: string }>;
    controls?: boolean;
    description?: Binding;
    generation?: GenerationSpec;
    height?: number | string;
    hotkeys?: boolean;
    loop?: boolean;
    onNextEpisode?: EventHandler;
    pictureInPicture?: boolean;
    qualitySelector?: boolean;
    resumePosition?: boolean;
    showCaptions?: boolean;
    showFullscreen?: boolean;
    showMiniPlayer?: boolean;
    showNextEpisode?: boolean;
    showPlaybackRate?: boolean;
    showSkipIntro?: boolean;
    showThumbnails?: boolean;
    src: Binding;
    streaming?: 'hls' | 'dash';
    thumbnails?: {
        height: number;
        interval: number;
        sheetWidth?: number;
        spriteUrl: string;
        width: number;
    };
    tracking?: {
        dataSourceId?: string;
        events?: Array<
            | 'play'
            | 'pause'
            | 'seeked'
            | 'ended'
            | 'error'
            | 'ratechange'
            | 'fullscreen'
            | 'pip'
            | 'volumechange'
            | 'ad_impression'
            | 'ad_quartile'
            | 'ad_complete'
            | 'ad_skip'
        >;
        heartbeatInterval?: number;
    };
    width?: number | string;
}

export interface VoiceElement extends BaseElement {
    type: ElementType.voice;
    apiMode?: 'browser' | 'azure';
    mode: 'output' | 'input';
    avatar?: {
        character: string;
        enabled: boolean;
        region: string;
        style?: string;
        subscriptionKey: Binding;
        transparentBackground?: boolean;
        voice?: string;
    };
    language: string;
    onAIResponse?: EventHandler;
    onRecognize?: EventHandler;
    onSpeak?: EventHandler;
    onTranslate?: EventHandler;
    outputText?: Binding;
    targetLanguage?: string;
    voiceModel?: string;
}

export interface WalletElement extends BaseElement {
    type: ElementType.wallet;
    chainId: number;
    contracts?: {
        abi: string[];
        address: string | Binding;
        events?: {
            name: string;
            onEvent: EventHandler;
        }[];
        functions: {
            inputs?: Array<{ name: string; placeholder?: string; type: string }>;
            label?: string;
            name: string;
            onResult?: EventHandler;
            type: 'view' | 'write';
        }[];
    }[];
    mode?: 'full' | 'button';
    onConnect?: EventHandler;
    onDisconnect?: EventHandler;
    onError?: EventHandler;
    projectId?: string;
    provider: 'metamask' | 'walletconnect';
}

export type UIElement =
    | AccordionElement
    | AlertElement
    | AlertDialogElement
    | AudioElement
    | AvatarElement
    | BadgeElement
    | BreadcrumbElement
    | ButtonElement
    | CalendarElement
    | CalendarEventElement
    | CallElement
    | CardElement
    | CarouselElement
    | ChartElement
    | ChatElement
    | CollapsibleElement
    | CommandElement
    | ComposerElement
    | CommentsElement
    | ContainerElement
    | ContextMenuElement
    | CustomElement
    | DataGridElement
    | DrawerElement
    | DropdownElement
    | DynamicElement
    | EditorElement
    | FileUploadElement
    | FooterElement
    | FormElement
    | HeaderElement
    | IconElement
    | ImageElement
    | ListElement
    | LottieElement
    | MapElement
    | MenuElement
    | ModalElement
    | PaginationElement
    | PaymentElement
    | PopoverElement
    | ProgressElement
    | QRReaderElement
    | RadioGroupElement
    | RatingElement
    | ResizableElement
    | ScrollAreaElement
    | SearchElement
    | SheetElement
    | SidebarElement
    | ShareElement
    | SignaturePadElement
    | SkeletonElement
    | StepWizardElement
    | TableElement
    | TabsElement
    | TextElement
    | ThreeDModelElement
    | TimelineElement
    | ToggleElement
    | ToggleGroupElement
    | TooltipElement
    | TreeElement
    | VideoElement
    | VoiceElement
    | WalletElement;


export interface AuthGlobalConfig {
    audience?: string;
    cookieName?: string;
    loginHref?: string;
    logoutHref?: string;
    oidc?: OIDCConfig;
    postLoginHref?: string;
    providers?: OAuthProviderConfig[];
    saml?: SAMLConfig;
    strategy?: 'oauth' | 'oidc' | 'saml' | 'jwt' | 'custom';
    tenant?: string;
    tokenStorage?: 'cookie' | 'memory' | 'localStorage';
}

export interface BackgroundSpec {
    generation?: GenerationSpec;
    overlayClass?: string;
    type?: 'image' | 'video' | 'color' | 'gradient';
    value?: string | Binding;
}

export interface GenerationSpec {
    aiModel?: string;
    aspect?: string;
    captions?: boolean;
    durationSeconds?: number;
    maxChunkSeconds?: number;
    priority?: number;
    prompt?: string;
    segments?: SegmentSpec[];
    style?: string;
}

export interface MapsGlobalConfig {
    defaultProvider?: 'google' | 'mapbox' | 'osm';
    googleApiKey?: string | Binding;
    mapId?: string;
    mapboxToken?: string | Binding;
    styleId?: string;
}

export interface OAuthProviderConfig {
    authUrl?: string;
    clientId?: string | Binding;
    extraParams?: Record<string, string>;
    id: 'google' | 'microsoft' | 'github' | 'okta' | 'custom';
    pkce?: boolean;
    redirectUri?: string;
    scopes?: string[];
    tokenUrl?: string;
}

export interface OIDCConfig {
    clientId?: string | Binding;
    discoveryUrl?: string;
    loginUrl?: string;
    issuer: string;
    tokenUrl?: string;
    redirectUri?: string;
    scopes?: string[];
}

export interface SAMLConfig {
    idpMetadataUrl: string;
    spAcsUrl?: string;
}

export interface SegmentSpec {
    continuation?: boolean;
    durationSeconds: number;
    index: number;
    prompt?: string;
}

export interface SeriesSpec {
    color?: string;
    dot?: boolean | object;
    key: string;
    label?: string;
    opacity?: number;
    stackId?: string;
    strokeWidth?: number;
    type?: 'bar' | 'line' | 'area' | 'scatter' | 'radar';
    yAxisId?: string;
}

export interface StyleProps {
    background?: BackgroundSpec | null;
    className: string;
    responsiveClasses?: Record<string, string>;
}

export interface DataMapping {
    crudOperation?: ActionType;
    outputKey: string;
    sourceIds: string[];
    transform?: string;
}

export interface DataSource {
    auth?: { type: 'basic' | 'bearer' | 'api_key'; value: string };
    baseUrl?: string;
    body?: Record<string, any>;
    credentials?: 'include' | 'omit' | 'same-origin';
    errorKey?: string;
    graphql_operation?: 'query' | 'mutation' | 'subscription';
    headers?: Record<string, string>;
    heartbeat?: { interval: number; message: string };
    id: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WEBSOCKET' | 'GRAPHQL';
    path?: string;
    trigger?: 'init' | 'action' | 'interval' | 'manual';
    pollingInterval?: number;
    protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
    query?: string;
    queryParams?: Record<string, string>;
    refId?: string;
    retry?: { attempts: number; delay: number; strategy?: 'exponential' | 'linear' | 'jitter' };
}

export interface EndpointEnvironments {
    default: string;
    values: Record<string, {
        baseUrl?: string;
        headers?: Record<string, string>;
    }>;
}
export interface NavigationMenu extends BaseElement {
    type: ElementType.navigation_menu;
    id: string;

    /** Where it renders */
    placement: 'top' | 'side' | 'bottom' | 'drawer';

    /** Mobile behavior */
    mobile?: {
        trigger?: 'burger' | 'none';
        sheetDirection?: 'left' | 'right' | 'top' | 'bottom';
    };
    headerClassName?: string;
    searchInputClassName?: string;
    navClassName?: string;
    footerClassName?: string;
    triggerClassName?: string;
    sheetClassName?: string;
    closeButtonClassName?: string;
    header?: UIElement[];
    footer?: UIElement[];
    showSearch?: boolean | { placeholder?: Binding; dataSourceId?: string };
    searchClassName?: string;
    items: NavigationItem[];
    visibility?: VisibilityControl;
}
export interface NavigationSubmenu {
    type: 'submenu';
    id: string;
    label: Binding;
    trigger?: 'hover' | 'click';
    placement?: 'right' | 'left' | 'bottom';  // where submenu opens
    className?: string;

    items: NavigationItem[];  // recursive!
    visibility?: VisibilityControl;
}

export type NavigationItem =
    | NavigationLink
    | NavigationGroup
    | NavigationDivider
    | NavigationCustom
    | NavigationSubmenu;

export interface NavigationLink {
    type: 'link';
    id: string;
    label: Binding;
    href: string;
    icon?: IconElement;
    badge?: BadgeElement;
    requiresAuth?: boolean;
    className?: string;
    target?: '_self' | '_blank' | '_parent' | '_top';
    visibility?: VisibilityControl;
    onClick?: EventHandler;
}

export interface NavigationGroup {
    type: 'group';
    id: string;
    label: Binding;
    className?: string;
    childrenClassName?: string;
    icon?: IconElement;
    defaultCollapsed?: boolean;
    items: NavigationItem[];
}

export interface NavigationDivider { type: 'divider'; className?: string; }
export interface NavigationCustom { type: 'custom'; element: UIElement; }
export interface GuardRule {
    conditions?: ConditionExpr[];
    dataSourceId?: string;
    mode?: 'all' | 'any';
    onFail: RedirectSpec;
    requireAuth?: boolean;
    requireConsents?: string[];
    requireOrganization?: boolean;
    requireOtp?: boolean;
}

export interface IRoute {
    href: string;
    screenId: string;
    screenVersion?: string;
    requiresAuth?: boolean;
    guard?: GuardRule;
    screenConfigUrl?: string;
    metadata: {
        title?: string;
        description?: string;
        keywords?: string[];
        dateModified?: string;
        datePublished?: string;

        openGraph?: {
            description?: string;
            siteName?: string;
            title?: string;
            url?: string;
        };
        twitter?: {
            card?: string;
            description?: string;
            title?: string;
        };
        formatDetection?: {
            address?: boolean;
            date?: boolean;
            email?: boolean;
            telephone?: boolean;
            url?: boolean;
        };
    };
}
export interface IRouteList {
    routes: IRoute[];
    basePath?: string;
}

export interface RedirectSpec {
    href?: string;
    reasonKey?: Binding;
    screenId?: string;
}

export interface TransitionSpec {
    href?: string;
    modal?: {
        closeId?: string;
        openId?: string;
    };
    replace?: boolean;
    screenId?: string;
    statePatches?: Array<{ key: string; value: any | Binding }>;
}
export interface ConditionExpr {
    key?: Binding;
    op?: ConditionOp;
    value?: any;

    conditions?: ConditionExpr[];
    logic?: 'and' | 'or';
}

export interface VisibilityControl {
    condition: ConditionExpr;
    show: boolean;
}

export interface EventHandler {
    action: ActionType;
    aiPrompt?: string;
    dataSourceId?: string;
    canRun?: VisibilityControl;
    errorAction?: EventHandler;
    params?: ActionParams
    streamHandler?: {
        /** Callback event name used by WebSocket/SSE messages */
        eventKey?: string;
        /** JSONPath or regex to extract token from message */
        tokenPath?: string;
    };
    errorTransition?: TransitionSpec;
    exportConfig?: ExportConfig;
    responseType?: 'ui' | 'data' | 'none' | 'voice' | 'call';
    successTransition?: TransitionSpec;
    beforeActions?: EventHandler[];      // actions to run before main action
    successActions?: EventHandler[];     // actions if main succeeds
    errorActions?: EventHandler[];       // actions if main fails
    finallyActions?: EventHandler[];     // always runs
}

export interface IScreen {
    elements: UIElement[];
    id: string;
    layoutType: LayoutType;
    lifecycle?: {
        onEnter?: EventHandler[];
        onLeave?: EventHandler[];
    };
    name: Binding;
    styles?: StyleProps;
    transition?: { type: string; direction?: string; duration: number };
    version: string;
}
export interface UIDefinition {
    id: string;
    initialData?: Record<string, any>;
    guard?: GuardRule;
    screens: Array<IScreen>;
    href: string;
    route: string;
    dataMappings?: DataMapping[];
    dataSources?: DataSource[];
    metadata: Record<string, string | number | boolean | Record<string, any>>;
    state?: {
        data?: Array<{
            dataSourceId?: string;
            value?: Binding;
            path?: Binding
            dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
            defaultValue: any;
            validation?: {
                max?: number;
                maxLength?: number;
                min?: number;
                minLength?: number;
                regex?: string;
                required?: boolean;
            };
        }>;
        persist?: boolean;
        persistStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
        webSocketEndpoint?: {
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
            protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
            url: string | Binding;
        };
        webSocketKeys?: string[];
    };
    translations: Record<string, Record<string, string>>;
    version: string;
}

export interface ExportConfig {
    format: 'pdf' | 'ppt' | 'word' | 'json';
    includeNotes?: boolean;
    resolution?: string;
    template?: string;
}

// === Project Configuration Types ===
export interface AccessibilityConfig {
    focusRingAlways?: boolean;
    highContrast?: boolean;
    keyboardOnlyMode?: boolean;
    reducedMotion?: boolean;
}

export interface Brand {
    faviconUrl?: string;
    href: string;
    logoUrl?: string;
    name?: string;
    slogan?: string;
    socialMedia?: SocialMediaLinks;
}

export interface I18nConfig {
    defaultLocale?: string;
    formats?: {
        currency?: { style?: 'symbol' | 'code' | 'name' };
        date?: string;
        number?: { grouping?: boolean; maxFrac?: number; minFrac?: number };
        time?: string;
    };
    rtlLocales?: string[];
    supportedLocales?: string[];
}

export interface SecurityConfig {
    csrfHeaderName?: string;
    maskKeys?: string[];
    nonceKey?: string;
}

export interface SocialMediaLinks {
    discord?: string;
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    medium?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
    youtube?: string;
    [platform: string]: string | undefined;
}


export interface UIProject {
    brand: Brand;
    footer?: FooterElement;
    search?: {
        enabled?: boolean;
        path?: string;
    };
    globalConfig?: {
        projectId?: string;
        accessibilityConfig?: AccessibilityConfig;
        auth?: AuthGlobalConfig;
        endpoints?: {
            dataMappings?: DataMapping[];
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: string };
            defaultHeaders?: Record<string, string>;
            environments?: EndpointEnvironments;
            registry?: DataSource[];
        };
        maps?: MapsGlobalConfig;

        metadata?: {
            appLinks?: {
                android?: { app_name?: string; class?: string; package: string; url: string };
                ios?: { app_name?: string; app_store_id?: string; url: string };
                ipad?: { app_name?: string; app_store_id?: string; url: string };
                iphone?: { app_name?: string; app_store_id?: string; url: string };
                web?: { should_fallback?: boolean; url: string };
                windows?: { app_id: string; app_name?: string; url: string };
                windows_phone?: { app_id: string; app_name?: string; url: string };
                windows_universal?: { app_id: string; app_name: string; url: string };
            };
            bookmarks?: string | string[];
            category?: string;
            classification?: string;
            facebook?: { appId: string; admins?: never };
            itunes?: { appId: string; appArgument?: string };
            language?: string;
            license?: string;
            pinterest?: { richPin: string | boolean };
            schemaType?: string;
            twitter?: { site?: string };
            verification?: {
                google?: string | number | (string | number)[];
                me?: string | number | (string | number)[];
                other?: Record<string, string | number | (string | number)[]>;
                yahoo?: string | number | (string | number)[];
                yandex?: string | number | (string | number)[];
            };
            viewport?: {
                colorScheme?:
                | 'normal'
                | 'light'
                | 'dark'
                | 'light dark'
                | 'dark light'
                | 'only light';
                height?: string | number;
                initialScale?: number;
                interactiveWidget?:
                | 'resizes-visual'
                | 'resizes-content'
                | 'overlays-content';
                maximumScale?: number;
                minimumScale?: number;
                themeColor?: string;
                userScalable?: string;
                viewportFit?: 'auto' | 'cover' | 'contain';
                width?: string | number;
            };
        };

        /** Payment / Integration URLs */
        paymentCheckoutAPIUrl?: string;
        paypalUrl?: string;
        walletConnectUrl?: string;

        /** Security & Localization */
        security?: SecurityConfig;
        translateConfig?: I18nConfig;

        /** Profile bootstrap after login */
        profile?: {
            dataSources?: {
                auth?: { type: 'basic' | 'bearer' | 'api_key'; value: string };
                apiUrl?: string;
                body?: Record<string, any>;
                credentials?: 'include' | 'omit' | 'same-origin';
                graphql_operation?: 'query' | 'mutation' | 'subscription';
                headers?: Record<string, string>;
                method?: 'GET' | 'POST' | 'WEBSOCKET' | 'GRAPHQL';
                protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
            };
        };
    };

    /* ------------------------------------------------------
     🎨 Global Styles / Theme
    ------------------------------------------------------ */
    globalStyles?: {
        customCss?: string;  // Injected CSS (inline or <style> tag)
        theme?: {
            colorScheme?: 'normal' | 'light' | 'dark' | 'light dark' | 'dark light' | 'only light';

            /** Typography */
            fontFamily?: string;
            fontSizeBase?: string;

            /** Core Colors */
            primaryColorLight?: string;
            primaryColorDark?: string;
            secondaryColorLight?: string;
            secondaryColorDark?: string;

            /** Extended Tokens */
            backgroundLight?: string;
            backgroundDark?: string;
            foregroundLight?: string;
            foregroundDark?: string;
            borderLight?: string;
            borderDark?: string;
            accentLight?: string;
            accentDark?: string;
        };
    };

    initialData?: Record<string, any>;
    routeBase?: string;
    routeList: IRouteList;
    navigation?: {
        primary?: NavigationMenu;     // main nav (usually top or side)
        mobileBottom?: NavigationMenu;
        secondary?: NavigationMenu;   // e.g. user menu
    };

    state?: {
        keys?: Record<
            string,
            {
                binding?: Binding;
                dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
                defaultValue: any;
                validation?: {
                    max?: number;
                    maxLength?: number;
                    min?: number;
                    minLength?: number;
                    regex?: string;
                    required?: boolean;
                };
            }
        >;
        persist?: boolean;
        persistStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
        webSocketEndpoint?: {
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
            protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
            url: string | Binding;
        };
        webSocketKeys?: string[];
    };

    /* ------------------------------------------------------
     📊 Telemetry & Observability
    ------------------------------------------------------ */
    telemetry?: {
        errorUrl?: string;
        ingestUrl?: string;
        sampleRate?: number;
    };

    /* ------------------------------------------------------
     🌐 i18n / Translations
    ------------------------------------------------------ */
    translations?: Record<string, Record<string, string>>;

    /* ------------------------------------------------------
     🍪 Cookie Consent Banner
    ------------------------------------------------------ */
    cookie_banner?: {
        id: string;
        name: string;
        styles?: StyleProps;
        position?: 'bottom' | 'top';
        persistKey?: string;
        description?: Binding;

        /** Buttons */
        acceptButton?: ButtonElement;
        manageButton?: ButtonElement;
        saveButton?: ButtonElement;

        /** Preferences modal */
        preferencesModal?: ModalElement;

        /** Option list */
        options?: Array<{
            id: string;
            label: Binding;
            description?: Binding;
            required?: boolean;
            defaultValue?: boolean;
        }>;
    };

    /* ------------------------------------------------------
        Internal Screens / Routes
    ------------------------------------------------------ */
    screens?: UIDefinition[];

    /** Project version */
    version: string;
}

export interface NavigationAPI {
    back?: () => void;
    push?: (href: string) => void;
    replace?: (href: string) => void;
    reload?: () => void;
    currentPath?: () => string;
}
