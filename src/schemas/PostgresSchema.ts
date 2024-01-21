import { pgTable, text, timestamp, boolean, bigint } from "drizzle-orm/pg-core";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import {type PostgresJsDatabase} from "drizzle-orm/postgres-js/driver";
import { type NodePgDatabase } from "drizzle-orm/node-postgres/driver";
import {type VercelPgDatabase} from "drizzle-orm/vercel-postgres/driver";
import {AwsDataApiPgDatabase} from "drizzle-orm/aws-data-api/pg/driver";

const session = pgTable("session", {
  id: text("id").primaryKey(),
  shop: text("shop").notNull(),
  state: text("state").notNull(),
  isOnline: boolean("isOnline").default(false).notNull(),
  scope: text("scope"),
  expires: timestamp("expires", { precision: 3, mode: "string" }),
  accessToken: text("accessToken").notNull(),
  userId: bigint("userId", { mode: "bigint" }),
});

const schema = {
  session,
};

export type PostgresSchema = typeof schema;

export type PostgresDb =
  | NeonDatabase<PostgresSchema>
  | NeonHttpDatabase<PostgresSchema>
  | PostgresJsDatabase<PostgresSchema>
  | NodePgDatabase<PostgresSchema>
  | VercelPgDatabase<PostgresSchema>
  | AwsDataApiPgDatabase<PostgresSchema>
