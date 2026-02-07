import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { UserPlus, UserPlus2 } from "lucide-react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirect,
} from "react-router";
import { Form, useLoaderData } from "react-router";
import { z } from "zod";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    return redirect("/");
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
      { status: 422 },
    );
  }

  const user = await db.user.create({ data: signupData.value });
  session.setUser(user);

  return redirect("/", {
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
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-xl border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Register{" "}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Register a new account.{" "}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            method="post"
            id={form.id}
            onSubmit={form.onSubmit}
            className="space-y-5"
          >
            <div>{form.errors}</div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">Email</p>
              <CTextInput config={fields.name} label="" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Username
              </p>
              <CTextInput config={fields.username} label="" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">Email</p>
              <CTextInput config={fields.email} label="" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Password
              </p>
              <CTextInput config={fields.password} label="" type="password" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-card-foreground">
                Confirm Password
              </p>
              <CTextInput
                config={fields.confirmPassword}
                label=""
                type="password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If you are not already an admin, this currently does nothing!!!!!!{" "}
            </p>
            <Button type="submit" className="h-11 w-full font-medium">
              Sign Up
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
