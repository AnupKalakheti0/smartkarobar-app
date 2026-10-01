import { prisma } from "@/lib/prisma";
import { SummaryCard } from "@/components/SummaryCard";
import { formatNPR } from "@/lib/utils";
import { Wallet, CreditCard, Users, UserCheck, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [
    creditSalesAgg, customerPaymentsAgg,
    purchasesAgg, vendorPaymentsAgg,
    activeCustomers, totalCustomers,
    recentCustomerTx, recentVendorTx,
  ] = await Promise.all([
    prisma.customerTransaction.aggregate({ where: { type: "CREDIT_SALE" }, _sum: { amount: true } }),
    prisma.customerTransaction.aggregate({ where: { type: "PAYMENT" }, _sum: { amount: true } }),
    prisma.vendorTransaction.aggregate({ where: { type: "PURCHASE" }, _sum: { amount: true } }),
    prisma.vendorTransaction.aggregate({ where: { type: "PAYMENT" }, _sum: { amount: true } }),
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.count(),
    prisma.customerTransaction.findMany({ take: 5, orderBy: { dateAd: "desc" }, include: { customer: { select: { name: true } } } }),
    prisma.vendorTransaction.findMany({ take: 5, orderBy: { dateAd: "desc" }, include: { vendor: { select: { name: true } } } }),
  ]);

  const totalReceivables = (creditSalesAgg._sum.amount || 0) - (customerPaymentsAgg._sum.amount || 0);
  const totalPayables = (purchasesAgg._sum.amount || 0) - (vendorPaymentsAgg._sum.amount || 0);

  type RecentTx = { id: string; date: Date; dateBs: string; party: string; partyType: string; type: string; amount: number; description: string | null };
  const recentTx: RecentTx[] = [
    ...recentCustomerTx.map(t => ({ id: t.id, date: t.dateAd, dateBs: t.dateBs, party: t.customer.name, partyType: "customer", type: t.type, amount: t.amount, description: t.description })),
    ...recentVendorTx.map(t => ({ id: t.id, date: t.dateAd, dateBs: t.dateBs, party: t.vendor.name, partyType: "vendor", type: t.type, amount: t.amount, description: t.description })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Business overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Receivables" value={formatNPR(totalReceivables)} icon={Wallet} color="emerald" />
        <SummaryCard label="Total Payables" value={formatNPR(totalPayables)} icon={CreditCard} color="red" />
        <SummaryCard label="Active Customers" value={String(activeCustomers)} icon={UserCheck} color="blue" />
        <SummaryCard label="Total Customers" value={String(totalCustomers)} icon={Users} color="amber" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/customers" className="btn-primary"><Plus size={16} /> Add Credit Sale</Link>
        <Link href="/vendors" className="btn-secondary">View Vendors</Link>
        <Link href="/reports" className="btn-secondary">Reports</Link>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Recent Transactions</h2>
        {recentTx.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.type === "PAYMENT" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
                    {tx.type === "PAYMENT" ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{tx.party}</p>
                    <p className="text-xs text-slate-400">{tx.dateBs} · {tx.description || tx.type.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "PAYMENT" ? "text-emerald-600" : "text-slate-700"}`}>
                    {tx.type === "PAYMENT" ? "+" : "-"}{formatNPR(tx.amount)}
                  </p>
                  <p className="text-xs capitalize text-slate-400">{tx.partyType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
