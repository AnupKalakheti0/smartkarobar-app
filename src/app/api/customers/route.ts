import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      group: body.group || "RETAIL",
      area: body.area || null,
      status: body.status || "ACTIVE",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(customer);
}
