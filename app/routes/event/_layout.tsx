import { Link, Outlet, useMatch, useMatches } from "react-router";
import { Route } from "./+types/_layout";
import { AppSession } from "~/lib/session.server";
import { db } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import { H2 } from "~/components/display/headers";
import { z } from "zod";

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
      <div className="flex items-center justify-between mb-2 mt-12">
        <div>
          <Button asChild>
            <Link to={`/event/${slug}/lists`} className="underline">
              View Lists {">"}
            </Link>
          </Button>
        </div>
        <div className="flex-1 text-center mb-4">
          <H2>{name}</H2>
          {isAdmin && (
            <div className="text-center mb-6 mt-4">
              <Button asChild>
                {edit ? (
                  <Link to={`/event/${slug}`}>Done Editing</Link>
                ) : (
                  <Link to={`/event/${slug}/edit`}>Edit Event</Link>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </main>
  );
}
