"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnOrderState,
    ColumnPinningState,
    ColumnResizeMode,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    RowSelectionState,
    PaginationState,
    flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn, classesFromStyleProps, resolveBinding } from "@/src/lib/utils";
import { useActionHandler } from "@/src/schema/Actions";
import { useAppState } from "@/src/schema/StateContext";
import type { AnyObj } from "@/src/types";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader } from "@/src/components/ui/dialog";
import { FormResolver } from "@/src/components/ui/form-resolver";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/src/components/ui/resizable";
import { ChevronDown, ChevronRight, Settings2 } from "lucide-react";

/* ------------------------------- Types ------------------------------- */

export type GridColumnEditor =
    | { type: "text" }
    | { type: "number" }
    | { type: "select"; options: Array<{ value: string; label: string } | AnyObj> }
    | { type: "checkbox" }
    | { type: "custom"; render: (args: { value: any; row: AnyObj; onChange: (v: any) => void }) => React.ReactNode };

export interface GridColumn {
    id: string;
    header?: any; // binding or string
    accessorKey?: string; // path in row
    width?: number;
    minSize?: number;
    maxSize?: number;
    enableSorting?: boolean;
    enableHiding?: boolean;
    enableResizing?: boolean;
    enableEditing?: boolean;
    filter?: { type: "text" | "number" | "select"; options?: Array<{ value: any; label: string } | AnyObj> };
    render?: (row: AnyObj) => React.ReactNode;
    editor?: GridColumnEditor;
    cellClass?: AnyObj | string;
    headerClass?: AnyObj | string;
}

export interface GridAction {
    id: string;
    label?: any; // binding or string
    handler: AnyObj; // your EventHandler schema
    selectionRequired?: boolean; // if true, only enabled when selection exists
    confirm?: { title?: any; description?: any };
}

export type EditMode = "inline" | "modal" | "form";

export interface DataGridSchema {
    id: string;
    styles?: AnyObj;
    columns: GridColumn[];
    datasource: Datasource<AnyObj>;
    actions?: GridAction[];
    childRenderer?: (row: AnyObj) => React.ReactNode;
    editMode?: EditMode;
    editFormElement?: AnyObj; // FormElement schema for modal/form edit
    rowIdKey?: string; // default "id"
    serverSide?: boolean; // true => sorting/filter/paging pushed to datasource.query
    pageSizeOptions?: number[];
}

/* ----------------------------- DataGrid ------------------------------ */

export function DataGrid({
    id,
    styles,
    columns,
    datasource,
    actions = [],
    childRenderer,
    editMode = "modal",
    editFormElement,
    rowIdKey = "id",
    serverSide = true,
    pageSizeOptions = [10, 25, 50, 100],
}: DataGridSchema) {
    const { runEventHandler } = useActionHandler({ runtime: {} as any });
    const { t, state } = useAppState();

    /* --------------------------- Local state --------------------------- */

    const [data, setData] = React.useState<AnyObj[]>([]);
    const [total, setTotal] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = React.useState<string>("");

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: pageSizeOptions[0],
    });

    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const [inlineDrafts, setInlineDrafts] = React.useState<Record<string, AnyObj>>({});
    const [modalRow, setModalRow] = React.useState<AnyObj | null>(null);

    const columnResizeMode: ColumnResizeMode = "onChange";

    /* ---------------------------- Helpers ------------------------------ */

    const getRowId = React.useCallback(
        (row: AnyObj) => String(row[rowIdKey] ?? row.id ?? row._id),
        [rowIdKey]
    );

    const selectedIds = React.useMemo(
        () =>
            Object.entries(rowSelection)
                .filter(([, v]) => v)
                .map(([k]) => getRowId(data[Number(k)]))
                .filter(Boolean),
        [rowSelection, data, getRowId]
    );

    /* ------------------------- Build columns --------------------------- */

    const tanColumns = React.useMemo<ColumnDef<AnyObj, any>[]>(() => {
        const selectCol: ColumnDef<AnyObj> = {
            id: "__select",
            size: 36,
            enableResizing: false,
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(val) => table.toggleAllPageRowsSelected(Boolean(val))}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(val) => row.toggleSelected(Boolean(val))}
                    aria-label="Select row"
                />
            ),
        };

        const expandCol: ColumnDef<AnyObj> = childRenderer
            ? {
                id: "__expand",
                size: 36,
                enableResizing: false,
                cell: ({ row }) => {
                    const rid = getRowId(row.original);
                    const isOpen = !!expanded[rid];
                    return (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                setExpanded((prev) => ({ ...prev, [rid]: !isOpen }))
                            }
                            aria-label={isOpen ? t("collapse") : t("expand")}
                        >
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    );
                },
            }
            : (null as any);

        const dataCols: ColumnDef<AnyObj, any>[] = columns.map((c) => {
            const headerText = (s: any) => resolveBinding(c.header ?? c.id, s, t) ?? c.id;

            return {
                id: c.id,
                accessorKey: c.accessorKey ?? c.id,
                enableSorting: c.enableSorting ?? true,
                enableHiding: c.enableHiding ?? true,
                enableResizing: c.enableResizing ?? true,
                size: c.width,
                minSize: c.minSize ?? 60,
                maxSize: c.maxSize ?? 700,
                header: () => (
                    <div className={classesFromStyleProps(c.headerClass)}>
                        {headerText(state)}
                    </div>
                ),
                cell: ({ row, getValue }) => {
                    const rowObj = row.original;
                    const rid = getRowId(rowObj);
                    const isEditing = editMode === "inline" && inlineDrafts[rid];

                    // Inline edit render
                    if (isEditing && c.enableEditing !== false && c.editor) {
                        const draft = inlineDrafts[rid] ?? {};
                        const current = draft[c.accessorKey ?? c.id] ?? getValue();
                        const onChange = (v: any) =>
                            setInlineDrafts((d) => ({
                                ...d,
                                [rid]: { ...(d[rid] || {}), [c.accessorKey ?? c.id]: v },
                            }));

                        switch (c.editor.type) {
                            case "text":
                                return (
                                    <Input
                                        value={current ?? ""}
                                        onChange={(e) => onChange(e.target.value)}
                                        className={classesFromStyleProps(c.cellClass)}
                                    />
                                );
                            case "number":
                                return (
                                    <Input
                                        type="number"
                                        value={current ?? ""}
                                        onChange={(e) => onChange(Number(e.target.value))}
                                        className={classesFromStyleProps(c.cellClass)}
                                    />
                                );
                            case "checkbox":
                                return (
                                    <Checkbox
                                        checked={Boolean(current)}
                                        onCheckedChange={(v) => onChange(Boolean(v))}
                                    />
                                );
                            case "select": {
                                const opts = (c.editor.options || []).map((o: any) =>
                                    "value" in o ? o : { value: o.value ?? o.id, label: o.label ?? String(o.name ?? o.value) }
                                );
                                return (
                                    <select
                                        className={cn("border rounded px-2 py-1 w-full", classesFromStyleProps(c.cellClass))}
                                        value={current ?? ""}
                                        onChange={(e) => onChange(e.target.value)}
                                    >
                                        <option value="" />
                                        {opts.map((o: any) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                );
                            }
                            case "custom":
                                return c.editor.render({ value: current, row: rowObj, onChange });
                        }
                    }

                    // Normal render
                    const content = c.render ? c.render(rowObj) : getValue();
                    return <div className={classesFromStyleProps(c.cellClass)}>{String(content ?? "")}</div>;
                },
            };
        });

        const actionCol: ColumnDef<AnyObj> | null =
            actions.length || editMode !== "inline"
                ? {
                    id: "__actions",
                    size: 140,
                    enableResizing: false,
                    header: () => <span className="opacity-70">{t("actions")}</span>,
                    cell: ({ row }) => {
                        const original = row.original;
                        const rid = getRowId(original);
                        const isEditing = !!inlineDrafts[rid];

                        return (
                            <div className="flex items-center gap-1">
                                {/* Inline edit controls */}
                                {editMode === "inline" && (
                                    <>
                                        {!isEditing ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    setInlineDrafts((d) => ({ ...d, [rid]: { ...original } }))
                                                }
                                            >
                                                {t("edit")}
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={async () => {
                                                        const payload = inlineDrafts[rid];
                                                        await datasource.update?.(rid, payload);
                                                        setInlineDrafts((d) => {
                                                            const { [rid]: _, ...rest } = d;
                                                            return rest;
                                                        });
                                                        // refresh
                                                        refetch();
                                                    }}
                                                >
                                                    {t("save")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setInlineDrafts((d) => {
                                                            const { [rid]: _, ...rest } = d;
                                                            return rest;
                                                        })
                                                    }
                                                >
                                                    {t("cancel")}
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* Modal / form edit control */}
                                {editMode !== "inline" && (
                                    <Button size="sm" variant="ghost" onClick={() => setModalRow(original)}>
                                        {t("edit")}
                                    </Button>
                                )}

                                {/* Row actions menu */}
                                {actions.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                {t("more")}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {actions.map((a) => {
                                                const label = resolveBinding(a.label ?? a.id, state, t) || a.id;
                                                const disabled = a.selectionRequired && selectedIds.length === 0;
                                                return (
                                                    <DropdownMenuItem
                                                        key={a.id}
                                                        disabled={disabled}
                                                        onClick={() =>
                                                            runEventHandler(a.handler, {
                                                                selection: selectedIds.length ? selectedIds : [rid],
                                                                row: original,
                                                            })
                                                        }
                                                    >
                                                        {label}
                                                    </DropdownMenuItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        );
                    },
                }
                : null;

        const base = [
            selectCol,
            ...(expandCol ? [expandCol] : []),
            ...dataCols,
            ...(actionCol ? [actionCol] : []),
        ];
        return base;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        columns,
        childRenderer,
        expanded,
        editMode,
        inlineDrafts,
        actions,
        selectedIds,
        state,
        t,
        getRowId,
    ]);

    /* ------------------------ React Table setup ------------------------ */

    const table = useReactTable({
        data,
        columns: tanColumns,
        state: {
            sorting,
            columnVisibility,
            columnOrder,
            columnPinning,
            rowSelection,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnOrderChange: setColumnOrder,
        onColumnPinningChange: setColumnPinning,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
        getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
        manualSorting: serverSide,
        manualFiltering: serverSide,
        manualPagination: serverSide,
        columnResizeMode,
        getRowId: (row, idx) => getRowId(row) ?? String(idx),
        pageCount: serverSide ? Math.ceil(total / pagination.pageSize) : undefined,
        globalFilterFn: "includesString",
    });

    /* ------------------------- Virtualization ------------------------- */

    const parentRef = React.useRef<HTMLDivElement | null>(null);
    const rowVirtualizer = useVirtualizer({
        count: table.getRowModel().rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 40,
        overscan: 10,
    });

    /* --------------------------- Fetch data --------------------------- */

    const refetch = React.useCallback(async () => {
        setLoading(true);

        const qp: QueryParams = {
            page: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
            sort: sorting.map((s) => ({ id: s.id, desc: s.desc })),
            global: globalFilter || undefined,
            filters: table
                .getAllColumns()
                .filter((c) => c.getIsFiltered())
                .map((c) => ({ id: c.id, value: c.getFilterValue() })),
        };

        try {
            const res = await datasource.query(qp);
            setData(res.items || []);
            setTotal(res.total ?? res.items?.length ?? 0);
        } finally {
            setLoading(false);
        }
    }, [datasource, globalFilter, pagination, sorting, table]);

    React.useEffect(() => {
        refetch();
    }, [refetch]);

    /* ---------------------------- Toolbar ----------------------------- */

    function Toolbar() {
        const allCols = table.getAllLeafColumns().filter((c) => !["__select", "__expand"].includes(c.id));

        return (
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder={t("search")}
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="h-9 w-56"
                    />
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setGlobalFilter("");
                            table.resetColumnFilters();
                        }}
                    >
                        {t("clear_filters")}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Settings2 className="h-4 w-4" />
                                {t("columns")}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>{t("toggle_columns")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allCols.map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(v) => col.toggleVisibility(Boolean(v))}
                                >
                                    {col.columnDef.header as any || col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {actions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="default">
                                {t("actions")}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {actions.map((a) => {
                                const disabled = a.selectionRequired && selectedIds.length === 0;
                                return (
                                    <DropdownMenuItem
                                        key={a.id}
                                        disabled={disabled}
                                        onClick={() =>
                                            runEventHandler(a.handler, {
                                                selection: selectedIds,
                                            })
                                        }
                                    >
                                        {resolveBinding(a.label ?? a.id, state, t) || a.id}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        );
    }

    /* ---------------------------- Rendering --------------------------- */

    return (
        <div className={classesFromStyleProps(styles)}>
            <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={100}>
                    <div className="flex flex-col gap-2">
                        <Toolbar />

                        <div
                            ref={parentRef}
                            className={cn(
                                "relative h-[60vh] w-full overflow-auto rounded border",
                                loading && "opacity-70"
                            )}
                        >
                            <Table className="table-fixed">
                                <TableHeader>
                                    {table.getHeaderGroups().map((hg) => (
                                        <TableRow key={hg.id}>
                                            {hg.headers.map((header) => {
                                                const canSort = header.column.getCanSort();
                                                return (
                                                    <TableHead
                                                        key={header.id}
                                                        style={{ width: header.getSize() }}
                                                        className="relative select-none"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "flex items-center gap-1",
                                                                canSort && "cursor-pointer"
                                                            )}
                                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                                            {header.column.getIsSorted() === "asc" && <span>▲</span>}
                                                            {header.column.getIsSorted() === "desc" && <span>▼</span>}
                                                        </div>

                                                        {/* Resize handle */}
                                                        {header.column.getCanResize() && (
                                                            <div
                                                                onMouseDown={header.getResizeHandler()}
                                                                onTouchStart={header.getResizeHandler()}
                                                                className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                                                            />
                                                        )}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>

                                <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                                    {rowVirtualizer.getVirtualItems().map((vr) => {
                                        const row = table.getRowModel().rows[vr.index];
                                        if (!row) return null;
                                        const rid = getRowId(row.original);
                                        const showChild = !!expanded[rid];

                                        return (
                                            <React.Fragment key={row.id}>
                                                <TableRow
                                                    data-index={vr.index}
                                                    ref={(node) => {
                                                        if (node) {
                                                            (node as any).style.transform = `translateY(${vr.start}px)`;
                                                            (node as any).style.position = "absolute";
                                                            (node as any).style.width = "100%";
                                                        }
                                                    }}
                                                    data-state={row.getIsSelected() && "selected"}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>

                                                {showChild && childRenderer && (
                                                    <TableRow
                                                        ref={(node) => {
                                                            if (node) {
                                                                (node as any).style.transform = `translateY(${vr.start + 40}px)`;
                                                                (node as any).style.position = "absolute";
                                                                (node as any).style.width = "100%";
                                                            }
                                                        }}
                                                    >
                                                        <TableCell colSpan={row.getVisibleCells().length}>
                                                            {childRenderer(row.original)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Column reorder via simple drag handle (header) */}
                            <div className="hidden">
                                {/** Optional: integrate @dnd-kit for column reordering if you want full UX.
                 * For now, table exposes setColumnOrder — populate it from external DnD.
                 */}
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm opacity-70">
                                {t("rows")}: {total}
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="h-9 rounded border px-2"
                                    value={pagination.pageSize}
                                    onChange={(e) =>
                                        setPagination((p) => ({ ...p, pageSize: Number(e.target.value), pageIndex: 0 }))
                                    }
                                >
                                    {pageSizeOptions.map((ps) => (
                                        <option key={ps} value={ps}>
                                            {t("per_page")}: {ps}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                                    disabled={pagination.pageIndex === 0}
                                >
                                    {"<<"}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                                    disabled={pagination.pageIndex === 0}
                                >
                                    {t("prev")}
                                </Button>
                                <span className="text-sm">
                                    {t("page")} {pagination.pageIndex + 1} {t("of")}{" "}
                                    {Math.max(1, Math.ceil(total / pagination.pageSize))}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setPagination((p) => ({
                                            ...p,
                                            pageIndex: Math.min(Math.ceil(total / p.pageSize) - 1, p.pageIndex + 1),
                                        }))
                                    }
                                    disabled={pagination.pageIndex >= Math.ceil(total / pagination.pageSize) - 1}
                                >
                                    {t("next")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        setPagination((p) => ({
                                            ...p,
                                            pageIndex: Math.max(0, Math.ceil(total / p.pageSize) - 1),
                                        }))
                                    }
                                    disabled={pagination.pageIndex >= Math.ceil(total / pagination.pageSize) - 1}
                                >
                                    {">>"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
            </ResizablePanelGroup>

            {/* Modal / Form editing */}
            {editMode !== "inline" && modalRow && (
                <Dialog open={!!modalRow} onOpenChange={() => setModalRow(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>{t("edit_row")}</DialogHeader>
                        {editFormElement ? (
                            <FormResolver
                                element={{
                                    ...editFormElement,
                                    onSubmit: editFormElement.onSubmit || {
                                        action: "crud_update",
                                        dataSourceId: datasource.id,
                                        params: { body: modalRow, statePath: undefined },
                                        responseType: "data",
                                    },
                                }}
                            />
                        ) : (
                            <FormResolver
                                element={{
                                    id: `${id}-edit`,
                                    type: "form",
                                    formGroupType: "single",
                                    styles: {},
                                    formFields: Object.keys(modalRow).map((k) => ({
                                        id: `${id}-${k}`,
                                        fieldType: "input",
                                        input: {
                                            id: `${id}-${k}`,
                                            type: "input",
                                            name: k,
                                            inputType: "text",
                                            value: modalRow[k],
                                            styles: {},
                                        },
                                    })),
                                    onSubmit: {
                                        action: "crud_update",
                                        dataSourceId: datasource.id,
                                        params: { body: { ...modalRow } },
                                        responseType: "data",
                                    },
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
