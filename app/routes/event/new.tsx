import { Route } from "./+types/new";
import { z } from "zod";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, redirect } from "react-router";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";
import { CTextInput } from "~/components/inputs/textInput";
import { CForm } from "~/components/inputs/form";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((v) => !v.includes(" "), "Slug cannot contain a space"),
  name: z.string().min(1, "Name is required"),
});

export async function action({ request }: Route.ActionArgs) {
  const fData = await request.formData();

  const res = await parseWithZod(fData, {
    schema,
  });

  if (res.status !== "success") {
    return res.reply();
  }

  await db.event.create({
    data: {
      slug: res.value.slug,
      name: res.value.name,
    },
  });

  return redirect(`/event/${res.value.slug}`);
}

export default function EventNew({
  actionData: lastResult,
}: Route.ComponentProps) {
  const [form, fields] = useForm({
    id: "new-event",
    lastResult,
    defaultValue: {
      slug: "",
      name: "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <CForm method="post" config={form}>
      <CTextInput config={fields.name} label="Name" />
      <CTextInput config={fields.slug} label="Slug" />
      <Button type="submit">Create Event</Button>
    </CForm>
  );
}
