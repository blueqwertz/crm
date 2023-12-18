import { relations, sql } from "drizzle-orm";
import {
  text,
  integer,
  pgTable,
  primaryKey,
  index,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

// ENUMS
export const projectStatusEnum = pgEnum("projectStatus", [
  "NotStarted",
  "InProgress",
  "OnHold",
  "Completed",
  "Cancelled",
]);

export const activityTypeEnum = pgEnum("activityType", [
  "Call",
  "Meeting",
  "Task",
  "FollowUp",
]);

// #region NextAuth
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  headId: text("headId"),
  name: text("name"),
  email: text("email"),
  emailVerified: timestamp("emailVerified", { mode: "date" }).defaultNow(),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  contact: one(contacts, {
    fields: [users.id],
    references: [contacts.userId],
  }),
  head: one(heads, {
    fields: [users.headId],
    references: [heads.id],
  }),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull(),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
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

export const sessions = pgTable(
  "session",
  {
    sessionToken: text("sessionToken").notNull().primaryKey(),
    userId: text("userId").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// #endregion

// #region External

// #region Contacts
export const contacts = pgTable("contact", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  headId: text("headId").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName").notNull(),
  image: text("image"),
  info: text("info"),
  companyId: text("companyId"),
  email: text("email"),
  mobile: text("mobile"),
  userId: text("userId"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const contactRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, { fields: [contacts.userId], references: [users.id] }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  projects: many(contactsToProjects),
  acitivities: many(contactsToActivities),
  outgoingRelation: many(contactsToContacts, {
    relationName: "outgoingContact",
  }),
  receivingRelation: many(contactsToContacts, {
    relationName: "receivingContact",
  }),
  head: one(heads, {
    fields: [contacts.headId],
    references: [heads.id],
  }),
}));

export const contactsToContacts = pgTable(
  "contactsToContacts",
  {
    outgoingContactId: text("outgoingContactId")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    receivingContactId: text("receivingContactId")
      .notNull()
      .references(() => contacts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.outgoingContactId, t.receivingContactId] }),
  }),
);

export const contactsToContactsRelations = relations(
  contactsToContacts,
  ({ one }) => ({
    outgoingContact: one(contacts, {
      fields: [contactsToContacts.outgoingContactId],
      references: [contacts.id],
      relationName: "outgoingContact",
    }),
    receivingContact: one(contacts, {
      fields: [contactsToContacts.receivingContactId],
      references: [contacts.id],
      relationName: "receivingContact",
    }),
  }),
);

// #endregion

// #region Companies
export const companies = pgTable("company", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  headId: text("headId").notNull(),
  name: text("name"),
  image: text("image"),
  info: text("info"),
  field: text("field"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const companyRelations = relations(companies, ({ one, many }) => ({
  contacts: many(contacts),
  projects: many(companiesToProjects),
  acitivities: many(companiesToActivities),
  head: one(heads, {
    fields: [companies.headId],
    references: [heads.id],
  }),
}));

// #endregion

// #region Projects
export const projects = pgTable("project", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  headId: text("headId").notNull(),
  name: text("name"),
  image: text("image"),
  description: text("description"),
  value: integer("value"),
  status: projectStatusEnum("status").default("NotStarted"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const projectRelations = relations(projects, ({ one, many }) => ({
  companies: many(companiesToProjects),
  contacts: many(contactsToProjects),
  activities: many(projectsToActivities),
  head: one(heads, {
    fields: [projects.headId],
    references: [heads.id],
  }),
}));

// #endregion

// #region Project-Relations

// Company
export const companiesToProjects = pgTable(
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
    createdAt: timestamp("createdAt").defaultNow(),
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
export const contactsToProjects = pgTable(
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
    createdAt: timestamp("createdAt").defaultNow(),
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

export const activities = pgTable("activity", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  headId: text("headId").notNull(),
  description: text("description"),
  type: activityTypeEnum("type").default("Call"),
  date: timestamp("date", { mode: "date" }).defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const activityRelations = relations(activities, ({ one, many }) => ({
  companies: many(companiesToActivities),
  contacts: many(contactsToActivities),
  projects: many(projectsToActivities),
  head: one(heads, {
    fields: [activities.headId],
    references: [heads.id],
  }),
}));

// #endregion

// #region Activity-Relations

// Company
export const companiesToActivities = pgTable(
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
export const contactsToActivities = pgTable(
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
export const projectsToActivities = pgTable(
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

// #region Interal

// #region Head

export const heads = pgTable("head", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text("name"),
  info: text("info"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const headRealtions = relations(heads, ({ many }) => ({
  users: many(users),
  contacts: many(contacts),
  companies: many(companies),
  projects: many(projects),
  activities: many(activities),
}));

// #endregion

// #endregion
