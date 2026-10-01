"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, MessageCircle, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Modal } from "@/components/Modal";
import { formatNPR, formatAdDate } from "@/lib/utils";
import { todayBsDate } from "@/lib/bs-date";

interface TxData {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  dateBs: string;
  dateAd: string;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  group: string;
  area: string | null;
  status: string;
  notes: string | null;
  balance: number;
  transactions: TxData[];
}

export function CustomerDetailClient({ customer }: { customer: CustomerData }) {
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<"CREDIT_SALE" | "PAYMENT">("CREDIT_SALE");
  const router = useRouter();

  function openTxForm(type: "CREDIT_SALE" | "PAYMENT") {
    setTxType(type);
    setShowAddTx(true);
  }

  async function handleAddTx(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/customers/${customer.id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: txType,
        amount: parseFloat(fd.get("amount") as string),
        description: fd.get("description") || null,
      }),
    });
    setShowAddTx(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete customer "${customer.name}" and all transactions?`)) return;
    await fetch(`/api/customers/${customer.id}`, { method: "DELETE" });
    router.push("/customers");
    router.refresh();
  }

  const waLink = customer.phone
    ? `https://wa.me/977${customer.phone}?text=${encodeURIComponent(
        `Dear ${customer.name}, your outstanding amount is ${formatNPR(Math.max(0, customer.balance))}. Please clear your dues at your earliest convenience. - SmartKarobar`
      )}`
    : null;

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      {/* Customer header */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{customer.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="badge bg-blue-100 text-blue-700">{customer.group}</span>
                <span className={`badge ${customer.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {customer.status}
                </span>
                {customer.phone && <span>{customer.phone}</span>}
                {customer.area && <span>· {customer.area}</span>}
              </div>
              {customer.notes && <p className="mt-2 text-sm text-slate-400">{customer.notes}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Outstanding Balance</p>
            <p className={`text-2xl font-bold ${customer.balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatNPR(Math.abs(customer.balance))}
            </p>
            <p className="text-xs text-slate-400">{customer.balance > 0 ? "Customer owes you" : "Fully settled"}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => openTxForm("CREDIT_SALE")} className="btn-primary">
            <Plus size={16} /> Credit Sale
          </button>
          <button onClick={() => openTxForm("PAYMENT")} className="btn-secondary">
            <ArrowDownLeft size={16} /> Record Payment
          </button>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <MessageCircle size={16} /> WhatsApp Reminder
            </a>
          )}
          <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Transaction History</h2>
        {customer.transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Date (BS)</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Description</th>
                  <th className="pb-2 pl-4 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {customer.transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-700">{tx.dateBs}</p>
                      <p className="text-xs text-slate-400">{formatAdDate(tx.dateAd)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`badge ${tx.type === "CREDIT_SALE" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {tx.type === "CREDIT_SALE" ? "Credit Sale" : "Payment"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{tx.description || "—"}</td>
                    <td className={`py-3 pl-4 text-right font-semibold ${tx.type === "CREDIT_SALE" ? "text-blue-600" : "text-emerald-600"}`}>
                      {tx.type === "CREDIT_SALE" ? "+" : "-"}{formatNPR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add transaction modal */}
      <Modal open={showAddTx} onClose={() => setShowAddTx(false)} title={txType === "CREDIT_SALE" ? "Add Credit Sale" : "Record Payment"}>
        <form onSubmit={handleAddTx} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Customer: <span className="font-medium text-slate-700">{customer.name}</span>
            <br />Date: <span className="font-medium text-slate-700">{todayBsDate()}</span>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount (Rs) *</label>
            <input name="amount" type="number" step="0.01" min="0" required className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input name="description" className="input" placeholder="What was sold / payment method" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 justify-center">
              {txType === "CREDIT_SALE" ? "Add Credit Sale" : "Record Payment"}
            </button>
            <button type="button" onClick={() => setShowAddTx(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
