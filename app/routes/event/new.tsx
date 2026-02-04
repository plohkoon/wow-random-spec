import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { z } from "zod";
import { CForm } from "~/components/inputs/form";
import { CTextInput } from "~/components/inputs/textInput";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";
import { AppSession } from "~/lib/session.server";
import { Route } from "./+types/new";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { CalendarPlus } from "lucide-react";

const schema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .refine((v) => !v.includes(" "), "Slug cannot contain a space"),
  name: z.string().min(1, "Name is required"),
});

export async function loader({ request }: Route.LoaderArgs) {
  const session = await AppSession.fromRequest(request);
  await session.requireAdmin(`/`);

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const session = await AppSession.fromRequest(request);
  await session.requireAdmin(`/`);

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
    <>
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CalendarPlus className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Create Event
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Set up a new event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CForm method="post" config={form} className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-card-foreground">
                  Event Name
                </p>
                <CTextInput config={fields.name} label="" className="h-11 border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-card-foreground">
                  Season (Slug)
                </p>
                <p className="text-xs text-muted-foreground">
                  This will be used in the event URL.
                </p>
              </div>
              <CTextInput config={fields.slug} label="" className="h-11 border-input bg-background font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-primary" />
              <Button type="submit" className="h-11 w-full font-medium">Create Event</Button>
            </CForm>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
