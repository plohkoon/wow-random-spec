import {
  createCookieSessionStorage,
  redirect,
  Session,
  SessionData,
} from "react-router";
import { db, Prisma, User } from "./db.server";

const ADMINS = ["plohkoon", "captainfrogs", "pointysalad", "sharkfacekilla"];

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [process.env.SESSION_SECRET || "your-secret-key"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });

export class AppSession {
  session: Session<SessionData, SessionData>;
  COOKIE_NAME: string = "Cookie";

  constructor(session: Session<SessionData, SessionData>) {
    this.session = session;
  }

  static async fromCookie(cookie: string) {
    return new AppSession(await getSession(cookie));
  }

  static async fromHeader(headers: Headers) {
    return AppSession.fromCookie(headers.get("Cookie") || "");
  }

  static async fromRequest(request: Request) {
    return AppSession.fromHeader(request.headers);
  }

  get(key: string) {
    return this.session.get(key);
  }

  set(key: string, value: unknown) {
    this.session.set(key, value);
  }

  has(key: string) {
    return this.session.has(key);
  }

  unset(key: string) {
    this.session.unset(key);
  }

  get data() {
    return this.session.data;
  }

  async commit() {
    return commitSession(this.session);
  }

  async destroy() {
    return destroySession(this.session);
  }

  get userId(): string | null {
    return this.session.get("userId");
  }

  requireUserId({ redirectTo = "/" } = {}) {
    const userId = this.userId;
    if (!userId) {
      throw redirect(redirectTo);
    }

    return userId;
  }

  require2faUserId({ redirectTo = "/" } = {}): string {
    const userId = this.session.get("2faUserId");
    if (!userId) {
      throw redirect(redirectTo);
    }

    return userId;
  }

  // The typing of this is incorrect
  async getUser(select?: Prisma.UserSelect | undefined) {
    const userId = this.userId;
    if (!userId) {
      return null;
    }

    return await db.user.findUnique({
      where: { id: userId },
      select,
    });
  }

  async requireUser(select?: Prisma.UserSelect | undefined) {
    const user = await this.getUser(select);
    if (!user) {
      throw redirect("/signin");
    }

    return user;
  }

  set userId(userId: string) {
    this.session.set("userId", userId);
    this.session.unset("2faUserId");
  }

  set2faUserId(userId: string) {
    this.session.set("2faUserId", userId);
  }

  setUser(user: Partial<User> & { id: string }) {
    this.userId = user.id;
  }

  get hasUser() {
    return this.session.has("userId");
  }

  get has2faUser() {
    return this.session.has("2faUserId");
  }

  async signout() {
    return this.destroy();
  }

  async clear2faUserId() {
    this.session.unset("2faUserId");
  }

  async isAdmin() {
    const user = await this.getUser();
    if (!user) {
      return false;
    }

    return ADMINS.includes(user.username);
  }

  async requireAdmin(redirectTo = "/") {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) {
      throw redirect(redirectTo);
    }
  }
}
