import { Form, Link, useSubmit } from "react-router";
import { H1 } from "./headers";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

interface HeaderProps {
  colorScheme: "light" | "dark";
  setColorScheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  username?: string | null;
}

export default function Header({
  colorScheme,
  setColorScheme,
  username,
}: HeaderProps) {
  const submit = useSubmit();

  return (
    <>
<div className="sticky top-0 z-50 bg-white dark:bg-black flex items-center justify-between w-full p-2">
        {/* Logo + Title */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          </Link>
          <H1 className="text-sm md:text-lg lg:text-3xl">
            Tito and Dom's M+ Adventure
          </H1>
        </div>

        {/* Desktop Nav (Sign in/out + Switch) */}
        <div className="hidden md:flex items-center space-x-4">
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
          <div className="flex items-center space-x-2">
            <Label>Dark Mode</Label>
            <Switch
              checked={colorScheme === "dark"}
              onCheckedChange={(v) => {
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

        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {username ? (
                <>
                  <DropdownMenuItem>Hi {username}</DropdownMenuItem>
                  <Form action="/auth/signout" method="post">
                    <DropdownMenuItem asChild>
                      <button type="submit">Sign Out</button>
                    </DropdownMenuItem>
                  </Form>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/signin">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/auth/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem asChild>
                <div className="flex items-center space-x-2">
                  <Label>Dark Mode</Label>
                  <Switch
                    checked={colorScheme === "dark"}
                    onCheckedChange={(v) => {
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
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
