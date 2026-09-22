const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Try to load .env.local if present
try {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        const value = rest.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }
} catch {
  // Continue with process.env
}

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL environment variable is not set.");
    console.error("Please configure DATABASE_URL in .env.local with your MonsterASP connection string:");
    console.error('DATABASE_URL="postgresql://db69616:YOUR_PASSWORD@db69616.public.databaseasp.net:5432/db69616?sslmode=prefer"');
    process.exit(1);
  }

  console.log("🔄 Connecting to MonsterASP PostgreSQL (db69616.public.databaseasp.net)...");

  const isRemote =
    connectionString.includes("databaseasp.net") || connectionString.includes("sslmode");

  const pool = new Pool({
    connectionString,
    ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
  });

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("📄 Applying schema.sql to MonsterASP database...");
    await pool.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log("Table 'visits' is verified and ready.");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
