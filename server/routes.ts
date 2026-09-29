import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { dbManager } from './db.ts';

export const apiRouter = Router();

// In-memory IP rate limiter: max 10 submissions per 10 minutes
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function getIpHash(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const limit = 10; // 10 wishes per window

  const entry = rateLimitMap.get(ipHash);
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up stale rate limits every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (val.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 15 * 60 * 1000);

// Health endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection status endpoint
apiRouter.get('/db-status', (_req: Request, res: Response) => {
  const isPostgres = dbManager.getIsPostgres();
  res.json({
    connected: isPostgres,
    mode: isPostgres ? 'postgres' : 'memory',
    message: isPostgres
      ? 'Connected to Neon PostgreSQL cloud database. All wishes will persist permanently in the sky!'
      : 'Running on memory storage. Wishes save in this session; to persist permanently across restarts, provide DATABASE_URL.',
  });
});

// Stats endpoint
apiRouter.get('/wishes/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await dbManager.getStats();
    res.json(stats);
  } catch (err: any) {
    console.error('Failed to get stats:', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

// Random wish endpoint
apiRouter.get('/wishes/random', async (_req: Request, res: Response) => {
  try {
    const wish = await dbManager.getRandomWish();
    if (!wish) {
      return res.status(404).json({ error: 'No wishes found in the universe yet.' });
    }
    res.json({ wish });
  } catch (err: any) {
    console.error('Failed to get random wish:', err);
    res.status(500).json({ error: 'Failed to retrieve random blessing' });
  }
});

// List wishes endpoint (paginated & filtered)
apiRouter.get('/wishes', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 18;
    const energy = typeof req.query.energy === 'string' ? req.query.energy : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const result = await dbManager.getWishes({ page, limit, energy, search });
    res.json(result);
  } catch (err: any) {
    console.error('Failed to list wishes:', err);
    res.status(500).json({ error: 'Failed to retrieve wishes' });
  }
});

// Single wish by ID
apiRouter.get('/wishes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid wish identifier' });
    }

    const wish = await dbManager.getWishById(id);
    if (!wish) {
      return res.status(404).json({ error: 'This star seems to have drifted away.' });
    }

    res.json({ wish });
  } catch (err: any) {
    console.error('Failed to get wish by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve wish' });
  }
});

// Delete a wish by ID
apiRouter.delete('/wishes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid wish identifier' });
    }

    const deleted = await dbManager.deleteWish(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Star not found or already removed.' });
    }

    res.json({ success: true, message: 'Star was removed from the night sky.' });
  } catch (err: any) {
    console.error('Failed to delete wish:', err);
    res.status(500).json({ error: 'Failed to remove star.' });
  }
});

// Submit a new wish
apiRouter.post('/wishes', async (req: Request, res: Response) => {
  try {
    const ipHash = getIpHash(req);

    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        error: 'You have released several stars recently. Please rest a moment before sending another.',
      });
    }

    const { sender_name, message, wish_energy, star_type, one_word, is_anonymous } = req.body;

    // Validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A birthday wish message is required.' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ error: 'The wish message cannot be blank.' });
    }

    if (trimmedMessage.length > 500) {
      return res.status(400).json({ error: 'Wish message cannot exceed 500 characters.' });
    }

    const anonymousBool = Boolean(is_anonymous);
    let trimmedSender = typeof sender_name === 'string' ? sender_name.trim() : '';

    if (!anonymousBool && trimmedSender.length === 0) {
      return res.status(400).json({ error: 'Please share your name or select Anonymous.' });
    }

    if (trimmedSender.length > 100) {
      return res.status(400).json({ error: 'Sender name is too long (maximum 100 characters).' });
    }

    if (anonymousBool) {
      trimmedSender = 'Someone who wishes you well';
    }

    const trimmedEnergy = typeof wish_energy === 'string' && wish_energy.trim().length > 0
      ? wish_energy.trim().substring(0, 50)
      : 'happiness';

    const trimmedStarType = typeof star_type === 'string' && star_type.trim().length > 0
      ? star_type.trim().substring(0, 50)
      : 'golden_star';

    const trimmedOneWord = typeof one_word === 'string' && one_word.trim().length > 0
      ? one_word.trim().substring(0, 50)
      : null;

    const newWish = await dbManager.createWish({
      sender_name: trimmedSender,
      message: trimmedMessage,
      wish_energy: trimmedEnergy,
      star_type: trimmedStarType,
      one_word: trimmedOneWord,
      is_anonymous: anonymousBool,
      ip_hash: ipHash,
    });

    res.status(201).json({
      message: 'Your star has reached Shams’s universe ✨',
      wish: newWish,
    });
  } catch (err: any) {
    console.error('Failed to create wish:', err);
    res.status(500).json({ error: 'Your star could not take off this time. Please try again.' });
  }
});
