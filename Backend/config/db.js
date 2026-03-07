import { Client } from "pg";

// configuration pulled from environment for flexibility
const client = new Client({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "",
  database: process.env.PG_DATABASE || "stayease",
});

// initialize connection and create tables if they don't exist
export async function initDB() {
  try {
    await client.connect();
    console.log("PostgreSQL connected");

    // create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        image TEXT,
        role TEXT DEFAULT 'user',
        recent_searched_cities TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        contact TEXT NOT NULL,
        owner TEXT REFERENCES users(id),
        city TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        hotel INTEGER REFERENCES hotels(id),
        room_type TEXT NOT NULL,
        price_per_night NUMERIC NOT NULL,
        amenities JSONB NOT NULL,
        images TEXT[] DEFAULT '{}',
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        "user" TEXT REFERENCES users(id),
        room INTEGER REFERENCES rooms(id),
        hotel INTEGER REFERENCES hotels(id),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        total_price NUMERIC NOT NULL,
        guests INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT DEFAULT 'Pay At Hotel',
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("Tables ensured");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
}

export default client;