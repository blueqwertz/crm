import { relations, sql } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey, index } from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";


export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }),
  emailVerified: integer("emailVerified", {mode: "timestamp_ms"}).default(sql`CURRENT_TIME`),
  image: text("image", { length: 255 })
})

export const userRelations = relations(users, ({many}) => ({
  accounts: many(accounts),
  sessions: many(sessions)
}))

export const accounts = sqliteTable("account", {
  userId: text("userId").notNull(),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider", { length: 255 }).notNull(),
  providerAccountId: text("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type", { length: 255 }),
  scope: text("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: text("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = sqliteTable(
  "session",
  {
    sessionToken: text("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: text("userId", { length: 255 }).notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier", { length: 255 }).notNull(),
    token: text("token", { length: 255 }).notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

