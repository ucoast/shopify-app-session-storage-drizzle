import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const SQLiteSession = sqliteTable("session", {
  id: text("id").primaryKey(),
  shop: text("shop").notNull(),
  state: text("state").notNull(),
  isOnline: integer("isOnline", { mode: "boolean" }).default(false).notNull(),
  scope: text("scope"),
  expires: text("expires"),
  accessToken: text("accessToken").notNull(),
  userId: blob("userId", { mode: "bigint" }),
});

export type SQLiteSessionTable = typeof SQLiteSession;
export type SQLiteSessionSelect = InferSelectModel<typeof SQLiteSession>;
export type SQLiteSessionInsert = InferInsertModel<typeof SQLiteSession>;
