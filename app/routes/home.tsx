import { data, Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { commitDarkmodeSession, getDarkmodeSession } from "~/lib/darkmode";
import { db } from "~/lib/db.server";
import { Route } from "./+types/home";
import EventCard from "~/routes/event/components/eventCard";

export async function loader(_: Route.LoaderArgs) {
  const events = await db.event.findMany();

  return data({ events });
}

export async function action({ request }: Route.ActionArgs) {
  const jsonData = await request.json();

  if (!jsonData.colorScheme) {
    return null;
  }
  const session = await getDarkmodeSession(request.headers.get("Cookie"));
  session.set("darkmode", jsonData.colorScheme);
  return data(null, {
    headers: {
      "Set-Cookie": await commitDarkmodeSession(session),
    },
  });
}

export default function App({ loaderData: { events } }: Route.ComponentProps) {
  return (
    <>
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-6xl font-bold text-foreground text-center">Events</h1>
          <p className="mt-2 text-muted-foreground text-center">
            Upcoming and past events for Currently Online.
          </p>
        </header>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <p className="text-muted-foreground">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
    </>
  );
}

        // <Table>
        //   <TableHeader>
        //     <TableRow>
        //       <TableHead>Event</TableHead>
        //       <TableHead>Name</TableHead>
        //       <TableHead>Started At</TableHead>
        //     </TableRow>
        //   </TableHeader>
        //   <TableBody>
        //     {events.map((event) => (
        //       <TableRow key={event.id}>
        //         <TableCell>
        //           <Link to={`/event/${event.slug}`}>{event.slug}</Link>
        //         </TableCell>
        //         <TableCell>{event.name}</TableCell>
        //         <TableCell>{event.createdAt.toString()}</TableCell>
        //       </TableRow>
        //     ))}
        //   </TableBody>
        // </Table>