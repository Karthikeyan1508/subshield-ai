"use client";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, colorSchemeDark, themeQuartz, type ColDef } from "ag-grid-community";
import { API, urgency, type Subscription } from "../lib";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withPart(colorSchemeDark);
const date = ({ value }: { value?: string | null }) => (value ? new Date(value).toLocaleDateString() : "—");
const SCORE_COLOR = { red: "#ff5c5c", yellow: "#f5b942", green: "#4cc38a" };

const columns = (onCancelled: () => void): ColDef<Subscription>[] => [
  { field: "merchant", flex: 1 },
  { field: "status", width: 160 },
  { headerName: "Price", width: 110, valueGetter: (p) => p.data?.price, valueFormatter: (p) => (p.value == null ? "—" : `$${Number(p.value).toFixed(2)}`) },
  {
    headerName: "Price change",
    flex: 1,
    valueGetter: (p) => p.data?.hike?.pct ?? 0,
    valueFormatter: (p) => {
      const h = p.data?.hike;
      return h ? `+${h.pct}% ($${h.from.toFixed(2)} → $${h.to.toFixed(2)})` : "none";
    },
  },
  { headerName: "Trial ends", field: "trialEndsAt", valueFormatter: date, width: 130 },
  { headerName: "Next charge", field: "nextBillingTime", valueFormatter: date, width: 130 },
  {
    headerName: "Predatory score",
    field: "predatoryScore",
    width: 150,
    sort: "desc",
    cellStyle: (p) => ({ fontWeight: 700, color: SCORE_COLOR[urgency(p.data!)] }),
  },
  {
    headerName: "Action",
    width: 130,
    sortable: false,
    cellRenderer: ({ data }: { data?: Subscription }) => {
      if (!data) return null;
      if (data.status === "APPROVAL_PENDING" && data.approveUrl)
        return <a href={data.approveUrl} target="_blank" rel="noreferrer">Approve ↗</a>;
      if (data.status !== "ACTIVE" && data.status !== "SUSPENDED") return null;
      return (
        <button
          onClick={async () => {
            if (!confirm(`Cancel ${data.merchant}?`)) return;
            const res = await fetch(`${API}/api/subscriptions/${data.id}/cancel`, { method: "POST" });
            if (!res.ok) alert(`Cancel failed: ${(await res.json()).error}`);
            onCancelled();
          }}
        >
          Cancel
        </button>
      );
    },
  },
];

export default function Matrix({ subs, onCancelled }: { subs: Subscription[]; onCancelled: () => void }) {
  return (
    <div style={{ height: 60 + subs.length * 42 }}>
      <AgGridReact theme={theme} rowData={subs} columnDefs={columns(onCancelled)} getRowId={(p) => p.data.id} />
    </div>
  );
}
