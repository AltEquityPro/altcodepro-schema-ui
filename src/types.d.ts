export type Binding = string | { binding: string } | null;

export type AnyObj = Record<string, any>;

export enum ActionType {
    api_call = 'api_call',
    websocket_call = 'websocket_call',
    graphql_query = 'graphql_query',
    graphql_subscription = 'graphql_subscription',
    graphql_mutation = 'graphql_mutation',
    open_modal = 'open_modal',
    close_modal = 'close_modal',
    update_state = 'update_state',
    run_script = 'run_script',
    crud_create = 'crud_create',
    crud_read = 'crud_read',
    crud_update = 'crud_update',
    crud_delete = 'crud_delete',
    voice_command = 'voice_command',
    initiate_call = 'initiate_call',
    export_pdf = 'export_pdf',
    export_ppt = 'export_ppt',
    export_word = 'export_word',
    export_json = 'export_json',
    wallet_connect = 'wallet_connect',
    wallet_sign = 'wallet_sign',
    audit_log = 'audit_log',
    ai_generate = 'ai_generate',
    navigation = 'navigation',
}
export enum ElementType {
    accordion = 'accordion',
    alert = 'alert',
    alert_dialog = 'alert_dialog',
    avatar = 'avatar',
    badge = 'badge',
    breadcrumb = 'breadcrumb',
    button = 'button',
    calendar = 'calendar',
    call = 'call',
    card = 'card',
    carousel = 'carousel',
    chart = 'chart',
    code = 'code',
    collapsible = 'collapsible',
    command = 'command',
    container = 'container',
    context_menu = 'context_menu',
    custom = 'custom',
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
    loader = 'loader',
    map = 'map',
    menu = 'menu',
    modal = 'modal',
    pagination = 'pagination',
    payment = 'payment',
    popover = 'popover',
    progress = 'progress',
    qr_code = 'qr_code',
    quiz = 'quiz',
    radio_group = 'radio_group',
    resizable = 'resizable',
    scroll_area = 'scroll_area',
    separator = 'separator',
    sheet = 'sheet',
    sidebar = 'sidebar',
    skeleton = 'skeleton',
    step_wizard = 'step_wizard',
    switch = 'switch',
    table = 'table',
    tabs = 'tabs',
    text = 'text',
    textarea = 'textarea',
    three_d_model = 'three_d_model',
    toggle = 'toggle',
    toggle_group = 'toggle_group',
    tooltip = 'tooltip',
    video = 'video',
    voice = 'voice',
    wallet = 'wallet',
    wallet_connect_button = 'wallet_connect_button',
}


export enum InputType {
    text = 'text',
    email = 'email',
    password = 'password',
    number = 'number',
    date = 'date',
    checkbox = 'checkbox',
    radio = 'radio',
    select = 'select',
    file = 'file',
    textarea = 'textarea',
    voice = 'voice',
    multiselect = 'multiselect',
    datetime_local = 'datetime-local',
    time = 'time',
    image = 'image',
    month = 'month',
    range = 'range',
    search = 'search',
    tel = 'tel',
    url = 'url',
    week = 'week',
    otp = 'otp',
    createselect = 'createselect',
    calendar = 'calendar',
    color = 'color',
    toggle = 'toggle',
    rating = 'rating',
    signature = 'signature',
    richtext = 'richtext',
    code = 'code',
    markdown = 'markdown',
    tags = 'tags',
    switch = 'switch',
    currency = 'currency',
    credit_card = 'credit_card',
}
export type ButtonVariant =
    | "default"
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";

export enum Alignment {
    left = 'left',
    center = 'center',
    right = 'right',
    justify = 'justify',
}

export enum LayoutType {
    SingleColumn = 'single_column',
    TwoColumns = 'two_columns',
    ThreeColumns = 'three_columns',
    FourColumns = 'four_columns',
    DataDashboard = 'data_dashboard',
    DataTableWithChart = 'data_table_with_chart',
    Datagrid = 'datagrid',
    Map = 'map',
    Cover = 'cover',
    Contact = 'contact',
    FAQ = 'faq',
    FeatureCarousel = 'feature_carousel',
    Gallery = 'gallery',
    StepWizard = 'step_wizard',
    Timeline = 'timeline',
    Custom = 'custom',
}

export enum FormGroupType {
    card = 'card',
    single = 'single',
    container = 'container',
    tabs = 'tabs',
    step_wizard = 'step_wizard',
}

export enum FieldType {
    input = 'input',
    heading = 'heading',
    subheading = 'subheading',
    description = 'description',
    help = 'help',
    divider = 'divider',
    image = 'image',
    video = 'video',
    icon = 'icon',
    chart = 'chart',
    alert = 'alert',
    card = 'card',
    modal = 'modal',
    drawer = 'drawer',
    dropdown_menu = 'dropdown_menu',
    loader = 'loader',
    custom = 'custom',
}

export type FormField =
    | {
        id: string;
        fieldType: FieldType.input;
        input: InputElement;
        label?: Binding;
        placeholder?: Binding;
        helpText?: Binding;
        tooltip?: Binding;
        hidden?: boolean | Binding;
    }
    | {
        id: string;
        fieldType:
        | FieldType.heading
        | FieldType.subheading
        | FieldType.description
        | FieldType.help
        | FieldType.divider
        | FieldType.image
        | FieldType.video
        | FieldType.icon
        | FieldType.chart
        | FieldType.alert
        | FieldType.card
        | FieldType.modal
        | FieldType.drawer
        | FieldType.dropdown_menu
        | FieldType.loader
        | FieldType.custom;
        element: UIElement;
    };

export interface SegmentSpec {
    index: number;
    prompt?: string;
    durationSeconds: number;
    continuation?: boolean;
}

export interface GenerationSpec {
    prompt?: string;
    aspect?: string;
    style?: string;
    priority?: number;
    durationSeconds?: number;
    captions?: boolean;
    aiModel?: string;
    maxChunkSeconds?: number;
    segments?: SegmentSpec[];
}

export interface BackgroundSpec {
    type?: 'image' | 'video' | 'color' | 'gradient';
    value?: string | Binding;
    overlayClass?: string;
    generation?: GenerationSpec;
}

export interface AnimationSpec {
    entrance?: string;
    exit?: string;
    duration?: number;
    delay?: number;
    repeat?: number | 'infinite';
    easing?: string;
    lottieUrl?: string;
    framework?: 'animate.css' | 'css' | 'framer-motion' | 'gsap';
}

export interface StyleProps {
    className: string;
    responsiveClasses?: Record<string, string>;
    customCss?: string;
    background?: BackgroundSpec | null;
    animation?: AnimationSpec;
}

export interface AccessibilityProps {
    ariaLabel?: Binding;
    ariaRole?: string;
    ariaHidden?: boolean;
    tabIndex?: number;
    screenReaderText?: Binding;
    focusable?: boolean;
    voiceSupport?: boolean;
}

export interface RedirectSpec {
    href?: string;
    screenId?: string;
    reasonKey?: Binding;
}

export interface VisibilityControl {
    condition: {
        key: Binding;
        operator: ConditionOp;
        value: any;
    };
    show: boolean;
}

export interface AuthGlobalConfig {
    strategy?: 'oauth' | 'oidc' | 'saml' | 'jwt' | 'custom';
    providers?: OAuthProviderConfig[];
    oidc?: OIDCConfig;
    saml?: SAMLConfig;
    loginHref?: string;
    postLoginHref?: string;
    logoutHref?: string;
    tokenStorage?: 'cookie' | 'memory' | 'localStorage';
    cookieName?: string;
    audience?: string;
    tenant?: string;
}

export interface MapsGlobalConfig {
    defaultProvider?: 'google' | 'mapbox' | 'osm';
    googleApiKey?: string | Binding;
    mapboxToken?: string | Binding;
    mapId?: string;
    styleId?: string;
}

export interface BaseElement {
    id: string;
    name: string;
    value?: Binding;
    type: ElementType;
    styles?: StyleProps;
    accessibility?: AccessibilityProps;
    zIndex?: number;
    animations?: AnimationSpec;
    visibility?: VisibilityControl;
    dataSourceId?: string;
    onEvent?: Record<string, EventHandler>;
    children?: UIElement[];
}

export interface TextElement extends BaseElement {
    type: ElementType.text;
    content: Binding;
    contentFormat?: 'markdown' | 'html' | 'rich' | 'plain';
    tag: string;
    alignment: Alignment;
    fontWeight?: string;
}

export interface ButtonElement extends BaseElement {
    type: ElementType.button;
    text: Binding;
    variant: ButtonVariant;
    size?: "default" | "sm" | "lg" | "icon"
    onClick?: EventHandler
    disabled?: boolean | Binding
    iconLeft?: IconElement
    iconRight?: IconElement
    asChild?: boolean
}
export interface BadgeElement extends BaseElement {
    type: ElementType.badge

    /** Main text/label binding */
    text?: Binding

    /** Optional value (e.g. for counts or dynamic binding) */
    value?: Binding

    /** Badge style variant */
    variant?: "default" | "secondary" | "destructive" | "outline"

    /** Render as child (useful when badge is wrapping a link/button) */
    asChild?: boolean

    /** Optional icon to render before/after text */
    iconLeft?: IconElement
    iconRight?: IconElement

    /** Optional click handler (badges can be interactive) */
    onClick?: EventHandler

    /** Optional tooltip text */
    tooltip?: Binding

    /** Optional max length (truncate text beyond this) */
    maxLength?: number

    /** Show a dot badge (no text, just a small circle) */
    isDot?: boolean

    /** Size variant (smaller or larger badges) */
    size?: "sm" | "md" | "lg"
}

export interface InputElement extends BaseElement {
    type: ElementType.input;
    inputType: InputType;
    placeholder?: Binding;
    label?: Binding;
    value?: Binding;
    name: string;
    min?: number;
    max?: number;
    step?: number;
    accept?: string;
    options?: Binding | { value: string; label: Binding }[];
    multiple?: boolean;

    /** Currency-only props — used when inputType === 'currency' */
    currency?: string | Binding;
    minFractionDigits?: number;
    maxFractionDigits?: number;

    validation?: {
        regex?: string;
        regexErrorMessage?: Binding;
        required?: boolean;
        errorMessage?: Binding;
        min?: number;
        max?: number;
    };
    onChange?: EventHandler;
    onCreate?: EventHandler; // for createselect
    maxSize?: number;
}

export interface ModalElement extends BaseElement {
    type: ElementType.modal;
    title: Binding;
    description: Binding;
    content: UIElement[];
    isOpen: boolean | Binding;
    onClose: EventHandler;
    closeButton?: ButtonElement;
}

export interface IconElement extends BaseElement {
    type: ElementType.icon;
    name: string;
    size: number;
    label?: Binding;
}

export interface ImageElement extends BaseElement {
    type: ElementType.image;
    src: string;
    alt: Binding;
    width?: number | string;
    height?: number | string;
    generation?: GenerationSpec;
}
export type ContextMenuItem =
    | { id: string; type: "item"; label: Binding; onSelect?: EventHandler; shortcut?: string; disabled?: boolean; variant?: "default" | "destructive"; icon?: string }
    | { id: string; type: "checkbox"; label: Binding; checked?: Binding; onSelect?: EventHandler; disabled?: boolean }
    | { id: string; type: "radio"; label: Binding; value: string; group: string; checked?: Binding; onSelect?: EventHandler }
    | { id: string; type: "label"; label: Binding; inset?: boolean }
    | { id: string; type: "separator" }
    | { id: string; type: "sub"; label: Binding; items: ContextMenuItem[]; icon?: string }

export interface ContextMenuElement extends BaseElement {
    type: ElementType.context_menu;
    trigger: UIElement;
    items: ContextMenuItem[]
}
export interface VideoElement extends BaseElement {
    type: ElementType.video;
    src: Binding;
    description?: Binding;
    width?: number | string;
    height?: number | string;
    autoPlay?: boolean;
    loop?: boolean;
    controls?: boolean; // native controls; custom controls overlay always available
    generation?: GenerationSpec;
    streaming?: "hls" | "dash"; // dash ignored (Shaka removed)

    // Navigation
    onNextEpisode?: EventHandler;

    // UX flags
    showSkipIntro?: boolean;
    showNextEpisode?: boolean;
    showThumbnails?: boolean;
    showPlaybackRate?: boolean;
    showFullscreen?: boolean;
    showMiniPlayer?: boolean; // Picture-in-Picture
    showCaptions?: boolean;
    analytics?: boolean; // enable analytics hooks
    caching?: boolean; // use preload=auto, allow SW caching
    resumePosition?: boolean; // persist last position in localStorage

    // Thumbnails sprite
    thumbnails?: {
        spriteUrl: string;
        width: number;
        height: number;
        interval: number; // seconds per thumb
        sheetWidth?: number; // px, default 1000 for grid calc
    };

    // Captions/subtitles
    captions?: Array<{
        src: Binding;
        srclang: string;
        label: string;
        default?: boolean;
    }>;

    // Ads
    ads?: {
        preRoll?: Binding[];
        midRoll?: Array<{ time: number; src: Binding }>;
        postRoll?: Binding[];
        skippableAfter?: number; // seconds until Skip Ad is shown
    };

    // Analytics / tracking
    tracking?: {
        heartbeatInterval?: number; // seconds
        events?: Array<
            | "play"
            | "pause"
            | "seeked"
            | "ended"
            | "error"
            | "ratechange"
            | "fullscreen"
            | "pip"
            | "volumechange"
            | "ad_impression"
            | "ad_quartile"
            | "ad_complete"
            | "ad_skip"
        >;
        dataSourceId?: string; // send to this DataSource via Actions api_call
        // If omitted, we'll still call runEventHandler with payload only
    };

    // Advanced
    qualitySelector?: boolean; // allow manual HLS level selection
    pictureInPicture?: boolean; // alias of showMiniPlayer
    hotkeys?: boolean; // keyboard shortcuts like YouTube
    chapters?: Array<{ start: number; title: string }>;
}


export interface CardElement extends BaseElement {
    type: ElementType.card
    header?: UIElement
    title?: UIElement
    description?: UIElement
    action?: UIElement
    content: UIElement[]
    footer?: UIElement[]
    variant?: "default" | "outline" | "ghost" | "elevated" | "borderless"
    clickable?: boolean | Binding         // whole card clickable
    href?: Binding                        // navigation target
    media?: UIElement                     // image, chart, video in header
    badge?: UIElement                     // e.g. “New”, “Premium”
}

export interface ContainerElement extends BaseElement {
    type: ElementType.container;

    /** Layout mode */
    layout: "flex" | "grid" | "block" | "row" | "column";

    /** Gap between children (px, rem, etc.) */
    gap?: number | string;

    /** Flexbox-specific props */
    justify?:
    | "start"
    | "center"
    | "end"
    | "between"
    | "around"
    | "evenly";
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    wrap?: boolean;

    /** Grid-specific props */
    cols?: number; // Tailwind grid-cols-x
    rows?: number; // Tailwind grid-rows-x
    autoCols?: "auto" | "min" | "max" | "fr";
    autoRows?: "auto" | "min" | "max" | "fr";

    /** Responsive layout overrides (optional, not in BaseElement) */
    responsiveLayout?: {
        sm?: Partial<Omit<ContainerElement, "id" | "name" | "type" | "children">>;
        md?: Partial<Omit<ContainerElement, "id" | "name" | "type" | "children">>;
        lg?: Partial<Omit<ContainerElement, "id" | "name" | "type" | "children">>;
        xl?: Partial<Omit<ContainerElement, "id" | "name" | "type" | "children">>;
    };
}

export interface DrawerElement extends BaseElement {
    type: ElementType.drawer;
    title?: Binding;
    description?: Binding;
    isOpen?: boolean | Binding;
    trigger?: UIElement;
    content: UIElement[];
    footer?: UIElement[];
    onOpenChange?: EventHandler;
    direction?: "top" | "bottom" | "left" | "right";
    size?: "sm" | "md" | "lg" | string;
    showCloseButton?: boolean;
}

export interface FormElement extends BaseElement {
    type: ElementType.form;

    formGroupType: FormGroupType;
    formFields: FormField[];

    title?: Binding;
    description?: Binding;

    onSubmit: EventHandler;
    onCancel?: EventHandler;
    submitLabel?: Binding;
    cancelLabel?: Binding;

    validationSchema?: Record<string, any>;

    wizardConfig?: {
        steps: { id: string; title: Binding; description?: Binding }[];
        showProgress?: boolean;
        linear?: boolean;
    };
    tabsConfig?: {
        tabPosition?: 'top' | 'left' | 'right';
        variant?: 'default' | 'outline' | 'pills';
    };
}

export interface TableElement extends BaseElement {
    type: ElementType.table;
    headers: Binding[];
    rows: Binding | { cells: Binding[] }[];
    sortable?: boolean;
    pagination?: boolean;
    crudActions?: EventHandler[];
}

export type DatagGridCol = {
    key: string;
    header: string | Binding;
    width?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'multi-select' | 'date' | 'datetime' | 'time' | 'number' | 'range' | 'bool';
    options?: { value: any; label: string | Binding }[] | Binding; // for select/multi-select
    renderer?: 'text' | 'image' | 'link' | 'badge' | 'progress' | 'chart' | 'checkbox' | 'custom';
    chartConfig?: {
        type: 'bar' | 'line' | 'pie' | 'sparkline';
        dataKey: string;
        options?: Record<string, any>;
    };
    customRender?: string; // component name or script
    editable?: boolean;
    editorType?: InputType;
    cellClass?: string | Binding | { condition: Binding; class: string }[] | ((row: any) => string);
    headerClass?: string | Binding;
    align?: Alignment;
    footer?: string | Binding | { aggregate: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'custom'; customScript?: string };
    resizable?: boolean;
    pinned?: 'left' | 'right' | false;
    hidden?: boolean;
};

export interface DataGridElement extends BaseElement {
    type: ElementType.datagrid;
    id: string;
    columns: DatagGridCol[];
    rows?: any[]; // Client-side data
    totalCount?: number | Binding; // For server-side pagination
    pageSize?: number;
    currentPage?: number | Binding;
    infinite?: boolean; // Infinite scrolling instead of pagination
    virtualization?: boolean;
    virtualRowHeight?: number;
    height?: number | string;
    autoHeight?: boolean;
    selectable?: boolean;
    selectionMode?: 'single' | 'multiple';
    serverSide?: boolean;
    sorting?: { column: string; direction: 'asc' | 'desc' }[] | Binding; // Multi-sort support
    filters?: Record<string, any> | Binding; // Column filters
    globalFilter?: string | Binding; // Global search
    reorderable?: boolean; // Column reordering
    resizableColumns?: boolean;
    columnVisibility?: Record<string, boolean> | Binding;
    subRowsKey?: string; // Key for nested/child rows
    expansionTemplate?: UIElement | string; // Custom renderer for expanded rows
    rowActions?: Array<{
        id: string;
        label: Binding;
        icon?: string;
        variant?: ButtonVariant;
        onClick: EventHandler;
        condition?: Binding; // Visibility condition
    }>;
    groupActions?: Array<{
        id: string;
        label: Binding;
        icon?: string;
        variant?: ButtonVariant;
        onClick: EventHandler;
    }>;
    editingMode?: 'none' | 'cell' | 'row' | 'modal';
    editForm?: FormElement; // For modal editing
    rowClass?: string | Binding | { condition: Binding; class: string }[] | ((row: any) => string);
    loading?: boolean | Binding;
    emptyMessage?: Binding;
    onSortChange?: EventHandler;
    onFilterChange?: EventHandler;
    onGlobalFilterChange?: EventHandler;
    onPageChange?: EventHandler;
    onLoadMore?: EventHandler; // For infinite load
    onSelectionChange?: EventHandler;
    onRowClick?: EventHandler;
    onCellEdit?: EventHandler;
    onColumnReorder?: EventHandler;
    onColumnVisibilityChange?: EventHandler;
    onRowExpand?: EventHandler;
    onRowCollapse?: EventHandler;
    zIndex?: number;
}

export type Step = {
    id: string;
    title: string;
    shouldShow?: Binding
    content?: UIElement[];
    onNext?: EventHandler;
    onPrev?: EventHandler;
    onComplete?: EventHandler;
    validateAction?: EventHandler;
    validate?: boolean;
};

export interface StepWizardElement extends BaseElement {
    type: ElementType.step_wizard;
    id: string;
    steps: Step[];
    current?: number;
    zIndex?: number;
}

export interface MapElement extends BaseElement {
    type: ElementType.map;
    id: string;
    provider?: 'google' | 'mapbox' | 'osm';
    center: [number, number];
    zoom?: number;
    markers?: Array<{ id?: string | number; lat: number; lng: number; popup?: string; iconUrl?: string }>;
    markerCluster?: boolean;
    controls?: {
        zoom?: boolean;
        fullscreen?: boolean;
        streetView?: boolean;
        geolocate?: boolean;
        scale?: boolean;
    };
    dataSourceId?: string;
    heatmap?: Array<[number, number, number?]>;
    routes?: Array<{ id?: string | number; coords: Array<[number, number]> }>;
    tile?: 'osm' | 'mapbox';
    mapbox?: { accessToken?: string; styleId?: string };
    google?: { apiKey?: string | Binding; mapId?: string };
    height?: number;
}

export interface FileUploadElement extends BaseElement {
    type: ElementType.file_upload
    accept?: string
    multiple?: boolean
    maxSize?: number
    presignUrl: Binding
    headers?: Record<string, string | Binding>
    onUploaded?: EventHandler
    onError?: EventHandler
    onComplete?: EventHandler
    onQueueChange?: EventHandler
}

export interface WalletConnectButtonElement extends BaseElement {
    type: ElementType.wallet_connect_button;
    projectId?: string | Binding;
    chainId?: number;
    allowedChains?: number[];
}
export interface Step {
    id: string;
    title: Binding;
    content?: UIElement[];
    onNext?: EventHandler;
    onPrev?: EventHandler;
    onComplete?: EventHandler;
    validate?: boolean;
    validateAction?: EventHandler;
}

export interface StepWizardElement extends BaseElement {
    type: ElementType.step_wizard;
    id: string;
    steps: Step[];
    current?: number;
    zIndex?: number;
}

export interface AlertElement extends BaseElement {
    type: ElementType.alert;
    message: Binding;
    dismissible?: boolean;
    variant: | "default"
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "destructive";
    dismissible?: boolean;
}

export type DropdownItem = {
    id: string
    label: Binding
    heading?: Binding
    icon?: string
    shortcut?: string
    variant?: "default" | "destructive"
    onSelect?: EventHandler

    // Submenu
    children?: DropdownItem[]

    // Checkbox
    type?: "checkbox" | "radio" | "item" | "submenu" | 'separator' | 'label' | 'group'
    checked?: boolean | Binding

    // Radio group
    value?: string
    disabled?: boolean
    group?: string // group id for radio
}
export interface DropdownElement extends BaseElement {
    type: ElementType.dropdown
    trigger: UIElement
    items: DropdownItem[]
}


export interface TabsElement extends BaseElement {
    type: ElementType.tabs;
    tabs: { id: string; label: string; content: UIElement[] }[];
    activeTab: string;
    onChange?: EventHandler;
}

export interface AccordionElement extends BaseElement {
    type: ElementType.accordion
    items: {
        id: string
        title: Binding
        content: UIElement[]
    }[]
    expandedItem?: string | string[] // single or multiple
    onChange?: EventHandler
    multiple?: boolean
    collapsible?: boolean
}


export interface CarouselElement extends BaseElement {
    type: ElementType.carousel
    items: (UIElement & { interval?: number })[] | Binding
    autoPlay?: boolean
    interval?: number
    orientation?: "horizontal" | "vertical"
    loop?: boolean
    showControls?: boolean
    showIndicators?: boolean
    showProgress?: boolean
}

export interface LoaderElement extends BaseElement {
    type: ElementType.loader;
    variant: string;
    size: string;
}

export interface HeaderElement extends BaseElement {
    type: ElementType.header;
    alignment?: Alignment;
}

export interface FooterElement extends BaseElement {
    type: ElementType.footer;
    alignment?: Alignment;
}
export interface SeriesSpec {
    key: string
    type?: "bar" | "line" | "area" | "scatter" | "radar"
    color?: string
    stackId?: string
    label?: string
    yAxisId?: string
    opacity?: number
    strokeWidth?: number
    dot?: boolean | object
}
export interface AnimationSpec {
    /** initial state */
    initial?: Record<string, any>
    /** animate to */
    animate?: Record<string, any>
    /** exit state */
    exit?: Record<string, any>
    /** hover effect */
    whileHover?: Record<string, any>
    /** tap/click effect */
    whileTap?: Record<string, any>
    /** framer-motion transition */
    transition?: Record<string, any>
    /** whether to animate layout changes */
    layout?: boolean
}


export interface ChartElement extends BaseElement {
    type: ElementType.chart
    chartType:
    | "bar"
    | "line"
    | "area"
    | "pie"
    | "radar"
    | "radialBar"
    | "scatter"
    | "composed"
    | "candlestick"

    data: Binding | any[]

    options?: {
        xKey?: string
        yKey?: string
        valueKey?: string
        openKey?: string
        highKey?: string
        lowKey?: string
        closeKey?: string

        stacked?: boolean
        series?: SeriesSpec[]

        colors?: string[]
        donut?: boolean
        radius?: number | string

        legend?: boolean
        tooltip?: boolean
        responsive?: boolean
        grid?: boolean | Record<string, any>

        xDomain?: any
        yDomain?: any
        syncId?: string

        xFormatter?: string | Binding
        yFormatter?: string | Binding
        tooltipFormatter?: string | Binding

        lineStrokeWidth?: number
        lineDot?: boolean | Record<string, any>
        areaOpacity?: number

        animation?: boolean | Record<string, any>
        brush?: boolean | Record<string, any>
        referenceLines?: {
            x?: number[] | string[]
            y?: number[]
        }

        ariaLabel?: string | Binding
        description?: string | Binding
    }
}
export interface CommandElement extends BaseElement {
    type: ElementType.command
    placeholder?: string
    title?: string
    description?: string
    global?: boolean
    showMobileButton?: boolean
    emptyMessage?: string
    groups?: {
        heading: string
        items: {
            id: string
            label: string
            icon?: string
            shortcut?: string
            disabled?: boolean
            onSelect?: EventHandler
        }[]
    }[]
}

export interface CustomElement extends BaseElement {
    type: ElementType.custom;

    /** Single component name OR array of component names */
    component: string | string[];

    /** Arbitrary props to inject (resolved via bindings) */
    props?: Record<string, any>;

    /** Whether to render as group wrapper or individually */
    groupLayout?: "stack" | "inline" | "fragment";
}

export interface CollapsibleElement extends BaseElement {
    type: ElementType.collapsible
    open?: boolean | Binding
    onOpenChange?: EventHandler
    trigger?: UIElement
    content?: UIElement[]
}

export interface AvatarElement extends BaseElement {
    type: ElementType.avatar
    src?: Binding
    alt?: Binding
    size?: number | string
    fallback?: Binding
    generation?: GenerationSpec
    onlineStatus?: boolean | "online" | "offline" | "away" | Binding
    shape?: "circle" | "square" | "rounded"
    showRing?: boolean
}

export interface VoiceElement extends BaseElement {
    type: ElementType.voice;
    mode: 'input' | 'output' | 'both';
    language: string;
    voiceModel?: string;
    onRecognize?: EventHandler;
    onSpeak?: EventHandler;
    outputText?: Binding;
}

export interface CallElement extends BaseElement {
    type: "call";
    callType: "video" | "audio";
    /**
     * Room/peer identity – can be a roomId for conference or a peerId for 1:1
     */
    peerId: Binding;                   // string
    /**
     * WebSocket signaling server URL (wss://...). Your server should relay JSON
     * messages between room participants (join/offer/answer/candidate/leave).
     */
    signalingServer: Binding;          // string
    /**
     * Optional TURN/STUN config. Defaults provided below.
     */
    iceServers?: Array<{ urls: string | string[], username?: string, credential?: string }>;

    // UX flags & defaults
    autoplay?: boolean;                 // auto start local cam/mic
    mirrorLocal?: boolean;              // mirror local video
    showGridNames?: boolean;
    maxPeers?: number;                  // safety cap for mesh rooms
    screenShare?: boolean;              // allow screen share button
    devicesMenu?: boolean;              // show cam/mic/speaker selection
    stats?: boolean;                    // show connection stats per tile

    // Media constraints
    videoConstraints?: MediaTrackConstraints; // e.g., { width: { ideal: 1280 }, frameRate: { ideal: 30 } }
    audioConstraints?: MediaTrackConstraints; // e.g., { echoCancellation: true }

    // Hooks
    onConnect?: EventHandler;
    onDisconnect?: EventHandler;
    onError?: EventHandler;
    onPeerJoin?: EventHandler;          // payload: { peerId }
    onPeerLeave?: EventHandler;         // payload: { peerId }
    onStats?: EventHandler;             // periodic stats payload

    // Analytics
    tracking?: {
        dataSourceId?: string;            // send analytics via Actions api_call
        heartbeatInterval?: number;       // seconds
        events?: Array<"join" | "leave" | "mute" | "unmute" | "camera_on" | "camera_off" | "screenshare_on" | "screenshare_off" | "device_change" | "error">;
    };
}

export interface WalletElement extends BaseElement {
    type: ElementType.wallet;
    provider: 'metamask' | 'walletconnect';
    chainId: number;
    projectId?: string;
    onConnect?: EventHandler;
    onDisconnect?: EventHandler;
}

export interface EditorElement extends BaseElement {
    type: ElementType.editor

    /** Initial or bound content */
    content: Binding | string

    /** Optional placeholder */
    placeholder?: Binding | string

    /** Event when content changes */
    onChange?: EventHandler

    /** Toolbar controls */
    toolbar?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
        bulletList?: boolean
        orderedList?: boolean
        codeBlock?: boolean
    }
}

export interface QuizElement extends BaseElement {
    type: ElementType.quiz;
    questions: {
        id: string;
        question: Binding;
        options: { value: string; label: Binding }[];
        correctAnswer: string;
    }[];
    onSubmit: EventHandler;
}

export interface CalendarElement extends BaseElement {
    type: ElementType.calendar
    events: { id: string; title: Binding; start: Binding; end: Binding }[]
    selectedDate?: Binding
    selectionMode?: "single" | "multiple" | "range"
    onSelect: EventHandler
}

export interface QRCodeElement extends BaseElement {
    type: ElementType.qr_code;
    value: Binding;
    size: number;
}
export interface PaymentElement extends BaseElement {
    type: ElementType.payment;
    provider: 'stripe' | 'paypal' | 'razorpay' | 'custom';
    amount: number | Binding;
    currency: string;
    description?: Binding;
    publicKey?: string;
    clientSecret?: string;
    connectId?: string;
    metadata?: Record<string, string | number | boolean | Binding>;
    onSuccess?: EventHandler;
    onFailure?: EventHandler;
    onCancel?: EventHandler;
}

export interface ThreeDModelElement extends BaseElement {
    type: ElementType.three_d_model;
    src: Binding;
    alt?: Binding;
}

export interface BreadcrumbElement extends BaseElement {
    type: ElementType.breadcrumb
    items: {
        id: string
        label: Binding
        href?: string | Binding
        iconLeft?: UIElement
        iconRight?: UIElement
        onClick?: EventHandler
    }[]
    separator?: "chevron" | "slash" | "dot" | "custom"
    ellipsisAfter?: number // collapse middle items if too many
    tooltip?: boolean // show tooltips on hover for truncated labels
}

export interface AlertDialogElement extends BaseElement {
    type: ElementType.alert_dialog;

    title: Binding;
    description?: Binding;
    content: UIElement[];

    isOpen: boolean | Binding;
    onOpenChange?: EventHandler;

    /** Optional trigger button (opens dialog) */
    trigger?: UIElement;

    /** Primary / secondary actions */
    cancelButton?: ButtonElement;
    actionButton?: ButtonElement;

    /** Extended actions (for >2 buttons) */
    actions?: Array<ButtonElement & { role?: "default" | "destructive" | "cancel" }>;

    /** Visual variants for tone */
    variant?: "default" | "info" | "warning" | "danger" | "success" | "destructive";

    /** Whether clicking outside or pressing ESC closes dialog */
    dismissible?: boolean;

    /** Layout control */
    size?: "sm" | "md" | "lg" | "xl" | "full";
    position?: "center" | "top" | "bottom";
}



export interface HoverCardElement extends BaseElement {
    type: ElementType.hover_card;
    trigger: UIElement;
    content: UIElement[];
}
export interface MenuElement extends BaseElement {
    type: ElementType.menu;

    /** Variant controls which renderer to use */
    variant: "dropdown" | "context" | "menubar" | "navigation";

    /** Optional menu label/title (e.g. for navigation) */
    label?: Binding;

    /** Trigger element (button, icon, text, etc.) */
    trigger?: UIElement;

    /** Items for dropdown, context, navigation */
    items: MenuItem[];

    /** Only used for menubar */
    menus?: Array<{
        id: string;
        label: Binding;
        items: MenuItem[];
    }>;
}

export type MenuItem =
    | {
        id: string;
        type: "item";
        label: Binding;
        icon?: string;
        shortcut?: string;
        variant?: "default" | "destructive";
        href?: string; // for navigation links
        onSelect?: EventHandler;
    }
    | {
        id: string;
        type: "checkbox";
        label: Binding;
        checked?: Binding;
        onSelect?: EventHandler;
    }
    | {
        id: string;
        type: "radio";
        label: Binding;
        value: string;
        onSelect?: EventHandler;
    }
    | {
        id: string;
        type: "label";
        label: Binding;
    }
    | {
        id: string;
        type: "separator";
    }
    | {
        id: string;
        type: "sub";
        label: Binding;
        icon?: string;
        items: MenuItem[];
    };


export interface NavigationMenuElement extends BaseElement {
    type: ElementType.navigation_menu;
    items: Array<{
        id: string;
        label: Binding;
        content: UIElement[];
    }>;
}
export interface PaginationElement extends BaseElement {
    type: ElementType.pagination;
    pages: Array<{ number: number; active: boolean }>;
    totalPages?: number | Binding;
    currentPage?: number | Binding;
    showEllipsis?: boolean;
    onPrevious?: EventHandler;
    onNext?: EventHandler;
    onPageChange?: EventHandler;
}


export interface PopoverElement extends BaseElement {
    type: ElementType.popover;
    trigger: UIElement;          // the button / element that opens the popover
    content: UIElement[];        // children inside the popover
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    open?: boolean | Binding;    // controlled or bound open state
    onOpenChange?: EventHandler; // callback when popover toggles
}

export interface ProgressElement extends BaseElement {
    type: ElementType.progress;
    value: number | Binding;
    indeterminate?: boolean | Binding;
    label?: Binding;
    /** where to place the label */
    labelPosition?: "inside" | "outside" | "none";
    /** if true → hide visually but keep for screen readers */
    srOnlyLabel?: boolean | Binding;
}

export interface RadioGroupElement extends BaseElement {
    type: ElementType.radio_group;

    /** Currently selected value */
    value: Binding;

    /** List of options */
    options: Array<{ value: string; label: Binding; disabled?: boolean }>;

    /** Event handler for value change */
    onChange?: EventHandler;

    /** Layout orientation (default = vertical) */
    orientation?: "horizontal" | "vertical";

    /** Disable the entire group */
    disabled?: boolean;
}
export interface ScrollAreaElement extends BaseElement {
    type: ElementType.scroll_area

    /** Direction of scrolling */
    orientation?: "vertical" | "horizontal" | "both"

    /** Scrollbar visibility */
    scrollHide?: boolean // auto-hide when not scrolling

    /** Scrollbar size */
    size?: "sm" | "md" | "lg"

    /** Child content */
    children?: UIElement[]
}

export interface ResizableElement extends BaseElement {
    type: ElementType.resizable;

    /** Layout direction */
    direction: "horizontal" | "vertical";

    /** Panels with nested UI */
    panels: Array<{
        id: string;
        content: UIElement[];
        defaultSize?: number;   // % width or height depending on direction
        minSize?: number;       // minimum size in %
        maxSize?: number;       // maximum size in %
        collapsible?: boolean;  // allow collapse
    }>;

    /** Show draggable handle icon */
    withHandle?: boolean;
}

export interface SheetElement extends BaseElement {
    type: ElementType.sheet
    title?: Binding
    description?: Binding
    isOpen?: boolean | Binding
    trigger?: UIElement
    content: UIElement[]
    footer?: UIElement[]
    onOpenChange?: EventHandler
    direction?: "left" | "right" | "top" | "bottom"
    showCloseButton?: boolean
    shortcuts?: Array<{ key: string; action: "close" | "toggle" }>
}

export interface SidebarElement extends BaseElement {
    type: ElementType.sidebar;
    header?: UIElement;
    groups: Array<{
        id: string;
        label: Binding;
        items: UIElement[];
    }>;
    footer?: UIElement;
}
export interface ToggleElement extends BaseElement {
    type: ElementType.toggle
    pressed?: Binding | boolean
    onToggle?: EventHandler
    variant?: "default" | "outline"
    size?: "default" | "sm" | "lg"
    label?: Binding
    icon?: string
}
export interface ToggleGroupElement extends BaseElement {
    type: ElementType.toggle_group
    value: Binding | string[] // single or multiple selection
    multiple?: boolean        // default = false
    options: ToggleElement[]  // reuse ToggleElement schema
    onChange?: EventHandler
}


export interface TooltipElement extends BaseElement {
    type: ElementType.tooltip;
    trigger: UIElement;
    content: Binding;
    delayDuration?: number;
    side?: "top" | "bottom" | "left" | "right";
    sideOffset?: number;
}


export type UIElement =
    | ButtonElement | ModalElement | IconElement | BadgeElement
    | TextElement | ImageElement | VideoElement | CardElement | CommandElement
    | ContainerElement | FormElement | TableElement | DataGridElement | MapElement
    | StepWizardElement | AlertElement | DropdownElement | TabsElement | AccordionElement
    | CarouselElement | LoaderElement | ChartElement | CustomElement | AvatarElement
    | VoiceElement | CallElement | WalletElement | WalletConnectButtonElement
    | FileUploadElement | EditorElement | QuizElement | CalendarElement
    | QRCodeElement | ThreeDModelElement | PaymentElement | ToggleElement
    | DrawerElement | ContextMenuElement | BreadcrumbElement | AlertDialogElement
    | HoverCardElement | MenuElement | NavigationMenuElement | PaginationElement | PopoverElement | RadioGroupElement
    | ProgressElement | RadioGroupElement | ResizableElement | SheetElement | SidebarElement | ToggleGroupElement | TooltipElement;

export interface DataSource {
    id: string;
    refId?: string;
    baseUrl?: string | Binding;
    path?: string | Binding;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WEBSOCKET' | 'GRAPHQL';
    headers?: Record<string, string | Binding>;
    body?: Record<string, any> | Binding;
    credentials?: 'include' | 'omit' | 'same-origin';
    errorKey?: string;
    query?: string;
    protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
    graphql_operation?: 'query' | 'mutation' | 'subscription';
    queryParams?: Record<string, string | Binding>;
    pollingInterval?: number;
    retry?: { attempts: number; delay: number; strategy?: 'exponential' | 'linear' | 'jitter' };
    heartbeat?: { interval: number; message: Binding };
    auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
}

export interface DataSourceRef {
    id: string;
    baseUrl?: string | Binding;
    path?: string | Binding;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WEBSOCKET' | 'GRAPHQL';
    headers?: Record<string, string | Binding>;
    body?: Record<string, any> | Binding;
    query?: string | Binding;
    queryParams?: Record<string, string | Binding>;
    pollingInterval?: number;
    retry?: { attempts: number; delay: number };
    heartbeat?: { interval: number; message: Binding };
    auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
}

export interface EndpointEnvironments {
    default: string;
    values: Record<string, {
        baseUrl?: string | Binding;
        headers?: Record<string, string | Binding>;
    }>;
}

export interface ExportConfig {
    format: 'pdf' | 'ppt' | 'word' | 'json';
    resolution?: string;
    includeNotes?: boolean;
    template?: string;
}

export interface DataMapping {
    sourceIds: string[];
    transform?: string;
    outputKey: string;
    crudOperation?: ActionType;
}

export interface TransitionSpec {
    href?: string;
    screenId?: string;
    replace?: boolean;
    modal?: {
        closeId?: string;
        openId?: string;
    };
    statePatches?: Array<{ key: string; value: any | Binding }>;
}

export interface EventHandler {
    action: ActionType;
    params?: Record<string, any | Binding>;
    responseType?: 'ui' | 'data' | 'none' | 'voice' | 'call';
    dataSourceId?: string;
    successAction?: EventHandler;
    errorAction?: EventHandler;
    successTransition?: TransitionSpec;
    errorTransition?: TransitionSpec;
    exportConfig?: ExportConfig;
    aiPrompt?: string;
}

export interface UIScreenDef {
    id: string;
    version: string;
    layoutType: LayoutType;
    name: Binding;
    route: string;
    elements: UIElement[];
    dataSources?: DataSource[];
    dataMappings?: DataMapping[];
    transition?: { type: string; direction?: string; duration: number };
    metadata: Record<string, string | number | boolean | Record<string, any>>;
    styles?: StyleProps;
    guard?: GuardRule;
    lifecycle?: {
        onEnter?: EventHandler;
        onLeave?: EventHandler;
    };
}

export interface UIDefinition {
    id: string;
    version: string;
    screens: UIScreenDef[];
    translations: Record<string, Record<string, string>>;
    initialData?: Record<string, any>;
    state?: {
        keys?: Record<string, {
            defaultValue: any;
            dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
            binding?: Binding;
            validation?: {
                required?: boolean;
                regex?: string;
                minLength?: number;
                maxLength?: number;
                min?: number;
                max?: number;
            };
        }>;
        persist?: boolean;
        persistStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
        webSocketKeys?: string[];
        webSocketEndpoint?: {
            url: string | Binding;
            protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
        };
    };
}

export interface ConditionExpr {
    key: Binding;
    op: ConditionOp;
    value?: any;
}

export interface GuardRule {
    conditions?: ConditionExpr[];
    mode?: 'all' | 'any';
    dataSourceId?: string;
    onFail: RedirectSpec;
    requireAuth?: boolean;
    requireOrganization?: boolean;
    requireOtp?: boolean;
    requireConsents?: string[];
}

export type ConditionOp = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'exists' | 'not_exists' | 'matches' | 'in' | 'not_in';

export interface NavStyle {
    activeStyle?: StyleProps;
    inactiveStyle?: StyleProps;
    containerStyle?: StyleProps;
    overlayStyle?: StyleProps;
    sheetStyle?: StyleProps;
}

export interface IRouteList {
    routes: IRoute[];
    layout?: string;
    desktopNavType?: 'top' | 'side';
    responsiveNavType?: 'bottom' | 'burger';
    metadata: {
        basePath: string;
        totalRoutes: number;
        generatedAt: string;
        version?: string;
    };
    navStyle: NavStyle;
}

export interface IRoute {
    label: string;
    href: string;
    icon: string;
    showInBottomBar: boolean;
    showInNavigation: boolean;
    file: string;
    guard?: GuardRule;
    metadata: {
        title?: string;
        description?: string;
        datePublished?: string;
        dateModified?: string;
        pagination?: {
            previous?: null | string | URL | undefined;
            next?: null | string | URL | undefined;
        };
        openGraph?: {
            title?: string;
            description?: string;
            url?: string;
            siteName?: string;
        };
        twitter?: {
            card?: string;
            title?: string;
            description?: string;
        };
        keywords?: string[];
        formatDetection?: {
            email?: boolean;
            address?: boolean;
            telephone?: boolean;
            date?: boolean;
            url?: boolean;
        };
    };
    isDynamic: boolean;
    requiresAuth: boolean;
    nested?: IRoute[];
    visibility?: VisibilityControl;
    screenId?: string;
    screenVersion?: string;
    screenConfigUrl?: string;
}

export interface OAuthProviderConfig {
    id: 'google' | 'microsoft' | 'github' | 'okta' | 'custom';
    clientId?: string | Binding;
    authUrl?: string;
    tokenUrl?: string;
    redirectUri?: string;
    scopes?: string[];
    pkce?: boolean;
    extraParams?: Record<string, string>;
}

export interface OIDCConfig {
    issuer: string;
    clientId?: string | Binding;
    redirectUri?: string;
    scopes?: string[];
    discoveryUrl?: string;
}

export interface SAMLConfig {
    idpMetadataUrl: string;
    spAcsUrl?: string;
}

export interface I18nConfig {
    defaultLocale?: string;
    supportedLocales?: string[];
    rtlLocales?: string[];
    formats?: {
        date?: string;
        time?: string;
        number?: { grouping?: boolean; minFrac?: number; maxFrac?: number };
        currency?: { style?: 'symbol' | 'code' | 'name' };
    };
}

export interface AccessibilityConfig {
    reducedMotion?: boolean;
    highContrast?: boolean;
    focusRingAlways?: boolean;
    keyboardOnlyMode?: boolean;
}

export interface SecurityConfig {
    csrfHeaderName?: string;
    nonceKey?: string;
    maskKeys?: string[];
}

export interface SocialMediaLinks {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
    discord?: string;
    tiktok?: string;
    medium?: string;
    website?: string;
    [platform: string]: string | undefined;
}

export interface Brand {
    href: string;
    name?: string;
    logoUrl?: string;
    faviconUrl?: string;
    slogan?: string;
    socialMedia?: SocialMediaLinks;
}

export interface UIProject {
    projectId?: string;
    version: string;
    routeList: IRouteList;
    header?: HeaderElement;
    footer?: FooterElement;
    brand: Brand;
    routeBase?: string;
    telemetry?: {
        ingestUrl?: string;
        errorUrl?: string;
        sampleRate?: number;
    };
    globalConfig?: {
        paymentCheckoutAPIUrl?: string;
        paypalUrl?: string;
        walletConnectUrl?: string;
        auth?: AuthGlobalConfig;
        maps?: MapsGlobalConfig;
        endpoints?: {
            registry?: DataSource[];
            environments?: EndpointEnvironments;
            defaultHeaders?: Record<string, string | Binding>;
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
            dataMappings?: DataMapping[];
        };
        translateConfig: I18nConfig;
        security?: SecurityConfig;
        accessibilityConfig?: AccessibilityConfig;
        metadata?: {
            category?: string;
            license?: string;
            schemaType?: string;
            language?: string;
            classification?: string;
            search?: { enabled?: boolean; path?: string };
            viewport?: {
                width?: string | number;
                height?: string | number;
                initialScale?: number;
                maximumScale?: number;
                minimumScale?: number;
                userScalable?: string;
                viewportFit?: 'auto' | 'cover' | 'contain';
                interactiveWidget?: 'resizes-visual' | 'resizes-content' | 'overlays-content';
                themeColor?: string;
                colorScheme?: 'normal' | 'light' | 'dark' | 'light dark' | 'dark light' | 'only light';
            };
            verification?: {
                google?: string | number | (string | number)[];
                yahoo?: string | number | (string | number)[];
                yandex?: string | number | (string | number)[];
                me?: string | number | (string | number)[];
                other?: { [name: string]: string | number | (string | number)[] };
            };
            pinterest?: { richPin: string | boolean };
            facebook?: { appId: string; admins?: never };
            twitter?: { site?: string };
            itunes?: { appId: string; appArgument?: string };
            appLinks?: {
                ios?: { app_name?: string; app_store_id?: string; url: string };
                iphone?: { app_name?: string; app_store_id?: string; url: string };
                ipad?: { app_name?: string; app_store_id?: string; url: string };
                android?: { package: string; app_name?: string; url: string; class?: string };
                web?: { url: string; should_fallback?: boolean };
                windows?: { app_id: string; app_name?: string; url: string };
                windows_phone?: { app_id: string; app_name?: string; url: string };
                windows_universal?: { app_id: string; app_name: string; url: string };
            };
            bookmarks?: string | Array<string>;
        };
    };
    globalStyles?: {
        theme?: {
            primaryColorLight?: string;
            primaryColorDark?: string;
            secondaryColorLight?: string;
            secondaryColorDark?: string;
            fontFamily?: string;
            fontSizeBase?: string;
            colorScheme?: 'normal' | 'light' | 'dark' | 'light dark' | 'dark light' | 'only light';
        };
        tailwindConfig?: {
            prefix?: string;
            important?: boolean;
            customClasses?: Record<string, string>;
        };
        animationFramework?: string;
    };
    translations?: Record<string, Record<string, string>>;
    initialData?: Record<string, any>;
    state?: {
        keys?: Record<string, {
            defaultValue: any;
            dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
            binding?: Binding;
            validation?: {
                required?: boolean;
                regex?: string;
                minLength?: number;
                maxLength?: number;
                min?: number;
                max?: number;
            };
        }>;
        persist?: boolean;
        persistStorage?: 'localStorage' | 'sessionStorage' | 'cookie';
        webSocketKeys?: string[];
        webSocketEndpoint?: {
            url: string | Binding;
            protocol?: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws';
            auth?: { type: 'basic' | 'bearer' | 'api_key'; value: Binding };
        };
    };
}