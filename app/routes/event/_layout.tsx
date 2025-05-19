import { Link, Outlet, useMatches } from "react-router";
import { z } from "zod";
import { H2 } from "~/components/display/headers";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";
import { AppSession } from "~/lib/session.server";
import { Route } from "./+types/_layout";

export const loader = async ({
  request,
  params: { slug },
}: Route.LoaderArgs) => {
  const session = await AppSession.fromRequest(request);
  const isAdmin = await session.isAdmin();

  const event = await db.event.findUnique({
    where: { slug },
  });

  return { isAdmin, name: event?.name ?? "unknown event" };
};

const schema = z
  .object({
    edit: z.boolean().optional(),
  })
  .transform((v) => v.edit);

export default function EventLayout({
  loaderData: { isAdmin, name },
  params: { slug },
}: Route.ComponentProps) {
  const edit = useMatches().reduce(
    (acc, match) => acc || !!schema.safeParse(match.handle).data,
    false
  );

  return (
    <main>
      <div className="flex items-center justify-between mb-2 mt-6 flex-col md:flex-row space-y-4">
        <H2 className="text-6xl mx-4">{name}</H2>
        <div className="flex-1 flex flex-row space-x-4 justify-end items-center px-4">
          <Button asChild>
            <Link to={`/event/${slug}/lists`} className="underline">
              View Lists {">"}
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/event/${slug}/stats`} className="underline">
              View Stats {">"}
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild>
              {edit ? (
                <Link to={`/event/${slug}`} className="underline">
                  Done Editing
                </Link>
              ) : (
                <Link to={`/event/${slug}/edit`} className="underline">
                  Edit Event
                </Link>
              )}
            </Button>
          )}
        </div>
      </div>
      <Outlet />
    </main>
  );
}
