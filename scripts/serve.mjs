/** Local development only. No dependencies; never serve the checkout root. */
import { createServer } from 'node:http';
import { realpath, stat, readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('../app/', import.meta.url));
const media = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const inside = (root, target) => {
  const path = relative(root, target);
  return path !== '..' && !path.startsWith('../') && !isAbsolute(path);
};

/** Root is injectable only for isolated tests; CLI always serves app/. */
export function createAppServer({ root = appRoot } = {}) {
  return createServer(async (req, res) => {
    const reply = (status, body, headers = {}) => {
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (!/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host ?? '')) return reply(403, 'Forbidden');
    if (!['GET', 'HEAD'].includes(req.method)) return reply(405, 'Method not allowed', { Allow: 'GET, HEAD' });
    try {
      const raw = req.url.split('?')[0];
      if (!raw.startsWith('/') || raw.startsWith('//')) return reply(403, 'Forbidden');
      const path = decodeURIComponent(raw);
      // Residual escapes are refused as well, avoiding double-decoding ambiguity.
      if (/[\\\0%]/.test(path) || path.split('/').some(part => part === '..' || part === '.')) {
        return reply(403, 'Forbidden');
      }
      const base = await realpath(root);
      const target = resolve(base, '.' + (path === '/' ? '/index.html' : path));
      if (!inside(base, target)) return reply(403, 'Forbidden');
      const canonical = await realpath(target);
      if (!inside(base, canonical)) return reply(403, 'Forbidden');
      if (!(await stat(canonical)).isFile()) return reply(404, 'Not found');
      const body = await readFile(canonical);
      reply(200, body, { 'Content-Type': media[extname(canonical)] ?? 'application/octet-stream',
        'Content-Length': body.length });
    } catch (error) {
      if (error instanceof URIError) return reply(400, 'Bad request');
      if (['ENOENT', 'ENOTDIR', 'EACCES', 'ELOOP'].includes(error.code)) return reply(404, 'Not found');
      reply(500, 'Internal server error');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be an integer from 0 to 65535');
  const server = createAppServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Órbita development server: 127.0.0.1:${server.address().port}`));
}
