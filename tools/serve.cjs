// Lokální náhled: node prooze-web/tools/serve.cjs 8801
// Servíruje dist/. POST /api/poptavka/ jen zapíše poptávku do dev-poptavky.jsonl (skutečné odeslání řeší api/poptavka.js na Vercelu).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../dist'), port = +(process.argv[2] || 8801);
const devLog = path.resolve(__dirname, '../dev-poptavky.jsonl');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p.startsWith('/api/poptavka')) {
    if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e5) req.destroy(); });
    return req.on('end', () => {
      fs.appendFileSync(devLog, body.replace(/\n/g, ' ') + '\n');
      console.log('[poptávka]', body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
  }
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  else if (!path.extname(f) && fs.existsSync(f + '.html')) f += '.html';
  fs.readFile(f, (err, data) => {
    if (err) {
      return fs.readFile(path.join(root, '404.html'), (e2, nf) => { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(e2 ? '404' : nf); });
    }
    const type = types[path.extname(f).toLowerCase()] || 'application/octet-stream';
    // Range requesty: bez nich prohlížeč neumí převíjet video (scrubování scrollem)
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {
      const start = range[1] ? +range[1] : 0, end = range[2] ? Math.min(+range[2], data.length - 1) : data.length - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-store' });
      return res.end(data.subarray(start, end + 1));
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log('PROOZE: http://localhost:' + port));
