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
    | ButtonElement | ModalElement | IconElement
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