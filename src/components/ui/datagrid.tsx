"use client";
import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import {
    ColumnDef, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState,
    PaginationState, Row, flexRender, getCoreRowModel, getExpandedRowModel, getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel, useReactTable
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react"
import { Calendar } from "../../components/ui/calendar"
import { DataGridElement, DataGridCol, ElementType, InputType, DataSource, EventHandler, AnyObj } from "../../types"
import { deepResolveBindings, cn, resolveBinding } from "../../lib/utils"
import { useDataSources } from "../../schema/useDataSources"
import { Checkbox } from "../../components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem } from "../../components/ui/dropdown-menu"
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover"
import { Progress } from "../../components/ui/progress"
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "../../components/ui/select"
import { Switch } from "../../components/ui/switch"
import { Label } from "recharts"
import { Chart } from "./chart"
import { DialogHeader } from "./dialog"
import { FormResolver } from "./form-resolver"
import { Input } from "./input"
import { Skeleton } from "./skeleton"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./table"
import { Button } from "./button"
import { Badge } from "./badge"
import { DynamicIcon } from "./dynamic-icon";


interface DataGridProps {
    element: DataGridElement
    dataSources?: DataSource[];
    state: AnyObj;
    t: (key: string) => string;
    setState: (path: string, value: any) => void;
    runEventHandler?: (handler?: EventHandler | undefined, dataOverride?: AnyObj) => Promise<void>
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

export function DataGrid({ element, dataSources, setState, state, t, runEventHandler }: DataGridProps) {
    const [sorting, setSorting] = useState<SortingState>(deepResolveBindings(element.sorting, state, t) || [])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(deepResolveBindings(element.filters, state, t) || [])
    const [globalFilter, setGlobalFilter] = useState<string>(deepResolveBindings(element.globalFilter, state, t) || "")
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(deepResolveBindings(element.columnVisibility, state, t) || {})
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: deepResolveBindings(element.currentPage, state, t) ?? 0,
        pageSize: element.pageSize ?? 10,
    })
    const [editingRowId, setEditingRowId] = useState<string | null>(null)
    const [editingCell, setEditingCell] = useState<{ rowId: string; colKey: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [currentEditData, setCurrentEditData] = useState<any>(null)

    const resolvedDataSources = useDataSources({ dataSources, state, setState })

    const data = useMemo(() => {
        let raw = [];

        if (element.serverSide && element.dataSourceId) {
            raw = resolvedDataSources?.data[element.dataSourceId] ?? [];
        } else {
            raw = resolveBinding(element.rows, state, t) || [];
        }
        // 🔹 Normalize rows if they come in "cells" format
        if (Array.isArray(raw) && raw.length > 0 && raw[0]?.cells) {
            return raw.map((r: any) => {
                const obj: AnyObj = {};
                element.columns.forEach((col, i) => {
                    obj[col.key] = r.cells[i];
                });
                return obj;
            });
        }

        return raw;
    }, [element, resolvedDataSources, state, t]);

    const totalCount = deepResolveBindings(element.totalCount, state, t) ?? data.length

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

        element.columns.forEach((col: DataGridCol) => {
            const resolvedCol = deepResolveBindings(col, state, t) as DataGridCol
            cols.push({
                accessorKey: resolvedCol.key,
                header: ({ column }) => {
                    return resolvedCol.sortable ? (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            {deepResolveBindings(resolvedCol.header, state, t)}
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
                id: resolvedCol.key || col.key || col.header?.toString(),
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
                                    const show = action.condition ? deepResolveBindings(action.condition, { ...state, row: row.original }, t) : true
                                    if (!show) return null
                                    return (
                                        <DropdownMenuItem
                                            key={action.id}
                                            onClick={() => runEventHandler?.(action.onClick, { row: row.original })}
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
            if (element.onSortChange) runEventHandler?.(element.onSortChange, { sorting: newSorting })
        },
        onColumnFiltersChange: (updater) => {
            const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
            setColumnFilters(newFilters)
            if (element.onFilterChange) runEventHandler?.(element.onFilterChange, { filters: newFilters })
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
            if (element.onColumnVisibilityChange) runEventHandler?.(element.onColumnVisibilityChange, { visibility: newVisibility })
        },
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
            setRowSelection(newSelection)
            if (element.onSelectionChange) runEventHandler?.(element.onSelectionChange, { selection: newSelection })
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
                runEventHandler?.(element.onLoadMore)
            }
        }
    }, [rowVirtualizer.getVirtualItems()])

    const handleCellEdit = (rowId: string, colKey: string, value: any) => {
        // Update data
        if (element.onCellEdit) {
            runEventHandler?.(element.onCellEdit, { rowId, colKey, value })
        }
        setEditingCell(null)
    }

    const startEditing = (row: Row<any>, col?: DataGridCol) => {
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
            runEventHandler?.(element.onCellEdit, { rowId: currentEditData.id, data })
        }
        setModalOpen(false)
    }

    const renderCell = (col: DataGridCol, value: any, rowData: any) => {
        const cellClass = typeof col.cellClass === 'function' ? col.cellClass(rowData) :
            Array.isArray(col.cellClass) ? col.cellClass.find((c: { condition: any }) => deepResolveBindings(c.condition, { ...state, row: rowData }, t))?.class :
                deepResolveBindings(col.cellClass, { ...state, row: rowData }, t)

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
                return <Chart
                    state={state}
                    t={t}
                    element={{
                        type: ElementType.chart,
                        id: `${col.key}_chart`,
                        name: `${col.key}_chart`,
                        chartType: (col.chartConfig?.type || 'bar') as any,
                        data: rowData[col.chartConfig?.dataKey || ''],
                        options: col.chartConfig?.options
                    }} />
            case 'checkbox':
                return <Checkbox checked={!!value} disabled />
            default:
                return value
        }
    }

    const renderEditor = (col: DataGridCol, value: any, rowData: any, colKey: string) => {
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
                                ? col.options.map((opt: { value: string; label: any }) =>
                                    <SelectItem key={opt.value}
                                        value={opt.value}>{deepResolveBindings(opt.label, state, t)}
                                    </SelectItem>)
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

    const renderFilter = (column: any, colDef: DataGridCol) => {
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
                                ? colDef.options.map((opt: { value: string; label: any }) => <SelectItem key={opt.value}
                                    value={opt.value}>{deepResolveBindings(opt.label, state, t)}</SelectItem>)
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
                        <Label>{deepResolveBindings(colDef.header, state, t)}</Label>
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
        if (Array.isArray(element.rowClass)) return element.rowClass.find(c => deepResolveBindings(c.condition, { ...state, row: row.original }, t))?.class
        return deepResolveBindings(element.rowClass, { ...state, row: row.original }, t)
    }

    const loading = deepResolveBindings(element.loading, state, t) ?? false
    const emptyMessage = deepResolveBindings(element.emptyMessage, state, t) ?? "No data available"

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
                        if (element.onGlobalFilterChange) runEventHandler?.(element.onGlobalFilterChange, { globalFilter: event.target.value })
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
                        onClick={() => runEventHandler?.(action.onClick, { selectedRows: table.getSelectedRowModel().rows.map(r => r.original) })}
                    >
                        {action.icon && <DynamicIcon className="mr-2" name={action.icon} />}
                        {deepResolveBindings(action.label, state, t) || null}
                    </Button>
                ))}
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup, hi) => (
                        <TableRow key={`${headerGroup.id}_${hi}`}>
                            {headerGroup.headers?.map((header, hdi) => {
                                const meta = header.column.columnDef.meta as any
                                return (
                                    <TableHead
                                        key={`${header.id}_${headerGroup.id}_${hi}_${hdi}`}
                                        colSpan={header.colSpan}
                                        style={{ width: header.getSize(), textAlign: meta?.align }}
                                        className={cn(meta?.headerClass)}
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanFilter() ? (
                                            <div className="mt-2">
                                                {renderFilter(header.column, element.columns.find(c => c.key === header.id) as DataGridCol)}
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
                            <TableRow key={`tr_${i}_${_}`}>
                                {table.getVisibleLeafColumns().map((col, j) => (
                                    <TableCell key={`${col.id}_${i}_${j}`}><Skeleton className="h-4 w-full" /></TableCell>
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
                                        if (element.onRowClick) runEventHandler?.(element.onRowClick, { row: row.original })
                                    }}
                                >
                                    {row.getVisibleCells().map((cell, index) => {
                                        const meta = cell.column.columnDef.meta as any
                                        return (
                                            <TableCell
                                                key={`get-visible${cell.id}-${index}`}
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
                            state={state}
                            t={t}
                            onFormSubmit={handleModalSubmit}
                            runEventHandler={runEventHandler}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}