"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { API, type Subscription } from "../lib";
import Matrix from "./Matrix";

// Bryntum touches the DOM at import time, so it must skip server rendering.
const Timeline = dynamic(() => import("./Timeline"), { ssr: false });

export default function Dashboard() {
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API}/api/subscriptions`)
      .then((r) => (r.ok ? r.json() : r.json().then((b) => Promise.reject(new Error(b.error ?? r.statusText)))))
      .then(setSubs)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p role="alert">Could not load subscriptions: {error}</p>;
  if (!subs) return <p>Loading…</p>;
  return (
    <>
      <h2>Renewals — next 30 days</h2>
      <Timeline subs={subs} />
      <h2>Subscriptions</h2>
      <Matrix subs={subs} />
    </>
  );
}
