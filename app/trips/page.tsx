import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TripsPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center text-xl text-gray-700">
        Please Sign In
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user?.id },
  });

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const today = new Date();
  today.setHours(0,0,0,0);
  const upcomingTrips = sortedTrips.filter(
    (trip) => new Date(trip.startDate) >= today
  );

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/trips/new">
          <Button>New Trip</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>
                Welcome Back , {session.user?.name} </CardTitle>
        </CardHeader>
        <CardContent>
            <p>{trips.length === 0 ? "Start Planning your first trip by clicking the button above": 
            `You have ${trips.length} ${trips.length ===1 ? "trip" :"trips"} planned . ${upcomingTrips.length >0 ? `You have ${upcomingTrips.length} trips coming up!` : ""}`}</p>
        </CardContent>
        <div>
            <h2 className= "text-xl font-semibold mb-4">Your Recent Trips</h2>
            {trips.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justifu-center py-8">
                        <h3 className= "text-xl font-medium mb-2">No trips yet.</h3>
                        <p className= "text-center mb-4 max-w-md">Start planning your adventure by creating your first trip</p>
                        <Link href="/trips/new">
                            <Button>Create Trip</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) :(
                <div className= "grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedTrips.slice(0,6).map((trip,key)=> (
                        <Link key = {key} href = {""}>
                            <Card className="h-full hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className= "line-clamp-1">
                                      {trip.title} 
                                      </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className = "text-sm line-clamp-2 mb-2">
                                      {trip.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}