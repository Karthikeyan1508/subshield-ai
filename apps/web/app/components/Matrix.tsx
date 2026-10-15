"use client";
import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef } from "ag-grid-community";
import { COLOR, STATUS, avatarBg, money, urgency, type Subscription } from "../lib";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withParams({
  accentColor: "#1d3a0c",
  backgroundColor: "transparent",
  foregroundColor: "#12220b",
  headerBackgroundColor: "transparent",
  headerTextColor: "#5a6a4e",
  borderColor: "rgba(18, 34, 11, 0.1)",
  rowHoverColor: "rgba(159, 232, 112, 0.18)",
  fontFamily: "inherit",
  fontSize: 16,
  headerFontWeight: 700,
  wrapperBorder: false,
  spacing: 7,
});

// Relative time like "in 2d" / "in 5h"; plain date for the label.
function when(iso: string | null) {
  if (!iso) return "—";
  const ms = Date.parse(iso) - Date.now();
  const abs = Math.abs(ms);
  if (abs < 36e5) return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · now";
  const rel = abs < 36e5 * 48 ? `${Math.round(abs / 36e5)}h` : `${Math.round(abs / 864e5)}d`;
  return `${new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${ms >= 0 ? "in" : ""} ${rel}${ms < 0 ? " ago" : ""}`.replace("·  ", "· ");
}

function Spark({ points }: { points: number[] }) {
  if (points.length < 2) return <span style={{ color: "#94a3b8" }}>—</span>;
  const w = 84, h = 28;
  const min = Math.min(...points), span = Math.max(...points) - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * (w - 6) + 3, h - 4 - ((p - min) / span) * (h - 8)]);
  const up = points[points.length - 1] > points[0];
  const stroke = up ? COLOR.red : COLOR.green;
  const last = xy[xy.length - 1];
  return (
    <svg width={w} height={h} role="img" aria-label={`Price history ${points.map(money).join(" to ")}`}>
      <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill={stroke} />
    </svg>
  );
}

export default function Matrix({
  subs,
  selectedId,
  onSelect,
  onCancel,
}: {
  subs: Subscription[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCancel: (s: Subscription) => void;
}) {
  const grid = useRef<AgGridReact<Subscription>>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => grid.current?.api?.redrawRows(), [selectedId]);

  const columns: ColDef<Subscription>[] = [
    {
      headerName: "Merchant",
      field: "merchant",
      flex: 1.3,
      minWidth: 160,
      cellRenderer: ({ data }: { data?: Subscription }) =>
        data && (
          <div className="merchant">
            <span className="avatar" style={{ background: avatarBg(data.merchant) }}>{data.merchant[0]}</span>
            <div>
              {data.merchant}
              <small>{data.interval ? `Every ${data.interval.toLowerCase()}` : "—"}</small>
            </div>
          </div>
        ),
    },
    {
      field: "status",
      flex: 1.2,
      minWidth: 160,
      cellRenderer: ({ value }: { value: string }) => {
        const s = STATUS[value] ?? { label: value, tone: "off" as const };
        return <span className={`badge ${s.tone}`}>{s.label}</span>;
      },
    },
    { field: "price", headerName: "Price", flex: 0.6, minWidth: 72, type: "numericColumn", valueFormatter: ({ value }) => (value == null ? "—" : money(value)) },
    {
      headerName: "Price trend",
      flex: 0.8,
      minWidth: 90,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: Subscription }) => data && <Spark points={data.priceHistory.map((p) => p.price)} />,
    },
    {
      headerName: "Change",
      flex: 1.3,
      minWidth: 135,
      valueGetter: ({ data }) => data?.hike?.pct ?? 0,
      cellRenderer: ({ data }: { data?: Subscription }) =>
        data?.hike ? (
          <span className="hike">+{data.hike.pct}% <small style={{ fontWeight: 400, color: "#64748b" }}>{money(data.hike.from)} → {money(data.hike.to)}</small></span>
        ) : (
          <span style={{ color: "#94a3b8" }}>No change</span>
        ),
    },
    { field: "nextBillingTime", headerName: "Next charge", flex: 1, minWidth: 105, valueFormatter: ({ value }) => when(value) },
    {
      field: "predatoryScore",
      headerName: "Risk score",
      flex: 1,
      minWidth: 140,
      sort: "desc",
      cellRenderer: ({ data }: { data?: Subscription }) =>
        data && (
          <div className="score" title="Predatory score: price hike + trial urgency">
            <b style={{ color: COLOR[urgency(data)] }}>{data.predatoryScore}</b>
            <span className="bar"><i style={{ width: `${data.predatoryScore}%`, background: COLOR[urgency(data)] }} /></span>
          </div>
        ),
    },
    {
      headerName: "Action",
      width: 100,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: ({ data }: { data?: Subscription }) => {
        if (!data) return null;
        if (data.status === "APPROVAL_PENDING" && data.approveUrl)
          return <a className="btn sm" href={data.approveUrl} target="_blank" rel="noreferrer">Approve ↗</a>;
        if (data.status !== "ACTIVE" && data.status !== "SUSPENDED") return null;
        return <button className="sm danger" onClick={(e) => { e.stopPropagation(); onCancel(data); }}>Cancel</button>;
      },
    },
  ];

  return (
    <section className="card glass">
      <div className="card-head">
        <div>
          <h2>All subscriptions</h2>
          <p>Sort, filter and click a row to highlight it on the timeline.</p>
        </div>
        <div className="tools">
          <input className="search" placeholder="Search merchants…" aria-label="Search subscriptions" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <button onClick={() => grid.current?.api.exportDataAsCsv({ fileName: "subshield-subscriptions.csv" })}>Export CSV</button>
        </div>
      </div>
      <div className="grid-pad">
        <AgGridReact<Subscription>
          ref={grid}
          theme={theme}
          rowData={subs}
          columnDefs={columns}
          defaultColDef={{ sortable: true, filter: true, resizable: true, suppressHeaderFilterButton: true }}
          quickFilterText={filter}
          domLayout="autoHeight"
          rowHeight={54}
          headerHeight={42}
          animateRows
          getRowId={(p) => p.data.id}
          getRowClass={(p) => (p.data?.id === selectedId ? "row-selected" : undefined)}
          onRowClicked={(e) => e.data && onSelect(e.data.id)}
        />
      </div>
    </section>
  );
}
