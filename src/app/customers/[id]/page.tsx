import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/CustomerDetailClient";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { transactions: { orderBy: { dateAd: "desc" } } },
  });

  if (!customer) notFound();

  const balance = customer.transactions.reduce(
    (sum, t) => (t.type === "CREDIT_SALE" ? sum + t.amount : sum - t.amount),
    0
  );

  const serialized = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    group: customer.group,
    area: customer.area,
    status: customer.status,
    notes: customer.notes,
    balance,
    transactions: customer.transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      dateBs: t.dateBs,
      dateAd: t.dateAd.toISOString(),
    })),
  };

  return <CustomerDetailClient customer={serialized} />;
}
