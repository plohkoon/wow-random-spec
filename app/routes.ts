import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/", "./routes/home.tsx"),
  route("/test", "./routes/test.tsx"),
  ...prefix("/auth", [
    route("signup", "./routes/auth/signup.tsx"),
    route("signin", "./routes/auth/signin.tsx"),
    route("signout", "./routes/auth/signout.tsx"),
  ]),
  route("/event/", "./routes/event/_layout.tsx", [
    route("new", "./routes/event/new.tsx"),
    ...prefix(":slug", [
      index("./routes/event/show/route.tsx"),
      route("player/:id", "./routes/event/player/route.tsx"),
      route("edit", "./routes/event/edit.tsx", [
        route(":id/roll/", "./routes/event/roll.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
