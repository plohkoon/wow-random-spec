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
import { ClientHintCheck, getHints } from "./lib/clientHints";
import { getDarkmodeSession } from "./lib/darkmode";
import "./tailwind.css";
import { AppSession } from "./lib/session.server";
import Header from "./components/display/header";

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

export const meta: Route.MetaFunction = () => [
  { title: "Tito and Dom's M+ Adventure" },
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
      <body className="h-screen overscroll-none w-full">
        <Header
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          username={username}
        />
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
