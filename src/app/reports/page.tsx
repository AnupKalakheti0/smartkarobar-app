import { prisma } from "@/lib/prisma";
import { SummaryCard } from "@/components/SummaryCard";
import { formatNPR } from "@/lib/utils";
import { Wallet, CreditCard, Scale, BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const [customers, vendors, customerPayments, vendorPayments] = await Promise.all([
    prisma.customer.findMany({
      include: { transactions: { select: { type: true, amount: true } } },
    }),
    prisma.vendor.findMany({
      include: { transactions: { select: { type: true, amount: true } } },
    }),
    prisma.customerTransaction.findMany({
      where: { type: "PAYMENT" },
      orderBy: { dateAd: "desc" },
      take: 10,
      include: { customer: { select: { name: true } } },
    }),
    prisma.vendorTransaction.findMany({
      where: { type: "PAYMENT" },
      orderBy: { dateAd: "desc" },
      take: 10,
      include: { vendor: { select: { name: true } } },
    }),
  ]);

  // Calculate customer balances
  const customerBalances = customers.map(c => {
    const balance = c.transactions.reduce(
      (sum, t) => (t.type === "CREDIT_SALE" ? sum + t.amount : sum - t.amount), 0
    );
    return { id: c.id, name: c.name, area: c.area || "Unknown", group: c.group, balance, txCount: c.transactions.length };
  });

  const vendorBalances = vendors.map(v => {
    const balance = v.transactions.reduce(
      (sum, t) => (t.type === "PURCHASE" ? sum + t.amount : sum - t.amount), 0
    );
    return { id: v.id, name: v.name, area: v.area || "Unknown", balance, txCount: v.transactions.length };
  });

  const totalReceivables = customerBalances.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  const totalPayables = vendorBalances.reduce((sum, v) => sum + Math.max(0, v.balance), 0);
  const netPosition = totalReceivables - totalPayables;

  // Area-wise breakdown
  const areaMap = new Map<string, { customers: number; receivables: number; payables: number }>();
  for (const c of customerBalances) {
    if (!areaMap.has(c.area)) areaMap.set(c.area, { customers: 0, receivables: 0, payables: 0 });
    const a = areaMap.get(c.area)!;
    a.customers++;
    a.receivables += Math.max(0, c.balance);
  }
  for (const v of vendorBalances) {
    if (!areaMap.has(v.area)) areaMap.set(v.area, { customers: 0, receivables: 0, payables: 0 });
    areaMap.get(v.area)!.payables += Math.max(0, v.balance);
  }
  const areaData = Array.from(areaMap.entries()).map(([area, d]) => ({ area, ...d }))
    .sort((a, b) => b.receivables - a.receivables);

  // Top outstanding customers
  const topOutstanding = [...customerBalances].filter(c => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);
  const topPayables = [...vendorBalances].filter(v => v.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);

  return (
    <div className="space-y-6 pt-16 md:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-sm text-slate-500">Business insights and summaries</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Receivables" value={formatNPR(totalReceivables)} icon={Wallet} color="emerald" />
        <SummaryCard label="Total Payables" value={formatNPR(totalPayables)} icon={CreditCard} color="red" />
        <SummaryCard label="Net Position" value={formatNPR(netPosition)} icon={Scale} color={netPosition >= 0 ? "emerald" : "red"} />
      </div>

      {/* Area-wise report */}
      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
          <BarChart3 size={18} /> Area-wise Report
        </h2>
        {areaData.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="pb-2 pr-4 font-medium">Area</th>
                  <th className="pb-2 pr-4 text-right font-medium">Customers</th>
                  <th className="pb-2 pr-4 text-right font-medium">Receivables</th>
                  <th className="pb-2 pl-4 text-right font-medium">Payables</th>
                </tr>
              </thead>
              <tbody>
                {areaData.map(a => (
                  <tr key={a.area} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-700">{a.area}</td>
                    <td className="py-3 pr-4 text-right text-slate-600">{a.customers}</td>
                    <td className="py-3 pr-4 text-right font-medium text-emerald-600">{formatNPR(a.receivables)}</td>
                    <td className="py-3 pl-4 text-right font-medium text-red-600">{formatNPR(a.payables)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top outstanding customers */}
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top Outstanding Customers</h2>
          {topOutstanding.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No outstanding balances</p>
          ) : (
            <div className="space-y-2">
              {topOutstanding.map(c => (
                <div key={c.id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.area} · {c.group}</p>
                  </div>
                  <p className="text-sm font-semibold text-red-600">{formatNPR(c.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top payables */}
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Top Outstanding Payables</h2>
          {topPayables.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No outstanding payables</p>
          ) : (
            <div className="space-y-2">
              {topPayables.map(v => (
                <div key={v.id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{v.name}</p>
                    <p className="text-xs text-slate-400">{v.area}</p>
                  </div>
                  <p className="text-sm font-semibold text-red-600">{formatNPR(v.balance)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent payments */}
      <div className="card p-5">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Recent Payments Received</h2>
        {customerPayments.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">No payments recorded</p>
        ) : (
          <div className="space-y-2">
            {customerPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.customer.name}</p>
                  <p className="text-xs text-slate-400">{p.dateBs} · {p.description || "Payment"}</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">+{formatNPR(p.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
