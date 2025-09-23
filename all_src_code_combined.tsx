

// === File: src/types.d.ts ===

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
    header = 'header',
    footer = 'footer',
    button = 'button',
    input = 'input',
    three_d_model = 'three_d_model',
    modal = 'modal',
    icon = 'icon',
    text = 'text',
    image = 'image',
    card = 'card',
    map = 'map',
    container = 'container',
    collapsible = 'collapsible',
    command = 'command',
    form = 'form',
    table = 'table',
    datagrid = 'datagrid',
    alert = 'alert',
    badge = 'badge',
    breadcrumb = 'breadcrumb',
    dropdown = 'dropdown',
    drawer = 'drawer',
    dropdown_menu = 'dropdown_menu',
    context_menu = 'context_menu',
    tabs = 'tabs',
    accordion = 'accordion',
    carousel = 'carousel',
    loader = 'loader',
    video = 'video',
    payment = 'payment',
    chart = 'chart',
    custom = 'custom',
    avatar = 'avatar',
    voice = 'voice',
    call = 'call',
    slider = 'slider',
    wallet = 'wallet',
    editor = 'editor',
    quiz = 'quiz',
    calendar = 'calendar',
    qr_code = 'qr_code',
    step_wizard = 'step_wizard',
    wallet_connect_button = 'wallet_connect_button',
    file_upload = 'file_upload',
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
    slider = 'slider',
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

export enum ButtonVariant {
    primary = 'primary',
    secondary = 'secondary',
    outline = 'outline',
    danger = 'danger',
    success = 'success',
}

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
    onClick?: EventHandler;
    disabled?: boolean | Binding;
    icon?: IconElement;
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

export interface ContextMenuElement extends BaseElement {
    type: ElementType.context_menu;
    trigger: UIElement;
    items: Array<
        | { id: string; type: 'item'; label: Binding; onSelect?: EventHandler; shortcut?: string }
        | { id: string; type: 'checkbox'; label: Binding; checked?: Binding; onSelect?: EventHandler }
        | { id: string; type: 'radio'; label: Binding; value: string; onSelect?: EventHandler }
        | { id: string; type: 'label'; label: Binding }
        | { id: string; type: 'separator' }
        | { id: string; type: 'sub'; label: Binding; items: Array<{ id: string; label: Binding; onSelect?: EventHandler }> }
    >;
}

export interface VideoElement extends BaseElement {
    type: ElementType.video;
    src: Binding;
    description: Binding;
    width?: number | string;
    height?: number | string;
    autoPlay?: boolean;
    loop?: boolean;
    controls?: boolean;
    generation?: GenerationSpec;
    streaming?: 'hls' | 'dash';
}

export interface CardElement extends BaseElement {
    type: ElementType.card;
    header?: UIElement;
    content: UIElement[];
    footer?: UIElement[];
}

export interface ContainerElement extends BaseElement {
    type: ElementType.container;
    layout: 'flex' | 'grid' | 'block' | 'row' | 'column';
    gap?: number | string;
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
}

export interface DropdownMenuElement extends BaseElement {
    type: ElementType.dropdown_menu;
    trigger: UIElement;
    items: {
        id: string;
        label: Binding;
        icon?: string;
        variant?: 'default' | 'destructive';
        onSelect?: EventHandler;
    }[];
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
    type: ElementType.file_upload;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    presignUrl: Binding;
    headers?: Record<string, string | Binding>;
    onUploaded?: EventHandler;
}

export interface WalletConnectButtonElement extends BaseElement {
    type: ElementType.wallet_connect_button;
    projectId?: string | Binding;
    chainId?: number;
    allowedChains?: number[];
}

export interface AlertElement extends BaseElement {
    type: ElementType.alert;
    message: Binding;
    variant: string;
    dismissible?: boolean;
}

export interface DropdownElement extends BaseElement {
    type: ElementType.dropdown;
    label: Binding;
    options: Binding | { value: string; label: string }[];
    selectedValue?: Binding;
    onChange?: EventHandler;
    required?: boolean;
}

export interface TabsElement extends BaseElement {
    type: ElementType.tabs;
    tabs: { id: string; label: string; content: UIElement[] }[];
    activeTab: string;
    onChange?: EventHandler;
}

export interface AccordionElement extends BaseElement {
    type: ElementType.accordion;
    items: { id: string; title: Binding; content: UIElement[] }[];
    expandedItem?: string;
    onChange?: EventHandler;
}

export interface CarouselElement extends BaseElement {
    type: ElementType.carousel;
    items: Binding | UIElement[];
    autoPlay?: boolean;
    interval?: number;
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

export interface ChartElement extends BaseElement {
    type: ElementType.chart;
    chartType: 'bar' | 'pie' | 'line';
    data: Binding | any;
    options?: Record<string, any>;
}

export interface CustomElement extends BaseElement {
    type: ElementType.custom;
    component: string;
    props: Record<string, any | Binding>;
}

export interface AvatarElement extends BaseElement {
    type: ElementType.avatar;
    src: Binding;
    size: number | string;
    generation?: GenerationSpec;
    onlineStatus?: boolean | Binding;
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
    type: ElementType.call;
    callType: 'video' | 'audio';
    peerId: Binding;
    signalingServer?: Binding;
    onConnect?: EventHandler;
    onDisconnect?: EventHandler;
    controls?: boolean;
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
    type: ElementType.editor;
    content: Binding;
    onChange: EventHandler;
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
    type: ElementType.calendar;
    events: { id: string; title: Binding; start: Binding; end: Binding }[];
    onSelect: EventHandler;
}

export interface QRCodeElement extends BaseElement {
    type: ElementType.qr_code;
    value: Binding;
    size: number;
}

export interface SliderElement extends BaseElement {
    type: ElementType.slider;
    transition?: { type: string; direction?: string; duration: number };
    styles?: StyleProps;
    autoPlay?: boolean;
    elements: UIElement[];
    interval?: number;
    exportOptions?: { pdf: boolean; ppt: boolean };
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
    type: ElementType.breadcrumb;
    items: { id: string; label: Binding; href?: string }[];
}

export type UIElement =
    | ButtonElement | InputElement | ModalElement | IconElement
    | TextElement | ImageElement | VideoElement | CardElement
    | ContainerElement | FormElement | TableElement | DataGridElement | MapElement
    | StepWizardElement | AlertElement | DropdownElement | TabsElement | AccordionElement
    | CarouselElement | LoaderElement | ChartElement | CustomElement | AvatarElement
    | VoiceElement | CallElement | WalletElement | WalletConnectButtonElement
    | FileUploadElement | EditorElement | QuizElement | CalendarElement
    | QRCodeElement | ThreeDModelElement | PaymentElement | SliderElement
    | DrawerElement | ContextMenuElement | DropdownMenuElement | BreadcrumbElement;

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

// === File: src/schema/Actions.tsx ===

export interface ActionRuntime {
    navigate?: (href: string, replace?: boolean) => void;
    openModal?: (id: string) => void;
    closeModal?: (id: string) => void;
    runScript?: (name: string, args: any[]) => Promise<any> | any;
    toast?: (msg: string, variant?: "success" | "error" | "info") => void;
    exportFile?: (type: "pdf" | "ppt" | "word" | "json", payload: AnyObj) => Promise<void>;
    connectWallet?: (provider: string, chainId: number, projectId?: string) => Promise<any>;
    signTransaction?: (provider: string, chainId: number, transaction: any) => Promise<any>;
    initiateCall?: (callType: "video" | "audio", peerId: string, signalingServer?: string) => Promise<void>;
    processVoiceCommand?: (command: string, language: string, voiceModel?: string) => Promise<any>;
}

interface ActionParams {
    timeout?: number;
    retry?: { attempts: number; delay: number; strategy?: 'exponential' | 'linear' | 'jitter' };
    optimisticState?: { path: string; value: any };
    resultMapping?: { jsonPath?: string; transform?: string };
}

async function withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    strategy: 'exponential' | 'linear' | 'jitter' = 'exponential',
    signal?: AbortSignal
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        if (signal?.aborted) throw new Error('Request aborted');
        try {
            return await fn();
        } catch (e: any) {
            lastError = e;
            if (i === attempts - 1) throw e;
            if (e.message?.includes('HTTP') && ![429, 500, 502, 503, 504].includes(parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10))) {
                throw e;
            }
            let waitTime = delay;
            if (strategy === 'exponential') {
                waitTime = delay * Math.pow(2, i);
            } else if (strategy === 'linear') {
                waitTime = delay * (i + 1);
            } else if (strategy === 'jitter') {
                waitTime = delay * Math.pow(2, i) + Math.random() * delay;
            }
            await Promise.race([
                new Promise(resolve => setTimeout(resolve, waitTime)),
                new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('Request aborted')), { once: true })),
            ]);
        }
    }
    throw lastError;
}

export function useActionHandler({
    globalConfig,
    screen,
    runtime,
}: {
    globalConfig?: UIProject['globalConfig'];
    screen?: UIScreenDef;
    runtime: ActionRuntime;
}) {
    const { state, setState, t, form } = useAppState();
    const abortControllers = useRef<Record<string, AbortController>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const scriptAllowlist = ['customScript1', 'customScript2'];

    const cancel = (actionId: string) => {
        const controller = abortControllers.current[actionId];
        if (controller) {
            controller.abort();
            delete abortControllers.current[actionId];
        }
        const wsCleanup = wsCleanups.current[actionId];
        if (wsCleanup) {
            wsCleanup();
            delete wsCleanups.current[actionId];
        }
    };

    const runEventHandler = async (handler?: EventHandler, dataOverride?: AnyObj): Promise<void> => {
        if (!handler) return;

        const h = deepResolveBindings(handler, state, t, resolveBinding) as EventHandler & { params?: ActionParams };
        const controller = new AbortController();
        const actionId = `${h.action}-${Date.now()}`;
        abortControllers.current[actionId] = controller;

        const executeTransition = async (transition?: TransitionSpec) => {
            if (!transition) return;
            const resolvedTransition = deepResolveBindings(transition, state, t, resolveBinding) as TransitionSpec;
            if (resolvedTransition.href && runtime.navigate) {
                runtime.navigate(resolvedTransition.href, !!resolvedTransition.replace);
            }
            if (resolvedTransition.modal?.openId) runtime.openModal?.(resolvedTransition.modal.openId);
            if (resolvedTransition.modal?.closeId) runtime.closeModal?.(resolvedTransition.modal.closeId);
            if (resolvedTransition.statePatches) {
                resolvedTransition.statePatches.forEach(patch => {
                    const value = resolveBinding(patch.value, state, t);
                    setState(patch.key, value);
                });
            }
        };

        const then = async (ok: boolean, payload?: any, error?: { message: string; status?: number }) => {
            const next = ok ? h.successAction : h.errorAction;
            const transition = ok ? h.successTransition : h.errorTransition;
            await executeTransition(transition);
            if (next) await runEventHandler(next, dataOverride);
            if (!ok && error) {
                if (h.params?.optimisticState) {
                    setState(h.params.optimisticState.path, state[h.params.optimisticState.path] || null);
                }
                runtime.toast?.(error.message, "error");
            }
        };

        const applyResultMapping = (result: any, mapping?: ActionParams['resultMapping']) => {
            if (!mapping) return result;
            let mapped = result;
            if (mapping.jsonPath) {
                try {
                    mapped = JSONPath({ path: mapping.jsonPath, json: result });
                } catch (e) {
                    console.error("JSONPath mapping error", e);
                    return { ok: false, error: `JSONPath mapping error: ${String(e)}` };
                }
            }
            if (mapping.transform) {
                try {
                    const fn = new Function("data", mapping.transform);
                    mapped = fn(mapped);
                } catch (e) {
                    console.error("Transform mapping error", e);
                    return { ok: false, error: `Transform error: ${String(e)}` };
                }
            }
            return mapped;
        };

        const executeApiAction = async (ds: DataSource, bodyOverride?: AnyObj | FormData) => {
            const resolvedDs = deepResolveBindings(ds, state, t, resolveBinding) as DataSource;
            const baseUrl = String(resolveBinding(resolvedDs.baseUrl || '', state, t));
            const path = String(resolveBinding(resolvedDs.path || '', state, t));
            let url = new URL(path, baseUrl).toString();
            const headers = Object.entries({
                ...(globalConfig?.endpoints?.defaultHeaders || {}),
                ...(resolvedDs.headers || {}),
            }).reduce((acc, [k, v]) => ({ ...acc, [k]: String(resolveBinding(v, state, t)) }), {} as Record<string, string>);
            if (globalConfig?.security?.csrfHeaderName && state.csrfToken) {
                headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
            }
            if (resolvedDs.auth) {
                const authValue = String(resolveBinding(resolvedDs.auth.value, state, t));
                if (authValue) {
                    switch (resolvedDs.auth.type) {
                        case 'bearer':
                            headers['Authorization'] = `Bearer ${authValue}`;
                            break;
                        case 'basic':
                            headers['Authorization'] = `Basic ${btoa(authValue)}`;
                            break;
                        case 'api_key':
                            headers['X-Api-Key'] = authValue;
                            break;
                    }
                }
            }
            const queryParams = h.params?.queryParams || resolvedDs.queryParams;
            if (queryParams) {
                const params = new URLSearchParams(Object.entries(queryParams).map(([k, v]) => [k, String(resolveBinding(v, state, t))]));
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            const body = bodyOverride instanceof FormData ? bodyOverride : bodyOverride ? JSON.stringify(resolveBinding(bodyOverride, state, t)) : resolvedDs.body ? JSON.stringify(resolveBinding(resolvedDs.body, state, t)) : undefined;
            if (body instanceof FormData) {
                delete headers['Content-Type'];
            } else if (body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
            const method = resolvedDs.method || (h.action === ActionType.crud_create ? "POST" : h.action === ActionType.crud_read ? "GET" : h.action === ActionType.crud_update ? "PUT" : "DELETE");

            const controllerWithTimeout = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => controllerWithTimeout.abort(), h.params.timeout) : null;
            const signal = AbortSignal.any([controller.signal, controllerWithTimeout.signal]);

            const fetchWithRetry = async () => {
                const res = await fetch(url, {
                    method,
                    headers,
                    body,
                    credentials: resolvedDs.credentials || 'same-origin',
                    signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                const contentType = res.headers.get("content-type") || "";
                const contentDisposition = res.headers.get("content-disposition");
                if (contentDisposition?.includes("attachment")) {
                    const blob = await res.blob();
                    const filename = contentDisposition.match(/filename="([^"]+)"/)?.[1] || "download";
                    return { blob, filename };
                }
                if (contentType.includes("application/json")) return await res.json();
                if (contentType.includes("text/")) return await res.text();
                return await res.blob();
            };

            const result = h.params?.retry
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', signal)
                : await fetchWithRetry();

            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        const executeGraphqlAction = async (ds: DataSource, queryOverride?: string, variablesOverride?: AnyObj) => {
            const resolvedDs = deepResolveBindings(ds, state, t, resolveBinding) as DataSource;
            const baseUrl = String(resolveBinding(resolvedDs.baseUrl || '', state, t));
            const path = String(resolveBinding(resolvedDs.path || '', state, t));
            let url = new URL(path, baseUrl).toString();
            const headers = Object.entries({
                "Content-Type": "application/json",
                ...(globalConfig?.endpoints?.defaultHeaders || {}),
                ...(resolvedDs.headers || {}),
            }).reduce((acc, [k, v]) => ({ ...acc, [k]: String(resolveBinding(v, state, t)) }), {} as Record<string, string>);
            if (globalConfig?.security?.csrfHeaderName && state.csrfToken) {
                headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
            }
            const authValue = resolvedDs.auth ? String(resolveBinding(resolvedDs.auth.value, state, t)) : null;
            if (resolvedDs.auth && authValue) {
                switch (resolvedDs.auth.type) {
                    case 'bearer':
                        headers['Authorization'] = `Bearer ${authValue}`;
                        break;
                    case 'basic':
                        headers['Authorization'] = `Basic ${btoa(authValue)}`;
                        break;
                    case 'api_key':
                        headers['X-Api-Key'] = authValue;
                        break;
                }
            }
            const query = String(resolveBinding(queryOverride || resolvedDs.query || '', state, t));
            const variables = resolveBinding(variablesOverride || resolvedDs.body || {}, state, t);
            const body = { query, variables };

            if (resolvedDs.graphql_operation === 'subscription') {
                let wsUrl = url;
                if (resolvedDs.auth?.type === 'bearer' && authValue) {
                    wsUrl += wsUrl.includes('?') ? '&' : '?';
                    wsUrl += `access_token=${encodeURIComponent(authValue)}`;
                }
                const protocol = resolvedDs.protocol || 'graphql-ws';
                let ws: WebSocket | null = null;
                const connect = () => {
                    ws = new WebSocket(wsUrl, protocol);
                    ws.onopen = () => {
                        const initPayload = authValue && resolvedDs.auth?.type === 'bearer' ? { Authorization: `Bearer ${authValue}` } : {};
                        ws?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
                    };
                    ws.onmessage = (event) => {
                        let data;
                        try {
                            data = JSON.parse(event.data);
                        } catch {
                            data = event.data;
                        }
                        if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                            ws?.send(JSON.stringify({ type: protocol === 'graphql-ws' ? 'subscribe' : 'start', id: resolvedDs.id, payload: { query, variables } }));
                        } else if (data.type === 'data' || data.type === 'next') {
                            const result = applyResultMapping(data.payload?.data || data.data, h.params?.resultMapping);
                            if (h.responseType === 'data' && h.params?.statePath) {
                                setState(h.params.statePath, result);
                            }
                        }
                    };
                    ws.onclose = () => {
                        ws = null;
                        wsCleanups.current[actionId]?.();
                        delete wsCleanups.current[actionId];
                    };
                    ws.onerror = (error) => {
                        console.error('WebSocket error', error);
                        ws?.close();
                    };
                };
                connect();
                wsCleanups.current[actionId] = () => {
                    ws?.close();
                };
                return;
            }

            const controllerWithTimeout = new AbortController();
            const timeoutId = h.params?.timeout ? setTimeout(() => controllerWithTimeout.abort(), h.params.timeout) : null;
            const signal = AbortSignal.any([controller.signal, controllerWithTimeout.signal]);

            const fetchWithRetry = async () => {
                const res = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(body),
                    credentials: resolvedDs.credentials || 'same-origin',
                    signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                return await res.json();
            };

            const result = h.params?.retry
                ? await withRetry(fetchWithRetry, h.params.retry.attempts, h.params.retry.delay, h.params.retry.strategy || 'exponential', signal)
                : await fetchWithRetry();

            if (timeoutId) clearTimeout(timeoutId);
            return result;
        };

        try {
            let result: any;

            if (h.params?.optimisticState) {
                setState(h.params.optimisticState.path, resolveBinding(h.params.optimisticState.value, state, t));
            }

            switch (h.action) {
                case ActionType.navigation: {
                    const href = String(h.params?.href || h.successTransition?.href || "/");
                    runtime.navigate?.(href, !!h.successTransition?.replace);
                    break;
                }

                case ActionType.open_modal: {
                    const id = String(h.params?.id);
                    if (!id) throw new Error("Modal ID required for open_modal");
                    runtime.openModal?.(id);
                    break;
                }

                case ActionType.close_modal: {
                    const id = String(h.params?.id);
                    if (!id) throw new Error("Modal ID required for close_modal");
                    runtime.closeModal?.(id);
                    break;
                }

                case ActionType.update_state: {
                    const path = String(h.params?.path);
                    if (!path) throw new Error("State path required for update_state");
                    const value = resolveBinding(h.params?.value, state, t);
                    setState(path, value);
                    break;
                }

                case ActionType.run_script: {
                    const name = String(h.params?.name);
                    if (!name) throw new Error("Script name required for run_script");
                    if (!scriptAllowlist.includes(name)) throw new Error(`Script ${name} not in allowlist`);
                    const args = h.params?.args ? (Array.isArray(h.params.args) ? h.params.args : [h.params.args]).map(arg => resolveBinding(arg, state, t)) : [];
                    result = await runtime.runScript?.(name, args);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                case ActionType.api_call:
                case ActionType.crud_create:
                case ActionType.crud_read:
                case ActionType.crud_update:
                case ActionType.crud_delete:
                case ActionType.audit_log:
                case ActionType.ai_generate: {
                    const dsId = h.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = screen?.dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);

                    let body: AnyObj | FormData | undefined = dataOverride || h.params?.body;
                    if (h.action === ActionType.audit_log) {
                        const event = String(h.params?.event || '');
                        if (!event) throw new Error("Event required for audit_log");
                        const metadata = resolveBinding(h.params?.metadata || {}, state, t);
                        body = { event, metadata, timestamp: new Date().toISOString() };
                    } else if (h.action === ActionType.ai_generate) {
                        const prompt = String(h.aiPrompt || h.params?.prompt || '');
                        if (!prompt) throw new Error("Prompt required for ai_generate");
                        const type = String(h.params?.type || 'text') as "text" | "image" | "video" | "ui";
                        body = { prompt, type, ...(h.params || {}) };
                    }

                    result = await executeApiAction(ds, body);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                case ActionType.graphql_query:
                case ActionType.graphql_mutation:
                case ActionType.graphql_subscription: {
                    const dsId = h.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = screen?.dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);
                    result = await executeGraphqlAction(ds, h.params?.query, h.params?.variables || dataOverride);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                case ActionType.websocket_call: {
                    const dsId = h.dataSourceId;
                    if (!dsId) throw new Error(`dataSourceId required for ${h.action}`);
                    const inlineDs = screen?.dataSources?.find(ds => ds.id === dsId);
                    const globalDs = (globalConfig?.endpoints?.registry || []).find(ref => ref.id === dsId);
                    const ds = inlineDs || globalDs;
                    if (!ds) throw new Error(`DataSource ${dsId} not found`);

                    const resolvedDs = deepResolveBindings(ds, state, t, resolveBinding) as DataSource;
                    const baseUrl = String(resolveBinding(resolvedDs.baseUrl || '', state, t));
                    const path = String(resolveBinding(resolvedDs.path || '', state, t));
                    let url = new URL(path, baseUrl).toString();
                    const headers = Object.entries({
                        ...(globalConfig?.endpoints?.defaultHeaders || {}),
                        ...(resolvedDs.headers || {}),
                    }).reduce((acc, [k, v]) => ({ ...acc, [k]: String(resolveBinding(v, state, t)) }), {} as Record<string, string>);
                    if (globalConfig?.security?.csrfHeaderName && state.csrfToken) {
                        headers[globalConfig.security.csrfHeaderName] = state.csrfToken;
                    }
                    if (resolvedDs.auth) {
                        const authValue = String(resolveBinding(resolvedDs.auth.value, state, t));
                        if (authValue) {
                            switch (resolvedDs.auth.type) {
                                case 'bearer':
                                    headers['Authorization'] = `Bearer ${authValue}`;
                                    url += url.includes('?') ? '&' : '?';
                                    url += `access_token=${encodeURIComponent(authValue)}`;
                                    break;
                                case 'basic':
                                    headers['Authorization'] = `Basic ${btoa(authValue)}`;
                                    break;
                                case 'api_key':
                                    headers['X-Api-Key'] = authValue;
                                    break;
                            }
                        }
                    }
                    const initialMessage = resolveBinding(h.params?.body || resolvedDs.body || dataOverride, state, t);

                    let ws: WebSocket | null = null;
                    const connect = () => {
                        ws = new WebSocket(url);
                        ws.onopen = () => {
                            if (initialMessage) ws?.send(JSON.stringify(initialMessage));
                            if (resolvedDs.heartbeat) {
                                const intervalId = setInterval(() => {
                                    if (ws?.readyState === WebSocket.OPEN) {
                                        ws.send(JSON.stringify(resolvedDs.heartbeat?.message));
                                    }
                                }, resolvedDs.heartbeat.interval);
                                wsCleanups.current[actionId] = () => {
                                    clearInterval(intervalId);
                                    ws?.close();
                                };
                            }
                        };
                        ws.onmessage = (event) => {
                            let data;
                            try {
                                data = JSON.parse(event.data);
                            } catch {
                                data = event.data;
                            }
                            if (h.responseType === 'data' && h.params?.statePath) {
                                setState(h.params.statePath, applyResultMapping(data, h.params.resultMapping));
                            }
                        };
                        ws.onclose = () => {
                            ws = null;
                            wsCleanups.current[actionId]?.();
                            delete wsCleanups.current[actionId];
                        };
                        ws.onerror = (error) => {
                            console.error('WebSocket error', error);
                            ws?.close();
                        };
                    };
                    connect();
                    break;
                }

                case ActionType.export_pdf:
                case ActionType.export_ppt:
                case ActionType.export_word:
                case ActionType.export_json: {
                    const format = h.action.replace('export_', '') as "pdf" | "ppt" | "word" | "json";
                    const payload = resolveBinding(h.exportConfig || {}, state, t);
                    await runtime.exportFile?.(format, payload);
                    break;
                }

                case ActionType.voice_command: {
                    const command = String(h.params?.command || '');
                    if (!command) throw new Error("Command required for voice_command");
                    const language = String(h.params?.language || 'en-US');
                    const voiceModel = String(h.params?.voiceModel || '');
                    result = await runtime.processVoiceCommand?.(command, language, voiceModel);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                case ActionType.initiate_call: {
                    const callType = String(h.params?.callType || 'video') as "video" | "audio";
                    const peerId = String(resolveBinding(h.params?.peerId, state, t));
                    if (!peerId) throw new Error("Peer ID required for initiate_call");
                    const signalingServer = String(resolveBinding(h.params?.signalingServer || '', state, t));
                    await runtime.initiateCall?.(callType, peerId, signalingServer);
                    break;
                }

                case ActionType.wallet_connect: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const projectId = String(resolveBinding(h.params?.projectId || '', state, t));
                    result = await runtime.connectWallet?.(provider, chainId, projectId);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                case ActionType.wallet_sign: {
                    const provider = String(h.params?.provider || 'metamask');
                    const chainId = Number(h.params?.chainId || 1);
                    const transaction = resolveBinding(h.params?.transaction, state, t);
                    if (!transaction) throw new Error("Transaction required for wallet_sign");
                    result = await runtime.signTransaction?.(provider, chainId, transaction);
                    if (h.responseType === "data" && h.params?.statePath) {
                        setState(h.params.statePath, applyResultMapping(result, h.params.resultMapping));
                    }
                    break;
                }

                default:
                    throw new Error(`Unsupported action: ${h.action}`);
            }

            await then(true, result);
        } catch (e: any) {
            const errorObj = {
                message: String(e.message || e),
                status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
            };
            await then(false, undefined, errorObj);
        } finally {
            controller.abort();
            delete abortControllers.current[actionId];
        }
    };

    useEffect(() => {
        return () => {
            Object.values(abortControllers.current).forEach(c => c.abort());
            Object.values(wsCleanups.current).forEach(c => c());
            abortControllers.current = {};
            wsCleanups.current = {};
        };
    }, []);

    return { runEventHandler, cancel };
}

// === File: src/schema/Datasource.tsx ===

type Fetcher = (ds: DataSource, state: AnyObj, t: (k: string) => string, signal?: AbortSignal) => Promise<any>;

async function withRetry<T>(
    fn: () => Promise<T>,
    attempts: number,
    delay: number,
    strategy: 'exponential' | 'linear' | 'jitter' = 'exponential',
    signal?: AbortSignal
): Promise<T> {
    let lastError: any;
    for (let i = 0; i < attempts; i++) {
        if (signal?.aborted) throw new Error('Request aborted');
        try {
            return await fn();
        } catch (e: any) {
            lastError = e;
            if (i === attempts - 1) throw e;
            let waitTime = delay;
            if (strategy === 'exponential') {
                waitTime = delay * Math.pow(2, i);
            } else if (strategy === 'linear') {
                waitTime = delay * (i + 1);
            } else if (strategy === 'jitter') {
                waitTime = delay * Math.pow(2, i) + Math.random() * delay;
            }
            await Promise.race([
                new Promise(resolve => setTimeout(resolve, waitTime)),
                new Promise((_, reject) => signal?.addEventListener('abort', () => reject(new Error('Request aborted')), { once: true })),
            ]);
        }
    }
    throw lastError;
}

function applyDataMappings(out: any, ds: DataSource, mappings: DataMapping[] | undefined, setState: (path: string, value: any) => void): any {
    if (!mappings) return out;
    let result = out;
    for (const m of mappings) {
        if (m.sourceIds.includes(ds.id)) {
            if (m.transform) {
                try {
                    const fn = new Function("data", m.transform);
                    result = fn(result);
                } catch (e) {
                    console.error("Mapping transform error", e);
                    result = { ok: false, error: `Transform error: ${String(e)}` };
                }
            }
            if (m.outputKey) {
                setState(m.outputKey, result);
            }
        }
    }
    return result;
}

const defaultFetcher: Fetcher = async (ds, state, t, signal) => {
    if (!ds.baseUrl) {
        throw new Error('baseUrl is required for DataSource');
    }

    const baseUrl = String(resolveBinding(ds.baseUrl, state, t));
    const path = String(resolveBinding(ds.path || '', state, t));
    let url = joinUrl(baseUrl, path);

    const headers: Record<string, string> = Object.entries(ds.headers || {}).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: String(resolveBinding(v, state, t)) }),
        {}
    );
    if (ds.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const authValue = ds.auth ? String(resolveBinding(ds.auth.value, state, t)) : '';
    if (ds.auth && authValue) {
        switch (ds.auth.type) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${authValue}`;
                break;
            case 'basic':
                headers['Authorization'] = `Basic ${btoa(authValue)}`;
                break;
            case 'api_key':
                headers['X-Api-Key'] = authValue;
                break;
        }
    }

    if (ds.method === "GRAPHQL") {
        const isSubscription = ds.graphql_operation === 'subscription';
        const variables = resolveBinding(ds.body || {}, state, t);
        const query = String(resolveBinding(ds.query || '', state, t));
        const body = { query, variables };

        if (isSubscription) {
            if (ds.auth?.type === 'bearer' && authValue) {
                url += url.includes('?') ? '&' : '?';
                url += `access_token=${encodeURIComponent(authValue)}`;
            }
            return { _sub: true, url, query, variables, headers, protocol: ds.protocol || 'graphql-ws' };
        } else {
            const r = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                credentials: ds.credentials || 'same-origin',
                signal,
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
            return r.json();
        }
    }

    if (ds.method === "WEBSOCKET") {
        if (ds.auth?.type === 'bearer' && authValue) {
            url += url.includes('?') ? '&' : '?';
            url += `access_token=${encodeURIComponent(authValue)}`;
        }
        return { _ws: true, url, initialMessage: resolveBinding(ds.body, state, t), headers };
    }

    const queryParams = ds.queryParams
        ? new URLSearchParams(Object.entries(ds.queryParams).map(([k, v]) => [k, String(resolveBinding(v, state, t))]))
        : null;
    if (queryParams) url += (url.includes('?') ? '&' : '?') + queryParams.toString();

    const r = await fetch(url, {
        method: ds.method || "GET",
        headers,
        body: ds.body ? (headers['Content-Type'] === 'application/json' ? JSON.stringify(resolveBinding(ds.body, state, t)) : resolveBinding(ds.body, state, t)) : undefined,
        credentials: ds.credentials || 'same-origin',
        signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
    const ct = r.headers.get("content-type") || "";
    return ct.includes("application/json") ? await r.json() : await r.text();
};

function setupWebSocket(
    url: string,
    onMessage: (data: any) => void,
    initialMessage?: any,
    heartbeat?: { interval: number; message: any },
    authHeaders?: Record<string, string>,
    protocol: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws' = 'graphql-ws'
): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let backoff = 1000;
    const maxBackoff = 30000;

    const connect = () => {
        ws = new WebSocket(url, protocol);

        ws.onopen = () => {
            console.log('WebSocket connected');
            backoff = 1000;
            const initPayload = authHeaders && authHeaders['Authorization'] ? { Authorization: authHeaders['Authorization'] } : {};
            if (protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') {
                ws?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
            } else if (initialMessage) {
                ws?.send(JSON.stringify(initialMessage));
            }
            if (heartbeat) {
                heartbeatInterval = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(heartbeat.message));
                    }
                }, heartbeat.interval);
            }
        };

        ws.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch {
                data = event.data;
            }
            if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                if (initialMessage) ws?.send(JSON.stringify(initialMessage));
            } else {
                onMessage(data);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket closed', event.code, event.reason);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            if (!event.wasClean) {
                reconnectTimeout = setTimeout(connect, backoff);
                backoff = Math.min(backoff * 2, maxBackoff);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error', error);
            ws?.close();
        };
    };

    connect();

    return () => {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        ws?.close();
    };
}

function setupGraphQLSubscription(
    url: string,
    query: string,
    variables: any,
    onData: (data: any) => void,
    headers?: Record<string, string>,
    protocol: 'graphql-ws' | 'subscriptions-transport-ws' | 'graphql-transport-ws' = 'graphql-ws'
): () => void {
    return setupWebSocket(
        url,
        (msg) => {
            let parsed;
            try {
                parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
            } catch {
                parsed = msg;
            }
            if (parsed.type === 'data' || parsed.type === 'next') onData(parsed.payload?.data || parsed.data);
        },
        { type: protocol === 'graphql-ws' ? 'subscribe' : 'start', id: 'sub1', payload: { query, variables } },
        undefined,
        headers,
        protocol
    );
}

export function useDataSources({
    dataSources = [],
    globalConfig,
    screen,
    fetcher = defaultFetcher,
}: {
    dataSources?: DataSource[];
    globalConfig?: UIProject['globalConfig'];
    screen?: UIScreenDef;
    fetcher?: Fetcher;
}) {
    const { state, setState, t } = useAppState();
    const [data, setData] = useState<Record<string, any>>({});
    const timers = useRef<Record<string, NodeJS.Timeout>>({});
    const wsCleanups = useRef<Record<string, () => void>>({});
    const abortControllers = useRef<Record<string, AbortController>>({});

    const resolved = useMemo(() => {
        const env = globalConfig?.endpoints?.environments?.default || 'prod';
        const envConfig = globalConfig?.endpoints?.environments?.values[env] || {};
        const defaultHeaders = globalConfig?.endpoints?.defaultHeaders || {};
        const globalAuth = globalConfig?.endpoints?.auth;
        const globalEndpoints = globalConfig?.endpoints?.registry || [];

        return dataSources.map((ds) => {
            let resolvedDs: DataSource = { ...ds };

            if (ds.refId) {
                const globalRef = globalEndpoints.find(ref => ref.id === ds.refId);
                if (globalRef) {
                    resolvedDs = { ...globalRef, ...resolvedDs };
                }
            }

            if (envConfig.baseUrl) resolvedDs.baseUrl = envConfig.baseUrl;
            if (envConfig.headers) resolvedDs.headers = { ...resolvedDs.headers, ...envConfig.headers };
            resolvedDs.headers = { ...defaultHeaders, ...resolvedDs.headers };
            if (!resolvedDs.auth && globalAuth) resolvedDs.auth = globalAuth;

            return deepResolveBindings(resolvedDs, state, t, resolveBinding) as DataSource;
        });
    }, [dataSources, state, t, globalConfig]);

    const mappings = useMemo(() => {
        const globalMappings = globalConfig?.endpoints?.dataMappings || [];
        const screenMappings = screen?.dataMappings || [];
        return [...globalMappings, ...screenMappings];
    }, [globalConfig, screen]);

    useEffect(() => {
        let mounted = true;
        const stops: Array<() => void> = [];

        (async () => {
            for (const ds of resolved) {
                const controller = new AbortController();
                abortControllers.current[ds.id] = controller;

                const run = async () => {
                    try {
                        const out = ds.retry
                            ? await withRetry(() => fetcher(ds, state, t, controller.signal), ds.retry.attempts, ds.retry.delay, ds.retry.strategy, controller.signal)
                            : await fetcher(ds, state, t, controller.signal);
                        const mapped = applyDataMappings(out, ds, mappings, setState);
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: mapped }));
                    } catch (e: any) {
                        if (e.name === 'AbortError') return;
                        const errorObj = {
                            ok: false,
                            error: String(e.message || e),
                            status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
                        };
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: errorObj }));
                        if (ds.errorKey) {
                            setState(ds.errorKey, errorObj);
                        }
                    }
                };

                if (ds.method !== "WEBSOCKET" && !(ds.method === "GRAPHQL" && ds.graphql_operation === 'subscription')) {
                    await run();
                } else {
                    let out;
                    try {
                        out = await fetcher(ds, state, t);
                    } catch (e: any) {
                        if (e.name === 'AbortError') continue;
                        const errorObj = {
                            ok: false,
                            error: String(e.message || e),
                            status: e.message?.includes('HTTP') ? parseInt(e.message.match(/HTTP (\d+)/)?.[1] || '0', 10) : undefined,
                        };
                        if (mounted) setData(prev => ({ ...prev, [ds.id]: errorObj }));
                        if (ds.errorKey) {
                            setState(ds.errorKey, errorObj);
                        }
                        continue;
                    }

                    if (out._ws || out._sub) {
                        const cleanup = out._sub
                            ? setupGraphQLSubscription(out.url, out.query, out.variables, (newData) => {
                                if (mounted) {
                                    const mapped = applyDataMappings(newData, ds, mappings, setState);
                                    setData(prev => ({ ...prev, [ds.id]: mapped }));
                                }
                            }, out.headers, out.protocol)
                            : setupWebSocket(out.url, (msg) => {
                                if (mounted) {
                                    const mapped = applyDataMappings({ _ws: true, last: msg }, ds, mappings, setState);
                                    setData(prev => ({ ...prev, [ds.id]: mapped }));
                                }
                            }, out.initialMessage, ds.heartbeat, out.headers, out.protocol);

                        wsCleanups.current[ds.id] = cleanup;
                        stops.push(cleanup);
                    }
                }

                if (ds.pollingInterval && ds.method !== "WEBSOCKET" && !(ds.method === "GRAPHQL" && ds.graphql_operation === 'subscription')) {
                    const id = setInterval(async () => {
                        const newController = new AbortController();
                        abortControllers.current[ds.id] = newController;
                        await run();
                    }, ds.pollingInterval);
                    timers.current[ds.id] = id;
                    stops.push(() => {
                        clearInterval(id);
                        abortControllers.current[ds.id]?.abort();
                        delete abortControllers.current[ds.id];
                    });
                }
            }
        })();

        return () => {
            mounted = false;
            stops.forEach(s => s());
            Object.values(timers.current).forEach(clearInterval);
            Object.values(abortControllers.current).forEach(c => c.abort());
            timers.current = {};
            abortControllers.current = {};
            Object.values(wsCleanups.current).forEach(c => c());
            wsCleanups.current = {};
        };
    }, [resolved, fetcher, state, t, setState, mappings]);

    return data;
}

function joinUrl(base: string, path: string): string {
    try {
        return new URL(path, base).toString();
    } catch (e) {
        console.error('Invalid URL construction:', { base, path, error: e });
        throw new Error(`Failed to construct URL from base: ${base} and path: ${path}`);
    }
}

// === File: src/schema/ElementResolver.tsx ===

"use client";

import React from "react";
import type { AnyObj, DropdownElement, InputElement, UIElement } from "./types-bridges";
import { ElementType, Alignment, InputType, ButtonVariant } from "./types-bridges";
import { resolveBinding, isVisible, classesFromStyleProps, getAccessibilityProps, motionFromAnimation, deepResolveBindings, cn } from "../lib/utils";
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
import { IconElement, VideoElement, PaymentElement, MapElement, FormElement, DataGridElement, LoaderElement, AvatarElement, VoiceElement, CallElement, SliderElement, WalletElement, EditorElement, QuizElement, QRCodeElement, StepWizardElement, WalletConnectButtonElement, FileUploadElement, CarouselElement, AccordionElement, AlertElement, BreadcrumbElement, ButtonElement, CalendarElement, CardElement, ContainerElement, ContextMenuElement, CustomElement, DrawerElement, DropdownMenuElement, FooterElement, HeaderElement, ModalElement, TableElement, TabsElement, TextElement } from "@/src/types";
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

function RenderChildren({ children }: { children: UIElement[] }) {
    return (
        <>
            {children?.map((child) => (
                <ElementResolver key={child.id} element={child} />
            ))}
        </>
    );
}

export function ElementResolver({ element }: { element: UIElement }) {
    const { state, t } = useAppState();
    const { runEventHandler } = useActionHandler({ runtime: {} as any });

    // visibility guard
    if (!isVisible(element.visibility, state, t)) return null;

    const classes = classesFromStyleProps(element.styles);
    const a11y = getAccessibilityProps(element.accessibility);
    const children = element.children || [];

    const wrap = (node: React.ReactNode) => {
        if (!element.styles?.animation) return <div className={classes}>{node}</div>;
        return (
            <motion.div className={classes} {...motionFromAnimation(element.styles?.animation)}>
                {node}
            </motion.div>
        );
    };

    switch (element.type) {


        default:
            return wrap(<RenderChildren children={children} />);
    }
}


// === File: src/schema/ProjectRouter.tsx ===

"use client";

import React, { useMemo } from "react";
import type { UIProject, UIDefinition, IRoute } from "./types-bridges";
import { ScreenRenderer } from "./ScreenRenderer";

// Minimal in-app router adapter.
// In Next.js, pass current route + matching UIDefinition.
export function ProjectRouter({
    project,
    route,
    definition,
    locale = "en",
    navigate,
}: {
    project: UIProject;
    route: IRoute;                // the matched route (from your own router / Next route)
    definition: UIDefinition;     // loaded screen definition for this route
    locale?: string;
    navigate?: (href: string, replace?: boolean) => void;
}) {
    const screenId = route.screenId || definition.screens[0]?.id;
    const screen = useMemo(() => definition.screens.find(s => s.id === screenId) || definition.screens[0], [definition, screenId]);

    return (
        <ScreenRenderer
            screen={screen}
            definition={definition}
            locale={locale}
            runtime={{ navigate }}
        />
    );
}


// === File: src/schema/ScreenRenderer.tsx ===

"use client";

export function ScreenRenderer({
    screen, definition, locale = "en", runtime
}: {
    screen: UIScreenDef;
    definition: UIDefinition;
    locale?: string;
    runtime?: Partial<ActionRuntime>;
}) {
    const t = useI18n(definition.translations || {}, locale);
    const [state, setState] = useSchemaState(definition.initialData || {});

    const data = useDataSources({ dataSources: screen.dataSources, state, t });

    const ctx = useMemo(() => ({
        state, setState,
        t,
        data,
        runtime: {
            toast: (message, variant) => {
                if (!message) return;
                if (variant === "error") toast.error(message);
                else if (variant === "success") toast.success(message);
                else toast(message);
            },
            navigate: runtime?.navigate,
            openModal: runtime?.openModal,
            closeModal: runtime?.closeModal,
            exportFile: runtime?.exportFile,
            runScript: runtime?.runScript,
            setState: (p, v) => setState(p, v),
        } as ActionRuntime
    }), [state, setState, data, runtime, t]);

    // lifecycle
    React.useEffect(() => {
        if (screen.lifecycle?.onEnter) runEventHandler({ handler: screen.lifecycle.onEnter, state, t, data, runtime: ctx.runtime });
        return () => {
            if (screen.lifecycle?.onLeave) runEventHandler({ handler: screen.lifecycle.onLeave, state, t, data, runtime: ctx.runtime });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen.id]);

    return (
        <div className="mx-auto w-full max-w-7xl p-4">
            {screen.elements?.map(el => <ElementResolver key={el.id} el={el} ctx={ctx} />)}
            <Toaster richColors position="top-right" />
        </div>
    );
}


// === File: src/schema/StateContext.tsx ===

interface AppStateContextType {
    state: AnyObj;
    setState: (path: string, value: any) => void;
    t: (key: string) => string;
    form: UseFormReturn<AnyObj>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function StateProvider({
    project,
    children,
    initialState = {},
    defaultLocale = "en-GB",
}: {
    project: UIProject;
    children: ReactNode;
    initialState?: AnyObj;
    defaultLocale?: string;
}) {
    const [state, setStateRaw] = useState<AnyObj>(() => {
        const initial = { ...initialState };
        if (project.state?.keys) {
            Object.entries(project.state.keys).forEach(([key, config]) => {
                initial[key] = config.defaultValue ?? null;
            });
        }
        return initial;
    });

    const wsRef = useRef<WebSocket | null>(null);
    const wsCleanupRef = useRef<(() => void) | null>(null);

    const validateValue = (key: string, value: any, config: any) => {
        if (!config.validation) return true;
        const { required, regex, minLength, maxLength, min, max } = config.validation;
        if (required && (value === null || value === undefined)) return false;
        if (typeof value === 'string') {
            if (minLength && value.length < minLength) return false;
            if (maxLength && value.length > maxLength) return false;
            if (regex && !new RegExp(regex).test(value)) return false;
        }
        if (typeof value === 'number') {
            if (min !== undefined && value < min) return false;
            if (max !== undefined && value > max) return false;
        }
        return true;
    };

    const setState = (path: string, value: any) => {
        setStateRaw((prev) => {
            const newState = { ...prev };
            const config = project.state?.keys?.[path];
            if (config && !validateValue(path, value, config)) {
                console.warn(`Invalid state update for ${path}:`, value);
                return prev;
            }
            const resolvedValue = config?.binding ? resolveBinding(config.binding, newState, t) ?? value : value;
            setPath(newState, path, resolvedValue);
            return newState;
        });
    };

    const t = (key: string) => {
        const translations = project.translations?.[state.locale || defaultLocale] || {};
        return translations[key] || key;
    };

    const formSchema: any = z.object(
        Object.entries(project.state?.keys || {}).reduce((schema, [key, config]) => {
            let validator: z.ZodTypeAny = z.any();
            switch (config.dataType) {
                case "string": {
                    let validator = z.string();
                    if (config.validation?.required) validator = validator.min(1);
                    if (config.validation?.regex) validator = validator.regex(new RegExp(config.validation.regex));
                    if (config.validation?.minLength) validator = validator.min(config.validation.minLength);
                    if (config.validation?.maxLength) validator = validator.max(config.validation.maxLength);
                    return { ...schema, [key]: validator };
                }
                case "number": {
                    let validator = z.number();
                    if (config.validation?.min !== undefined) validator = validator.min(config.validation.min);
                    if (config.validation?.max !== undefined) validator = validator.max(config.validation.max);
                    return { ...schema, [key]: validator };
                }
                case "boolean": {
                    return { ...schema, [key]: z.boolean() };
                }
                case "object": {
                    return { ...schema, [key]: z.object({}) };
                }
                case "array": {
                    return { ...schema, [key]: z.array(z.any()) };
                }
            }
            return { ...schema, [key]: validator };
        }, {})
    );

    const form = useForm<AnyObj>({
        resolver: zodResolver(formSchema),
        defaultValues: state,
    });

    useEffect(() => {
        form.reset(state);
    }, [state, form]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage = project.state.persistStorage === 'localStorage' ? localStorage : sessionStorage;
            storage.setItem('appState', JSON.stringify(state));
        }
    }, [state, project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.persist && project.state.persistStorage) {
            const storage = project.state.persistStorage === 'localStorage' ? localStorage : sessionStorage;
            const savedState = storage.getItem('appState');
            if (savedState) {
                setStateRaw((prev) => ({ ...prev, ...JSON.parse(savedState) }));
            }
        }
    }, [project.state?.persist, project.state?.persistStorage]);

    useEffect(() => {
        if (project.state?.webSocketEndpoint && project.state.webSocketKeys?.length) {
            const wsUrl = resolveBinding(project.state.webSocketEndpoint.url, state, t) as string;
            const protocol = project.state.webSocketEndpoint.protocol || 'graphql-ws';
            const auth = project.state.webSocketEndpoint.auth;
            let authValue: string | null = null;
            if (auth) {
                authValue = resolveBinding(auth.value, state, t) as string;
            }

            wsRef.current = new WebSocket(wsUrl, protocol);

            wsRef.current.onopen = () => {
                if (protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') {
                    const initPayload = authValue && auth?.type === 'bearer' ? { Authorization: `Bearer ${authValue}` } : {};
                    wsRef.current?.send(JSON.stringify({ type: 'connection_init', payload: initPayload }));
                }
            };

            wsRef.current.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    data = event.data;
                }
                if ((protocol === 'graphql-ws' || protocol === 'graphql-transport-ws') && data.type === 'connection_ack') {
                    project.state?.webSocketKeys?.forEach(key => {
                        wsRef.current?.send(JSON.stringify({
                            type: protocol === 'graphql-ws' ? 'subscribe' : 'start',
                            id: key,
                            payload: { query: `subscription { stateUpdate(key: "${key}") }` },
                        }));
                    });
                } else if (data.type === 'data' || data.type === 'next') {
                    const key = data.payload?.data?.stateUpdate?.key;
                    const value = data.payload?.data?.stateUpdate?.value;
                    if (key && project.state?.webSocketKeys?.includes(key)) {
                        setState(key, value);
                    }
                }
            };

            wsRef.current.onclose = () => {
                wsRef.current = null;
                wsCleanupRef.current?.();
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error', error);
                wsRef.current?.close();
            };

            wsCleanupRef.current = () => {
                wsRef.current?.close();
            };
        }

        return () => {
            wsCleanupRef.current?.();
            wsRef.current = null;
        };
    }, [project.state?.webSocketEndpoint, project.state?.webSocketKeys, state, t]);

    return (
        <AppStateContext.Provider value={{ state, setState, t, form }}>
            {children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error("useAppState must be used within a StateProvider");
    }
    return context;
}

function setPath(obj: AnyObj, path: string, value: any) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = current[parts[i]] || {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

// === File: src/schema/types-bridges.ts ===

// Re-export your schema types with stable import for app code.
export type {
    AnyObj, UIDefinition, UIElement, UIScreenDef, UIProject, FormElement, DropdownElement, InputElement,
    EventHandler, DataSource, DataSourceRef, Binding, IRoute, IRouteList
} from "@/src/types";
export {
    ElementType, ActionType, Alignment, InputType, ButtonVariant, LayoutType
} from "@/src/types";


// === File: src/components/ui/accordion.tsx ===



function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }


// === File: src/components/ui/alert-dialog.tsx ===



function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

export {
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
}


// === File: src/components/ui/alert.tsx ===

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }


// === File: src/components/ui/aspect-ratio.tsx ===

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }


function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }



const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }



function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }


// === File: src/components/ui/calendar.tsx ===

"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/src/lib/utils"
import { Button, buttonVariants } from "./button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }


// === File: src/components/ui/card.tsx ===

import * as React from "react"

import { cn } from "@/src/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}


// === File: src/components/ui/carousel.tsx ===

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button } from "./button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}


// === File: src/components/ui/chart.tsx ===

"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/src/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                  const color =
                    itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
                    itemConfig.color
                  return color ? `  --color-${key}: ${color};` : null
                })
                .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
      typeof payload.payload === "object" &&
      payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export function Chart({ type, data, options = {}, className }: any) {
  const colors = options.colors || ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];

  return (
    <ChartContainer
      id={type}
      config={{ value: { label: options.yKey || "Value" } }}
      className={className}
    >
      <>
        {type === "bar" && (
          <RechartsPrimitive.BarChart data={data}>
            <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
            <RechartsPrimitive.XAxis dataKey={options.xKey || "name"} />
            <RechartsPrimitive.YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <RechartsPrimitive.Bar
              dataKey={options.yKey || "value"}
              fill={colors[0]}
            />
          </RechartsPrimitive.BarChart>
        )}

        {type === "line" && (
          <RechartsPrimitive.LineChart data={data}>
            <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
            <RechartsPrimitive.XAxis dataKey={options.xKey || "name"} />
            <RechartsPrimitive.YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <RechartsPrimitive.Line
              type="monotone"
              dataKey={options.yKey || "value"}
              stroke={colors[0]}
            />
          </RechartsPrimitive.LineChart>
        )}

        {type === "pie" && (
          <RechartsPrimitive.PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <RechartsPrimitive.Pie
              data={data}
              dataKey={options.valueKey || "value"}
              nameKey={options.xKey || "name"}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_: any, i: number) => (
                <RechartsPrimitive.Cell
                  key={i}
                  fill={colors[i % colors.length]}
                />
              ))}
            </RechartsPrimitive.Pie>
          </RechartsPrimitive.PieChart>
        )}
      </>
    </ChartContainer>
  );
}


// === File: src/components/ui/checkbox.tsx ===

"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }


// === File: src/components/ui/code-input.tsx ===

"use client";

import CodeMirror from "@uiw/react-codemirror";
import 'codemirror/keymap/sublime';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/theme/monokai.css';

interface CodeInputProps {
    value: string;
    onChange: (val: string) => void;
    language?: string;
    placeholder?: string;
    className?: string;
}

export function CodeInput({ value, onChange, placeholder, className }: CodeInputProps) {
    return (
        <div className={`border rounded-md overflow-hidden ${className || ""}`}>
            <CodeMirror
                value={value}
                height="300px"
                onChange={(val) => onChange(val)}
                basicSetup={{ autocompletion: true, lineNumbers: true, highlightActiveLine: true }}
            />
            {placeholder && !value && (
                <div className="absolute top-2 left-2 text-muted-foreground text-sm pointer-events-none">
                    {placeholder}
                </div>
            )}
        </div>
    );
}


// === File: src/components/ui/collapsible.tsx ===

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }


// === File: src/components/ui/command.tsx ===

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}


// === File: src/components/ui/context-menu.tsx ===

"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  )
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}


// === File: src/components/ui/create-select.tsx ===

"use client";

import * as React from "react";
import { PlusIcon, CheckIcon } from "lucide-react";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { EventHandler } from "@/src/types";
import { useActionHandler } from "@/src/schema/Actions";

export type CreateSelectOption = { value: string; label: string };

type CreateSelectProps = {
    className?: string;
    value: string;
    options: CreateSelectOption[];
    placeholder?: React.ReactNode;
    onChange: (value: string) => void;

    /** Action to run when a user creates a new entry */
    onCreateAction?: EventHandler;

    /**
     * Build the optimistic option from the text typed by the user.
     * Defaults to using the same string for value and label.
     */
    buildOption?: (raw: string) => CreateSelectOption;

    /** Optional: disable creation UI */
    disableCreate?: boolean;
};

export function CreateSelect({
    className,
    value,
    options,
    placeholder,
    onChange,
    onCreateAction,
    buildOption = (raw) => ({ value: raw, label: raw }),
    disableCreate,
}: CreateSelectProps) {
    const [localOptions, setLocalOptions] = React.useState<CreateSelectOption[]>(options);
    const [adding, setAdding] = React.useState(false);
    const [draft, setDraft] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const { runEventHandler } = useActionHandler({ runtime: {} as any });

    // Keep local options in sync when upstream changes
    React.useEffect(() => {
        setLocalOptions(options);
    }, [options]);

    const alreadyExists = React.useMemo(() => {
        const trimmed = draft.trim().toLowerCase();
        return trimmed.length > 0 && localOptions.some(o => o.label.toLowerCase() === trimmed || o.value.toLowerCase() === trimmed);
    }, [draft, localOptions]);

    const createOption = async () => {
        const raw = draft.trim();
        if (!raw || busy || alreadyExists) return;

        const optimistic = buildOption(raw);

        // optimistic add (so UI feels instant)
        setLocalOptions((prev) => [...prev, optimistic]);
        onChange(optimistic.value);

        if (!onCreateAction) {
            // no remote action; just collapse the row
            setAdding(false);
            setDraft("");
            return;
        }

        try {
            setBusy(true);

            // Fire your action pipeline. It will update app state if the
            // action was configured with responseType:"data" and a statePath,
            // and your form will re-render with those new options via bindings.
            await runEventHandler(
                {
                    ...onCreateAction,
                    // Pass the draft as { value, label } so the action can use it
                    params: {
                        ...(onCreateAction.params || {}),
                        newOption: { value: optimistic.value, label: optimistic.label },
                    },
                },
                // Also pass as dataOverride for APIs that read from action.dataOverride
                { value: optimistic.value, label: optimistic.label }
            );
        } catch {
            // roll back optimistic add on failure
            setLocalOptions((prev) => prev.filter((o) => o.value !== optimistic.value));
            // also clear the selected value if we had just set it to the failed one
            if (value === optimistic.value) onChange("");
        } finally {
            setBusy(false);
            setAdding(false);
            setDraft("");
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {localOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                            {value === opt.value ? <CheckIcon className="ml-2 size-3.5 opacity-60" /> : null}
                        </SelectItem>
                    ))}

                    {!disableCreate && (
                        <div className="border-t mt-1 pt-2 px-1">
                            {!adding ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                    onClick={() => setAdding(true)}
                                >
                                    <PlusIcon className="size-4" />
                                    Add new
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input
                                        autoFocus
                                        value={draft}
                                        placeholder="Type new option…"
                                        onChange={(e) => setDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                createOption();
                                            } else if (e.key === "Escape") {
                                                setAdding(false);
                                                setDraft("");
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={!draft.trim() || alreadyExists || busy}
                                        onClick={createOption}
                                    >
                                        {busy ? "Saving…" : "Add"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setAdding(false);
                                            setDraft("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}


// === File: src/components/ui/credit-cart-input.tsx ===

"use client";

import { CreditCard } from "lucide-react";
import { Input } from "@/src/components/ui/input";

interface CreditCardInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function CreditCardInput({ value, onChange }: CreditCardInputProps) {
    const formatCardNumber = (val: string) => {
        return val
            .replace(/\D/g, "")
            .replace(/(.{4})/g, "$1 ")
            .trim();
    };

    return (
        <div className="relative">
            <CreditCard className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                inputMode="numeric"
                placeholder="•••• •••• •••• ••••"
                className="pl-8"
                maxLength={19 + 3}
                value={value ?? ""}
                onChange={(e) => onChange(formatCardNumber(e.target.value))}
            />
        </div>
    );
}


// === File: src/components/ui/currency-input.tsx ===

import * as React from "react";
import { cn } from "@/src/lib/utils";

/**
 * CurrencyInput
 * - Pure React + Intl.NumberFormat (no external libs)
 * - Locale-aware formatting/parsing
 * - Emits number | undefined to parent
 * - Preserves caret position while typing
 * - Tailwind/shadcn Input look
 */
export type CurrencyInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "inputMode"
> & {
    value?: number | null;
    onChange?: (value: number | undefined) => void;
    locale?: string;          // e.g. "en-US" | "de-DE", defaults to browser
    currency?: string;        // e.g. "USD" | "EUR" — if provided, shows symbol
    minFractionDigits?: number; // default 2
    maxFractionDigits?: number; // default 2
    allowNegative?: boolean;    // default false
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    (
        {
            className,
            value,
            onChange,
            locale,
            currency,
            minFractionDigits = 2,
            maxFractionDigits = 2,
            allowNegative = false,
            placeholder,
            ...rest
        },
        ref
    ) => {
        const resolvedLocale =
            locale ||
            (typeof navigator !== "undefined" ? navigator.language : "en-US");

        // Build formatter
        const formatter = React.useMemo(() => {
            return new Intl.NumberFormat(resolvedLocale, {
                style: currency ? "currency" : "decimal",
                currency: currency || undefined,
                minimumFractionDigits: minFractionDigits,
                maximumFractionDigits: maxFractionDigits,
            });
        }, [resolvedLocale, currency, minFractionDigits, maxFractionDigits]);

        // Extract locale parts (decimal & group separator)
        const parts = React.useMemo(() => {
            const sample = formatter.format(1234567.89);
            const p = (Intl as any).NumberFormat.prototype.formatToParts
                ? formatter.formatToParts(1234567.89)
                : null;

            let decimal = ".";
            let group = ",";
            let minus = "-";
            let currencySymbol = "";

            if (p && Array.isArray(p)) {
                for (const part of p) {
                    if (part.type === "decimal") decimal = part.value;
                    if (part.type === "group") group = part.value;
                    if (part.type === "minusSign") minus = part.value;
                    if (part.type === "currency") currencySymbol = part.value;
                }
            } else {
                // Fallback guess from sample string
                // Find non-digits — last one is likely decimal
                const nonDigits = sample.replace(/\d/g, "");
                const last = nonDigits.slice(-1);
                if (last) decimal = last;
                group = nonDigits.replace(new RegExp(`[${escapeRegex(decimal)}]$`), "").slice(-1) || group;
            }

            return { decimal, group, minus, currencySymbol };
        }, [formatter]);

        const [display, setDisplay] = React.useState<string>("");

        // Keep internal display in sync with numeric value prop
        React.useEffect(() => {
            if (value === null || value === undefined || Number.isNaN(value)) {
                setDisplay("");
            } else {
                setDisplay(formatter.format(value));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [value, formatter]);

        // Helpers
        function escapeRegex(s: string) {
            return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }

        function toDigitsOnly(s: string) {
            return s.replace(/\D/g, "");
        }

        function parseLocalized(input: string): number | undefined {
            if (!input) return undefined;

            // Normalize: remove currency symbols & spaces
            let raw = input
                .replace(new RegExp(escapeRegex(parts.currencySymbol), "g"), "")
                .replace(/\s/g, "");

            // Handle negative
            let isNegative = false;
            if (raw.includes(parts.minus)) {
                isNegative = true;
                raw = raw.replace(new RegExp(escapeRegex(parts.minus), "g"), "");
            }

            // Remove group separators, unify decimal to '.'
            if (parts.group) {
                raw = raw.replace(new RegExp(escapeRegex(parts.group), "g"), "");
            }
            if (parts.decimal && parts.decimal !== ".") {
                raw = raw.replace(new RegExp(escapeRegex(parts.decimal), "g"), ".");
            }

            // Keep only one decimal point (first)
            const firstDot = raw.indexOf(".");
            if (firstDot !== -1) {
                raw =
                    raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
            }

            // Strip anything not digit or dot
            raw = raw.replace(/[^0-9.]/g, "");

            if (!raw) return undefined;

            let num = Number(raw);
            if (Number.isNaN(num)) return undefined;
            if (!allowNegative && num < 0) num = Math.abs(num);
            if (allowNegative && isNegative) num = -num;

            // Limit fraction digits
            if (maxFractionDigits >= 0) {
                const factor = Math.pow(10, maxFractionDigits);
                num = Math.round(num * factor) / factor;
            }

            return num;
        }

        // Caret preservation by tracking count of digits left of caret pre/post format
        function countDigitsLeftOfCaret(val: string, caret: number) {
            let count = 0;
            for (let i = 0; i < Math.min(caret, val.length); i++) {
                if (/\d/.test(val[i])) count++;
            }
            return count;
        }

        function findCaretFromDigitsCount(val: string, targetDigitsLeft: number) {
            if (targetDigitsLeft <= 0) return 0;
            let count = 0;
            for (let i = 0; i < val.length; i++) {
                if (/\d/.test(val[i])) {
                    count++;
                    if (count === targetDigitsLeft) return i + 1;
                }
            }
            return val.length;
        }

        const inputRef = React.useRef<HTMLInputElement>(null);
        React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
            const el = e.target;
            const prevDisplay = el.value;
            const prevCaret = el.selectionStart ?? prevDisplay.length;
            const prevDigitsLeft = countDigitsLeftOfCaret(prevDisplay, prevCaret);

            const numeric = parseLocalized(prevDisplay);
            const nextDisplay = numeric === undefined && prevDisplay.trim() === ""
                ? ""
                : numeric === undefined
                    ? prevDisplay // let user continue typing invalid intermediate states; don't jump too hard
                    : formatter.format(numeric);

            setDisplay(nextDisplay);

            // emit number or undefined
            onChange?.(numeric);

            // restore caret based on digits-left count
            requestAnimationFrame(() => {
                const el2 = inputRef.current;
                if (!el2) return;
                const nextCaret = findCaretFromDigitsCount(nextDisplay, prevDigitsLeft);
                el2.setSelectionRange(nextCaret, nextCaret);
            });
        }

        function handleBlur() {
            // On blur, snap/normalize formatting strictly
            const numeric = parseLocalized(display);
            const finalDisplay =
                numeric === undefined ? "" : formatter.format(numeric);
            setDisplay(finalDisplay);
            onChange?.(numeric);
        }

        return (
            <input
                ref={inputRef}
                inputMode="decimal"
                // pattern allows digits, localized decimal separator, minus, and spaces
                pattern={`[0-9${escapeRegex(parts.decimal)}${allowNegative ? escapeRegex(parts.minus) : ""} ]*`}
                placeholder={placeholder}
                value={display}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                    "border-input flex h-10 w-full rounded-md border bg-background px-3 py-2",
                    "text-sm shadow-sm placeholder:text-muted-foreground",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...rest}
            />
        );
    }
);

CurrencyInput.displayName = "CurrencyInput";


// === File: src/components/ui/datagrid.tsx ===

import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import { ColumnDef, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState, PaginationState, Row, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ArrowUpDown, MoreHorizontal, ChevronDown, Edit, Trash, Eye, Table } from "lucide-react"
import { Calendar } from "@/src/components/ui/calendar"
import { DatagGridCol, DataGridElement, InputType } from "@/src/types"
import { resolveBinding, deepResolveBindings, cn } from "@/src/lib/utils"
import { useActionHandler } from "@/src/schema/Actions"
import { useDataSources } from "@/src/schema/Datasource"
import { useAppState } from "@/src/schema/StateContext"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/src/components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "@/src/components/ui/popover"
import { Progress } from "@/src/components/ui/progress"
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "recharts"
import { Chart } from "./chart"
import { DialogHeader } from "./dialog"
import { FormResolver } from "./form-resolver"
import { Input } from "./input"
import { Skeleton } from "./skeleton"
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from "./table"
import { Button } from "./button"
import { Badge } from "./badge"


interface DataGridProps {
    element: DataGridElement
    runtime: any // From parent, for actions like navigate, etc.
}

export function DataGrid({ element, runtime }: DataGridProps) {
    const { state, setState, t } = useAppState()
    const { runEventHandler } = useActionHandler({ globalConfig: runtime.globalConfig, screen: runtime.screen, runtime })
    const dataSources = useDataSources({ dataSources: runtime.screen?.dataSources || [], globalConfig: runtime.globalConfig, screen: runtime.screen })

    const [sorting, setSorting] = useState<SortingState>(resolveBinding(element.sorting, state, t) || [])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(resolveBinding(element.filters, state, t) || [])
    const [globalFilter, setGlobalFilter] = useState<string>(resolveBinding(element.globalFilter, state, t) || "")
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(resolveBinding(element.columnVisibility, state, t) || {})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: resolveBinding(element.currentPage, state, t) ?? 0,
        pageSize: element.pageSize ?? 10,
    })
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [currentEditData, setCurrentEditData] = useState<any>(null)

    const data = useMemo(() => {
        if (element.serverSide && element.dataSourceId) {
            return dataSources[element.dataSourceId] || []
        }
        return resolveBinding(element.rows, state, t) || []
    }, [element, dataSources, state, t])

    const totalCount = resolveBinding(element.totalCount, state, t) ?? data.length

    const columns: ColumnDef<any>[] = useMemo(() => {
        const cols: ColumnDef<any>[] = []

        if (element.subRowsKey) {
            cols.push({
                id: "expander",
                header: () => null,
                cell: ({ row }) => (
                    row.getCanExpand() ? (
                        <Button
                            variant="ghost"
                            onClick={row.getToggleExpandedHandler()}
                            className="h-8 w-8 p-0"
                        >
                            {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-[-90deg]" />}
                        </Button>
                    ) : null
                ),
                size: 40,
            })
        }

        if (element.selectable) {
            cols.push({
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            })
        }

        element.columns.forEach((col: DatagGridCol) => {
            const resolvedCol = deepResolveBindings(col, state, t) as DatagGridCol
            cols.push({
                accessorKey: resolvedCol.key,
                header: ({ column }) => {
                    return resolvedCol.sortable ? (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            {resolveBinding(resolvedCol.header, state, t)}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        resolvedCol.header
                    )
                },
                cell: ({ row, getValue }) => {
                    const value = getValue()
                    const isEditing = (element.editingMode === 'cell' && editingCell?.rowId === row.id && editingCell?.colKey === resolvedCol.key) ||
                        (element.editingMode === 'row' && editingRowId === row.id)

                    if (isEditing && resolvedCol.editable) {
                        return renderEditor(resolvedCol, value, row.original, resolvedCol.key)
                    }

                    return renderCell(resolvedCol, value, row.original)
                },
                filterFn: getFilterFn(resolvedCol.filterType),
                size: Number(resolvedCol.width) || undefined,
                minSize: Number(resolvedCol.minWidth) || undefined,
                maxSize: Number(resolvedCol.maxWidth) || undefined,
                meta: {
                    align: resolvedCol.align,
                    cellClass: resolvedCol.cellClass,
                    headerClass: resolvedCol.headerClass,
                    footer: resolvedCol.footer,
                },
                enableHiding: !resolvedCol.hidden,
                enableResizing: resolvedCol.resizable,
                enablePinning: !!resolvedCol.pinned,
            })
        })

        if (element.rowActions?.length) {
            cols.push({
                id: "actions",
                cell: ({ row }) => {
                    const actions = deepResolveBindings(element.rowActions, state, t) as Array<any>
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {actions.map((action) => {
                                    const show = action.condition ? resolveBinding(action.condition, { ...state, row: row.original }, t) : true
                                    if (!show) return null
                                    return (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => runEventHandler(action.onClick, { row: row.original })}
                                        >
                                            {action.icon && <span className="mr-2">{action.icon}</span>}
                                            {action.label}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
                size: 60,
            })
        }

        return cols
    }, [element, state, t, editingCell, editingRowId])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater
            setSorting(newSorting)
            if (element.onSortChange) runEventHandler(element.onSortChange, { sorting: newSorting })
        },
        onColumnFiltersChange: (updater) => {
            const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
            setColumnFilters(newFilters)
            if (element.onFilterChange) runEventHandler(element.onFilterChange, { filters: newFilters })
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: element.infinite ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: (updater) => {
            const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater
            setColumnVisibility(newVisibility)
            if (element.onColumnVisibilityChange) runEventHandler(element.onColumnVisibilityChange, { visibility: newVisibility })
        },
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
            setRowSelection(newSelection)
            if (element.onSelectionChange) runEventHandler(element.onSelectionChange, { selection: newSelection })
        },
        getExpandedRowModel: getExpandedRowModel(),
        onPaginationChange: setPagination,
        getSubRows: element.subRowsKey
            ? (row) => element.subRowsKey !== undefined ? row[element.subRowsKey as keyof typeof row] : undefined
            : undefined,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            pagination,
            expanded: expandedRows,
        },
        enableColumnResizing: element.resizableColumns,
        enablePinning: true,
        manualPagination: element.serverSide,
        manualSorting: element.serverSide,
        manualFiltering: element.serverSide,
        rowCount: totalCount,
        pageCount: element.serverSide ? Math.ceil(totalCount / pagination.pageSize) : undefined,
    })

    const { rows } = table.getRowModel()
    const rowVirtualizer = useVirtualizer({
        count: element.infinite ? rows.length + 1 : rows.length, // +1 for loading row in infinite
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => element.virtualRowHeight ?? 48,
        overscan: 20,
    })

    const tableContainerRef = React.useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (element.infinite && rowVirtualizer.getVirtualItems().length > 0) {
            const lastItem = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]
            if (lastItem && lastItem.index >= rows.length - 1 && element.onLoadMore) {
                runEventHandler(element.onLoadMore)
            }
        }
    }, [rowVirtualizer.getVirtualItems()])

    const handleCellEdit = (rowId: string, colKey: string, value: any) => {
        // Update data
        if (element.onCellEdit) {
            runEventHandler(element.onCellEdit, { rowId, colKey, value })
        }
        setEditingCell(null)
    }

    const startEditing = (row: Row<any>, col?: DatagGridCol) => {
        if (element.editingMode === 'modal' && element.editForm) {
            setCurrentEditData(row.original)
            setModalOpen(true)
        } else if (element.editingMode === 'row') {
            setEditingRowId(row.id)
        } else if (element.editingMode === 'cell' && col) {
            setEditingCell({ rowId: row.id, colKey: col.key })
        }
    }

    const handleModalSubmit = (data: any) => {
        if (element.onCellEdit) { // Reuse onCellEdit for row edit
            runEventHandler(element.onCellEdit, { rowId: currentEditData.id, data })
        }
        setModalOpen(false)
    }

    const renderCell = (col: DatagGridCol, value: any, rowData: any) => {
        let cellValue = value
        const cellClass = typeof col.cellClass === 'function' ? col.cellClass(rowData) :
            Array.isArray(col.cellClass) ? col.cellClass.find(c => resolveBinding(c.condition, { ...state, row: rowData }, t))?.class :
                resolveBinding(col.cellClass, { ...state, row: rowData }, t)

        switch (col.renderer) {
            case 'image':
                return <img src={value} alt="" className="h-8 w-8 object-cover" />
            case 'link':
                return <a href={value} className="text-blue-600 hover:underline">{value}</a>
            case 'badge':
                return <Badge variant="outline">{value}</Badge>
            case 'progress':
                return <Progress value={Number(value)} className="w-[60%]" />
            case 'chart':
                return <Chart chartType={col.chartConfig?.type || 'bar'} data={rowData[col.chartConfig?.dataKey || '']} options={col.chartConfig?.options} />
            case 'checkbox':
                return <Checkbox checked={!!value} disabled />
            case 'custom':
                // Assume customRender is a component name, resolve from registry or something
                const CustomComp = col.customRender ? runtime.customComponents?.[col.customRender] : null
                return CustomComp ? <CustomComp data={rowData} /> : value
            default:
                return value
        }
    }

    const renderEditor = (col: DatagGridCol, value: any, rowData: any, colKey: string) => {
        const handleChange = (newValue: any) => handleCellEdit(rowData.id, colKey, newValue)

        switch (col.editorType || col.filterType || 'text') {
            case InputType.text:
            case InputType.email:
            case InputType.password:
            case InputType.number:
            case InputType.textarea:
                return <Input type={col.editorType} defaultValue={value} onBlur={(e) => handleChange(e.target.value)} autoFocus />
            case InputType.select:
            case InputType.multiselect:
                return (
                    <Select defaultValue={value} onValueChange={handleChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.isArray(col.options)
                                ? col.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{resolveBinding(opt.label, state, t)}</SelectItem>)
                                : null}
                        </SelectContent>
                    </Select>
                )
            case InputType.date:
            case InputType.datetime_local:
                return <Input type={col.editorType} defaultValue={value} onChange={(e) => handleChange(e.target.value)} />
            case InputType.checkbox:
            case InputType.switch:
                return <Switch checked={value} onCheckedChange={handleChange} />
            case InputType.color:
                return <Input type="color" defaultValue={value} onChange={(e) => handleChange(e.target.value)} />
            // Add more as needed
            default:
                return <Input defaultValue={value} onBlur={(e) => handleChange(e.target.value)} autoFocus />
        }
    }

    const getFilterFn = (type?: string) => {
        switch (type) {
            case 'number':
            case 'range':
                return 'inNumberRange'
            case 'date':
            case 'datetime':
            case 'time':
                return 'equals'
            case 'bool':
                return 'equals'
            default:
                return 'includesString'
        }
    }

    const renderFilter = (column: any, colDef: DatagGridCol) => {
        const filterValue = column.getFilterValue()

        switch (colDef.filterType) {
            case 'text':
                return <Input placeholder={`Filter ${colDef.header}...`} value={filterValue ?? ''} onChange={e => column.setFilterValue(e.target.value)} />
            case 'select':
            case 'multi-select':
                return (
                    <Select value={filterValue} onValueChange={v => column.setFilterValue(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder={`Filter ${colDef.header}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.isArray(colDef.options)
                                ? colDef.options.map(opt => <SelectItem key={opt.value} value={opt.value}>{resolveBinding(opt.label, state, t)}</SelectItem>)
                                : null}
                        </SelectContent>
                    </Select>
                )
            case 'date':
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">{filterValue ? filterValue.toString() : `Filter ${colDef.header}`}</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Calendar
                                selected={filterValue}
                                onSelect={(date: any) => column.setFilterValue(date)}
                                mode="single"
                                required
                            />
                        </PopoverContent>
                    </Popover>
                )
            case 'bool':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch checked={filterValue} onCheckedChange={v => column.setFilterValue(v)} />
                        <Label>{resolveBinding(colDef.header, state, t)}</Label>
                    </div>
                )
            case 'number':
            case 'range':
                return <Input type="number" placeholder={`Filter ${colDef.header}...`} value={filterValue ?? ''} onChange={e => column.setFilterValue(e.target.value)} />
            default:
                return null
        }
    }

    const rowClass = (row: Row<any>) => {
        if (typeof element.rowClass === 'function') return element.rowClass(row.original)
        if (Array.isArray(element.rowClass)) return element.rowClass.find(c => resolveBinding(c.condition, { ...state, row: row.original }, t))?.class
        return resolveBinding(element.rowClass, { ...state, row: row.original }, t)
    }

    const loading = resolveBinding(element.loading, state, t) ?? false
    const emptyMessage = resolveBinding(element.emptyMessage, state, t) ?? "No data available"

    return (
        <div
            ref={tableContainerRef}
            className={cn("rounded-md border overflow-auto", element.styles?.className)}
            style={{ height: element.height ? `${element.height}px` : element.autoHeight ? 'auto' : '400px' }}
        >
            <div className="flex items-center py-4 px-4 space-x-4">
                <Input
                    placeholder="Search..."
                    value={globalFilter ?? ""}
                    onChange={(event) => {
                        setGlobalFilter(event.target.value)
                        if (element.onGlobalFilterChange) runEventHandler(element.onGlobalFilterChange, { globalFilter: event.target.value })
                    }}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.columnDef.header as string}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {element.groupActions?.map(action => (
                    <Button
                        key={action.id}
                        variant={action.variant as any || 'default'}
                        onClick={() => runEventHandler(action.onClick, { selectedRows: table.getSelectedRowModel().rows.map(r => r.original) })}
                    >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {resolveBinding(action.label, state, t)}
                    </Button>
                ))}
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const meta = header.column.columnDef.meta as any
                                return (
                                    <TableHead
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{ width: header.getSize(), textAlign: meta?.align }}
                                        className={cn(meta?.headerClass)}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanFilter() ? (
                                            <div className="mt-2">
                                                {renderFilter(header.column, element.columns.find(c => c.key === header.id) as DatagGridCol)}
                                            </div>
                                        ) : null}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: pagination.pageSize }).map((_, i) => (
                            <TableRow key={i}>
                                {table.getVisibleLeafColumns().map((col, j) => (
                                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length ? (
                        rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = rows[virtualRow.index]
                            if (!row) return null
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(rowClass(row))}
                                    onClick={() => {
                                        if (element.onRowClick) runEventHandler(element.onRowClick, { row: row.original })
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef.meta as any
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                style={{ textAlign: meta?.align }}
                                                className={cn(typeof meta?.cellClass === 'function' ? meta.cellClass(row.original) : meta?.cellClass)}
                                                onDoubleClick={() => {
                                                    const colDef = element.columns.find(c => c.key === cell.column.id)
                                                    if (colDef?.editable) startEditing(row, colDef)
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                    {element.infinite && loading && (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center">
                                Loading more...
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {!element.infinite && (
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            )}
            {element.editingMode === 'modal' && element.editForm && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Row</DialogTitle>
                        </DialogHeader>
                        <FormResolver
                            element={element.editForm}
                            defaultData={currentEditData}
                            onFormSubmit={handleModalSubmit}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

// === File: src/components/ui/dialog.tsx ===

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}


// === File: src/components/ui/drawer.tsx ===

"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/src/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}


// === File: src/components/ui/dropdown-menu.tsx ===

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}


// === File: src/components/ui/form-group.tsx ===


/** ---------- Group helpers (schema-driven) ---------- */
type FormFieldUnion = FormFieldType & {
    tabId?: string;      // optional metadata on field
    stepId?: string;     // optional metadata on field
    meta?: { tabId?: string; stepId?: string }; // if you prefer meta container
};

const getFieldGroupId = (f: FormFieldUnion, kind: "tab" | "step") =>
    kind === "tab" ? (f.tabId ?? f.meta?.tabId) : (f.stepId ?? f.meta?.stepId);

function unique<T>(arr: T[]) {
    return [...new Set(arr)];
}

function namesForGroup(
    formFields: FormFieldType[],
    kind: "tab" | "step",
    groupId: string
): string[] {
    return formFields
        .filter((f) => getFieldGroupId(f as FormFieldUnion, kind) === groupId)
        .flatMap((f) =>
            f.fieldType === FieldType.input ? [((f as any).input?.name as string)].filter(Boolean) : []
        );
}

function resolveLabel(val: any, state: AnyObj, t: (k: string) => string): string {
    const out = resolveBinding(val, state, t);
    return typeof out === "string" ? out : String(out ?? "");
}

export function TabsBar({
    tabs,
    activeId,
    onTab,
    className,
}: {
    tabs: { id: string; label: string }[];
    activeId: string;
    onTab: (id: string) => void;
    className?: string;
}) {
    return (
        <div className={className}>
            <div className="flex gap-4 border-b">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => onTab(t.id)}
                        data-active={activeId === t.id ? "true" : "false"}
                        className="pb-2"
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function Stepper({
    steps,
    currentIndex,
    className,
}: {
    steps: { id: string; label: string }[];
    currentIndex: number;
    className?: string;
}) {
    return (
        <ol className={className}>
            <div className="flex items-center justify-between w-full mb-4">
                {steps.map((s, i) => (
                    <li key={s.id} className="flex-1 text-center" data-active={i <= currentIndex ? "true" : "false"}>
                        <div className="flex flex-col items-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1">{i + 1}</div>
                            <span className="text-xs">{s.label}</span>
                        </div>
                    </li>
                ))}
            </div>
        </ol>
    );
}

export function TabGroup({
    group,
    form,
    renderField,
}: {
    group: FormElement;
    form: any;
    renderField: (f: FormFieldType) => React.ReactNode;
}) {
    const { state, t } = useAppState();

    // Prefer explicit group.tabs; otherwise derive from fields' tabId
    const derivedTabIds = unique(
        group.formFields
            .map((f) => getFieldGroupId(f as FormFieldUnion, "tab"))
            .filter(Boolean) as string[]
    );
    const tabs =
        (group as any).tabs?.length
            ? (group as any).tabs.map((tb: any) => ({
                id: tb.id,
                label: resolveLabel(tb.label ?? tb.id, state, t),
            }))
            : derivedTabIds.map((id) => ({ id, label: id }));

    const [activeId, setActiveId] = useState<string>(tabs[0]?.id || "tab0");

    const onChangeTab = async (id: string) => {
        // validate only current tab’s fields (if any); else allow change
        const currentNames = namesForGroup(group.formFields, "tab", activeId);
        const ok = currentNames.length ? await form.trigger(currentNames) : true;
        if (ok) setActiveId(id);
    };

    return (
        <div className={classesFromStyleProps(group.styles)}>
            <TabsBar tabs={tabs} activeId={activeId} onTab={onChangeTab} />
            <div className="mt-4">
                {group.formFields
                    .filter((f) => getFieldGroupId(f as FormFieldUnion, "tab") === activeId)
                    .map((f) => (
                        <div key={f.id}>{renderField(f)}</div>
                    ))}
            </div>
        </div>
    );
}

export function WizardGroup({
    group,
    form,
    renderField,
}: {
    group: FormElement;
    form: any;
    renderField: (f: FormFieldType) => React.ReactNode;
}) {
    const { state, t } = useAppState();

    // Prefer explicit group.steps; otherwise derive from fields' stepId
    const derivedStepIds = unique(
        group.formFields
            .map((f) => getFieldGroupId(f as FormFieldUnion, "step"))
            .filter(Boolean) as string[]
    );
    const steps =
        (group as any).steps?.length
            ? (group as any).steps.map((s: any, i: number) => ({
                id: s.id ?? `step-${i}`,
                label: resolveLabel(s.label ?? s.id ?? `Step ${i + 1}`, state, t),
            }))
            : derivedStepIds.map((id, i) => ({ id, label: `Step ${i + 1}` }));

    const [current, setCurrent] = useState(0);

    const goNext = async () => {
        const stepId = steps[current]?.id;
        const names = namesForGroup(group.formFields, "step", stepId);
        const ok = names.length ? await form.trigger(names) : await form.trigger(); // fallback to all
        if (ok) setCurrent((c) => Math.min(c + 1, steps.length - 1));
    };
    const goPrev = () => setCurrent((c) => Math.max(0, c - 1));

    return (
        <div className={classesFromStyleProps(group.styles)}>
            <Stepper steps={steps} currentIndex={current} />
            <div className="space-y-4">
                {group.formFields
                    .filter((f) => getFieldGroupId(f as FormFieldUnion, "step") === steps[current]?.id)
                    .map((f) => (
                        <div key={f.id}>{renderField(f)}</div>
                    ))}
            </div>
            <div className="mt-4 flex justify-between">
                <Button type="button" onClick={goPrev} disabled={current === 0}>
                    {t("back")}
                </Button>
                {current < steps.length - 1 ? (
                    <Button type="button" onClick={goNext}>
                        {t("next")}
                    </Button>
                ) : (
                    <Button type="submit">{t("submit")}</Button>
                )}
            </div>
        </div>
    );
}


// === File: src/components/ui/form-resolver.tsx ===

"use client";

import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

import {
    AnyObj,
    ElementType,
    FormElement,
    InputElement,
    UIElement,
    InputType,
    FieldType,
    FormField as FormFieldType,
    FormGroupType,
} from "@/src/types";
import { useAppState } from "@/src/schema/StateContext";
import { useActionHandler } from "@/src/schema/Actions";
import { resolveBinding, classesFromStyleProps, luhnCheck } from "@/src/lib/utils";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/src/components/ui/select";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/src/components/ui/form";
import { Slider } from "@/src/components/ui/slider";
import { Multiselect, type MultiSelectOption } from "@/src/components/ui/multiselect";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";
import { Calendar } from "./calendar";
import { CreateSelect, CreateSelectOption } from "./create-select";
import { CreditCardInput } from "./credit-cart-input";
import { RatingInput } from "./rating-input";
import { SignatureInput } from "./signature-input";
import { TagsInput } from "./tags-input";
import { RichTextInput } from "./richtext-input";
import { CodeInput } from "./code-input";
import { MarkdownInput } from "./markdown-input";
import { CurrencyInput } from "./currency-input";
import { TabGroup, WizardGroup } from "./form-group";

/** ---------- Helpers ---------- */
type SelectOption = { value: string; label: string };

const numberCoerce = (val: unknown) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "number") return val;
    const n = Number(val);
    return Number.isNaN(n) ? val : n;
};

/** ---------- UI-Only Elements ---------- */
function Heading({ text }: { text: string }) {
    return <h2 className="text-2xl font-semibold">{text}</h2>;
}
function Subheading({ text }: { text: string }) {
    return <h3 className="text-lg font-medium text-muted-foreground">{text}</h3>;
}
function Description({ text }: { text: string }) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
}
function Divider() {
    return <div className="my-4 border-t border-border" />;
}
function HelpMessage({ text }: { text: string }) {
    return <p className="text-xs text-muted-foreground italic">{text}</p>;
}
function ContainerWrapper({ children }: { children: React.ReactNode }) {
    return <div className="grid gap-4">{children}</div>;
}
function CardWrapper({ children }: { children: React.ReactNode }) {
    return <div className="rounded-lg border bg-card p-4 shadow-sm">{children}</div>;
}
interface FormResolverProps {
    element: FormElement;
    defaultData?: Record<string, any>;
    onFormSubmit?: (data: Record<string, any>) => void;
}
export function FormResolver({ element, defaultData, onFormSubmit }: FormResolverProps) {
    const { state, t } = useAppState();
    const { runEventHandler } = useActionHandler({ runtime: {} as any });

    const formSchema = useMemo(() => {
        const shape: Record<string, z.ZodTypeAny> = {};

        for (const f of element.formFields) {
            if (f.fieldType !== FieldType.input) continue;
            const input = f.input as InputElement;

            const err = (msg: string) =>
                t((input.validation?.errorMessage as string) || msg);

            switch (input.inputType) {
                case InputType.text:
                case InputType.email:
                case InputType.password:
                case InputType.textarea: {
                    let s = z.string()
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    if (input.validation?.regex)
                        s = s.regex(new RegExp(input.validation.regex), err("invalid_format"));
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_short"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_long"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.number: {
                    let s: any = z.preprocess(numberCoerce, z.number());
                    if (input.validation?.required)
                        s = s.refine((val: any) => val !== undefined, err("field_required"));
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.checkbox: {
                    let v = z.boolean();
                    if (input.validation?.required)
                        v = v.refine((val) => val === true, err("must_be_checked"));
                    shape[input.name] = v;
                    break;
                }

                case InputType.select: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.multiselect: {
                    let s = z.array(z.string());
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.image: {
                    let v = z
                        .any()
                        .refine(
                            (val) =>
                                val == null ||
                                (Array.isArray(val) &&
                                    val.every((v) => v instanceof File && v.type.startsWith("image/"))),
                            t("invalid_image_input")
                        );
                    if (input.validation?.required)
                        v = v.refine(
                            (val) => Array.isArray(val) && val.length > 0,
                            t("image_required")
                        );
                    shape[input.name] = v;
                    break;
                }

                case InputType.range: {
                    let s = z.number();
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.search: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.slider: {
                    let s = z.number();
                    if (input.validation?.min !== undefined)
                        s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined)
                        s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.file: {
                    // We keep files as File[] (from react-dropzone)
                    let v = z
                        .any()
                        .refine(
                            (val) =>
                                val == null ||
                                (Array.isArray(val) && val.every((v) => v instanceof File)),
                            t("invalid_file_input")
                        );
                    if (input.validation?.required)
                        v = v.refine(
                            (val) => Array.isArray(val) && val.length > 0,
                            t("file_required")
                        );
                    shape[input.name] = v;
                    break;
                }
                case InputType.date:
                case InputType.datetime_local:
                case InputType.time:
                case InputType.month:
                case InputType.week: {
                    let s = z.string(); // ISO string
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.otp: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("otp_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.voice: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, t("voice_input_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.radio: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.url: {
                    let s = z.string().url(err("invalid_url"));
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.tel: {
                    let s = z.string().regex(/^\+?[0-9\s\-()]+$/, err("invalid_phone"));
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.color: {
                    let s = z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, err("invalid_color"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.toggle:
                case InputType.switch: {
                    let s = z.boolean();
                    if (input.validation?.required)
                        s = s.refine((val) => val === true, err("must_be_checked"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.rating: {
                    let s = z.number().min(0).max(5);
                    if (input.validation?.required)
                        s = s.refine((val) => val > 0, err("rating_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.signature: {
                    let s = z.string(); // base64 or URL to signature image
                    if (input.validation?.required) s = s.min(1, err("signature_required"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.credit_card: {
                    let s = z.string()
                        .regex(/^\d{13,19}$/, err("invalid_card_number"))
                        .refine((val) => luhnCheck(val), err("invalid_card_number"));
                    shape[input.name] = s;
                    break;
                }
                case InputType.richtext:
                case InputType.code:
                case InputType.markdown: {
                    let s = z.string();
                    if (input.validation?.required) s = s.min(1, err("field_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.tags: {
                    let s = z.array(z.string());
                    if (input.validation?.required) s = s.min(1, err("tags_required"));
                    shape[input.name] = s;
                    break;
                }

                case InputType.currency: {
                    let s = z.number();
                    if (input.validation?.min !== undefined) s = s.min(input.validation.min, err("too_small"));
                    if (input.validation?.max !== undefined) s = s.max(input.validation.max, err("too_large"));
                    shape[input.name] = s;
                    break;
                }

                default:
                    shape[input.name] = z.any();
            }

        }

        return z.object(shape);
    }, [element.formFields, t]);


    const defaultValues = defaultData ? defaultData : useMemo(() => {
        const vals: AnyObj = {};
        for (const f of element.formFields) {
            if (f.fieldType !== FieldType.input) continue;
            const input = f.input as InputElement;
            let def: any = resolveBinding(input.value, state, t);

            switch (input.inputType) {
                case InputType.checkbox:
                    def = Boolean(def);
                    break;
                case InputType.number:
                    def = numberCoerce(def);
                    break;
                case InputType.file:
                    def = [];
                    break;
                case InputType.multiselect:
                    def = Array.isArray(def) ? def : [];
                    break;
                case InputType.slider: {
                    const min = input.min ?? 0;
                    def = typeof def === "number" ? def : min;
                    break;
                }
                default:
                    if (def === undefined || def === null) def = "";
            }
            vals[input.name] = def;
        }
        return vals as FormValues;
    }, [element.formFields, state, t]);

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: "onSubmit",
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        if (onFormSubmit) {
            onFormSubmit(data);
        } else {
            runEventHandler(element.onSubmit, data as AnyObj);
        }
    };

    const renderField = (f: FormFieldType) => {
        if (f.fieldType === FieldType.input) {
            return renderInputField(f.input);
        }

        switch (f.fieldType) {
            case FieldType.heading:
                return <Heading key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.subheading:
                return <Subheading key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.description:
                return <Description key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.help:
                return <HelpMessage key={f.id} text={resolveBinding(f.element.name, state, t)} />;
            case FieldType.divider:
                return <Divider key={f.id} />;
            case FieldType.card:
                return <CardWrapper key={f.id}>{f.element.children?.map(renderField as any)}</CardWrapper>;
            default:
                return null;
        }
    };

    const renderInputField = (field: UIElement) => {
        if (field.type !== ElementType.input) return null;
        const input = field as InputElement;
        const name = input.name as keyof FormValues;

        return (
            <FormField
                key={input.id}
                control={form.control}
                name={name}
                render={({ field: formField }) => {
                    const label =
                        input.label != null ? resolveBinding(input.label, state, t) : null;
                    const placeholder = resolveBinding(input.placeholder, state, t);

                    return (
                        <FormItem className={classesFromStyleProps(input.styles)}>
                            {label && <FormLabel>{label}</FormLabel>}
                            <FormControl>
                                {(() => {
                                    switch (input.inputType) {

                                        case InputType.number: {
                                            return (
                                                <Input
                                                    type="number"
                                                    placeholder={placeholder}
                                                    value={
                                                        formField.value === undefined || formField.value === null
                                                            ? ""
                                                            : String(formField.value)
                                                    }
                                                    onChange={(e) =>
                                                        formField.onChange(numberCoerce(e.target.value))
                                                    }
                                                    inputMode="decimal"
                                                />
                                            );
                                        }

                                        case InputType.textarea: {
                                            return <Textarea placeholder={placeholder}
                                                value={(formField.value as string) ?? ""}
                                                onChange={formField.onChange} />;
                                        }

                                        case InputType.checkbox: {
                                            return (
                                                <Checkbox
                                                    checked={Boolean(formField.value)}
                                                    onCheckedChange={(checked) =>
                                                        formField.onChange(Boolean(checked))
                                                    }
                                                />
                                            );
                                        }

                                        case InputType.select: {
                                            const options: SelectOption[] =
                                                (resolveBinding(input.options, state, t) as
                                                    | SelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Select
                                                    value={(formField.value as string) ?? ""}
                                                    onValueChange={(v) => formField.onChange(v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {options.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            );
                                        }

                                        case InputType.multiselect: {
                                            const options: MultiSelectOption[] =
                                                (resolveBinding(input.options, state, t) as
                                                    | MultiSelectOption[]
                                                    | undefined) || [];
                                            return (
                                                <Multiselect
                                                    options={options}
                                                    value={(formField.value as string[]) || []}
                                                    onChange={(vals) => formField.onChange(vals)}
                                                    placeholder={placeholder}
                                                />
                                            );
                                        }

                                        case InputType.slider: {
                                            const min = input.min ?? 0;
                                            const max = input.max ?? 100;
                                            const step = input.step ?? 1;

                                            const current = (formField.value as number) ?? min;

                                            return (
                                                <div className="flex flex-col gap-2">
                                                    <Slider
                                                        defaultValue={[current]}
                                                        min={min}
                                                        max={max}
                                                        step={step}
                                                        onValueChange={(vals) => formField.onChange(vals[0])}
                                                    />
                                                    <div className="text-xs text-muted-foreground">
                                                        {current}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        case InputType.file: {
                                            return (
                                                <DropzoneField
                                                    multiple={!!input.multiple}
                                                    accept={input.accept}
                                                    maxSize={input.maxSize}
                                                    files={(formField.value as File[]) || []}
                                                    onFiles={(files) => formField.onChange(files)}
                                                />
                                            );
                                        }

                                        case InputType.voice: {
                                            const {
                                                transcript,
                                                listening,
                                                resetTranscript,
                                                browserSupportsSpeechRecognition,
                                            } = useSpeechRecognition();

                                            const start = () => {
                                                resetTranscript();
                                                SpeechRecognition.startListening({
                                                    continuous: true,
                                                    language: "en-US",
                                                });
                                            };
                                            const stop = () => {
                                                SpeechRecognition.stopListening();
                                                formField.onChange(transcript);
                                            };

                                            if (!browserSupportsSpeechRecognition) {
                                                return (
                                                    <div className="text-sm text-muted-foreground">
                                                        {t("voice_not_supported")}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant={listening ? "destructive" : "outline"}
                                                            onClick={listening ? stop : start}
                                                        >
                                                            {listening ? t("stop_recording") : t("start_recording")}
                                                        </Button>
                                                        {formField.value ? (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    resetTranscript();
                                                                    formField.onChange("");
                                                                }}
                                                            >
                                                                {t("clear")}
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {transcript || t("voice_input_placeholder")}
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        value={(formField.value as string) ?? ""}
                                                        readOnly
                                                    />
                                                </div>
                                            );
                                        }
                                        case InputType.date: {
                                            const value = formField.value ? new Date(formField.value as string) : undefined;
                                            return (
                                                <Calendar
                                                    mode="single"
                                                    selected={value}
                                                    onSelect={(date) =>
                                                        formField.onChange(date ? date.toISOString().split("T")[0] : "")
                                                    }
                                                />
                                            );
                                        }

                                        case InputType.datetime_local: {
                                            return (
                                                <Input
                                                    type="datetime-local"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.time: {
                                            return (
                                                <Input
                                                    type="time"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.month: {
                                            return (
                                                <Input
                                                    type="month"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.week: {
                                            return (
                                                <Input
                                                    type="week"
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.radio: {
                                            const options: SelectOption[] =
                                                (resolveBinding(input.options, state, t) as SelectOption[]) || [];
                                            return (
                                                <div className="space-y-2">
                                                    {options.map((opt) => (
                                                        <label key={opt.value} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={name as string}
                                                                value={opt.value}
                                                                checked={formField.value === opt.value}
                                                                onChange={() => formField.onChange(opt.value)}
                                                            />
                                                            {opt.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        case InputType.color: {
                                            return (
                                                <Input
                                                    type="color"
                                                    value={(formField.value as string) ?? "#000000"}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.toggle:
                                        case InputType.switch: {
                                            return (
                                                <Checkbox
                                                    checked={Boolean(formField.value)}
                                                    onCheckedChange={(checked) => formField.onChange(Boolean(checked))}
                                                />
                                            );
                                        }


                                        case InputType.rating:
                                            return <RatingInput value={(formField.value as any) ?? 0} onChange={formField.onChange} />;

                                        case InputType.signature:
                                            return <SignatureInput value={formField.value as string} onChange={formField.onChange} />;

                                        case InputType.tags:
                                            return <TagsInput value={formField.value as string[] ?? []} onChange={formField.onChange} />;

                                        case InputType.credit_card:
                                            return <CreditCardInput value={formField.value as string ?? ""} onChange={formField.onChange} />;

                                        case InputType.image: {
                                            return (
                                                <DropzoneField
                                                    multiple={!!input.multiple}
                                                    accept="image/*"
                                                    maxSize={input.maxSize}
                                                    files={(formField.value as File[]) || []}
                                                    onFiles={(files) => formField.onChange(files)}
                                                />
                                            );
                                        }

                                        case InputType.range: {
                                            const min = input.min ?? 0;
                                            const max = input.max ?? 100;
                                            const step = input.step ?? 1;
                                            const current = (formField.value as number) ?? min;
                                            return (
                                                <input
                                                    type="range"
                                                    min={min}
                                                    max={max}
                                                    step={step}
                                                    value={current}
                                                    onChange={(e) => formField.onChange(Number(e.target.value))}
                                                    className="w-full"
                                                />
                                            );
                                        }

                                        case InputType.search: {
                                            return (
                                                <Input
                                                    type="search"
                                                    placeholder={placeholder}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                        }

                                        case InputType.richtext:
                                            return (
                                                <RichTextInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );

                                        case InputType.code:
                                            return (
                                                <CodeInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );
                                        case InputType.markdown:
                                            return (
                                                <MarkdownInput
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                    placeholder={placeholder}
                                                />
                                            );
                                        case InputType.currency: {
                                            return (
                                                <CurrencyInput
                                                    value={(formField.value as number | undefined)}
                                                    onChange={(num) => formField.onChange(num)}
                                                    placeholder={placeholder ?? "0.00"}
                                                    // Optional: pass locale/currency from schema if you have them
                                                    // locale={resolveBinding(input.locale, state, t) as string | undefined}
                                                    currency={resolveBinding(input.currency, state, t) as string | undefined}
                                                    minFractionDigits={input.minFractionDigits || 2}
                                                    maxFractionDigits={input.maxFractionDigits || 2}
                                                />
                                            );
                                        }
                                        case InputType.otp: {
                                            return (
                                                <InputOTP
                                                    maxLength={6}
                                                    value={formField.value as string}
                                                    onChange={formField.onChange}
                                                >
                                                    <InputOTPGroup>
                                                        {Array.from({ length: 6 }).map((_, i) => (
                                                            <InputOTPSlot key={i} index={i} />
                                                        ))}
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            );
                                        }
                                        case InputType.createselect: {
                                            const options: CreateSelectOption[] =
                                                (resolveBinding(input.options, state, t) as CreateSelectOption[]) || [];

                                            return (
                                                <CreateSelect
                                                    value={(formField.value as string) ?? ""}
                                                    options={options}
                                                    placeholder={placeholder}
                                                    onChange={(val) => formField.onChange(val)}
                                                    onCreateAction={input.onCreate}
                                                />
                                            );
                                        }

                                        default:
                                            return (
                                                <Input
                                                    type={input.inputType}
                                                    placeholder={placeholder}
                                                    value={(formField.value as string) ?? ""}
                                                    onChange={formField.onChange}
                                                />
                                            );
                                    }
                                })()}
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        );
    };

    const renderGroup = (group: FormElement) => {
        switch (group.formGroupType) {
            case FormGroupType.card:
                return (
                    <CardWrapper key={group.id}>
                        {group.formFields.map(renderField)}
                    </CardWrapper>
                );

            case FormGroupType.container:
                return (
                    <ContainerWrapper key={group.id}>
                        {group.formFields.map(renderField)}
                    </ContainerWrapper>
                );

            case FormGroupType.tabs:
                return (
                    <TabGroup
                        key={group.id}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            case FormGroupType.step_wizard:
                return (
                    <WizardGroup
                        key={group.id}
                        group={group}
                        form={form}
                        renderField={renderField}
                    />
                );

            default:
                return <div key={group.id}>{group.formFields.map(renderField)}</div>;
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={classesFromStyleProps(element.styles)}
            >
                {renderGroup(element)}
                <Button type="submit">{t("submit")}</Button>
            </form>
        </Form>
    );
}

/** ---------- Dropzone Field for File Upload ---------- */
function DropzoneField({
    onFiles,
    files,
    multiple,
    accept,
    maxSize,
}: {
    onFiles: (files: File[]) => void;
    files: File[];
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
}) {
    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        multiple,
        maxSize,
        accept: accept
            ? Object.fromEntries(accept.split(",").map((t) => [t.trim(), []]))
            : undefined,
        onDrop: (accepted) => onFiles(accepted),
    });

    return (
        <div className="space-y-2">
            <div
                {...getRootProps()}
                className="border-input hover:bg-accent/30 dark:hover:bg-accent/10 flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 text-sm transition-colors"
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop files here...</p>
                ) : (
                    <p>Drag &amp; drop files here, or click to select</p>
                )}
            </div>

            {files?.length > 0 && (
                <ul className="mt-1 space-y-1 text-sm">
                    {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="truncate">
                            {f.name}{" "}
                            <span className="text-muted-foreground">({Math.round(f.size / 1024)} KB)</span>
                        </li>
                    ))}
                </ul>
            )}

            {fileRejections.length > 0 && (
                <div className="text-destructive text-xs">
                    {fileRejections.map((rej, i) => (
                        <div key={i}>
                            {rej.file.name}: {rej.errors.map((e) => e.message).join(", ")}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// === File: src/components/ui/form.tsx ===

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/src/lib/utils"
import { Label } from "./label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}


// === File: src/components/ui/hover-card.tsx ===

"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/src/lib/utils"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }


// === File: src/components/ui/input-otp.tsx ===

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }


// === File: src/components/ui/input.tsx ===

import * as React from "react"

import { cn } from "@/src/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }


// === File: src/components/ui/label.tsx ===

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/src/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }


// === File: src/components/ui/markdown-input.tsx ===

"use client";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
interface MarkdownInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export function MarkdownInput({ value, onChange, placeholder, className }: MarkdownInputProps) {
    return (
        <div className="container">
            <MDEditor
                value={value}
                onChange={onChange as any}
                previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                }}
            />
            <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
        </div>
    );
}


// === File: src/components/ui/menubar.tsx ===

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  )
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className
        )}
        {...props}
      />
    </MenubarPortal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
}

export {
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
}


// === File: src/components/ui/multiselect.tsx ===

"use client"

import * as React from "react"
import { XIcon, ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "@/src/lib/utils"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"

export type MultiSelectOption = { label: string; value: string }

interface MultiselectProps {
    options: MultiSelectOption[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    className?: string
}

export function Multiselect({
    options,
    value,
    onChange,
    placeholder = "Select",
    className,
}: MultiselectProps) {
    const toggle = (v: string) => {
        if (value.includes(v)) {
            onChange(value.filter((x) => x !== v))
        } else {
            onChange([...value, v])
        }
    }

    const removeChip = (v: string) => {
        onChange(value.filter((x) => x !== v))
    }

    return (
        <div className={cn("w-full", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        type="button"
                        role="combobox"
                        className={cn(
                            "w-full justify-between",
                        )}
                    >
                        <div className="flex min-h-5 w-0 flex-1 flex-wrap items-center gap-1 overflow-hidden">
                            {value.length > 0 ? (
                                value.map((v) => {
                                    const opt = options.find((o) => o.value === v)
                                    return (
                                        <span
                                            key={v}
                                            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                        >
                                            {opt?.label ?? v}
                                            <XIcon
                                                className="size-3 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeChip(v)
                                                }}
                                            />
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDownIcon className="ml-2 size-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px]">
                    {options.map((opt) => {
                        const checked = value.includes(opt.value)
                        return (
                            <DropdownMenuCheckboxItem
                                key={opt.value}
                                checked={checked}
                                onCheckedChange={() => toggle(opt.value)}
                                className="flex items-center gap-2"
                            >
                                <CheckIcon className={cn("size-4", checked ? "opacity-100" : "opacity-0")} />
                                {opt.label}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}


// === File: src/components/ui/navigation-menu.tsx ===

import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}


// === File: src/components/ui/pagination.tsx ===

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button, buttonVariants } from "./button"

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
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
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
      size="default"
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
      size="default"
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

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}


// === File: src/components/ui/popover.tsx ===

"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/src/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }


// === File: src/components/ui/progress.tsx ===

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/src/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }


// === File: src/components/ui/radio-group.tsx ===

"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }


// === File: src/components/ui/rating-input.tsx ===

"use client";

import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface RatingInputProps {
    value: number;
    max?: number;
    onChange: (val: number) => void;
}

export function RatingInput({ value, max = 5, onChange }: RatingInputProps) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => {
                const val = i + 1;
                return (
                    <button
                        key={val}
                        type="button"
                        onClick={() => onChange(val)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={cn(
                                "h-6 w-6 transition-colors",
                                val <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}


// === File: src/components/ui/resizable.tsx ===

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/src/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }


// === File: src/components/ui/richtext-input.tsx ===

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextInput({ value, onChange, placeholder, className }: RichTextInputProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: placeholder || "Start typing…" }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className={`border rounded-md p-2 bg-background ${className || ""}`}>
            <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
        </div>
    );
}


// === File: src/components/ui/scroll-area.tsx ===

"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/src/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }


// === File: src/components/ui/select.tsx ===

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
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
}


// === File: src/components/ui/separator.tsx ===

"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/src/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }


// === File: src/components/ui/sheet.tsx ===

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/src/lib/utils"

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}


// === File: src/components/ui/sidebar.tsx ===

"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Separator } from "./separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet"
import { Skeleton } from "./skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
        "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
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
}


// === File: src/components/ui/signature-input.tsx ===

"use client";

import * as React from "react";
import { Undo } from "lucide-react";

interface SignatureInputProps {
    value?: string;
    onChange: (dataUrl: string) => void;
}

export function SignatureInput({ value, onChange }: SignatureInputProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let drawing = false;

        const start = (e: MouseEvent) => {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        };
        const move = (e: MouseEvent) => {
            if (!drawing) return;
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        };
        const end = () => {
            if (!drawing) return;
            drawing = false;
            onChange(canvas.toDataURL("image/png"));
        };

        canvas.addEventListener("mousedown", start);
        canvas.addEventListener("mousemove", move);
        canvas.addEventListener("mouseup", end);
        canvas.addEventListener("mouseleave", end);

        return () => {
            canvas.removeEventListener("mousedown", start);
            canvas.removeEventListener("mousemove", move);
            canvas.removeEventListener("mouseup", end);
            canvas.removeEventListener("mouseleave", end);
        };
    }, [onChange]);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onChange("");
    };

    return (
        <div className="space-y-2">
            <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="border rounded bg-white w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{value ? "Signature captured" : "Please sign above"}</span>
                <button
                    type="button"
                    className="flex items-center gap-1 text-muted-foreground hover:text-red-500"
                    onClick={clear}
                >
                    <Undo className="h-4 w-4" /> Clear
                </button>
            </div>
        </div>
    );
}


// === File: src/components/ui/skeleton.tsx ===

import { cn } from "@/src/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }


// === File: src/components/ui/slider.tsx ===

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/src/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }


// === File: src/components/ui/sonner.tsx ===

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster, sonnerToast as toast }


// === File: src/components/ui/switch.tsx ===

"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/src/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }


// === File: src/components/ui/table.tsx ===

import * as React from "react"

import { cn } from "@/src/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}


// === File: src/components/ui/tabs.tsx ===

"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/src/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }


// === File: src/components/ui/tags-input.tsx ===

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
    const [inputValue, setInputValue] = React.useState("");

    const addTag = () => {
        const tag = inputValue.trim();
        if (tag && !value.includes(tag)) {
            onChange([...value, tag]);
            setInputValue("");
        }
    };

    const removeTag = (tag: string) => {
        onChange(value.filter((t) => t !== tag));
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="bg-accent text-sm px-2 py-1 rounded-full flex items-center gap-1"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag"
                />
                <Button type="button" onClick={addTag}>
                    Add
                </Button>
            </div>
        </div>
    );
}


// === File: src/components/ui/textarea.tsx ===

import * as React from "react"

import { cn } from "@/src/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }


// === File: src/components/ui/toggle-group.tsx ===

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"
import { toggleVariants } from "./toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }


// === File: src/components/ui/toggle.tsx ===

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }


// === File: src/components/ui/tooltip.tsx ===

"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/src/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }


// === File: src/hooks/use-mobile.ts ===

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}


// === File: src/lib/i18n.ts ===

import { useMemo } from "react";
import { useTranslation as useT } from "./utils";

export function useI18n(translations: Record<string, Record<string, string>> | undefined, locale = "en") {
    return useMemo(() => useT(translations || {}, locale), [translations, locale]);
}


// === File: src/lib/utils.ts ===

import stripJsonComments from 'strip-json-comments';
import { BrowserProvider } from 'ethers';
import { AnyObj, VisibilityControl, AccessibilityProps, StyleProps, AnimationSpec, IRoute, UIDefinition, ImageElement, UIProject, Brand } from '@/src/types';
import { v4 as uuidv4 } from 'uuid';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const injectedCache = new Set<string>();
export const languageMap: Record<string, string> = {
    md: 'markdown',
    markdown: 'markdown',
    json: 'json',
    js: 'javascript',
    py: 'python',
    ts: 'typescript',
    tsx: 'tsx',
    jsx: 'jsx',
    css: 'css',
    html: 'html',
    yaml: 'yaml',
    yml: 'yaml',
    sql: 'sql',
};

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function useTranslation(translations: Record<string, Record<string, string>>, locale: string) {
    return (key: string) => translations[locale]?.[key] ?? key;
}
export function safeJsonParse(str: string) {
    try {
        return { parsed: JSON.parse(str), error: null };
    } catch (e: any) {
        return { parsed: null, error: e.message };
    }
}

export function stripBeforeThinkTag(raw: string): string {
    const split = raw.split('</think>');
    return split[split.length - 1];
}
// ui/styles/variants.ts
export const buttonVariants: Record<string, string> = {
    primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
    secondary:
        "bg-gray-300 hover:bg-gray-400 focus:ring-2 focus:ring-gray-400",
    success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500",
    danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500",
    warning:
        "bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400",
    outline:
        "border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400",

};

export function cleanStartingFile(raw: string): string {
    const cleaned = raw.replace(/--[^-]*--\s*/g, '');
    const startIdx = Math.min(
        ...['{', '['].map(char => cleaned.indexOf(char)).filter(idx => idx !== -1)
    );
    return startIdx !== -1 ? cleaned.slice(startIdx) : cleaned;
}

/**
 * Remove extra commas before closing brackets or braces.
 */
function removeExtraCommas(jsonStr: string): string {
    // Remove commas before closing brackets or braces, e.g., [1,2,3,] -> [1,2,3]
    return jsonStr.replace(/,\s*([\]}])/g, '$1');
}

/**
 * Attempt to balance brackets and braces if there are mismatches.
 */
function balanceBrackets(jsonStr: string): string {
    let openBraces = 0;
    let openBrackets = 0;
    for (const char of jsonStr) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
    }
    let fixedStr = jsonStr;
    while (openBraces > 0) {
        fixedStr += '}';
        openBraces--;
    }
    while (openBrackets > 0) {
        fixedStr += ']';
        openBrackets--;
    }
    // Note: Handling extra closing brackets/braces is harder without context, so we focus on missing ones.
    return fixedStr;
}

/**
 * Enhanced cleaning and repair of JSON-like AI output.
 */
export function cleanJsonLikeAIOutput(raw: string): string {
    if (!raw) return '';
    let jsonLike = cleanStartingFile(raw);
    jsonLike = jsonLike.replace(/`{3,}[a-zA-Z]*\s*\n?/g, '');
    jsonLike = jsonLike.replace(/`{3,}\s*$/g, '');
    jsonLike = jsonLike.replace(/<\/think>/gi, '').trim();
    jsonLike = jsonLike.replace(/^[`\s\r\n]+|[`\s\r\n]+$/g, '');
    let clean = stripJsonComments(jsonLike);
    // Step 1: Remove extra commas
    clean = removeExtraCommas(clean);
    // Step 2: Attempt to balance brackets/braces
    clean = balanceBrackets(clean);
    // Step 3: Try parsing and return pretty-printed if valid
    const { parsed, error } = safeJsonParse(clean);
    if (error) {
        return clean;
    }
    return JSON.stringify(parsed, null, 2);
}

export function cleanCodeContent({
    fileContent,
    ext,
}: {
    fileContent: string;
    ext: string;
}): string {
    if (!fileContent) return '';
    let displayContent = stripBeforeThinkTag(fileContent.trim());
    const language = languageMap[ext] || 'text';
    if (ext === 'md' || ext === 'markdown') {
        displayContent = displayContent.replace(/^---\s*[\s\S]*?\n---\s*\n?/, '');
    }
    if (language === 'json') {
        const blockRegex = /`{3,}(?:json|)\s*([\s\S]*?)`{3,}/gi;
        const matches = [...displayContent.matchAll(blockRegex)];
        if (matches.length > 1) {
            const parsedArray: any[] = [];
            for (const match of matches) {
                const raw = stripJsonComments(match[1].trim());
                const cleaned = cleanJsonLikeAIOutput(raw);
                const { parsed } = safeJsonParse(cleaned);
                if (parsed) {
                    parsedArray.push(parsed);
                }
            }
            return JSON.stringify(parsedArray, null, 2);
        } else if (matches.length === 1) {
            const raw = stripJsonComments(matches[0][1].trim());
            const cleaned = cleanJsonLikeAIOutput(raw);
            return cleaned;
        } else {
            const cleaned = cleanJsonLikeAIOutput(displayContent);
            return cleaned;
        }
    }
    displayContent = displayContent.replace(/`{3,}[a-zA-Z]*\s*\n?/g, '');
    displayContent = displayContent.replace(/`{3,}\s*$/g, '');
    if (language !== 'text') {
        const regex = new RegExp(language, 'gi');
        displayContent = displayContent.replace(regex, '');
    }
    displayContent = displayContent.trim();
    return displayContent;
}

export const getProvider = (): BrowserProvider => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No Ethereum provider found");
    }
    return new BrowserProvider((window as any).ethereum);
};

export const scriptRegistry = {
    walletConnect: async () => {
        const provider = getProvider();
        const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
        const [account] = accounts;
        if (!account) throw new Error("No accounts returned");
        return account;
    },
    walletSign: async (message: string, account?: string) => {
        const provider = getProvider();
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        if (account && addr.toLowerCase() !== account.toLowerCase()) {
            throw new Error("Signer/account mismatch");
        }
        return signer.signMessage(message);
    },

    validateInput: (value: string, regex: string) => {
        return new RegExp(regex).test(value);
    },
};

export function throttle<T extends (...args: any[]) => void>(fn: T, ms = 2000): T {
    let last = 0;
    let timer: any;
    return ((...args: any[]) => {
        const now = Date.now();
        if (now - last > ms) { last = now; fn(...args); }
        else {
            clearTimeout(timer);
            timer = setTimeout(() => { last = Date.now(); fn(...args); }, ms - (now - last));
        }
    }) as T;
}

export const makeLogger = (ingestUrl?: string) => {
    const send = throttle((level: 'info' | 'warn' | 'error', message: string, meta?: any) => {
        try {
            if (!ingestUrl) return;
            fetch(ingestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level, message, meta, ts: new Date().toISOString() }),
            }).catch(() => { });
        } catch { }
    }, 2500);

    return {
        info: (m: string, meta?: any) => { console.info(m, meta); send('info', m, meta); },
        warn: (m: string, meta?: any) => { console.warn(m, meta); send('warn', m, meta); },
        error: (m: string, meta?: any) => { console.error(m, meta); send('error', m, meta); },
    };
};

const RTL_LANGS = ['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'ur', 'yi'];
export function localeToDir(locale?: string) {
    const code = (locale || '').split('-')[0].toLowerCase();
    return RTL_LANGS.includes(code) ? 'rtl' : 'ltr';
}

/** Intl helpers */
export function formatNumber(n: number, locale = 'en-US') {
    return new Intl.NumberFormat(locale).format(n);
}
export function formatDateTime(d: number | Date, locale = 'en-US') {
    try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(typeof d === 'number' ? new Date(d) : d);
    } catch {
        return new Date(typeof d === 'number' ? d : d.valueOf()).toLocaleString();
    }
}


export function getPath(obj: AnyObj, path: string) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}


export const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

function readEnv(key: string): string | undefined {
    if (typeof process !== "undefined" && process.env) {
        return process.env[key];
    }
    if (typeof window !== "undefined") {
        return (window as any)[key];
    }
    return undefined;
}

function expandEnvTemplates(str: string): string {
    return str.replace(/\$\{([A-Z0-9_]+)\}/g, (_, k) => readEnv(k) || "");
}
export function resolveBinding(val: any, state: AnyObj, t: (k: string) => string): any {
    if (val == null) return val;

    if (typeof val === "object" && "binding" in val) {
        const key = String(val.binding);

        // i18n translations
        if (key.startsWith("i18n.")) {
            const k = key.slice(5);
            const out = t(k);
            return out === k ? "" : out;
        }
        if (key.startsWith("translations.")) {
            const parts = key.split(".");
            if (parts.length >= 3) {
                const path = parts.slice(2).join(".");
                const out = t(path);
                return out === path ? "" : out;
            }
        }

        // State lookup
        if (key.startsWith("state.")) {
            const valFromState = getPath(state, key.slice(6));
            // return [] instead of undefined for options
            if (Array.isArray(valFromState)) return valFromState;
            return valFromState ?? null;
        }

        // env.* lookup
        if (key.startsWith("env.")) return readEnv(key.slice(4));

        // Direct ENV key
        if (/^[A-Z0-9_]+$/.test(key)) return readEnv(key);

        // Any reference mentioning API_ENDPOINT
        if (key.includes("API_ENDPOINT")) return readEnv("API_ENDPOINT");

        // fallback to state full path
        const maybe = getPath(state, key);
        return typeof maybe === "string" ? expandEnvTemplates(maybe) : maybe;
    }

    return val;
}

const isPlainObj = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && !(v instanceof File) && !(v instanceof FormData);

export function deepResolveBindings(input: any, state: any, t: (k: string) => string): any {
    if (input == null) return input;
    if (Array.isArray(input)) return input.map(v => deepResolveBindings(v, state, t));
    if (isPlainObj(input)) {
        if ('binding' in input) return resolveBinding(input, state, t);
        const out: any = {};
        for (const [k, v] of Object.entries(input)) out[k] = deepResolveBindings(v, state, t);
        return out;
    }
    if (typeof input === 'string') return resolveBinding(input, state, t);
    return input;
}

export function setPath<T extends AnyObj>(obj: T, path: string, value: any): T {
    if (!path) return obj;
    const parts = path.split('.');
    const clone: any = Array.isArray(obj) ? [...(obj as any)] : { ...obj };
    let cur: any = clone;
    for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        const next = cur[k];
        cur[k] =
            next && typeof next === 'object'
                ? (Array.isArray(next) ? [...next] : { ...next })
                : {};
        cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
    return clone;
}

/**
 * Generates Framer Motion animation props.
 * @param a - Animation specification.
 * @returns Animation props.
 */
export function motionFromAnimation(a?: AnimationSpec) {
    if (!a) return {} as Record<string, any>;
    return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
            duration: a.duration ? a.duration / 1000 : 0.3,
            delay: a.delay || 0,
            repeat: a.repeat === 'infinite' ? Infinity : a.repeat,
            ease: a.easing || 'easeInOut',
        },
    } as Record<string, any>;
}

/**
 * Validates input data against a regex or schema.
 * @param value - Input value to validate.
 * @param regex - Optional regex pattern.
 * @returns Boolean indicating validity.
 */
export function validateInput(value: any, regex?: string): boolean {
    if (regex) {
        try {
            return new RegExp(regex).test(String(value));
        } catch {
            return false;
        }
    }
    return true;
}


export const sortRows = (rows: any[], sortKey: string | null, dir: 'asc' | 'desc' | null) => {
    if (!sortKey || !dir) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
        const av = a?.[sortKey]; const bv = b?.[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return dir === 'asc' ? -1 : 1;
        if (bv == null) return dir === 'asc' ? 1 : -1;
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    return copy;
};

export const filterRows = (rows: any[], filters: Record<string, string>) => {
    const active = Object.entries(filters).filter(([, v]) => v?.trim());
    if (!active.length) return rows;
    return rows.filter(r =>
        active.every(([k, v]) => String(r?.[k] ?? '').toLowerCase().includes(String(v).toLowerCase()))
    );
};

export function isVisible(visibility: VisibilityControl | undefined, state: AnyObj, t: (key: string) => string): boolean {
    if (!visibility) return true;
    const { key, operator, value } = visibility.condition;
    const resolvedKey = resolveBinding(key, state, t);
    const resolvedValue = resolveBinding(value, state, t);

    switch (operator) {
        case "==": return resolvedKey === resolvedValue;
        case "!=": return resolvedKey !== resolvedValue;
        case ">": return resolvedKey > resolvedValue;
        case "<": return resolvedKey < resolvedValue;
        case ">=": return resolvedKey >= resolvedValue;
        case "<=": return resolvedKey <= resolvedValue;
        case "exists": return resolvedKey !== null && resolvedKey !== undefined;
        case "not_exists": return resolvedKey === null || resolvedKey === undefined;
        case "matches": return new RegExp(resolvedValue).test(resolvedKey);
        case "in": return Array.isArray(resolvedValue) && resolvedValue.includes(resolvedKey);
        case "not_in": return Array.isArray(resolvedValue) && !resolvedValue.includes(resolvedKey);
        default: return true;
    }
}

export function classesFromStyleProps(styles?: StyleProps): string {
    if (!styles) return "";
    let classes = styles.className || "";
    if (styles.responsiveClasses) {
        classes += " " + Object.values(styles.responsiveClasses).join(" ");
    }
    if (styles.customCss) {
        // Assume customCss is a string of Tailwind classes or raw CSS (handled by a CSS-in-JS solution)
        classes += " " + styles.customCss;
    }
    if (styles.background) {
        switch (styles.background.type) {
            case "color":
                classes += ` bg-[${styles.background.value}]`;
                break;
            case "gradient":
                classes += ` bg-gradient-to-r ${styles.background.value}`;
                break;
            case "image":
                classes += ` bg-[url(${styles.background.value})] bg-cover`;
                break;
            case "video":
                classes += ` bg-[url(${styles.background.value})] bg-cover`;
                break;
        }
        if (styles.background.overlayClass) {
            classes += ` ${styles.background.overlayClass}`;
        }
    }
    return classes.trim();
}

export function getAccessibilityProps(accessibility?: AccessibilityProps): Record<string, any> {
    if (!accessibility) return {};
    return {
        "aria-label": resolveBinding(accessibility.ariaLabel, {}, () => ""),
        role: accessibility.ariaRole,
        "aria-hidden": accessibility.ariaHidden,
        tabIndex: accessibility.tabIndex,
        "aria-description": resolveBinding(accessibility.screenReaderText, {}, () => ""),
        focusable: accessibility.focusable,
    };
}

export function getAllScreenImages(logo: string, screenJson: UIDefinition | null) {
    const images: Array<string> = [logo];
    if (screenJson) {
        screenJson.screens = screenJson.screens || [];
        screenJson.screens.forEach((screen: any) => {
            if (!screen || !screen.elements) return;
            screen.elements.forEach((el: any) => {
                if (el.type === 'image') {
                    const imgEl = el as ImageElement;
                    if (imgEl.src) {
                        images.push(imgEl.src);
                    }
                }
            });
        });
    }
    return images;
}
function getSocialLinks(brand: Brand | undefined): string[] {
    if (!brand?.socialMedia) return [];

    return Object.values(brand.socialMedia).filter(
        (url): url is string => typeof url === 'string' && url.trim().startsWith('http')
    );
}
export async function getMetaData(route: IRoute, project: UIProject, base_url: string, screenDefinition?: UIDefinition | null,): Promise<AnyObj> {
    try {
        const meta = route.metadata ?? {};
        const logo = project.brand?.logoUrl || '';
        const favIcon = project.brand?.faviconUrl || '';
        const slogan = project.brand?.slogan || '';
        let screenConfigUrl = route.screenConfigUrl;
        let screenJson: UIDefinition | null = screenDefinition || null;
        if (!screenJson) {
            // If no screenConfigUrl is provided, construct default URL from route.label
            if (!screenConfigUrl && route.label) {
                const label = route.label.replace(/\s+/g, '_');
                screenConfigUrl = `${base_url}/data/${label}_v1.json`; // e.g., /data/Home_v1.json
            }
            if (screenConfigUrl) {
                try {
                    const res = await fetch(screenConfigUrl);
                    if (res.ok) {
                        screenJson = await res.json();
                    }
                } catch (e) {
                    // Ignore fetch errors for metadata
                }
            }
        }
        const images: Array<string> = getAllScreenImages(logo, screenJson);
        const title = typeof meta.title === 'string' ? meta.title : meta.openGraph?.title || meta.twitter?.title || project.brand?.name || 'AltCodePro';
        const description = typeof meta.description === 'string' ? meta.description : meta.openGraph?.description || meta.twitter?.description || project.brand?.slogan || '';
        const uniqueImages = [...new Set(images.filter(Boolean))];
        const og = meta.openGraph ?? {};
        const twitter = meta.twitter ?? {};
        const obj: any = {
            title: title,
            description: description,
            keywords: meta.keywords,
            applicationName: project.brand?.name,
            manifest: '/manifest.webmanifest',
            icons: {
                icon: favIcon || uniqueImages?.[0] || '/favicon.ico',
                shortcut: favIcon || uniqueImages?.[0] || '/favicon.ico',
                apple: favIcon || uniqueImages?.[0] || '/favicon.ico',
                other: [
                    { rel: 'apple-touch-icon', url: favIcon || uniqueImages?.[0] || '/favicon.ico' },
                    { rel: 'apple-touch-icon-precomposed', url: favIcon || uniqueImages?.[0] || '/favicon.ico' },
                ],
            },
            authors: [{ 'name': 'AltCodePro', 'url': 'https://altcode.pro' }],
            creator: 'AltCodePro',
            publisher: 'AltCodePro',
            formatDetection: meta.formatDetection,
            openGraph: {
                title: og.title || title,
                description: og.description || description,
                url: og.url,
                siteName: og.siteName,
                images: uniqueImages
            },
            twitter: {
                site: project?.globalConfig?.metadata?.twitter?.site || '@AltCodePro',
                title: twitter.title || title,
                creator: 'AltCodePro',
                description: twitter.description || description || '',
                images: uniqueImages.length > 0 ? uniqueImages[0] : undefined,
            },
            pinterest: project?.globalConfig?.metadata?.pinterest ?? undefined,
            facebook: project?.globalConfig?.metadata?.facebook,
            verification: project?.globalConfig?.metadata?.verification || {},
            appleWebApp: {
                title: project.brand?.name || 'AltCodePro',
                capable: true,
                statusBarStyle: 'default',
                startupImage: logo
                    ? [{ url: logo }]
                    : uniqueImages.length > 0
                        ? [{ url: uniqueImages[0] }]
                        : undefined,
            },
            itunes: project?.globalConfig?.metadata?.itunes ?? undefined,
            bookmarks: project?.globalConfig?.metadata?.bookmarks ?? undefined,
            abstract: slogan,
            pagination: meta.pagination,
            category: project?.globalConfig?.metadata?.category || undefined,
            classification: project?.globalConfig?.metadata?.classification || undefined,
        };
        if (base_url) {
            obj.metadataBase = new URL(base_url);
        }
        obj.alternates = {
            canonical: obj.openGraph?.url || `${base_url}${route.href}`
        };
        return obj;
    } catch (error) {
        return {
            title: project.brand?.name || 'AltCodePro'
        }
    }
}

export async function getJSONLD(
    route: IRoute,
    project: UIProject,
    base_url: string = '',
    screenDefinition?: UIDefinition | null
): Promise<AnyObj> {
    try {
        const metadata = await getMetaData(route, project, base_url, screenDefinition);
        const globalMeta = project.globalConfig?.metadata ?? {};
        const openGraph = metadata?.openGraph ?? {};
        const title = metadata?.title || project.brand?.name || 'Untitled App';
        const description = metadata?.description || project.brand?.slogan || '';
        const schemaType = globalMeta?.schemaType || 'WebPage';
        const schemaLang = globalMeta?.language || 'en';
        const metadataBase = metadata?.metadataBase?.href || '';
        const pageUrl = openGraph?.url || `${metadataBase}${route.href}` || undefined;
        const images = (metadata?.openGraph?.images as string[]) || [];
        const url = metadata.openGraph?.url || metadata.metadataBase?.href + route.href || '';
        const jsonLd: AnyObj = {
            "@context": "https://schema.org",
            "@type": schemaType,
            "name": title,
            "headline": title,
            "description": description,
            "url": pageUrl,
            "inLanguage": schemaLang,
            "isAccessibleForFree": true,
            "publisher": {
                "@type": "Organization",
                "name": project.brand?.name || 'AltCodePro',
                "url": "https://altcode.pro",
                "logo": {
                    "@type": "ImageObject",
                    "url": project.brand?.logoUrl || '',
                }
            },
            "author": {
                "@type": "Organization",
                "name": project.brand?.name || 'AltCodePro',
                "url": "https://altcode.pro"
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            },
            "sameAs": getSocialLinks(project?.brand) || [],
            "datePublished": route?.metadata?.datePublished || new Date().toISOString(),
            "dateModified": route?.metadata?.dateModified || new Date().toISOString()
        };

        if (images.length > 0) {
            jsonLd.image = images;
        }
        if (metadata.keywords) {
            jsonLd.keywords = Array.isArray(metadata.keywords)
                ? metadata.keywords.join(', ')
                : metadata.keywords;
        }
        // Optional: Add structured search support
        if (project.globalConfig?.metadata?.search?.enabled && globalMeta?.search?.path) {
            jsonLd.potentialAction = {
                "@type": "SearchAction",
                "target": `${metadataBase}${globalMeta.search.path}?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            };
        }
        if (globalMeta.search?.enabled && globalMeta.search.path) {
            jsonLd.potentialAction = {
                "@type": "SearchAction",
                target: `${url}${globalMeta.search.path}?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            };
        }

        if (globalMeta.license) {
            jsonLd.license = globalMeta.license;
        }
        if (globalMeta.category) {
            jsonLd.about = {
                "@type": "Thing",
                name: globalMeta.category,
            };
            jsonLd.genre = globalMeta.category;
        }
        return jsonLd;
    } catch (error) {
        // Graceful fallback for any error
        return {};
    }
}

// utils/validation.ts
export function luhnCheck(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\D/g, ""); // remove spaces, dashes
    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}
