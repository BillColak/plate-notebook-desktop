import { drizzle } from "drizzle-orm/sqlite-proxy";

import { invoke } from "@tauri-apps/api/core";

import * as schema from "./schema";

export const db = drizzle(
  async (sql, params, method) => {
    try {
      const result = await invoke<{
        rows: unknown[][];
      }>("execute_sql", {
        sql,
        params,
        method,
      });

      return { rows: result.rows };
    } catch (e) {
      console.error("SQL error:", e);
      return { rows: [] };
    }
  },
  { schema }
);
