"use client";

import { useState } from "react";
import { FileJson, FileSpreadsheet, Download } from "lucide-react";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    const res = await fetch("/api/export");
    return res.json();
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toCSV(data: any): string {
    let csv = "";

    csv += "=== CUSTOMERS ===\n";
    csv += "ID,Name,Phone,Group,Area,Status,CreatedAt\n";
    for (const c of data.customers) {
      csv += [c.id, c.name, c.phone || "", c.group, c.area || "", c.status, c.createdAt].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    }

    csv += "\n=== CUSTOMER TRANSACTIONS ===\n";
    csv += "ID,Customer,Type,Amount,Description,DateBS,DateAD\n";
    for (const t of data.customerTransactions) {
      csv += [t.id, t.customer.name, t.type, t.amount, t.description || "", t.dateBs, t.dateAd].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    }

    csv += "\n=== VENDORS ===\n";
    csv += "ID,Name,Phone,Area,CreatedAt\n";
    for (const v of data.vendors) {
      csv += [v.id, v.name, v.phone || "", v.area || "", v.createdAt].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    }

    csv += "\n=== VENDOR TRANSACTIONS ===\n";
    csv += "ID,Vendor,Type,Amount,Description,DateBS,DateAD\n";
    for (const t of data.vendorTransactions) {
      csv += [t.id, t.vendor.name, t.type, t.amount, t.description || "", t.dateBs, t.dateAd].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
    }

    return csv;
  }

  async function exportJSON() {
    setLoading(true);
    try {
      const data = await fetchData();
      download(JSON.stringify(data, null, 2), "smartkarobar-export.json", "application/json");
    } finally {
      setLoading(false);
    }
  }

  async function exportCSV() {
    setLoading(true);
    try {
      const data = await fetchData();
      download(toCSV(data), "smartkarobar-export.csv", "text/csv");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Export Data</h1>
        <p className="text-sm text-slate-500">Download your business data for backup and portability</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button onClick={exportCSV} disabled={loading} className="card flex flex-col items-center gap-3 p-8 transition hover:shadow-md disabled:opacity-50">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <FileSpreadsheet size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Export as CSV</h3>
          <p className="text-center text-sm text-slate-500">Spreadsheet format for Excel, Google Sheets</p>
          <span className="btn-primary mt-2"><Download size={16} /> Download CSV</span>
        </button>

        <button onClick={exportJSON} disabled={loading} className="card flex flex-col items-center gap-3 p-8 transition hover:shadow-md disabled:opacity-50">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FileJson size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Export as JSON</h3>
          <p className="text-center text-sm text-slate-500">Structured data for import and backup</p>
          <span className="btn-primary mt-2"><Download size={16} /> Download JSON</span>
        </button>
      </div>

      <div className="card p-5">
        <h3 className="mb-2 font-semibold text-slate-800">Your Data Stays Yours</h3>
        <p className="text-sm text-slate-500">
          SmartKarobar supports data portability. Export your complete business records — customers, vendors,
          and all transactions — in CSV or JSON format. Your data is never locked in.
        </p>
      </div>
    </div>
  );
}
