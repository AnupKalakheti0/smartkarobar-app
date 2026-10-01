"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Phone, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { formatNPR } from "@/lib/utils";

interface VendorData {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  balance: number;
  transactionCount: number;
}

export function VendorsClient({ vendors }: { vendors: VendorData[] }) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.phone || "").includes(search) ||
      (v.area || "").toLowerCase().includes(q)
    );
  });

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone") || null,
        area: fd.get("area") || null,
        notes: fd.get("notes") || null,
      }),
    });
    setShowAdd(false);
    router.refresh();
  }

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-sm text-slate-500">{vendors.length} total vendors</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          className="input pl-10"
          placeholder="Search by name, phone, or area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">No vendors found</div>
        ) : (
          filtered.map(v => (
            <Link key={v.id} href={`/vendors/${v.id}`} className="card flex items-center justify-between p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                  {v.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-800">{v.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {v.phone && <span className="flex items-center gap-1"><Phone size={12} />{v.phone}</span>}
                    {v.area && <span className="flex items-center gap-1"><MapPin size={12} />{v.area}</span>}
                    <span>{v.transactionCount} transactions</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${v.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatNPR(Math.abs(v.balance))}
                </p>
                <p className="text-xs text-slate-400">{v.balance > 0 ? "You owe" : "Settled"}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Vendor">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input name="name" required className="input" placeholder="Vendor / supplier name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input name="phone" className="input" placeholder="9801234567" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
            <input name="area" className="input" placeholder="Kalanki" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea name="notes" className="input" rows={2} placeholder="Optional notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Add Vendor</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
