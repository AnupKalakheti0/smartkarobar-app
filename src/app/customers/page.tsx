import { prisma } from "@/lib/prisma";
import { CustomersClient } from "@/components/CustomersClient";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { transactions: { select: { type: true, amount: true } } },
    orderBy: { createdAt: "desc" },
  });

  const customersWithBalance = customers.map(c => {
    const balance = c.transactions.reduce(
      (sum, t) => (t.type === "CREDIT_SALE" ? sum + t.amount : sum - t.amount),
      0
    );
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      group: c.group,
      area: c.area,
      status: c.status,
      balance,
      transactionCount: c.transactions.length,
    };
  });

  return <CustomersClient customers={customersWithBalance} />;
}
