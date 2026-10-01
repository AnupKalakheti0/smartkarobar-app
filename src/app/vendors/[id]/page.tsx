import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VendorDetailClient } from "@/components/VendorDetailClient";

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: { transactions: { orderBy: { dateAd: "desc" } } },
  });

  if (!vendor) notFound();

  const balance = vendor.transactions.reduce(
    (sum, t) => (t.type === "PURCHASE" ? sum + t.amount : sum - t.amount),
    0
  );

  const serialized = {
    id: vendor.id,
    name: vendor.name,
    phone: vendor.phone,
    area: vendor.area,
    notes: vendor.notes,
    balance,
    transactions: vendor.transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      dateBs: t.dateBs,
      dateAd: t.dateAd.toISOString(),
    })),
  };

  return <VendorDetailClient vendor={serialized} />;
}
