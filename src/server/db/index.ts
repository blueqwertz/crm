// import { drizzle } from "drizzle-orm/libsql";
// import * as schema from "../../../drizzle/schema";
// import { createClient } from "@libsql/client";
// import { env } from "~/env";

// const client = createClient({
//   url: env.DATABASE_URL,
//   authToken: env.DATABASE_AUTH_TOKEN,
// });

// export const db = drizzle(client, { schema });

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../../drizzle/schema";

neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });