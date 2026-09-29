import { Pool } from 'pg';
import crypto from 'crypto';

export interface WishRecord {
  id: number;
  sender_name: string;
  message: string;
  wish_energy: string;
  star_type: string;
  one_word: string | null;
  is_anonymous: boolean;
  status: 'approved' | 'pending' | 'hidden';
  ip_hash: string | null;
  created_at: string;
}

class DatabaseManager {
  private pool: Pool | null = null;
  private isPostgres = false;
  // In-memory store starts clean with zero pre-set records
  private memoryWishes: WishRecord[] = [];
  private nextId = 1;

  constructor() {
    this.memoryWishes = [];
    this.nextId = 1;
  }

  public getIsPostgres(): boolean {
    return this.isPostgres;
  }

  public async init(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        console.log('[DB] Connecting to PostgreSQL using DATABASE_URL...');
        this.pool = new Pool({
          connectionString: databaseUrl,
          ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
          max: 10,
          connectionTimeoutMillis: 8000,
        });

        // Test connection
        const client = await this.pool.connect();
        try {
          console.log('[DB] PostgreSQL connected successfully. Ensuring schema...');
          await client.query(`
            CREATE TABLE IF NOT EXISTS wishes (
              id SERIAL PRIMARY KEY,
              sender_name VARCHAR(100) NOT NULL,
              message TEXT NOT NULL,
              wish_energy VARCHAR(50) NOT NULL,
              star_type VARCHAR(50) NOT NULL,
              one_word VARCHAR(50),
              is_anonymous BOOLEAN DEFAULT FALSE,
              status VARCHAR(20) DEFAULT 'approved',
              ip_hash VARCHAR(64),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_wishes_status ON wishes(status);
            CREATE INDEX IF NOT EXISTS idx_wishes_energy ON wishes(wish_energy);
          `);

          this.isPostgres = true;
          console.log('[DB] PostgreSQL initialization complete (clean, no mock data).');
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn('[DB] PostgreSQL connection attempt failed, using in-memory store:', err);
        this.isPostgres = false;
      }
    } else {
      console.log('[DB] Running with fresh storage (clean, no mock data).');
      this.isPostgres = false;
    }
  }

  public async createWish(data: {
    sender_name: string;
    message: string;
    wish_energy: string;
    star_type: string;
    one_word?: string | null;
    is_anonymous?: boolean;
    ip_hash?: string | null;
  }): Promise<WishRecord> {
    const isAnonymous = Boolean(data.is_anonymous);
    const senderName = isAnonymous ? 'Someone who loves you' : data.sender_name.trim();
    const oneWord = data.one_word ? data.one_word.trim() : null;
    const status = 'approved';

    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `INSERT INTO wishes (sender_name, message, wish_energy, star_type, one_word, is_anonymous, status, ip_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          senderName,
          data.message.trim(),
          data.wish_energy.trim().toLowerCase(),
          data.star_type.trim().toLowerCase(),
          oneWord,
          isAnonymous,
          status,
          data.ip_hash || null,
        ]
      );
      return res.rows[0];
    } else {
      const newRecord: WishRecord = {
        id: this.nextId++,
        sender_name: senderName,
        message: data.message.trim(),
        wish_energy: data.wish_energy.trim().toLowerCase(),
        star_type: data.star_type.trim().toLowerCase(),
        one_word: oneWord,
        is_anonymous: isAnonymous,
        status,
        ip_hash: data.ip_hash || null,
        created_at: new Date().toISOString(),
      };
      this.memoryWishes.unshift(newRecord);
      return newRecord;
    }
  }

  public async getWishes(options: {
    page?: number;
    limit?: number;
    energy?: string;
    search?: string;
  }): Promise<{ wishes: WishRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    if (this.isPostgres && this.pool) {
      const conditions: string[] = ["status = 'approved'"];
      const params: any[] = [];
      let paramIndex = 1;

      if (options.energy && options.energy !== 'all') {
        conditions.push(`LOWER(wish_energy) = $${paramIndex++}`);
        params.push(options.energy.toLowerCase());
      }

      if (options.search && options.search.trim()) {
        conditions.push(`(LOWER(sender_name) LIKE $${paramIndex} OR LOWER(message) LIKE $${paramIndex})`);
        params.push(`%${options.search.trim().toLowerCase()}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const countRes = await this.pool.query(
        `SELECT COUNT(*) FROM wishes ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const queryParams = [...params, limit, offset];
      const dataRes = await this.pool.query(
        `SELECT id, sender_name, message, wish_energy, star_type, one_word, is_anonymous, status, created_at
         FROM wishes ${whereClause}
         ORDER BY created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
        queryParams
      );

      return {
        wishes: dataRes.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } else {
      let filtered = this.memoryWishes.filter((w) => w.status === 'approved');

      if (options.energy && options.energy !== 'all') {
        filtered = filtered.filter((w) => w.wish_energy.toLowerCase() === options.energy!.toLowerCase());
      }

      if (options.search && options.search.trim()) {
        const query = options.search.trim().toLowerCase();
        filtered = filtered.filter(
          (w) => w.sender_name.toLowerCase().includes(query) || w.message.toLowerCase().includes(query)
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        wishes: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }
  }

  public async getWishById(id: number): Promise<WishRecord | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT id, sender_name, message, wish_energy, star_type, one_word, is_anonymous, status, created_at
         FROM wishes WHERE id = $1 AND status = 'approved'`,
        [id]
      );
      return res.rows[0] || null;
    } else {
      const found = this.memoryWishes.find((w) => w.id === id && w.status === 'approved');
      return found || null;
    }
  }

  public async deleteWish(id: number): Promise<boolean> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `DELETE FROM wishes WHERE id = $1 RETURNING id`,
        [id]
      );
      return res.rowCount !== null && res.rowCount > 0;
    } else {
      const idx = this.memoryWishes.findIndex((w) => w.id === id);
      if (idx !== -1) {
        this.memoryWishes.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  public async getRandomWish(): Promise<WishRecord | null> {
    if (this.isPostgres && this.pool) {
      const res = await this.pool.query(
        `SELECT id, sender_name, message, wish_energy, star_type, one_word, is_anonymous, status, created_at
         FROM wishes WHERE status = 'approved'
         ORDER BY RANDOM() LIMIT 1`
      );
      return res.rows[0] || null;
    } else {
      const approved = this.memoryWishes.filter((w) => w.status === 'approved');
      if (approved.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * approved.length);
      return approved[randomIndex];
    }
  }

  public async getStats(): Promise<{
    totalWishes: number;
    anonymousWishes: number;
    energyCounts: Record<string, number>;
    starTypeCounts: Record<string, number>;
  }> {
    if (this.isPostgres && this.pool) {
      const totalRes = await this.pool.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous
         FROM wishes WHERE status = 'approved'`
      );

      const energyRes = await this.pool.query(
        `SELECT wish_energy, COUNT(*) as count
         FROM wishes WHERE status = 'approved'
         GROUP BY wish_energy`
      );

      const starRes = await this.pool.query(
        `SELECT star_type, COUNT(*) as count
         FROM wishes WHERE status = 'approved'
         GROUP BY star_type`
      );

      const energyCounts: Record<string, number> = {};
      energyRes.rows.forEach((r) => {
        energyCounts[r.wish_energy] = parseInt(r.count, 10);
      });

      const starTypeCounts: Record<string, number> = {};
      starRes.rows.forEach((r) => {
        starTypeCounts[r.star_type] = parseInt(r.count, 10);
      });

      return {
        totalWishes: parseInt(totalRes.rows[0].total, 10),
        anonymousWishes: parseInt(totalRes.rows[0].anonymous, 10),
        energyCounts,
        starTypeCounts,
      };
    } else {
      const approved = this.memoryWishes.filter((w) => w.status === 'approved');
      const totalWishes = approved.length;
      const anonymousWishes = approved.filter((w) => w.is_anonymous).length;

      const energyCounts: Record<string, number> = {};
      const starTypeCounts: Record<string, number> = {};

      approved.forEach((w) => {
        energyCounts[w.wish_energy] = (energyCounts[w.wish_energy] || 0) + 1;
        starTypeCounts[w.star_type] = (starTypeCounts[w.star_type] || 0) + 1;
      });

      return {
        totalWishes,
        anonymousWishes,
        energyCounts,
        starTypeCounts,
      };
    }
  }
}

export const dbManager = new DatabaseManager();
