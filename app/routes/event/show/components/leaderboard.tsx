import { Suspense } from "react";
import { Await } from "react-router";
import { Route } from "../+types/route";

type MythicZip = Awaited<Route.ComponentProps["loaderData"]["mythicTeamZip"]>;
type MythicZipPromise = Promise<MythicZip | null>;

function LeaderBoardInternal({ zip }: { zip: MythicZipPromise }) {
  return <></>;
}

function LeaderBoardLoading() {
  return <div className="text-center">Loading...</div>;
}

function LeaderBoardMissing() {
  return <div className="text-center">No Mythic Data Found</div>;
}

export function LeaderBoard({ zip }: { zip: MythicZipPromise }) {
  return (
    <Suspense fallback={<LeaderBoardLoading />}>
      <Await resolve={zip}>
        {(mythicZip) => {
          if (!mythicZip) return <LeaderBoardMissing />;

          return <LeaderBoardInternal zip={zip} />;
        }}
      </Await>
    </Suspense>
  );
}
