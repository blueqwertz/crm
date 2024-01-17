import {
  ActivityPolicy,
  CompanyPolicy,
  ContactPolicy,
  ProjectPolicy,
} from "@prisma/client";
import { type Session } from "next-auth";

export const PolicyQuery = ({
  session,
  entity,
  operation,
}: {
  session: Session;
  entity: "contact" | "company" | "project" | "activity";
  operation: "read" | "edit" | "delete";
}) => {
  const rolePolicyQuery = {
    policy: {
      read: {
        canRead: true,
      },
      edit: {
        canEdit: true,
      },
      delete: {
        canDelete: true,
      },
    },
    role: {
      all: {
        contact: {
          read: session?.user.role.canReadAllContact,
          edit: session?.user.role.canEditAllContact,
          delete: session?.user.role.canDeleteAllContact,
        },
        company: {
          read: session?.user.role.canReadAllCompany,
          edit: session?.user.role.canEditAllCompany,
          delete: session?.user.role.canDeleteAllCompany,
        },
        project: {
          read: session?.user.role.canReadAllProject,
          edit: session?.user.role.canEditAllProject,
          delete: session?.user.role.canDeleteAllProject,
        },
        activity: {
          read: session?.user.role.canReadAllActivity,
          edit: session?.user.role.canEditAllActivity,
          delete: session?.user.role.canDeleteAllActivity,
        },
      },
      connected: {
        contact: {
          read: session?.user.role.canReadConnectedContact,
          edit: session?.user.role.canEditConnectedContact,
          delete: session?.user.role.canDeleteConnectedContact,
        },
        company: {
          read: session?.user.role.canReadConnectedCompany,
          edit: session?.user.role.canEditConnectedCompany,
          delete: session?.user.role.canDeleteConnectedCompany,
        },
        project: {
          read: session?.user.role.canReadConnectedProject,
          edit: session?.user.role.canEditConnectedProject,
          delete: session?.user.role.canDeleteConnectedProject,
        },
        activity: {
          read: session?.user.role.canReadConnectedActivity,
          edit: session?.user.role.canEditConnectedActivity,
          delete: session?.user.role.canDeleteConnectedActivity,
        },
      },
    },
  };

  if (rolePolicyQuery.role.all[entity][operation]) {
    return undefined;
  }

  return {
    OR: [
      ...(rolePolicyQuery.role.connected[entity][operation]
        ? [
            ...{
              contact: { include: ["projects", "companies"] },
              company: { include: ["projects"] },
              project: { include: [] },
              activity: {
                include: ["contacts", "companies", "projects"],
              },
            }[entity].include.flatMap((entry) => [
              {
                [entry]: {
                  some: {
                    policies: {
                      some: {
                        userId: session.user.id,
                        ...rolePolicyQuery.policy[operation],
                      },
                    },
                  },
                },
              },
            ]),
          ]
        : []),
      {
        teamPolicies: {
          some: {
            headId: session.user.head.id,
            team: {
              members: {
                some: {
                  id: session.user.id,
                },
              },
            },
            ...rolePolicyQuery.policy[operation],
          },
        },
      },
      {
        policies: {
          some: {
            headId: session.user.head.id,
            userId: session.user.id,
            ...rolePolicyQuery.policy[operation],
          },
        },
      },
    ],
  };
};

export const IncludePolicyQuery = ({
  include,
  session,
  entity,
  operation,
  args,
}: {
  include: boolean;
  session: Session;
  entity: "contact" | "company" | "project" | "activity";
  operation: "read" | "edit" | "delete";
  args?: object;
}) => {
  if (!include) {
    return undefined;
  }

  return {
    ...args,
    where: {
      ...PolicyQuery({ session, entity, operation }),
    },
  };
};

export const CanDoOperation = ({
  session,
  policies,
  entity,
  operation,
}: {
  session: Session | null;
  policies:
    | ContactPolicy[]
    | CompanyPolicy[]
    | ProjectPolicy[]
    | ActivityPolicy[]
    | undefined;
  entity: "contact" | "company" | "project" | "activity";
  operation: "read" | "edit" | "delete";
}) => {
  const rolePolicyQuery = {
    policy: {
      read: policies?.some((policy) => policy.canRead),
      edit: policies?.some((policy) => policy.canEdit),
      delete: policies?.some((policy) => policy.canDelete),
    },
    role: {
      all: {
        contact: {
          read: session?.user.role.canReadAllContact,
          edit: session?.user.role.canEditAllContact,
          delete: session?.user.role.canDeleteAllContact,
        },
        company: {
          read: session?.user.role.canReadAllCompany,
          edit: session?.user.role.canEditAllCompany,
          delete: session?.user.role.canDeleteAllCompany,
        },
        project: {
          read: session?.user.role.canReadAllProject,
          edit: session?.user.role.canEditAllProject,
          delete: session?.user.role.canDeleteAllProject,
        },
        activity: {
          read: session?.user.role.canReadAllActivity,
          edit: session?.user.role.canEditAllActivity,
          delete: session?.user.role.canDeleteAllActivity,
        },
      },
    },
  };

  if (rolePolicyQuery.role.all[entity][operation]) {
    return true;
  }

  if (rolePolicyQuery.policy[operation]) {
    return true;
  }

  return false;
};
