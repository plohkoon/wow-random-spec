import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { bcrypt } from "~/lib/bcrypt.server";
import { z } from "zod";
import { db, User } from "~/lib/db.server";
import { parseWithZod as parse } from "@conform-to/zod";

export const authenticator = new Authenticator<User>();

const schema = z.object({
  email: z.string(),
  password: z.string(),
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const data = parse(form, { schema });

    if (data.status !== "success") {
      throw new Error("Invalid form data");
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: data.value.email }, { username: data.value.email }],
      },
    });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const passwordValid = await bcrypt.compare(
      data.value.password,
      user.password
    );

    if (!passwordValid) {
      throw new Error("Invalid Credentials");
    }

    return user;
  }),
  "form"
);
