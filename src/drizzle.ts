import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { desc, eq, inArray } from "drizzle-orm";
import {
  type Db,
  type SessionSelect,
  type SessionTable,
} from "./schemas/schemas";

export class DrizzleSessionStorage<T extends Db> implements SessionStorage {
  private readonly ready: Promise<boolean>;
  private readonly db: T;
  private sessionTable: SessionTable<T>;

  constructor(drizzle: T, sessionTable: SessionTable<T>) {
    this.db = drizzle;
    this.sessionTable = sessionTable;
    this.ready = this.doesSessionTableExist();

    if (!this.doesSessionTableExist().then((exists) => exists)) {
      throw new Error(`DrizzleClient does not have a session table`);
    }
  }

  public async storeSession(sessionToStore: Session): Promise<boolean> {
    await this.ready;

    const { id, ...data } = this.sessionToRow(sessionToStore);

    await this.db
      .insert(this.sessionTable)
      .values({ id, ...data })
      .onConflictDoUpdate({
        target: this.sessionTable.id,
        set: { ...data },
      });

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    try {
      const row = await this.db.query.session.findFirst({
        where: eq(this.sessionTable.id, id),
      });

      if (!row) {
        return undefined;
      }

      return this.rowToSession(row);
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;

    try {
      await this.db
        .delete(this.sessionTable)
        .where(eq(this.sessionTable.id, id));
    } catch (e) {
      console.error(e);
      return false;
    }

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await this.ready;

      await this.db
        .delete(this.sessionTable)
        .where(inArray(this.sessionTable.id, ids));

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const sessions = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.shop, shop))
      .orderBy(desc(this.sessionTable.expires));

    return sessions.map((session: SessionSelect<T>) =>
      this.rowToSession(session)
    );
  }

  private sessionToRow(session: Session): SessionSelect<T> {
    const sessionParams = session.toObject();

    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope || null,
      expires: session.expires
        ? new Date(session.expires).toDateString()
        : null,
      accessToken: session.accessToken || "",
      userId:
        (sessionParams.onlineAccessInfo?.associated_user
          .id as unknown as bigint) || null,
    };
  }

  private rowToSession(row: SessionSelect<T>): Session {
    const sessionParams: { [key: string]: boolean | string | number } = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
    };

    if (row.expires) {
      sessionParams.expires = new Date(row.expires).getTime();
    }

    if (row.scope) {
      sessionParams.scope = row.scope;
    }

    if (row.accessToken) {
      sessionParams.accessToken = row.accessToken;
    }

    if (row.userId) {
      sessionParams.onlineAccessInfo = String(row.userId);
    }

    return Session.fromPropertyArray(Object.entries(sessionParams));
  }

  private async doesSessionTableExist(): Promise<boolean> {
    try {
      const query = await this.db.select().from(this.sessionTable).limit(1);
      return query?.length !== undefined;
    } catch (e) {
      return false;
    }
  }
}

export class MissingSessionTableError extends Error {}
