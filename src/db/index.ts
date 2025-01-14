import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Use a default connection string for development if DATABASE_URL is not set
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/solaceassignment";

// For migrations and seeding, we need a different connection configuration
export const migrationClient = postgres(connectionString, { max: 1 });

// For query execution, we want connection pooling
const queryClient = postgres(connectionString);

// Create the database instance
const db = drizzle(queryClient);

export default db;
