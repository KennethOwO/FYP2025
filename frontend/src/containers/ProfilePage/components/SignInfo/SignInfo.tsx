import style from "./SignInfo.module.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable, ColumnFiltersState, VisibilityState, SortingState, getSortedRowModel, getPaginationRowModel, getFilteredRowModel } from "@tanstack/react-table";
// @ts-ignore
import { auth } from "../../../../../firebase";
import { GetUserByEmail, FetchDatasetByUserId } from "../../../../services/account.service";
import { Search, ChevronRight, ChevronLeft, ChevronFirst, ChevronLast, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAuth, User } from "firebase/auth";

type publicTableData = {
    no: number;
    text_sentence: string;
    status_SE_en: string;
    submitted_time: string;
};

const SignInfo = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [roleAccess, setRoleAccess] = useState("");
    // For public
    const [submittedValue, setSubmittedValue] = useState(0);
    const [pendingValue, setPendingValue] = useState(0);
    const [acceptedValue, setAcceptedValue] = useState(0);
    const [rejectedValue, setRejectedValue] = useState(0);
    const [publicTableData, setPublicTableData] = useState([]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    useEffect(() => {
        auth.onAuthStateChanged(async (user: User | null) => {
            if (user) {
                const data = await GetUserByEmail(user.email, user);
                setEmail(user.email ?? "");
                setRoleAccess(data.data.role_access);
                getSignInfoforPublic(user.email ?? "", user);
            }
        });
    }, []);

    async function getSignInfoforPublic(userEmail: string, authUser: User) {
        const user = await GetUserByEmail(userEmail ?? "", authUser);
        setRoleAccess(user.data.role_access);
        const dataset = await FetchDatasetByUserId(user.data.user_id, authUser);
        setPublicTableData(dataset.data);
        setSubmittedValue(dataset.data.filter((data: any) => data.status_SE_en).length);
        setPendingValue(dataset.data.filter((data: any) => data.status_SE_en === "New").length);
        setAcceptedValue(dataset.data.filter((data: any) => data.status_SE_en === "Awaiting Accept" || data.status_SE_en === "In Progress" || data.status_SE_en === "Awaiting Verification" || data.status_SE_en === "Rejected" || data.status_SE_en === "Verified").length);
        setRejectedValue(dataset.data.filter((data: any) => data.status_SE_en === "Cancelled").length);
    }

    // For the table
    const columnHelper = createColumnHelper<publicTableData>();

    const columns = [
        columnHelper.accessor("no", {
            enableSorting: false,
            header: () => <span>No</span>,
            cell: (info) => info.row.index + 1,
        }),

        columnHelper.accessor("text_sentence", {
            sortingFn: "text",
            filterFn: "includesString",
            header: () => t("signText"),
            cell: (info) => <div>{info.getValue()}</div>,
        }),

        columnHelper.accessor((row) => row.status_SE_en, {
            sortingFn: "text",
            id: "status",
            cell: (info) => (
                <div className={style.tableStatusCell} style={["In Progress", "Awaiting Accept", "Awaiting Verification", "Verified", "Rejected"].includes(info.getValue()) ? { backgroundColor: "#32CD32" } : ["New"].includes(info.getValue()) ? { backgroundColor: "#FFD700" } : { backgroundColor: "#FF6A55" }}>
                    {["In Progress", "Awaiting Accept", "Awaiting Verification", "Verified", "Rejected"].includes(info.getValue()) ? t("approved") : ["New"].includes(info.getValue()) ? t("pending") : t("rejected")}
                </div>
            ),

            header: () => <span>{t("accStatus")}</span>,
        }),
        columnHelper.accessor("submitted_time", {
            sortingFn: "datetime",
            header: () => t("accDate"),
            cell: (info) => new Date(info.getValue()).toLocaleString(),
        }),
    ];

    const table = useReactTable({
        data: publicTableData.reverse(),
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <>
            <div className={style.horizontalContainer}>
                <div className={style.signInfoContainer}>
                    <div className={style.slot}>
                        <h1 className={style.title}>{t("submitted")}</h1>
                        <p className={style.number}>{submittedValue}</p>
                    </div>
                    <div className={style.divider}></div>
                    <div className={style.slot}>
                        <h1 className={style.title}>{t("pending")}</h1>
                        <p className={style.number}>{pendingValue}</p>
                    </div>
                    <div className={style.divider}></div>
                    <div className={style.slot}>
                        <h1 className={style.title}>{t("approved")}</h1>
                        <p className={style.number}>{acceptedValue}</p>
                    </div>
                    <div className={style.divider}></div>
                    <div className={style.slot}>
                        <h1 className={style.title}>{t("rejected")}</h1>
                        <p className={style.number}>{rejectedValue}</p>
                    </div>
                </div>
            </div>

            {publicTableData.length === 0 && (roleAccess === "public" || roleAccess === "signexpert") && (
                <div className={style.signTextTableContainer}>
                    <div>
                        <p>
                            {t("noDataAvailable")}{" "}
                            <Link to="/dataset-collection" className={style.linkRedirect}>
                                <span>{t("datasetCollectionForm")}</span>
                            </Link>{" "}
                            {t("toShareWords")}
                        </p>
                    </div>
                </div>
            )}

            {publicTableData.length !== 0 && (
                <div className={style.signTextTableContainer}>
                    <div className={style.searchBox}>
                        <div className={style.searchBox}>
                            <Search className={style.searchIcon} />
                            <input placeholder={t("searchBySign")} value={(table.getColumn("text_sentence")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("text_sentence")?.setFilterValue(event.target.value)} className={style.searchInputBox} />
                        </div>
                    </div>
                    <div className={style.table}>
                        {/* Table header */}
                        {table.getHeaderGroups().map((headerGroup) => (
                            <div key={headerGroup.id} className={`${style.tableRow} ${style.headerRow}`}>
                                {headerGroup.headers.map((header) => (
                                    <div key={header.id} className={style.tableColumn}>
                                        {header.isPlaceholder ? null : (
                                            <div className={`${style.tableHeader} ${header.column.id === "no" ? style.noCursor : ""}`} onClick={header.column.id !== "no" ? header.column.getToggleSortingHandler() : undefined}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.id === "no"
                                                    ? null
                                                    : {
                                                          asc: <ChevronUp className={style.sortIcon} />,
                                                          desc: <ChevronDown className={style.sortIcon} />,
                                                          false: <ChevronsUpDown className={style.sortIcon} />,
                                                      }[header.column.getIsSorted() as string] ?? null}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Table body */}
                        {table.getRowModel().rows.map((row) => (
                            <div key={row.id} className={style.tableRow}>
                                {row.getVisibleCells().map((cell) => (
                                    <div key={cell.id} className={style.tableColumn}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className={style.pagination}>
                        <div className={style.rowsPerPage}>{t("rowsPerPage")} </div>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                        >
                            {[10, 25, 50, 100].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>

                        {/* Show current number of data in format "Showing (first index in that page) - (last index of that page) of (length of the data)", such as "Showing 1 - 10 of 50" */}
                        <div className={style.dataNumber}>
                            {table.getRowModel().rows.length === 0 ? 0 : table.getRowModel().rows[0].index + 1} - {table.getRowModel().rows.length === 0 ? 0 : table.getRowModel().rows[table.getRowModel().rows.length - 1].index + 1} of {publicTableData.length}
                        </div>

                        <button onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                            <ChevronFirst className={style.paginationIcon} />
                        </button>
                        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <ChevronLeft className={style.paginationIcon} />
                        </button>
                        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            <ChevronRight className={style.paginationIcon} />
                        </button>
                        <button onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
                            <ChevronLast className={style.paginationIcon} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SignInfo;
