import { commitDarkmodeSession, getDarkmodeSession } from "~/lib/darkmode";
import { Route } from "./+types/home";
import { data, Link } from "react-router";
import { db } from "~/lib/db.server";
import { H2 } from "~/components/display/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

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
    <div>
      <H2>Events</H2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Started At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Link to={`/event/${event.slug}`}>{event.slug}</Link>
              </TableCell>
              <TableCell>{event.name}</TableCell>
              <TableCell>{event.createdAt.toString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
