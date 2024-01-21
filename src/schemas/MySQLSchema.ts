import {
  mysqlTable,
  text,
  timestamp,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";
import { type PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";

const session = mysqlTable("session", {
  id: text("id").primaryKey(),
  shop: text("shop").notNull(),
  state: text("state").notNull(),
  isOnline: boolean("isOnline").default(false).notNull(),
  scope: text("scope"),
  expires: timestamp("expires", { mode: "string" }),
  accessToken: text("accessToken").notNull(),
  userId: bigint("userId", { mode: "bigint" }),
});

const schema = {
  session,
};

export type MySQLSchema = typeof schema;
export type MYSQLDb = PlanetScaleDatabase<MySQLSchema>;
