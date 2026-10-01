import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const vendor = await prisma.vendor.update({
    where: { id: params.id },
    data: {
      name: body.name,
      phone: body.phone || null,
      area: body.area || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(vendor);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.vendor.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
