import type { LinksFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./tailwind.css";
import { Label } from "./components/ui/label";
import { Switch } from "./components/ui/switch";
import { H1 } from "./components/display/headers";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
          <div className="flex flex-row items-center space-x-2">
            <Label>Dark Mode</Label>
            <Switch name="darkmode" id="darkmode" />
          </div>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
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
