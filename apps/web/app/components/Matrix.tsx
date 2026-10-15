"use client";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, colorSchemeDark, themeQuartz, type ColDef } from "ag-grid-community";
import { urgency, type Subscription } from "../lib";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeQuartz.withPart(colorSchemeDark);
const date = ({ value }: { value?: string | null }) => (value ? new Date(value).toLocaleDateString() : "—");
const SCORE_COLOR = { red: "#ff5c5c", yellow: "#f5b942", green: "#4cc38a" };

const columns: ColDef<Subscription>[] = [
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
];

export default function Matrix({ subs }: { subs: Subscription[] }) {
  return (
    <div style={{ height: 60 + subs.length * 42 }}>
      <AgGridReact theme={theme} rowData={subs} columnDefs={columns} getRowId={(p) => p.data.id} />
    </div>
  );
}
