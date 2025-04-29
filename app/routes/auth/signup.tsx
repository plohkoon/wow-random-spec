import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  redirect,
} from "react-router";
import { Form, useLoaderData } from "react-router";
import { z } from "zod";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "~/components/ui/button";
import { bcrypt } from "~/lib/bcrypt.server";
import { db } from "~/lib/db.server";
import { AppSession } from "~/lib/session.server";

const SignupSchema = z
  .object({
    email: z.string().email().min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await AppSession.fromRequest(request);
  if (session.hasUser) {
    return redirect("/dashboard");
  }

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const serverSchema = SignupSchema.transform((data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = data;
    return {
      ...rest,
      password: bcrypt.hashSync(data.password, 10),
    };
  });
  const [formData, session] = await Promise.all([
    request.formData(),
    AppSession.fromRequest(request),
  ]);
  const signupData = parseWithZod(formData, { schema: serverSchema });

  if (signupData.status !== "success") {
    return data(
      signupData.reply({ hideFields: ["password", "confirmPassword"] }),
      { status: 422 }
    );
  }

  const user = await db.user.create({ data: signupData.value });
  session.setUser(user);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await session.commit(),
    },
  });
};

export default function Signup() {
  const lastResult = useLoaderData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupSchema });
    },
  });

  return (
    <Form method="post" id={form.id} onSubmit={form.onSubmit}>
      <div>{form.errors}</div>
      <CTextInput config={fields.name} label="Name" />
      <CTextInput config={fields.username} label="Username" />
      <CTextInput config={fields.email} label="Email" />
      <CTextInput config={fields.password} label="Password" type="password" />
      <CTextInput
        config={fields.confirmPassword}
        label="Confirm Password"
        type="password"
      />

      <div>
        If you are not already an admin this currently does nothing!!!!!
      </div>
      <Button type="submit">Sign Up</Button>
    </Form>
  );
}
