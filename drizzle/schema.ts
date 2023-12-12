import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  sqliteTable,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

// #region NextAuth
export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }).default(
    sql`CURRENT_TIME`,
  ),
  image: text("image", { length: 255 }),
});

export const userRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  contact: one(contacts, {
    fields: [users.id],
    references: [contacts.userId],
  }),
}));

export const accounts = sqliteTable(
  "account",
  {
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
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = sqliteTable(
  "session",
  {
    sessionToken: text("sessionToken", { length: 255 }).notNull().primaryKey(),
    userId: text("userId", { length: 255 }).notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
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
  }),
);

// #endregion

// #region External

// #region Contacts
export const contacts = sqliteTable("contact", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  firstName: text("firstName"),
  lastName: text("lastName").notNull(),
  companyId: text("companyId"),
  email: text("email", { length: 255 }),
  mobile: text("mobile"),
  userId: text("userId"),
});

export const contactRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  projects: many(contactsToProjects),
  acitivities: many(contactsToActivities),
}));

// #endregion

// #region Companies
export const companies = sqliteTable("company", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name"),
  info: text("info"),
  field: text("field"),
});

export const companyRelations = relations(companies, ({ many }) => ({
  contact: many(contacts),
  projects: many(companiesToProjects),
  acitivities: many(companiesToActivities),
}));

// #endregion

// #region Projects
export const projects = sqliteTable("project", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name"),
  description: text("description"),
  value: integer("value"),
});

export const projectRelations = relations(projects, ({ many }) => ({
  companies: many(companiesToProjects),
  contacts: many(contactsToProjects),
  activities: many(projectsToActivities),
}));

// #endregion

// #region Project-Relations

// Company
export const companiesToProjects = sqliteTable(
  "companiesToProjects",
  {
    companyId: text("companyId")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.projectId] }),
  }),
);

export const companiesToProjectsRelations = relations(
  companiesToProjects,
  ({ one }) => ({
    company: one(companies, {
      fields: [companiesToProjects.companyId],
      references: [companies.id],
    }),
    project: one(projects, {
      fields: [companiesToProjects.projectId],
      references: [projects.id],
    }),
  }),
);

// Contact
export const contactsToProjects = sqliteTable(
  "contactsToProjects",
  {
    contactId: text("contactId")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contactId, t.projectId] }),
  }),
);

export const contactsToProjectsRelations = relations(
  contactsToProjects,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactsToProjects.contactId],
      references: [contacts.id],
    }),
    project: one(projects, {
      fields: [contactsToProjects.projectId],
      references: [projects.id],
    }),
  }),
);

// #endregion

// #region Acitivities

export const activities = sqliteTable("activity", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  description: text("description"),
  type: text("type"),
  date: integer("date", { mode: "timestamp" }).default(sql`CURRENT_TIME`),
});

export const activityRelations = relations(activities, ({ many }) => ({
  companies: many(companiesToActivities),
  contacts: many(contactsToActivities),
  projects: many(projectsToActivities),
}));

// #endregion

// #region Activity-Relations

// Company
export const companiesToActivities = sqliteTable(
  "companiesToActivities",
  {
    companyId: text("companyId")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    activityId: text("activityId")
      .notNull()
      .references(() => activities.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.activityId] }),
  }),
);

export const companiesToActivitiesRelations = relations(
  companiesToActivities,
  ({ one }) => ({
    company: one(companies, {
      fields: [companiesToActivities.companyId],
      references: [companies.id],
    }),
    activity: one(activities, {
      fields: [companiesToActivities.activityId],
      references: [activities.id],
    }),
  }),
);

// Contact
export const contactsToActivities = sqliteTable(
  "contactsToActivities",
  {
    contactId: text("contactId")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    activityId: text("activityId")
      .notNull()
      .references(() => activities.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contactId, t.activityId] }),
  }),
);

export const contactsToActivitiesRelations = relations(
  contactsToActivities,
  ({ one }) => ({
    contact: one(contacts, {
      fields: [contactsToActivities.contactId],
      references: [contacts.id],
    }),
    acitivity: one(activities, {
      fields: [contactsToActivities.activityId],
      references: [activities.id],
    }),
  }),
);

// Project
export const projectsToActivities = sqliteTable(
  "projectsToActivies",
  {
    projectId: text("projectId")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    activityId: text("activityId")
      .notNull()
      .references(() => activities.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.projectId, t.activityId] }),
  }),
);

export const projectsToActivitiesRelations = relations(
  projectsToActivities,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectsToActivities.projectId],
      references: [projects.id],
    }),
    acitivity: one(activities, {
      fields: [projectsToActivities.activityId],
      references: [activities.id],
    }),
  }),
);

// #endregion

// #endregion
