import { createCookieSessionStorage } from "react-router";

export const {
  getSession: getDarkmodeSession,
  commitSession: commitDarkmodeSession,
  destroySession: destroyDarkmodeSession,
} = createCookieSessionStorage({
  cookie: {
    name: "darkmode-override",
    httpOnly: true,
  },
});
