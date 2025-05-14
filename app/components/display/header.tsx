import { Form, Link, useSubmit } from "react-router";
import { H1 } from "./headers";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";

interface HeaderProps {
  colorScheme: "light" | "dark";
  setColorScheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  username?: string | null;
}


export default function Header({ colorScheme, setColorScheme, username }: HeaderProps) {
      const submit = useSubmit();

    return (
        <>
        <div className="flex flex-row items-center space-x-4">
          <Link to="/">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-16 w-16 inline-block"
            />
          </Link>
          <H1 className="grow">Tito and Dom's M+ Adventure</H1>
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
        </>
    )
}