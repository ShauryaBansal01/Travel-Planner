"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function reorderItinerary(tripId: string, newOrder: string[]) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }

  for (let i = 0; i < newOrder.length; i++) {
    await prisma.location.update({
      where: { id: newOrder[i] },
      data: { order: i },
    });
  }
}