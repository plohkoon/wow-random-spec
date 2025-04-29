import { LoaderFunctionArgs, redirect } from "react-router";
import { AppSession } from "~/lib/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await AppSession.fromRequest(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await session.signout(),
    },
  });
};

export const action = loader;
