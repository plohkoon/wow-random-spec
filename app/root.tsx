import { useState } from "react";
import type { LinksFunction } from "react-router";
import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { Route } from "./+types/root";
import { H1 } from "./components/display/headers";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { ClientHintCheck, getHints } from "./lib/clientHints";
import { getDarkmodeSession } from "./lib/darkmode";
import "./tailwind.css";
import { AppSession } from "./lib/session.server";
import { Button } from "./components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await AppSession.fromRequest(request);

  const hints = getHints(request);
  let colorScheme = hints.theme;
  const darkModeOverride = (
    await getDarkmodeSession(request.headers.get("Cookie"))
  ).get("darkmode");
  if (darkModeOverride === "dark") {
    colorScheme = "dark";
  } else if (darkModeOverride === "light") {
    colorScheme = "light";
  }

  const user = await session.getUser();
  return {
    requestInfo: {
      hints,
      colorScheme,
      user: user ? { username: user.username } : null,
    },
  };
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const rootLoaderData = useRouteLoaderData(
    "root"
  ) as Route.ComponentProps["loaderData"];
  const defaultColorScheme = rootLoaderData?.requestInfo?.colorScheme;
  const username = rootLoaderData?.requestInfo?.user?.username;
  const [colorScheme, setColorScheme] = useState(defaultColorScheme);
  const submit = useSubmit();

  return (
    <html lang="en" className={colorScheme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-screen overscroll-none p-4">
        <div className="flex flex-row items-center space-x-4">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 inline-block" />
          <H1 className="grow">First Seasonal Tito and Dom's M+ Adventure</H1>
          <div className="flex flex-row space-x-2">
            {username ? (
              <>
                <span>Hi {username}</span>
                <Form action="/auth/signout" method="post">
                  <Button type="submit">Sign Out</Button>
                </Form>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-row items-center space-x-2">
            <Label>Dark Mode</Label>
            <Switch
              checked={colorScheme === "dark"}
              onCheckedChange={(v) => {
                console.log(v);
                const newValue = v ? "dark" : "light";
                setColorScheme(newValue);
                submit(
                  { colorScheme: newValue },
                  {
                    method: "post",
                    navigate: false,
                    action: "/",
                    encType: "application/json",
                  }
                );
              }}
            />
          </div>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
        <ClientHintCheck nonce="" />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <div>
      <h1>Unknown Error</h1>
    </div>
  );
}
