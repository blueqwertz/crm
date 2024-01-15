import { type Session } from "next-auth";

export const PolicyQuery = ({
  session,
  entity,
  operation,
}: {
  session: Session;
  entity: "contact" | "company" | "project";
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
          read: session.user.role.canReadAllContact,
          edit: session.user.role.canEditAllContact,
          delete: session.user.role.canDeleteAllContact,
        },
        company: {
          read: session.user.role.canReadAllCompany,
          edit: session.user.role.canEditAllCompany,
          delete: session.user.role.canDeleteAllCompany,
        },
        project: {
          read: session.user.role.canReadAllProject,
          edit: session.user.role.canEditAllProject,
          delete: session.user.role.canDeleteAllProject,
        },
      },
      connected: {
        contact: {
          read: session.user.role.canReadConnectedContact,
          edit: session.user.role.canEditConnectedContact,
          delete: session.user.role.canDeleteConnectedContact,
        },
        company: {
          read: session.user.role.canReadConnectedCompany,
          edit: session.user.role.canEditConnectedCompany,
          delete: session.user.role.canDeleteConnectedCompany,
        },
        project: {
          read: session.user.role.canReadConnectedProject,
          edit: session.user.role.canEditConnectedProject,
          delete: session.user.role.canDeleteConnectedProject,
        },
      },
    },
  };

  return {
    ...(!rolePolicyQuery.role.all[entity][operation]
      ? {
          OR: [
            {
              ...(rolePolicyQuery.role.connected[entity][operation]
                ? {
                    OR: [
                      ...(entity != "project"
                        ? [
                            {
                              projects: {
                                some: {
                                  contacts: {
                                    some: {
                                      userId: session.user.id,
                                    },
                                  },
                                },
                              },
                            },
                            {
                              projects: {
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
                          ]
                        : []),
                      ...(entity != "company"
                        ? [
                            {
                              companies: {
                                some: {
                                  contacts: {
                                    some: {
                                      userId: session.user.id,
                                    },
                                  },
                                },
                              },
                            },
                            {
                              companies: {
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
                          ]
                        : []),
                    ],
                  }
                : {}),
            },
            {
              ...(!rolePolicyQuery.role.all[entity][operation]
                ? {
                    policies: {
                      some: {
                        userId: session.user.id,
                        ...rolePolicyQuery.policy[operation],
                      },
                    },
                  }
                : {}),
            },
          ],
        }
      : {}),
  };
};
