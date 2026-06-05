import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SUPABASE_URL } from "@/configs";
import * as schema from "./schemas";

const client = postgres(SUPABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
