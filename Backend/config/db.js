import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDB() {
  try {
    const client = await pool.connect();

    console.log("PostgreSQL connected");

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

    client.release(); // VERY IMPORTANT

    console.log("Tables ensured");

  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

export default pool;