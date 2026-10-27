const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// Env vars
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID   = process.env.STRIPE_PRICE_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL           = process.env.APP_URL || `http://localhost:${PORT}`;
const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service_role key — server only
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ADMIN_USER        = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS        = process.env.ADMIN_PASS || 'vnc2024';

// Supabase admin client (service role — bypasses RLS)
// Only connect when the URL is a real http(s) URL; a placeholder value used to crash the server on boot.
const supabaseAdmin = (SUPABASE_URL && /^https?:\/\//i.test(SUPABASE_URL.trim()) && SUPABASE_SERVICE_KEY)
  ? createClient(SUPABASE_URL.trim(), SUPABASE_SERVICE_KEY)
  : null;
if (!supabaseAdmin) console.warn('Supabase not configured: set SUPABASE_URL (https://…supabase.co) and SUPABASE_SERVICE_KEY');

const isAdmin = (b) => b && b.adminUser === ADMIN_USER && b.adminPass === ADMIN_PASS;
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function jsonRes(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function readBodyRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readBodyJson(req) {
  const raw = await readBodyRaw(req);
  try { return JSON.parse(raw.toString() || '{}'); } catch { return {}; }
}

// ─── ROUTE HANDLER ───────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // ── 1. STRIPE WEBHOOK ───────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/webhook') {
    const rawBody = await readBodyRaw(req);
    const sig = req.headers['stripe-signature'];
    try {
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (session.payment_status === 'paid' && session.metadata?.userId && supabaseAdmin) {
          await supabaseAdmin
            .from('listeners')
            .update({ subscribed: true, stripe_customer_id: session.customer })
            .eq('id', session.metadata.userId);
          console.log('Webhook: marked listener subscribed', session.metadata.userId);
        }
      }

      if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
        const obj = event.data.object;
        const customerId = obj.customer;
        if (customerId && supabaseAdmin) {
          await supabaseAdmin
            .from('listeners')
            .update({ subscribed: false })
            .eq('stripe_customer_id', customerId);
          console.log('Webhook: revoked subscription for customer', customerId);
        }
      }

      res.writeHead(200); res.end('ok');
    } catch (err) {
      console.error('Webhook error:', err.message);
      res.writeHead(400); res.end(`Webhook error: ${err.message}`);
    }
    return;
  }

  // ── 2. CREATE STRIPE CHECKOUT SESSION ──────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/create-checkout-session') {
    try {
      if (!STRIPE_SECRET_KEY) { jsonRes(res, 500, { error: 'Stripe not configured' }); return; }
      const { userId, email } = await readBodyJson(req);
      const stripe = require('stripe')(STRIPE_SECRET_KEY);

      // Look up or create Stripe customer to enable portal later
      let customerId;
      if (supabaseAdmin) {
        const { data: listener } = await supabaseAdmin
          .from('listeners').select('stripe_customer_id').eq('id', userId).single();
        if (listener?.stripe_customer_id) {
          customerId = listener.stripe_customer_id;
        }
      }

      const sessionParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${APP_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}&user_id=${userId}`,
        cancel_url: `${APP_URL}/?checkout=cancel`,
        metadata: { userId },
      };
      if (customerId) {
        sessionParams.customer = customerId;
      } else {
        sessionParams.customer_email = email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      jsonRes(res, 200, { url: session.url });
    } catch (err) {
      console.error('Checkout error:', err.message);
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 3. VERIFY CHECKOUT (browser return) ────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/verify-checkout') {
    try {
      if (!STRIPE_SECRET_KEY) { jsonRes(res, 500, { error: 'Stripe not configured' }); return; }
      const sessionId = url.searchParams.get('session_id');
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid' && session.metadata?.userId && supabaseAdmin) {
        await supabaseAdmin
          .from('listeners')
          .update({ subscribed: true, stripe_customer_id: session.customer })
          .eq('id', session.metadata.userId);
      }
      jsonRes(res, 200, { paid: session.payment_status === 'paid', userId: session.metadata?.userId });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 4. STRIPE CUSTOMER PORTAL ──────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/customer-portal') {
    try {
      if (!STRIPE_SECRET_KEY) { jsonRes(res, 500, { error: 'Stripe not configured' }); return; }
      const { userId } = await readBodyJson(req);
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const { data: listener } = await supabaseAdmin
        .from('listeners').select('stripe_customer_id').eq('id', userId).single();
      if (!listener?.stripe_customer_id) {
        jsonRes(res, 400, { error: 'No subscription found' }); return;
      }
      const stripe = require('stripe')(STRIPE_SECRET_KEY);
      const portal = await stripe.billingPortal.sessions.create({
        customer: listener.stripe_customer_id,
        return_url: APP_URL,
      });
      jsonRes(res, 200, { url: portal.url });
    } catch (err) {
      console.error('Portal error:', err.message);
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 5. ADMIN LOGIN ─────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/admin-login') {
    const { user, pass } = await readBodyJson(req);
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      jsonRes(res, 200, { ok: true });
    } else {
      jsonRes(res, 401, { ok: false, msg: 'Invalid credentials' });
    }
    return;
  }

  // ── 6. ARTIST APPROVAL (admin action) ─────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/approve-artist') {
    try {
      const { artistId, action, adminUser, adminPass } = await readBodyJson(req);
      if (adminUser !== ADMIN_USER || adminPass !== ADMIN_PASS) {
        jsonRes(res, 401, { error: 'Unauthorized' }); return;
      }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const status = action === 'approve' ? 'approved' : 'rejected';
      await supabaseAdmin.from('artists').update({ status }).eq('id', artistId);
      jsonRes(res, 200, { ok: true, status });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 7. FETCH ALL USERS (admin) ─────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/admin-users') {
    try {
      const { adminUser, adminPass } = await readBodyJson(req);
      if (adminUser !== ADMIN_USER || adminPass !== ADMIN_PASS) {
        jsonRes(res, 401, { error: 'Unauthorized' }); return;
      }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const [{ data: listeners }, { data: artists }] = await Promise.all([
        supabaseAdmin.from('listeners').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('artists').select('*').order('created_at', { ascending: false }),
      ]);
      jsonRes(res, 200, { listeners: listeners || [], artists: artists || [] });
    } catch (err) {
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 7a. ADD TRACK (admin) ──────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/tracks') {
    try {
      const b = await readBodyJson(req);
      if (!isAdmin(b)) { jsonRes(res, 401, { error: 'Unauthorized' }); return; }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const title = String(b.title || '').trim();
      const artist_name = String(b.artistName || '').trim();
      if (!title || !artist_name) { jsonRes(res, 400, { error: 'Title and artist name are required' }); return; }
      const isrc = String(b.isrc || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || null;
      const { data, error } = await supabaseAdmin.from('tracks')
        .insert({ title, artist_name, isrc, artist_id: b.artistId || null }).select().single();
      if (error) throw error;
      jsonRes(res, 200, { ok: true, track: data });
    } catch (err) { jsonRes(res, 500, { error: err.message }); }
    return;
  }

  // ── 7b. LIST TRACKS (admin) ────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/tracks/list') {
    try {
      const b = await readBodyJson(req);
      if (!isAdmin(b)) { jsonRes(res, 401, { error: 'Unauthorized' }); return; }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const { data, error } = await supabaseAdmin.from('tracks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      jsonRes(res, 200, { tracks: data || [] });
    } catch (err) { jsonRes(res, 500, { error: err.message }); }
    return;
  }

  // ── 7c. LOG A SPIN (admin / playout system) ────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/spins') {
    try {
      const b = await readBodyJson(req);
      if (!isAdmin(b)) { jsonRes(res, 401, { error: 'Unauthorized' }); return; }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      if (!b.trackId || !b.station) { jsonRes(res, 400, { error: 'trackId and station are required' }); return; }
      const row = {
        track_id: b.trackId,
        station: String(b.station),
        played_at: b.playedAt || new Date().toISOString(),
        ad_revenue: round2(b.adRevenue),
        stream_revenue: round2(b.streamRevenue),
      };
      const { error } = await supabaseAdmin.from('spins').insert(row);
      if (error) throw error;
      jsonRes(res, 200, { ok: true });
    } catch (err) { jsonRes(res, 500, { error: err.message }); }
    return;
  }

  // ── 7d. ROYALTY VAULT REPORT (admin) ───────────────────────────────────────
  // Returns spins + artist earnings for one artist and period in the
  // "royaltyvault.v1" format that the Royalty Vault app imports.
  if (req.method === 'POST' && pathname === '/api/royalty-report') {
    try {
      const b = await readBodyJson(req);
      if (!isAdmin(b)) { jsonRes(res, 401, { error: 'Unauthorized' }); return; }
      if (!supabaseAdmin) { jsonRes(res, 500, { error: 'DB not configured' }); return; }
      const artist = String(b.artistName || '').trim();
      if (!artist || !isDate(b.from) || !isDate(b.to) || b.from > b.to) {
        jsonRes(res, 400, { error: 'Send artistName and a from/to date range (YYYY-MM-DD)' }); return;
      }
      const { data: tracks, error: tErr } = await supabaseAdmin
        .from('tracks').select('id,title,isrc,artist_name').ilike('artist_name', artist);
      if (tErr) throw tErr;
      const byId = new Map((tracks || []).map(t => [t.id, t]));
      let spins = [];
      if (byId.size) {
        const { data, error } = await supabaseAdmin.from('spins')
          .select('track_id,station,ad_revenue,stream_revenue')
          .in('track_id', [...byId.keys()])
          .gte('played_at', `${b.from}T00:00:00Z`).lte('played_at', `${b.to}T23:59:59Z`);
        if (error) throw error;
        spins = data || [];
      }
      const agg = new Map();
      for (const s of spins) {
        const a = agg.get(s.track_id) || { spins: 0, ad: 0, stream: 0, stations: new Set() };
        a.spins++; a.ad += Number(s.ad_revenue) || 0; a.stream += Number(s.stream_revenue) || 0; a.stations.add(s.station);
        agg.set(s.track_id, a);
      }
      const lines = [...agg.entries()].map(([id, a]) => {
        const t = byId.get(id);
        return {
          title: t.title, isrc: t.isrc || '', stream: 'digitalradio',
          units: a.spins, unit_label: 'spins',
          amount: round2(a.ad + a.stream),
          detail: { ad_revenue: round2(a.ad), stream_revenue: round2(a.stream), stations: [...a.stations] },
        };
      }).sort((x, y) => y.amount - x.amount);
      jsonRes(res, 200, {
        format: 'royaltyvault.v1',
        source: 'VNC Radio',
        report_id: `vncradio:${artist.toLowerCase()}:${b.from}:${b.to}`,
        artist, period: { from: b.from, to: b.to },
        generated_at: new Date().toISOString(),
        totals: { units: lines.reduce((n, l) => n + l.units, 0), amount: round2(lines.reduce((n, l) => n + l.amount, 0)) },
        lines,
      });
    } catch (err) { jsonRes(res, 500, { error: err.message }); }
    return;
  }

  // ── 8. AI CHAT PROXY ────────────────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/ai-chat') {
    try {
      if (!ANTHROPIC_API_KEY) { jsonRes(res, 500, { error: 'AI not configured' }); return; }
      const { messages } = await readBodyJson(req);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: 'You are the VNC Radio AI Growth Assistant. You help radio station managers and artists with social media campaigns, brand pitches, station copy, artist outreach, ad partnerships, and growth strategy. Keep answers concise and practical. VNC Radio is an urban music platform featuring Hip-Hop, R&B, Trap, Gospel, Reggae, and Classic Hip-Hop stations.',
          messages: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });

      const data = await response.json();
      if (data.content?.[0]?.text) {
        jsonRes(res, 200, { reply: data.content[0].text });
      } else {
        jsonRes(res, 500, { error: 'No response from AI' });
      }
    } catch (err) {
      console.error('AI error:', err.message);
      jsonRes(res, 500, { error: err.message });
    }
    return;
  }

  // ── 9. STATIC FILE SERVING ─────────────────────────────────────────────────
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = mime[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });

}).listen(PORT, '0.0.0.0', () => {
  console.log(`VNC Radio running on port ${PORT}`);
});
