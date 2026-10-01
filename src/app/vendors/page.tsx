import { prisma } from "@/lib/prisma";
import { VendorsClient } from "@/components/VendorsClient";

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: { transactions: { select: { type: true, amount: true } } },
    orderBy: { createdAt: "desc" },
  });

  const vendorsWithBalance = vendors.map(v => {
    const balance = v.transactions.reduce(
      (sum, t) => (t.type === "PURCHASE" ? sum + t.amount : sum - t.amount),
      0
    );
    return {
      id: v.id,
      name: v.name,
      phone: v.phone,
      area: v.area,
      balance,
      transactionCount: v.transactions.length,
    };
  });

  return <VendorsClient vendors={vendorsWithBalance} />;
}
