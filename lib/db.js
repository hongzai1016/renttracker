import { sql } from '@vercel/postgres';

export async function initDb() {
  try {
    // Create members table
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create rent_records table
    await sql`
      CREATE TABLE IF NOT EXISTS rent_records (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        month_year VARCHAR(10) NOT NULL, -- Format: YYYY-MM
        status VARCHAR(50) DEFAULT 'Pending',
        UNIQUE(member_id, month_year)
      );
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    // If not using Vercel Postgres yet, this will fail gracefully
  }
}
