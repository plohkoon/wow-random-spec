import { commitDarkmodeSession, getDarkmodeSession } from "~/lib/darkmode";
import { Route } from "./+types/home";
import { data } from "react-router";

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

export default function App() {
  return <div>Home</div>;
}
