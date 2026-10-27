const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  // Stripe checkout session
  if (req.method === 'POST' && req.url === '/api/create-checkout-session') {
    try {
      if (!STRIPE_SECRET_KEY) { json(res, 500, { error: 'Stripe not configured' }); return; }
      const { userId, email } = await readBody(req);
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
        cancel_url: `${APP_URL}/?checkout=cancel`,
        metadata: { userId },
      });
      json(res, 200, { url: session.url });
    } catch (err) {
      console.error('Stripe error:', err.message);
      json(res, 500, { error: err.message });
    }
    return;
  }

  // Verify checkout session (called after Stripe redirect back)
  if (req.method === 'GET' && req.url.startsWith('/api/verify-checkout')) {
    try {
      if (!STRIPE_SECRET_KEY) { json(res, 500, { error: 'Stripe not configured' }); return; }
      const sessionId = new URL(req.url, 'http://x').searchParams.get('session_id');
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        json(res, 200, { paid: true, userId: session.metadata.userId });
      } else {
        json(res, 200, { paid: false });
      }
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // Static file serving
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url.split('?')[0]);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`VNC Radio running on port ${PORT}`);
});
