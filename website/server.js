/* ═══════════════════════════════════════════════════════════
   Student Pulse — Multi-Access Download Server
   Serves the website on all network interfaces so anyone
   on the same network can access & download the app files.
   ═══════════════════════════════════════════════════════════ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.apk': 'application/vnd.android.package-archive',
  '.ipa': 'application/octet-stream',
  '.dmg': 'application/octet-stream',
  '.zip': 'application/zip',
  '.exe': 'application/octet-stream',
  '.msi': 'application/octet-stream',
};

const server = http.createServer((req, res) => {
  // CORS headers so any origin can fetch
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 — Not Found</h1>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    // For download files, set Content-Disposition
    const isDownload = urlPath.startsWith('/downloads/');
    const headers = { 'Content-Type': mime, 'Content-Length': stats.size };
    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${path.basename(filePath)}"`;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  console.log('\n ╔══════════════════════════════════════════════════╗');
  console.log(' ║   🎓 Student Pulse — Multi-Access Server        ║');
  console.log(' ╠══════════════════════════════════════════════════╣');
  console.log(` ║  Local:    http://localhost:${PORT}               ║`);

  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        const url = `http://${addr.address}:${PORT}`;
        const pad = ' '.repeat(Math.max(0, 33 - url.length));
        console.log(` ║  Network:  ${url}${pad}║`);
      }
    }
  }

  console.log(' ╠══════════════════════════════════════════════════╣');
  console.log(' ║  Share the Network URL with anyone on your LAN  ║');
  console.log(' ║  to let them download Student Pulse!             ║');
  console.log(' ╚══════════════════════════════════════════════════╝\n');
});
