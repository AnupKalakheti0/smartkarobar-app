import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vendor = await prisma.vendor.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      area: body.area || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(vendor);
}
