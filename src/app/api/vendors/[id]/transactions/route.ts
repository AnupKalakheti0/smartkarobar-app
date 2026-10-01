import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { todayBsDate } from "@/lib/bs-date";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const tx = await prisma.vendorTransaction.create({
    data: {
      vendorId: params.id,
      type: body.type,
      amount: parseFloat(body.amount),
      description: body.description || null,
      dateBs: todayBsDate(),
    },
  });
  return NextResponse.json(tx);
}
