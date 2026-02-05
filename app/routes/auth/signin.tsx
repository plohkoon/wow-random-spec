import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { User2 } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { Form, useLoaderData } from "react-router";
import { z } from "zod";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { authenticator } from "~/lib/auth.server";
import { AppSession } from "~/lib/session.server";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await AppSession.fromRequest(request);
  if (session.hasUser) {
    return redirect("/");
  }

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const [session, user] = await Promise.all([
    AppSession.fromRequest(request),
    authenticator.authenticate("form", request),
  ]);

  // No 2fa stuff for the time being.
  // if (user.isTwoFactorEnabled) {
  //   session.set2faUserId(user.id);
  //   return redirect($path("/2fa"), {
  //     headers: { "Set-Cookie": await session.commit() },
  //   });
  // }
  session.setUser(user);
  return redirect("/", {
    headers: {
      "Set-Cookie": await session.commit(),
    },
  });
};

export default function Signin() {
  const lastResult = useLoaderData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema });
    },
  });

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Sign In          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" id={form.id} onSubmit={form.onSubmit} className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Email
              </p>
              <CTextInput label="" config={fields.email} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Password              </p>
              <p className="text-xs text-muted-foreground">
                If you are not already an admin, this currently does nothing!!!!!!            </p>
            </div>
            <CTextInput label="" config={fields.password} type="password" />

            <Button type="submit" className="h-11 w-full font-medium">Sign In</Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
