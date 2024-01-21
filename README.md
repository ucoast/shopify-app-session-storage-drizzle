# Session Storage Adapter for Drizzle

This package implements the `SessionStorage` interface that works with an instance of Drizzle.

Session storage for Drizzle requires a `schema.ts` with a Session table. 

Version 0.0.1 only supports Postgres version of Drizzle. Support for MYSQL/SQLite is on the roadmap.

```ts
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
```

You can then instantiate and use `DrizzleSessionStorage` using the example below. Please refer to Drizzle [documentation](https://orm.drizzle.team/docs/get-started-postgresql) for more configuration options.

You must migrate your database to include the session table before using this package. If you are working on a new project, or are still prototyping, you can use [drizzle-kit push:pg](https://orm.drizzle.team/kit-docs/commands#prototype--push) to push your schema changes.

Otherwise please refer to Drizzle's documentation on [migration](https://orm.drizzle.team/kit-docs/commands#generate-migrations)

```js
import { shopifyApp } from "@shopify/shopify-app-express";
import { DrizzleSessionStorage } from "@ucoast/shopify-app-session-storage-drizzle";
import { drizzle } from 'drizzle-orm/neon-http'
import { neon, neonConfig } from '@neondatabase/serverless'

neonConfig.fetchConnectionCache = true

// We use neon but you can use any of Drizzle's [Postgres Drivers](https://orm.drizzle.team/docs/get-started-postgresql)
const pg = neon(connectionString, {
    fetchOptions: neonConfig,
})

const client = drizzle(pg, {
    // session object defined above
    schema: {session},
})

const storage = new DrizzleSessionStorage(client, session);

const shopify = shopifyApp({
  sessionStorage: storage,
  // ...
});
```

> **Note**: The allowed column types for version 0.0.1 are strict. Please ensure the session table schema is copied exactly.

If you prefer to use your own implementation of a session storage mechanism that is compatible with the `@shopify/shopify-app-express` package, see the [implementing session storage guide](https://github.com/Shopify/shopify-app-js/blob/main/packages/shopify-app-session-storage/implementing-session-storage.md).


## Contributing

This is our in-house implementation of session storage using Drizzle, modified slightly to make it easier to use. 

It is modeled after the other Shopify Session packages and our intention is to keep this scope as limited as possible. Below is the complete roadmap.

- MYSQL Compatibility
- SQLite Compatibility
- Allow additional database columns
- Allow custom table name
- Websocket Compatibility
- Test suite for all 3 databases

If you are interested in contributing, please shoot an email to david@ucoastweb.com so we can coordinate.


## Troubleshooting

If there is an issue with your schema that prevents it from finding the `Session` table, this package will throw a `MissingSessionTableError`.
Some common reasons for that are:

1. The database was not migrated.
1. The `Session` table above was not added to the schema.
1. The table is in the schema, but isn't named `Session`.

Here are some possible solutions for this issue:

1. Ensure you've [migrated your schema changes](https://orm.drizzle.team/kit-docs/commands#generate-migrations) to apply the schema.
1. Ensure you've copied the schema above into your Drizzle schema.
1. Make sure your database is named `session`.
