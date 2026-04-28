// kalshi-proxy.js
// Tiny CORS proxy for the Kalshi public API.
// Run: node kalshi-proxy.js
// Then open the HTML file via a local server (or just file://) — it'll hit http://localhost:3132 instead.

const http = require('http');
const https = require('https');

const PORT = 3132;
const KALSHI_HOST = 'api.elections.kalshi.com';

const server = http.createServer((req, res) => {
  // CORS headers — allow everything since this is local-only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Forward the request to Kalshi, preserving the path and query string
  const options = {
    hostname: KALSHI_HOST,
    path: req.url,
    method: 'GET',
    headers: { 'Accept': 'application/json', 'User-Agent': 'kalshi-explorer-local/1.0' },
  };

  console.log(`→ ${req.url}`);

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`Kalshi proxy running at http://localhost:${PORT}`);
  console.log(`Forwarding to https://${KALSHI_HOST}`);
  console.log('Leave this terminal open while using the app.');
});
