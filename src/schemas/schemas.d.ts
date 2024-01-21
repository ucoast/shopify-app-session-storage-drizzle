import { ExtractTables, InferSelectModel } from "drizzle-orm";
import { PostgresDb, PostgresSchema } from "./PostgresSchema";

type ExtractSchemaTables<T extends Record<string, unknown>> = ExtractTables<T>;

export type SessionTable<Db> = ExtractSchemaTables<PostgresSchema>["session"];

export type SessionSelect<Db> = InferSelectModel<SessionTable<Db>>;

export type Db = PostgresDb;
