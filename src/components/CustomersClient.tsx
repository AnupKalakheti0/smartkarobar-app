"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Phone, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { formatNPR } from "@/lib/utils";

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  group: string;
  area: string | null;
  status: string;
  balance: number;
  transactionCount: number;
}

const groupColors: Record<string, string> = {
  RETAIL: "bg-blue-100 text-blue-700",
  WHOLESALE: "bg-purple-100 text-purple-700",
  VIP: "bg-amber-100 text-amber-700",
};

export function CustomersClient({ customers }: { customers: CustomerData[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.phone || "").includes(search) ||
      (c.area || "").toLowerCase().includes(q);
    const matchesFilter = filter === "ALL" || c.group === filter;
    return matchesSearch && matchesFilter;
  });

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone") || null,
        group: fd.get("group"),
        area: fd.get("area") || null,
        status: fd.get("status"),
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
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500">{customers.length} total customers</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Search by name, phone, or area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "RETAIL", "WHOLESALE", "VIP"].map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                filter === g ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {g === "ALL" ? "All" : g.charAt(0) + g.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <div className="card p-8 text-center text-slate-400">No customers found</div>
        ) : (
          filtered.map(c => (
            <Link key={c.id} href={`/customers/${c.id}`} className="card flex items-center justify-between p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <span className={`badge ${groupColors[c.group] || "bg-slate-100 text-slate-600"}`}>
                      {c.group.charAt(0) + c.group.slice(1).toLowerCase()}
                    </span>
                    {c.status === "INACTIVE" && <span className="badge bg-slate-100 text-slate-500">Inactive</span>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {c.phone && <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>}
                    {c.area && <span className="flex items-center gap-1"><MapPin size={12} />{c.area}</span>}
                    <span>{c.transactionCount} transactions</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${c.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatNPR(Math.abs(c.balance))}
                </p>
                <p className="text-xs text-slate-400">{c.balance > 0 ? "Outstanding" : "Settled"}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input name="name" required className="input" placeholder="Customer name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <input name="phone" className="input" placeholder="9801234567" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Group</label>
              <select name="group" className="input" defaultValue="RETAIL">
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select name="status" className="input" defaultValue="ACTIVE">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Area</label>
            <input name="area" className="input" placeholder="Kalimati" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea name="notes" className="input" rows={2} placeholder="Optional notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">Add Customer</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
