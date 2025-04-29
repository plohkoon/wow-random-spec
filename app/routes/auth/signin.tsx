import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { Form, useLoaderData } from "react-router";
import { z } from "zod";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "~/components/ui/button";
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
    <div>
      <Form method="post" id={form.id} onSubmit={form.onSubmit}>
        <CTextInput label="Email" config={fields.email} />
        <CTextInput label="Password" config={fields.password} type="password" />
        <div>
          If you are not already an admin this currently does nothing!!!!!
        </div>
        <Button type="submit">Sign In</Button>
      </Form>
    </div>
  );
}
