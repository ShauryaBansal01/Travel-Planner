import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TripDetailClient from "@/components/trip-detail";

export default async function TripDetail(
  { params }: { params: Promise<{ tripid: string }> }
) {
  const { tripid } = await params;
  const session = await auth();

  if (!session) {
    return <div>Please sign in .</div>
  }
  const trip = await prisma.trip.findFirst({
    where: { id: tripid , userId: session.user?.id},
    include: {
      locations: true,
    },
  })

  if(!trip){
    return <div>Trip not found</div>
  }

  return <TripDetailClient trip={trip} />
}