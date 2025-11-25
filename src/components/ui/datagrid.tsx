"use client";
import * as React from "react";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
    PaginationState,
    Row,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react";
import { Calendar } from "../../components/ui/calendar";
import { DataGridElement, DataGridCol, ElementType, InputType, DataSource, EventHandler, AnyObj } from "../../types";
import { deepResolveBindings, cn, resolveBinding, cleanDataSourceId } from "../../lib/utils";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem } from "../../components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Progress } from "../../components/ui/progress";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { DynamicIcon } from "../../components/ui/dynamic-icon";
import { FormResolver } from "../../components/ui/form-resolver";
import { DialogHeader } from "../../components/ui/dialog";
import { Chart } from "./chart";

interface DataGridProps {
    element: DataGridElement;
    dataSources?: DataSource[];
    state: AnyObj;
    t: (key: string) => string;
    setState: (path: string, value: any) => void;
    runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj) => Promise<void>;
}

const getFilterFn = (type?: string) => {
    switch (type) {
        case "number":
        case "range":
            return "inNumberRange";
        case "date":
        case "datetime":
        case "time":
            return "equals";
        case "bool":
            return "equals";
        default:
            return "includesStringSensitive";
    }
};

export function DataGrid({ element, state, t, runEventHandler }: DataGridProps) {
    const [sorting, setSorting] = useState<SortingState>(deepResolveBindings(element.sorting, state, t) || []);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(deepResolveBindings(element.filters, state, t) || []);
    const [globalFilter, setGlobalFilter] = useState<string>(deepResolveBindings(element.globalFilter, state, t) || "");
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(deepResolveBindings(element.columnVisibility, state, t) || {});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: deepResolveBindings(element.currentPage, state, t) ?? 0,
        pageSize: element.pageSize ?? 10,
    });
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentEditData, setCurrentEditData] = useState<any>(null);

    const data = useMemo(() => {
        let raw = element.dataSourceId ? state?.[cleanDataSourceId(element.dataSourceId)] ?? [] : resolveBinding(element.rows, state, t) || [];
        if (!raw) return [];
        if (typeof raw === "string") {
            return [];
        }
        if (raw && Array.isArray(raw) && raw.length > 0 && raw[0]?.cells) {
            return raw?.map((r: any, i: any) => {
                const obj: AnyObj = {};
                element.columns.forEach((col, i) => {
                    obj[col.key] = r.cells[i];
                });
                return { ...obj, id: r.id || `${i}` };
            });
        }
        return raw?.map((item: any, index: number) => ({ ...item, id: item.id || `${index}` }));
    }, [element.dataSourceId, element.rows, state, t, element.columns]);

    const totalCount = deepResolveBindings(element.totalCount, state, t) ?? data.length;

    // Memoized column definitions
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const cols: ColumnDef<any>[] = [];

        // Expander column
        if (element.subRowsKey) {
            cols.push({
                id: "expander",
                header: () => null,
                cell: ({ row }) =>
                    row.getCanExpand() ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={row.getToggleExpandedHandler()}
                        >
                            <ChevronDown className={cn("h-4 w-4", row.getIsExpanded() ? "" : "rotate-[-90deg]")} />
                        </Button>
                    ) : null,
                size: 40,
                enableHiding: false,
                enableResizing: false,
            });
        }

        // Select column
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
            });
        }

        // Data columns
        element.columns.forEach((col: DataGridCol) => {
            const resolvedCol = deepResolveBindings(col, state, t);
            const colId = resolvedCol.key || resolvedCol.id || `${col.header}-${Math.random().toString(36).slice(2)}`;

            cols.push({
                accessorKey: colId,
                id: colId,
                header: ({ column }) => (
                    resolvedCol.sortable ? (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="flex items-center gap-2"
                        >
                            {deepResolveBindings(resolvedCol.header, state, t) || colId}
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    ) : (
                        deepResolveBindings(resolvedCol.header, state, t) || colId
                    )
                ),
                cell: ({ row, getValue }) => {
                    const value = getValue();
                    const isEditing =
                        (element.editingMode === "cell" && editingCell?.rowId === row.id && editingCell?.colKey === colId) ||
                        (element.editingMode === "row" && editingRowId === row.id);

                    return isEditing && resolvedCol.editable
                        ? renderEditor(resolvedCol, value, row.original, colId)
                        : renderCell(resolvedCol, value, row.original);
                },
                size: Number(resolvedCol.width) || 150,
                minSize: Number(resolvedCol.minWidth) || 100,
                maxSize: Number(resolvedCol.maxWidth) || undefined,
                meta: {
                    align: resolvedCol.align,
                    cellClass: resolvedCol.cellClass,
                    headerClass: resolvedCol.headerClass,
                    footer: resolvedCol.footer,
                },
                enableHiding: !resolvedCol.hidden,
                enableResizing: resolvedCol.resizable,
                enableSorting: resolvedCol.sortable,
                enablePinning: !!resolvedCol.pinned,
                filterFn: resolvedCol.filterType ? getFilterFn(resolvedCol.filterType) : undefined,
            });
        });

        // Actions column
        if (element.rowActions?.length) {
            cols.push({
                id: "actions",
                header: () => "Actions",
                cell: ({ row }) => {
                    const actions = deepResolveBindings(element.rowActions, state, t) as Array<any>;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {actions?.map((action) => {
                                    const show = action.condition
                                        ? deepResolveBindings(action.condition, { ...state, row: row.original }, t)
                                        : true;
                                    if (!show) return null;
                                    return (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => runEventHandler?.(action.onClick, { row: row.original })}
                                        >
                                            {action.icon && <DynamicIcon className="mr-2 h-4 w-4" name={action.icon} />}
                                            {deepResolveBindings(action.label, state, t)}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
                size: 60,
                enableSorting: false,
                enableHiding: false,
            });
        }

        return cols;
    }, [element, state, t, editingCell, editingRowId, runEventHandler]);

    // Table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onSortingChange: useCallback(
            (updater: any) => {
                const newSorting = typeof updater === "function" ? updater(sorting) : updater;
                setSorting(newSorting);
                runEventHandler?.(element.onSortChange, { sorting: newSorting });
            },
            [sorting, element.onSortChange, runEventHandler]
        ),
        onColumnFiltersChange: useCallback(
            (updater: any) => {
                const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
                setColumnFilters(newFilters);
                runEventHandler?.(element.onFilterChange, { filters: newFilters });
            },
            [columnFilters, element.onFilterChange, runEventHandler]
        ),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesStringSensitive",
        onColumnVisibilityChange: useCallback(
            (updater: any) => {
                const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
                setColumnVisibility(newVisibility);
                runEventHandler?.(element.onColumnVisibilityChange, { visibility: newVisibility });
            },
            [columnVisibility, element.onColumnVisibilityChange, runEventHandler]
        ),
        onRowSelectionChange: useCallback(
            (updater: any) => {
                const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
                setRowSelection(newSelection);
                runEventHandler?.(element.onSelectionChange, { selection: newSelection });
            },
            [rowSelection, element.onSelectionChange, runEventHandler]
        ),
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: element.infinite ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: element.subRowsKey
            ? (row) => row[element.subRowsKey as keyof typeof row]
            : undefined,
        enableColumnResizing: element.resizableColumns,
        enablePinning: true,
        manualPagination: element.serverSide,
        manualSorting: element.serverSide,
        manualFiltering: element.serverSide,
        rowCount: totalCount,
        pageCount: element.serverSide ? Math.ceil(totalCount / pagination.pageSize) : undefined,
    });

    const { rows } = table.getRowModel();
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Virtualization
    const rowVirtualizer = useVirtualizer({
        count: element.infinite ? rows.length + 1 : rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => element.virtualRowHeight ?? 48,
        overscan: 10,
    });

    // Infinite scroll handling
    useEffect(() => {
        if (element.infinite && rowVirtualizer.getVirtualItems().length > 0) {
            const lastItem = rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1];
            if (lastItem && lastItem.index >= rows.length - 1 && element.onLoadMore) {
                runEventHandler?.(element.onLoadMore);
            }
        }
    }, [rowVirtualizer.getVirtualItems(), rows.length, element.infinite, element.onLoadMore, runEventHandler]);

    // Cell editing
    const handleCellEdit = useCallback(
        (rowId: string, colKey: string, value: any) => {
            runEventHandler?.(element.onCellEdit, { rowId, colKey, value });
            setEditingCell(null);
        },
        [element.onCellEdit, runEventHandler]
    );

    // Start editing
    const startEditing = useCallback(
        (row: Row<any>, col?: DataGridCol) => {
            if (element.editingMode === "modal" && element.editForm) {
                setCurrentEditData(row.original);
                setModalOpen(true);
            } else if (element.editingMode === "row") {
                setEditingRowId(row.id);
            } else if (element.editingMode === "cell" && col) {
                setEditingCell({ rowId: row.id, colKey: col.key });
            }
        },
        [element.editingMode, element.editForm]
    );

    // Modal submit
    const handleModalSubmit = useCallback(
        (data: any) => {
            runEventHandler?.(element.onCellEdit, { rowId: currentEditData?.id, data });
            setModalOpen(false);
        },
        [currentEditData, element.onCellEdit, runEventHandler]
    );

    // Render cell
    const renderCell = useCallback(
        (col: DataGridCol, value: any, rowData: any) => {
            const cellClass = typeof col.cellClass === "function"
                ? col.cellClass(rowData)
                : Array.isArray(col.cellClass)
                    ? col.cellClass.find((c: { condition: any }) => deepResolveBindings(c.condition, { ...state, row: rowData }, t))?.class
                    : deepResolveBindings(col.cellClass, { ...state, row: rowData }, t);

            switch (col.renderer) {
                case "image":
                    return <img src={value} alt="" className="h-8 w-8 object-cover rounded" />;
                case "link":
                    return <a href={value} className="text-blue-600 hover:underline">{value}</a>;
                case "badge":
                    return <Badge variant="outline">{value}</Badge>;
                case "progress":
                    return <Progress value={Number(value)} className="w-[60%]" />;
                case "chart":
                    return (
                        <Chart
                            state={state}
                            t={t}
                            element={{
                                type: ElementType.chart,
                                id: `${col.key}_chart`,
                                name: `${col.key}_chart`,
                                chartType: (col.chartConfig?.type || "bar") as any,
                                data: rowData[col.chartConfig?.dataKey || ""],
                                options: col.chartConfig?.options,
                            }}
                        />
                    );
                case "checkbox":
                    return <Checkbox checked={!!value} disabled />;
                default:
                    return value ?? "";
            }
        },
        [state, t]
    );

    // Render editor
    const renderEditor = useCallback(
        (col: DataGridCol, value: any, rowData: any, colKey: string) => {
            const handleChange = (newValue: any) => handleCellEdit(rowData.id, colKey, newValue);

            switch (col.editorType || col.filterType || "text") {
                case InputType.text:
                case InputType.email:
                case InputType.password:
                case InputType.number:
                case InputType.textarea:
                    return (
                        <Input
                            type={col.editorType}
                            defaultValue={value}
                            onBlur={(e) => handleChange(e.target.value)}
                            autoFocus
                            className="w-full"
                        />
                    );
                case InputType.select:
                case InputType.multiselect:
                    return (
                        <Select defaultValue={String(value)} onValueChange={handleChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.isArray(col.options) &&
                                    col.options?.map((opt: { value: string; label: any }) => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                            {deepResolveBindings(opt.label, state, t)}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    );
                case InputType.date:
                case InputType.datetime_local:
                    return (
                        <Input
                            type={col.editorType}
                            defaultValue={value}
                            onChange={(e) => handleChange(e.target.value)}
                            className="w-full"
                        />
                    );
                case InputType.checkbox:
                case InputType.switch:
                    return <Switch checked={value} onCheckedChange={handleChange} />;
                case InputType.color:
                    return (
                        <Input
                            type="color"
                            defaultValue={value}
                            onChange={(e) => handleChange(e.target.value)}
                            className="w-full"
                        />
                    );
                default:
                    return (
                        <Input
                            defaultValue={value}
                            onBlur={(e) => handleChange(e.target.value)}
                            autoFocus
                            className="w-full"
                        />
                    );
            }
        },
        [state, t, handleCellEdit]
    );

    // Render filter
    const renderFilter = useCallback(
        (column: any, colDef: DataGridCol) => {
            if (!colDef?.filterable) return null;
            const filterValue = column.getFilterValue();
            switch (colDef?.filterType) {
                case "text":
                    return (
                        <Input
                            placeholder={`Filter ${deepResolveBindings(colDef.header, state, t)}...`}
                            value={filterValue ?? ""}
                            onChange={(e) => column.setFilterValue(e.target.value)}
                            className="mt-2"
                        />
                    );
                case "select":
                case "multi-select":
                    return (
                        <Select value={String(filterValue)} onValueChange={(v) => column.setFilterValue(v)}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder={`Filter ${deepResolveBindings(colDef.header, state, t)}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.isArray(colDef.options) &&
                                    colDef.options?.map((opt: { value: string; label: any }) => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                            {deepResolveBindings(opt.label, state, t)}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    );
                case "date":
                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-2">
                                    {filterValue ? new Date(filterValue).toLocaleDateString() : `Filter ${deepResolveBindings(colDef.header, state, t)}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    selected={filterValue ? new Date(filterValue) : undefined}
                                    onSelect={(date: any) => column.setFilterValue(date?.toISOString())}
                                    mode="single"
                                    required
                                />
                            </PopoverContent>
                        </Popover>
                    );
                case "bool":
                    return (
                        <div className="flex items-center space-x-2 mt-2">
                            <Switch checked={filterValue} onCheckedChange={(v) => column.setFilterValue(v)} />
                            <span>{deepResolveBindings(colDef.header, state, t)}</span>
                        </div>
                    );
                case "number":
                case "range":
                    return (
                        <Input
                            type="number"
                            placeholder={`Filter ${deepResolveBindings(colDef.header, state, t)}...`}
                            value={filterValue ?? ""}
                            onChange={(e) => column.setFilterValue(Number(e.target.value))}
                            className="mt-2"
                        />
                    );
                default:
                    return null;
            }
        },
        [state, t]
    );

    // Row class
    const rowClass = useCallback(
        (row: Row<any>) => {
            if (typeof element.rowClass === "function") return element.rowClass(row.original);
            if (Array.isArray(element.rowClass)) return element.rowClass.find((c) => deepResolveBindings(c.condition, { ...state, row: row.original }, t))?.class;
            return deepResolveBindings(element.rowClass, { ...state, row: row.original }, t);
        },
        [element.rowClass, state, t]
    );

    const loading = deepResolveBindings(element.loading, state, t) ?? false;
    const emptyMessage = deepResolveBindings(element.emptyMessage, state, t) ?? "No data available";

    return (
        <div
            ref={tableContainerRef}
            className={cn("rounded-md border overflow-auto", element.styles?.className)}
            style={{ height: element.height ? `${element.height}px` : element.autoHeight ? "auto" : "400px" }}
        >
            {/* Toolbar */}
            <div className="flex items-center py-4 px-4 space-x-4">
                <Input
                    placeholder="Search..."
                    value={globalFilter ?? ""}
                    onChange={(event) => {
                        setGlobalFilter(event.target.value);
                        runEventHandler?.(element.onGlobalFilterChange, { globalFilter: event.target.value });
                    }}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Columns</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns()?.filter((column) => column.getCanHide())?.map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {deepResolveBindings(
                                    element.columns.find((col: any) => (col.key || col.id) === column.id)?.header,
                                    state,
                                    t
                                ) || column.id}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                {element.groupActions?.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant || "default"}
                        onClick={() => runEventHandler?.(action.onClick, { selectedRows: table.getSelectedRowModel().rows?.map((r) => r.original) })}
                    >
                        {action.icon && <DynamicIcon className="mr-2 h-4 w-4" name={action.icon} />}
                        {deepResolveBindings(action.label, state, t)}
                    </Button>
                ))}
            </div>

            {/* Table */}
            <Table>
                <TableHeader>
                    {table.getHeaderGroups()?.map((headerGroup, hi) => (
                        <TableRow key={`header_group_${hi}_${headerGroup.id}`}>
                            {headerGroup.headers?.map((header, gi) => {
                                const meta = header.column.columnDef.meta as any;
                                return (
                                    <TableHead
                                        key={`header_${header.id}_${hi}_${gi}`}
                                        colSpan={header.colSpan}
                                        style={{ width: header.getSize(), textAlign: meta?.align }}
                                        className={cn(meta?.headerClass)}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanFilter() && (
                                            <div className="mt-2">
                                                {renderFilter(header.column, element.columns.find((c: any) => (c.key || c.id) === header.column.id) as DataGridCol)}
                                            </div>
                                        )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: pagination.pageSize })?.map((_, i) => (
                            <TableRow key={`loading_${i}`}>
                                {table.getVisibleLeafColumns()?.map((col) => (
                                    <TableCell key={`skeleton_${col.id}_${i}`}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : rows.length ? (
                        rowVirtualizer.getVirtualItems()?.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            if (!row) return null;
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(rowClass(row))}
                                    onClick={() => runEventHandler?.(element.onRowClick, { row: row.original })}
                                >
                                    {row.getVisibleCells()?.map((cell, ind) => {
                                        const meta = cell.column.columnDef.meta as any;
                                        return (
                                            <TableCell
                                                key={`{cell_${virtualRow.index}_${cell.column.id}_${ind}}`}
                                                style={{ textAlign: meta?.align }}
                                                className={cn(typeof meta?.cellClass === "function" ? meta.cellClass(row.original) : meta?.cellClass)}
                                                onDoubleClick={() => {
                                                    const colDef = element.columns.find((c: any) => (c.key || c.id) === cell.column.id);
                                                    if (colDef?.editable) startEditing(row, colDef);
                                                }}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
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

            {/* Pagination */}
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

            {/* Edit Modal */}
            {element.editingMode === "modal" && element.editForm && (
                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Row</DialogTitle>
                        </DialogHeader>
                        <FormResolver
                            element={element.editForm}
                            state={{ ...state, row: currentEditData }}
                            t={t}
                            onFormSubmit={handleModalSubmit}
                            runEventHandler={runEventHandler}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}