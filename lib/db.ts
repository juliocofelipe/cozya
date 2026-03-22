import { neon, neonConfig } from "@neondatabase/serverless";

type NeonQuery = ReturnType<typeof neon>;

declare global {
  // eslint-disable-next-line no-var
  var __neonSql__: NeonQuery | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada");
}

neonConfig.fetchConnectionCache = true;

const sql = globalThis.__neonSql__ ?? neon(connectionString);

if (process.env.NODE_ENV !== "production") {
  globalThis.__neonSql__ = sql;
}

export { sql };
