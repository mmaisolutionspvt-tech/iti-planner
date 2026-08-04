import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432'),
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DB ERROR] Database connection failed:', err.message);
  } else {
    console.log('[DB SUCCESS] Connected to PostgreSQL database.');
  }
});

export default pool;
