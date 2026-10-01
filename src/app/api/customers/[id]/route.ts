import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      name: body.name,
      phone: body.phone || null,
      group: body.group,
      area: body.area || null,
      status: body.status,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(customer);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
