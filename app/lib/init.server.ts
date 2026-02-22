import { migrateFromSqlite } from "~/lib/migrate-sqlite.server";
import { startScheduler } from "~/lib/scheduler.server";

await migrateFromSqlite();
startScheduler();
