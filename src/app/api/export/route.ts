import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [customers, vendors, customerTransactions, vendorTransactions] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.vendor.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.customerTransaction.findMany({
      orderBy: { dateAd: "asc" },
      include: { customer: { select: { name: true } } },
    }),
    prisma.vendorTransaction.findMany({
      orderBy: { dateAd: "asc" },
      include: { vendor: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    customers,
    vendors,
    customerTransactions: customerTransactions.map(t => ({
      id: t.id,
      customer: t.customer.name,
      type: t.type,
      amount: t.amount,
      description: t.description,
      dateBs: t.dateBs,
      dateAd: t.dateAd.toISOString(),
    })),
    vendorTransactions: vendorTransactions.map(t => ({
      id: t.id,
      vendor: t.vendor.name,
      type: t.type,
      amount: t.amount,
      description: t.description,
      dateBs: t.dateBs,
      dateAd: t.dateAd.toISOString(),
    })),
  });
}
