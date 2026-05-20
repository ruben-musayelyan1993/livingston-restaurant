import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Request, type Response, type NextFunction } from 'express';
import { join } from 'node:path';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';

const browserDistFolder = join(import.meta.dirname, '../browser');

// In dev (ng serve) dist/browser doesn't exist — fall back to source public/
const assetsBase = existsSync(browserDistFolder)
  ? browserDistFolder
  : join(process.cwd(), 'public');

// ── Translation data store ─────────────────────────────────────────────────────
// Kept outside public/ so ng-serve hot-reload never triggers on admin saves.
const sourceI18nDir = join(existsSync(browserDistFolder) ? browserDistFolder : join(process.cwd(), 'public'), 'i18n');
const dataDir = join(process.cwd(), 'data', 'i18n');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
for (const lang of ['ru', 'en', 'hy']) {
  const dst = join(dataDir, `${lang}.json`);
  const src = join(sourceI18nDir, `${lang}.json`);
  if (!existsSync(dst) && existsSync(src)) copyFileSync(src, dst);
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// ── Telegram config ───────────────────────────────────────────────────────────
const TG_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];
const TG_CHAT  = process.env['TELEGRAM_CHAT_ID'];

app.use(cookieParser());

// ── Admin auth ────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD_RAW = process.env['ADMIN_PASSWORD'] || 'livingston2024';
// Pre-hash at startup — if env already contains a bcrypt hash, use it as-is
const ADMIN_HASH = ADMIN_PASSWORD_RAW.startsWith('$2')
  ? ADMIN_PASSWORD_RAW
  : bcrypt.hashSync(ADMIN_PASSWORD_RAW, 10);

const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 hours
const sessions = new Map<string, number>(); // token → expiresAt

// Remove expired sessions to prevent memory growth
function pruneExpired(): void {
  const now = Date.now();
  for (const [token, exp] of sessions) {
    if (now > exp) sessions.delete(token);
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = (req.cookies as Record<string, string>)?.['admin_session'];
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const exp = sessions.get(token);
  if (!exp || Date.now() > exp) {
    sessions.delete(token);
    res.clearCookie('admin_session', { path: '/' });
    res.status(401).json({ error: 'Session expired' });
    return;
  }
  next();
}

// ── Rate limiter: 5 login attempts per 15 min per IP ──────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Login ─────────────────────────────────────────────────────────────────────
app.post('/admin/api/login', loginLimiter, express.json(), async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body as { password: string };
  const valid = await bcrypt.compare(password ?? '', ADMIN_HASH);
  if (!valid) { res.status(401).json({ error: 'Invalid password' }); return; }

  pruneExpired();
  const token = randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);

  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: SESSION_TTL,
    secure: process.env['NODE_ENV'] === 'production',
    path: '/',
  });
  res.json({ ok: true });
});

// ── Logout ────────────────────────────────────────────────────────────────────
app.post('/admin/api/logout', (req: Request, res: Response): void => {
  const token = (req.cookies as Record<string, string>)?.['admin_session'];
  if (token) sessions.delete(token);
  res.clearCookie('admin_session', { path: '/' });
  res.json({ ok: true });
});

// ── Telegram proxy ────────────────────────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

async function sendTelegram(text: string): Promise<void> {
  if (!TG_TOKEN || !TG_CHAT) throw new Error('Telegram not configured');
  const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) throw new Error(`Telegram responded with ${r.status}`);
}

app.post('/api/reservation', contactLimiter, express.json(), async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, date, guests, comment } = req.body as Record<string, string>;
  try {
    const formatted = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const text = [
      '🍽 <b>Новая заявка на бронирование</b>',
      '',
      `👤 <b>Имя:</b> ${name}`,
      `📧 <b>Email:</b> ${email}`,
      `📞 <b>Телефон:</b> ${phone}`,
      `📅 <b>Дата:</b> ${formatted}`,
      `👥 <b>Гостей:</b> ${guests}`,
      comment?.trim() ? `💬 <b>Комментарий:</b> ${comment}` : '',
    ].filter(Boolean).join('\n');
    await sendTelegram(text);
    res.json({ ok: true });
  } catch (err) {
    console.error('Reservation Telegram error:', err);
    res.status(502).json({ error: 'Failed to send notification' });
  }
});

const eventTypeLabels: Record<string, string> = {
  wedding: 'Свадьба', birthday: 'День рождения', corporate: 'Корпоратив', other: 'Другое',
};

app.post('/api/private-event', contactLimiter, express.json(), async (req: Request, res: Response): Promise<void> => {
  const { name, company, eventType, guests, date, comment } = req.body as Record<string, string>;
  try {
    const formatted = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const lines = [
      '🎉 <b>Новая заявка на частное мероприятие</b>',
      '',
      `👤 <b>Имя:</b> ${name}`,
    ];
    if (company?.trim()) lines.push(`🏢 <b>Компания:</b> ${company}`);
    lines.push(
      `🎭 <b>Тип мероприятия:</b> ${eventTypeLabels[eventType] ?? eventType}`,
      `👥 <b>Гостей:</b> ${guests}`,
      `📅 <b>Дата:</b> ${formatted}`,
    );
    if (comment?.trim()) lines.push(`💬 <b>Комментарий:</b> ${comment}`);
    await sendTelegram(lines.join('\n'));
    res.json({ ok: true });
  } catch (err) {
    console.error('PrivateEvent Telegram error:', err);
    res.status(502).json({ error: 'Failed to send notification' });
  }
});

// ── Serve live translations (data/ overrides static public/i18n) ──────────────
app.get('/i18n/:lang.json', (req: Request, res: Response): void => {
  const lang = req.params['lang'] as string;
  if (!['ru', 'en', 'hy'].includes(lang)) { res.status(404).end(); return; }
  const live = join(dataDir, `${lang}.json`);
  res.sendFile(existsSync(live) ? live : join(sourceI18nDir, `${lang}.json`));
});

// ── Translations ──────────────────────────────────────────────────────────────
app.get('/admin/api/translations', requireAdmin, (_req: Request, res: Response): void => {
  try {
    const result: Record<string, unknown> = {};
    for (const lang of ['ru', 'en', 'hy']) {
      result[lang] = JSON.parse(readFileSync(join(dataDir, `${lang}.json`), 'utf-8'));
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to read translations' });
  }
});

app.put('/admin/api/translations', requireAdmin, express.json({ limit: '2mb' }), (req: Request, res: Response): void => {
  try {
    const body = req.body as Record<string, unknown>;
    for (const lang of ['ru', 'en', 'hy']) {
      if (body[lang]) {
        writeFileSync(join(dataDir, `${lang}.json`), JSON.stringify(body[lang], null, 2));
      }
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to save translations' });
  }
});

// ── Images ────────────────────────────────────────────────────────────────────
app.get('/admin/api/images', requireAdmin, (_req: Request, res: Response): void => {
  const dir = join(assetsBase, 'assets/images');
  const files = readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(f))
    .map(name => ({ name, url: `/assets/images/${name}` }));
  res.json(files);
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, join(assetsBase, 'assets/images')),
  filename: (req, _file, cb) => cb(null, (req.params as { name: string }).name),
});
const upload = multer({ storage: imageStorage, limits: { fileSize: 15 * 1024 * 1024 } });

app.post('/admin/api/images/:name', requireAdmin, upload.single('file'), (req: Request, res: Response): void => {
  res.json({ ok: true, url: `/assets/images/${req.params['name']}` });
});

// ── Static files ──────────────────────────────────────────────────────────────
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// ── Angular SSR ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
