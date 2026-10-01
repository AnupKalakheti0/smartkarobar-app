import { PrismaClient, CustomerGroup, CustomerStatus, CustomerTxType, VendorTxType } from "@prisma/client";
import { formatBsDate } from "../src/lib/bs-date";

const prisma = new PrismaClient();

async function main() {
  // Check if already seeded
  const count = await prisma.customer.count();
  if (count > 0) {
    console.log("Seed: data already present, skipping");
    return;
  }

  const customers = [
    { name: "Sharma Kirana Store", phone: "9801234567", group: CustomerGroup.RETAIL, area: "Kalimati", status: CustomerStatus.ACTIVE },
    { name: "Hari Wholesale", phone: "9802345678", group: CustomerGroup.WHOLESALE, area: "Lazimpat", status: CustomerStatus.ACTIVE },
    { name: "Bishal Trading", phone: "9803456789", group: CustomerGroup.VIP, area: "New Road", status: CustomerStatus.ACTIVE },
    { name: "Sita Variety Store", phone: "9804567890", group: CustomerGroup.RETAIL, area: "Kalimati", status: CustomerStatus.ACTIVE },
    { name: "Gorkha Enterprises", phone: "9805678901", group: CustomerGroup.WHOLESALE, area: "Bhaktapur", status: CustomerStatus.ACTIVE },
    { name: "Annapurna Sweets", phone: "9806789012", group: CustomerGroup.VIP, area: "Patan", status: CustomerStatus.INACTIVE },
  ];

  const vendors = [
    { name: "Nepal Food Suppliers", phone: "9851111111", area: "Kalanki" },
    { name: "Himalayan Distributors", phone: "9852222222", area: "Thapathali" },
    { name: "Anmol Wholesale Pvt Ltd", phone: "9853333333", area: "Bhaktapur" },
  ];

  const createdCustomers = [];
  for (const c of customers) {
    createdCustomers.push(await prisma.customer.create({ data: c }));
  }

  const createdVendors = [];
  for (const v of vendors) {
    createdVendors.push(await prisma.vendor.create({ data: v }));
  }

  // Customer transactions
  const txData: Array<{ customerIdx: number; type: CustomerTxType; amount: number; description: string; daysAgo: number }> = [
    { customerIdx: 0, type: CustomerTxType.CREDIT_SALE, amount: 5000, description: "Rice, oil, sugar", daysAgo: 30 },
    { customerIdx: 0, type: CustomerTxType.PAYMENT, amount: 2000, description: "Cash payment", daysAgo: 15 },
    { customerIdx: 0, type: CustomerTxType.CREDIT_SALE, amount: 3500, description: "Weekly groceries", daysAgo: 7 },
    { customerIdx: 1, type: CustomerTxType.CREDIT_SALE, amount: 25000, description: "Bulk wholesale order", daysAgo: 45 },
    { customerIdx: 1, type: CustomerTxType.PAYMENT, amount: 10000, description: "Bank transfer", daysAgo: 20 },
    { customerIdx: 2, type: CustomerTxType.CREDIT_SALE, amount: 12000, description: "Festival supply", daysAgo: 60 },
    { customerIdx: 2, type: CustomerTxType.PAYMENT, amount: 12000, description: "Full settlement", daysAgo: 50 },
    { customerIdx: 2, type: CustomerTxType.CREDIT_SALE, amount: 8000, description: "Monthly supply", daysAgo: 10 },
    { customerIdx: 3, type: CustomerTxType.CREDIT_SALE, amount: 3200, description: "Daily essentials", daysAgo: 5 },
    { customerIdx: 4, type: CustomerTxType.CREDIT_SALE, amount: 18000, description: "Wholesale batch", daysAgo: 25 },
    { customerIdx: 4, type: CustomerTxType.PAYMENT, amount: 5000, description: "Partial payment", daysAgo: 10 },
    { customerIdx: 5, type: CustomerTxType.CREDIT_SALE, amount: 7500, description: "Sweets order", daysAgo: 90 },
    { customerIdx: 5, type: CustomerTxType.PAYMENT, amount: 3000, description: "Cash", daysAgo: 80 },
  ];

  for (const tx of txData) {
    const dateAd = new Date();
    dateAd.setDate(dateAd.getDate() - tx.daysAgo);
    await prisma.customerTransaction.create({
      data: {
        customerId: createdCustomers[tx.customerIdx].id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        dateBs: formatBsDate(dateAd),
        dateAd,
      },
    });
  }

  // Vendor transactions
  const vendorTxData: Array<{ vendorIdx: number; type: VendorTxType; amount: number; description: string; daysAgo: number }> = [
    { vendorIdx: 0, type: VendorTxType.PURCHASE, amount: 15000, description: "Food supplies purchase", daysAgo: 35 },
    { vendorIdx: 0, type: VendorTxType.PAYMENT, amount: 8000, description: "Bank transfer to vendor", daysAgo: 20 },
    { vendorIdx: 0, type: VendorTxType.PURCHASE, amount: 6000, description: "Additional stock", daysAgo: 5 },
    { vendorIdx: 1, type: VendorTxType.PURCHASE, amount: 22000, description: "Bulk goods", daysAgo: 40 },
    { vendorIdx: 1, type: VendorTxType.PAYMENT, amount: 22000, description: "Full payment", daysAgo: 30 },
    { vendorIdx: 1, type: VendorTxType.PURCHASE, amount: 11000, description: "New order", daysAgo: 8 },
    { vendorIdx: 2, type: VendorTxType.PURCHASE, amount: 9500, description: "Packaging materials", daysAgo: 15 },
  ];

  for (const tx of vendorTxData) {
    const dateAd = new Date();
    dateAd.setDate(dateAd.getDate() - tx.daysAgo);
    await prisma.vendorTransaction.create({
      data: {
        vendorId: createdVendors[tx.vendorIdx].id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        dateBs: formatBsDate(dateAd),
        dateAd,
      },
    });
  }

  console.log("Seed: data inserted successfully");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
