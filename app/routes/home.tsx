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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "~/components/ui/button";
import { LeaderBoard } from "./event/show/components/leaderboard";
import Leaderboard2 from "~/components/ui/leaderboard";

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
      <div>
        <h2 className="text-4xl mb-6 mt-4 font-bold leading-none tracking-light underline decoration-4 decoration-light-blue text-black dark:text-white">
          Events
        </h2>
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
    </>
  );
}
