import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// DESIGN TOKENS
// ============================================================
const T = {
  black: "#080A0F",
  slate: "#1A1F2E",
  slateLight: "#252B3D",
  border: "#2E3550",
  red: "#E8001D",
  redDim: "#9B0013",
  amber: "#F5A623",
  chrome: "#C8CDD6",
  white: "#F0F2F7",
  green: "#00E676",
  blue: "#2979FF",
  purple: "#AA00FF",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.black};color:${T.white};font-family:'Inter',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${T.slate}}
  ::-webkit-scrollbar-thumb{background:${T.red};border-radius:3px}
  .bebas{font-family:'Bebas Neue',sans-serif;letter-spacing:2px}
  .mono{font-family:'JetBrains Mono',monospace}
  .tag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .tag-live{background:${T.red};color:white}
  .tag-on{background:${T.green}22;color:${T.green};border:1px solid ${T.green}44}
  .tag-off{background:#ffffff11;color:${T.chrome};border:1px solid ${T.border}}
  .tag-sub{background:${T.amber}22;color:${T.amber};border:1px solid ${T.amber}44}
  .tag-fm{background:${T.blue}22;color:${T.blue};border:1px solid ${T.blue}44}
  .card{background:${T.slate};border:1px solid ${T.border};border-radius:10px;padding:16px}
  .card-hover:hover{border-color:${T.red}66;transform:translateY(-1px);transition:all .2s}
  .btn{padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s;letter-spacing:.5px}
  .btn-red{background:${T.red};color:white}
  .btn-red:hover{background:#ff1a35}
  .btn-ghost{background:transparent;color:${T.chrome};border:1px solid ${T.border}}
  .btn-ghost:hover{border-color:${T.chrome};color:white}
  .btn-amber{background:${T.amber};color:${T.black}}
  .btn-amber:hover{background:#ffc04d}
  .btn-sm{padding:5px 12px;font-size:11px}
  input,select,textarea{background:${T.slateLight};border:1px solid ${T.border};color:${T.white};border-radius:6px;padding:9px 12px;font-size:13px;font-family:'Inter',sans-serif;width:100%;outline:none;transition:border .2s}
  input:focus,select:focus,textarea:focus{border-color:${T.red}88}
  label{font-size:12px;color:${T.chrome};display:block;margin-bottom:4px;font-weight:500}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .flex{display:flex;align-items:center}
  .gap4{gap:4px}.gap8{gap:8px}.gap12{gap:12px}.gap16{gap:16px}
  .sb{justify-content:space-between}
  .wrap{flex-wrap:wrap}
  .mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}.mt24{margin-top:24px}
  .mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}
  .stat-num{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:600;line-height:1}
  .stat-label{font-size:11px;color:${T.chrome};margin-top:4px;text-transform:uppercase;letter-spacing:1px}
  .section-title{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;color:${T.chrome};margin-bottom:12px}
  .waveform-bar{display:inline-block;background:${T.red};border-radius:2px;animation:wave var(--d,.6s) ease-in-out infinite alternate;transform-origin:bottom}
  @keyframes wave{from{height:var(--min,4px)}to{height:var(--max,20px)}}
  .pulse{animation:pulse 2s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fade-in{animation:fadeIn .3s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .scroll-area{overflow-y:auto;max-height:calc(100vh - 140px)}
  .sidebar-item{padding:10px 14px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:500;display:flex;align-items:center;gap:10px;transition:all .15s;color:${T.chrome};margin-bottom:2px}
  .sidebar-item:hover{background:${T.slateLight};color:white}
  .sidebar-item.active{background:${T.red}22;color:${T.red};border-left:2px solid ${T.red}}
  .progress-bar{height:4px;background:${T.border};border-radius:2px;overflow:hidden}
  .progress-fill{height:100%;border-radius:2px;transition:width .5s}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${T.chrome};border-bottom:1px solid ${T.border};font-weight:600}
  td{padding:10px 12px;border-bottom:1px solid ${T.border}11;vertical-align:middle}
  tr:hover td{background:${T.slateLight}88}
  .tooltip{position:relative}
  .tooltip:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:${T.slateLight};border:1px solid ${T.border};padding:5px 10px;border-radius:5px;font-size:11px;white-space:nowrap;z-index:100;pointer-events:none}
  .switch{position:relative;display:inline-block;width:40px;height:22px}
  .switch input{opacity:0;width:0;height:0}
  .slider{position:absolute;cursor:pointer;inset:0;background:${T.border};border-radius:22px;transition:.3s}
  .slider:before{content:"";position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.3s}
  input:checked + .slider{background:${T.red}}
  input:checked + .slider:before{transform:translateX(18px)}
  .ai-msg{padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5;margin-bottom:8px}
  .ai-msg.assistant{background:${T.slateLight};border-left:3px solid ${T.red}}
  .ai-msg.user{background:${T.red}22;border-left:3px solid ${T.amber};text-align:right}
  .station-listener-card{background:${T.slate};border:1px solid ${T.border};border-radius:12px;padding:20px;position:relative;overflow:hidden;cursor:pointer;transition:all .2s}
  .station-listener-card:hover{border-color:${T.red};transform:translateY(-2px)}
  .station-listener-card.favorited{border-color:${T.amber}}
  .station-listener-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px}
  .station-listener-card.red::before{background:${T.red}}
  .station-listener-card.amber::before{background:${T.amber}}
  .station-listener-card.blue::before{background:${T.blue}}
  .station-listener-card.green::before{background:${T.green}}
  .station-listener-card.purple::before{background:${T.purple}}
  .sub-card{background:linear-gradient(135deg,${T.slateLight},${T.slate});border:1px solid ${T.amber}44;border-radius:14px;padding:24px;position:relative;overflow:hidden}
  .sub-card.premium::before{content:"";position:absolute;top:-60px;right:-60px;width:140px;height:140px;background:${T.amber}15;border-radius:50%}
  .login-container{min-height:100vh;display:flex;align-items:center;justify-content:center;background:${T.black};position:relative;overflow:hidden}
  .login-container::before{content:"";position:absolute;width:400px;height:400px;background:${T.red}08;border-radius:50%;top:-100px;right:-100px}
  .login-container::after{content:"";position:absolute;width:300px;height:300px;background:${T.red}05;border-radius:50%;bottom:-80px;left:-80px}
  .notification{position:fixed;top:20px;right:20px;z-index:999;background:${T.slate};border:1px solid ${T.green};border-radius:8px;padding:12px 18px;font-size:13px;font-weight:500;color:${T.green};animation:slideIn .3s ease}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  @media(max-width:768px){.grid2,.grid3,.grid4{grid-template-columns:1fr}.admin-layout{flex-direction:column}}
`;

// ============================================================
// MOCK DATA
// ============================================================
const STATIONS = [
  { id: 1, name: "VNC Hot 97", genre: "Hip-Hop / R&B", freq: "97.3 FM", color: "red", listeners: 2847, city: "Atlanta, GA", live: true, fm: true, desc: "The hottest hits from the A", dj: "DJ Stackz", coverBg: "#1a0a0a" },
  { id: 2, name: "VNC Trap City", genre: "Trap / Street", freq: "Online", color: "amber", listeners: 1203, city: "Houston, TX", live: true, fm: false, desc: "Pure trap, all day every day", dj: "Lil Trap God", coverBg: "#1a150a" },
  { id: 3, name: "VNC R&B Vibes", genre: "R&B / Soul", freq: "102.7 FM", color: "blue", listeners: 3421, city: "Chicago, IL", live: true, fm: true, desc: "Smooth R&B for the culture", dj: "Silky Smooth", coverBg: "#0a0d1a" },
  { id: 4, name: "VNC Gospel Hour", genre: "Gospel / Praise", freq: "Online", color: "green", listeners: 891, city: "Memphis, TN", live: false, fm: false, desc: "Lift every voice", dj: "Minister Ray", coverBg: "#0a1a0d" },
  { id: 5, name: "VNC Reggae Wave", genre: "Reggae / Dancehall", freq: "Online", color: "purple", listeners: 567, city: "Miami, FL", live: true, fm: false, desc: "One love, all vibes", dj: "Irie Dan", coverBg: "#120a1a" },
  { id: 6, name: "VNC Old School", genre: "Classic Hip-Hop", freq: "88.1 FM", color: "red", listeners: 1988, city: "New York, NY", live: true, fm: true, desc: "90s & 2000s classics nonstop", dj: "Big Flex", coverBg: "#1a0a0f" },
];

const ARTISTS = [
  { id: 1, name: "Pharaoh Beats", genre: "Hip-Hop", tracks: 24, spins: 18420, adRev: 4820, streamRev: 2340, signed: "2024-03-15", label: "VNC Independent", svSync: true },
  { id: 2, name: "Aaliyah Rose", genre: "R&B", tracks: 18, spins: 31050, adRev: 8920, streamRev: 5100, signed: "2024-01-20", label: "VNC Records", svSync: true },
  { id: 3, name: "Blaze 2X", genre: "Trap", tracks: 31, spins: 22100, adRev: 5640, streamRev: 3200, signed: "2023-11-05", label: "VNC Independent", svSync: false },
  { id: 4, name: "Pastor Keys", genre: "Gospel", tracks: 12, spins: 7890, adRev: 1200, streamRev: 980, signed: "2024-05-01", label: "VNC Gospel", svSync: true },
];

const ADS = [
  { id: 1, brand: "NikeAir Pro", type: "Audio 30s", station: "VNC Hot 97", plays: 4200, revenue: 12600, ctr: "8.4%", status: "active" },
  { id: 2, brand: "Sprite Zero", type: "Audio 15s", station: "VNC Trap City", plays: 2800, revenue: 5600, ctr: "6.1%", status: "active" },
  { id: 3, brand: "Cash App", type: "Audio 30s", station: "All Stations", plays: 9100, revenue: 27300, ctr: "11.2%", status: "active" },
  { id: 4, brand: "Hennessy VS", type: "Sponsorship", station: "VNC Old School", plays: 1400, revenue: 8400, ctr: "7.8%", status: "paused" },
];

const LISTENER_DATA = [
  { city: "Atlanta, GA", count: 1247, station: "VNC Hot 97", sub: true },
  { city: "Chicago, IL", count: 983, station: "VNC R&B Vibes", sub: true },
  { city: "Houston, TX", count: 856, station: "VNC Trap City", sub: false },
  { city: "New York, NY", count: 1102, station: "VNC Old School", sub: true },
  { city: "Miami, FL", count: 432, station: "VNC Reggae Wave", sub: false },
  { city: "Los Angeles, CA", count: 671, station: "VNC Hot 97", sub: true },
  { city: "Memphis, TN", count: 298, station: "VNC Gospel Hour", sub: false },
  { city: "Dallas, TX", count: 512, station: "VNC Trap City", sub: true },
];

const SUPPORT_TICKETS = [
  { id: "TK-001", user: "Marcus T.", issue: "Can't access premium content", station: "VNC R&B Vibes", priority: "high", status: "open", time: "2h ago" },
  { id: "TK-002", user: "Destiny M.", issue: "Audio cutting out on mobile", station: "VNC Hot 97", priority: "medium", status: "open", time: "4h ago" },
  { id: "TK-003", user: "Jerome K.", issue: "Payment declined", station: "All", priority: "high", status: "resolved", time: "1d ago" },
  { id: "TK-004", user: "Tiffany B.", issue: "Can't find favorite station", station: "VNC Trap City", priority: "low", status: "open", time: "6h ago" },
];

// ============================================================
// UTILITIES
// ============================================================
function Waveform({ bars = 12, height = 28, active = true }) {
  return (
    <div className="flex gap4" style={{ alignItems: "flex-end", height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="waveform-bar" style={{
          width: 3,
          "--min": `${Math.random() * 4 + 2}px`,
          "--max": `${Math.random() * (height - 6) + 6}px`,
          "--d": `${(Math.random() * 0.4 + 0.4).toFixed(2)}s`,
          animationDelay: `${(i * 0.07).toFixed(2)}s`,
          opacity: active ? 1 : 0.3,
          animationPlayState: active ? "running" : "paused",
        }} />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = T.red, icon }) {
  return (
    <div className="card">
      <div className="flex sb">
        <div>
          <div className="stat-num" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
          {sub && <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>↑ {sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 28, opacity: .4 }}>{icon}</div>}
      </div>
    </div>
  );
}

function Notification({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return <div className="notification">{msg}</div>;
}

function ProgressBar({ val, max, color = T.red }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${(val / max) * 100}%`, background: color }} />
    </div>
  );
}

// ============================================================
// AI HELPER COMPONENT
// ============================================================
function AIHelper() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! I'm your VNC Radio AI assistant. I can help you craft social media campaigns, pitch ad partnerships, write station bios, or draft outreach to brands. What do you need?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are the AI growth & marketing assistant for VNC Radio — a professional broadcast platform powered by VNC. Your role is to help the admin:
1. Write social media posts (Instagram, Twitter/X, TikTok, Facebook) to promote stations, shows, and artists
2. Draft brand partnership pitches and advertising proposals
3. Create email outreach templates for sponsorships
4. Suggest promotional strategies for growing listener base
5. Help write ad scripts, station IDs, and promos
6. Generate press release drafts
Keep responses concise, professional, and in a voice that fits urban radio culture. Always sound like you know the industry.`,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Let me think on that...";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection issue — try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div className="flex gap8 mb16">
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.red}22`, border: `1px solid ${T.red}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 600 }}>VNC AI Growth Assistant</div>
          <div style={{ fontSize: 11, color: T.green }} className="flex gap4"><span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block" }} /> Online</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
        ))}
        {loading && <div className="ai-msg assistant pulse">Thinking...</div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap8 mt12">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about campaigns, pitches, social posts..." style={{ flex: 1 }} />
        <button className="btn btn-red" onClick={send} disabled={loading}>Send</button>
      </div>

      <div className="flex gap8 mt8 wrap">
        {["Write an Instagram promo post", "Pitch a brand for ads", "Draft station intro copy", "Grow listener strategy"].map(s => (
          <button key={s} className="btn btn-ghost btn-sm" onClick={() => { setInput(s); }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN SECTIONS
// ============================================================
function AdminOverview() {
  const totalListeners = STATIONS.reduce((a, s) => a + s.listeners, 0);
  return (
    <div className="fade-in">
      <div className="flex sb mb16 wrap gap8">
        <div><div className="bebas" style={{ fontSize: 26, color: T.white }}>BROADCAST COMMAND CENTER</div>
          <div style={{ fontSize: 12, color: T.chrome }}>VNC Radio Network — Live Dashboard</div></div>
        <div className="flex gap8">
          <span className="tag tag-live pulse">● LIVE</span>
          <span className="tag tag-on">{STATIONS.filter(s => s.live).length} Stations On Air</span>
        </div>
      </div>

      <div className="grid4 mb16">
        <StatCard label="Active Listeners" value={totalListeners.toLocaleString()} sub="+12% today" color={T.red} icon="📻" />
        <StatCard label="Stations Live" value={STATIONS.filter(s => s.live).length} color={T.green} icon="🎙️" />
        <StatCard label="Monthly Revenue" value="$48,120" sub="+8.3% MoM" color={T.amber} icon="💰" />
        <StatCard label="Subscribers" value="3,847" sub="+234 this week" color={T.blue} icon="👑" />
      </div>

      <div className="grid2 mb16">
        <div className="card">
          <div className="section-title">STATIONS ON AIR</div>
          {STATIONS.map(s => (
            <div key={s.id} className="flex sb mb8" style={{ padding: "8px 0", borderBottom: `1px solid ${T.border}22` }}>
              <div className="flex gap8">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.live ? T.green : T.border, marginTop: 4 }} className={s.live ? "pulse" : ""} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: T.chrome }}>{s.genre} · {s.dj}</div>
                </div>
              </div>
              <div className="flex gap8" style={{ alignItems: "center" }}>
                <Waveform bars={8} height={20} active={s.live} />
                <div className="mono" style={{ fontSize: 12, color: T.white }}>{s.listeners.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">LISTENER MAP — TOP CITIES</div>
          {LISTENER_DATA.map((l, i) => (
            <div key={i} className="mb8">
              <div className="flex sb" style={{ marginBottom: 3 }}>
                <div style={{ fontSize: 12 }}>{l.city}</div>
                <div className="mono" style={{ fontSize: 12, color: T.chrome }}>{l.count.toLocaleString()}</div>
              </div>
              <ProgressBar val={l.count} max={1300} color={l.sub ? T.amber : T.blue} />
            </div>
          ))}
          <div className="flex gap8 mt12">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: T.amber, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: T.chrome }}>Subscriber</span>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: T.blue, display: "inline-block", marginLeft: 8 }} />
            <span style={{ fontSize: 11, color: T.chrome }}>Free Listener</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">TOP PERFORMING ADS THIS WEEK</div>
        <table>
          <thead><tr><th>Brand</th><th>Type</th><th>Station</th><th>Plays</th><th>Revenue</th><th>CTR</th><th>Status</th></tr></thead>
          <tbody>
            {ADS.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.brand}</td>
                <td style={{ color: T.chrome }}>{a.type}</td>
                <td>{a.station}</td>
                <td className="mono">{a.plays.toLocaleString()}</td>
                <td className="mono" style={{ color: T.green }}>${a.revenue.toLocaleString()}</td>
                <td className="mono" style={{ color: T.amber }}>{a.ctr}</td>
                <td><span className={`tag ${a.status === "active" ? "tag-on" : "tag-off"}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StationManager({ notify }) {
  const [stations, setStations] = useState(STATIONS);
  const [form, setForm] = useState({ name: "", genre: "", freq: "", city: "", dj: "", desc: "", fm: false });
  const [showForm, setShowForm] = useState(false);

  const toggleLive = (id) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, live: !s.live } : s));
    notify("Station status updated");
  };

  return (
    <div className="fade-in">
      <div className="flex sb mb16">
        <div className="bebas" style={{ fontSize: 22 }}>STATION MANAGER</div>
        <button className="btn btn-red" onClick={() => setShowForm(!showForm)}>+ Add Station</button>
      </div>

      {showForm && (
        <div className="card mb16 fade-in">
          <div className="section-title">NEW STATION</div>
          <div className="grid2">
            <div><label>Station Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VNC Station Name" /></div>
            <div><label>Genre</label><input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} placeholder="Hip-Hop / R&B" /></div>
            <div><label>Frequency / Type</label><input value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value })} placeholder="98.7 FM or Online" /></div>
            <div><label>Base City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Atlanta, GA" /></div>
            <div><label>Head DJ</label><input value={form.dj} onChange={e => setForm({ ...form, dj: e.target.value })} placeholder="DJ Name" /></div>
            <div><label>Description</label><input value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Station tagline..." /></div>
          </div>
          <div className="flex gap8 mt12">
            <label className="switch"><input type="checkbox" checked={form.fm} onChange={e => setForm({ ...form, fm: e.target.checked })} /><span className="slider" /></label>
            <span style={{ fontSize: 13 }}>FM Broadcast Enabled</span>
          </div>
          <button className="btn btn-red mt12" onClick={() => { notify("Station created!"); setShowForm(false); }}>Create Station</button>
        </div>
      )}

      <div className="grid2">
        {stations.map(s => (
          <div key={s.id} className="card card-hover">
            <div className="flex sb mb8">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: T.chrome }}>{s.genre}</div>
              </div>
              <div className="flex gap8">
                {s.fm && <span className="tag tag-fm">FM</span>}
                <span className={`tag ${s.live ? "tag-live" : "tag-off"}`}>{s.live ? "LIVE" : "OFF"}</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.chrome, marginBottom: 12 }}>{s.desc}</div>
            <div className="grid2" style={{ gap: 8, marginBottom: 12 }}>
              <div><div className="stat-label">Listeners</div><div className="mono" style={{ fontSize: 16, color: T.white }}>{s.listeners.toLocaleString()}</div></div>
              <div><div className="stat-label">DJ</div><div style={{ fontSize: 13 }}>{s.dj}</div></div>
              <div><div className="stat-label">Frequency</div><div style={{ fontSize: 13 }}>{s.freq}</div></div>
              <div><div className="stat-label">City</div><div style={{ fontSize: 13 }}>{s.city}</div></div>
            </div>
            <Waveform bars={14} height={24} active={s.live} />
            <div className="flex gap8 mt12">
              <button className={`btn btn-sm ${s.live ? "btn-ghost" : "btn-red"}`} onClick={() => toggleLive(s.id)}>{s.live ? "Take Off Air" : "Go Live"}</button>
              <button className="btn btn-ghost btn-sm">Edit</button>
              <button className="btn btn-ghost btn-sm">Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <div className="fade-in">
      <div className="bebas mb16" style={{ fontSize: 22 }}>ANALYTICS & INSIGHTS</div>
      <div className="grid4 mb16">
        <StatCard label="Total Spins Today" value="142,840" sub="+6% vs yesterday" color={T.red} />
        <StatCard label="Ad Revenue MTD" value="$48,120" sub="+8.3%" color={T.amber} />
        <StatCard label="Avg Session" value="47 min" color={T.blue} />
        <StatCard label="Churn Rate" value="2.1%" color={T.green} />
      </div>

      <div className="grid2 mb16">
        <div className="card">
          <div className="section-title">LISTENER BREAKDOWN BY STATION</div>
          {STATIONS.map(s => (
            <div key={s.id} className="mb12">
              <div className="flex sb mb4">
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div className="mono" style={{ fontSize: 12 }}>{s.listeners.toLocaleString()}</div>
              </div>
              <ProgressBar val={s.listeners} max={4000} color={s.color === "red" ? T.red : s.color === "amber" ? T.amber : s.color === "blue" ? T.blue : s.color === "green" ? T.green : T.purple} />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">GEOGRAPHIC LISTENER DISTRIBUTION</div>
          <table>
            <thead><tr><th>City</th><th>Listeners</th><th>Station</th><th>Subs</th></tr></thead>
            <tbody>
              {LISTENER_DATA.map((l, i) => (
                <tr key={i}>
                  <td>{l.city}</td>
                  <td className="mono" style={{ color: T.white }}>{l.count.toLocaleString()}</td>
                  <td style={{ fontSize: 11, color: T.chrome }}>{l.station}</td>
                  <td>{l.sub ? <span className="tag tag-sub">PRO</span> : <span className="tag tag-off">FREE</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="section-title">BROADCAST MONITORING — SIGNAL STATUS</div>
        <div className="grid3">
          {STATIONS.filter(s => s.fm).map(s => (
            <div key={s.id} style={{ background: T.slateLight, borderRadius: 8, padding: 14, border: `1px solid ${T.border}` }}>
              <div className="flex sb mb8">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <span className={`tag ${s.live ? "tag-live" : "tag-off"}`}>{s.freq}</span>
              </div>
              <div className="grid2" style={{ gap: 6, fontSize: 11, color: T.chrome }}>
                <div>Signal: <span style={{ color: T.green }}>98.4%</span></div>
                <div>Bitrate: <span style={{ color: T.white }}>320kbps</span></div>
                <div>Latency: <span style={{ color: T.amber }}>42ms</span></div>
                <div>Uptime: <span style={{ color: T.white }}>99.7%</span></div>
              </div>
              <div className="mt8"><Waveform bars={18} height={22} active={s.live} /></div>
            </div>
          ))}
          {STATIONS.filter(s => !s.fm).map(s => (
            <div key={s.id} style={{ background: T.slateLight, borderRadius: 8, padding: 14, border: `1px solid ${T.border}` }}>
              <div className="flex sb mb8">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <span className="tag tag-on">ONLINE STREAM</span>
              </div>
              <div className="grid2" style={{ gap: 6, fontSize: 11, color: T.chrome }}>
                <div>CDN: <span style={{ color: T.green }}>Healthy</span></div>
                <div>Bitrate: <span style={{ color: T.white }}>192kbps</span></div>
                <div>Latency: <span style={{ color: T.green }}>18ms</span></div>
                <div>Uptime: <span style={{ color: T.white }}>100%</span></div>
              </div>
              <div className="mt8"><Waveform bars={18} height={22} active={s.live} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistPortal({ notify }) {
  const [artists, setArtists] = useState(ARTISTS);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="fade-in">
      <div className="flex sb mb16">
        <div>
          <div className="bebas" style={{ fontSize: 22 }}>ARTIST PORTAL</div>
          <div style={{ fontSize: 12, color: T.chrome }}>Music registry · Revenue tracking · SoundoVault sync</div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-ghost btn-sm" onClick={() => notify("SoundoVault sync initiated")}>⚡ Sync SoundoVault</button>
          <button className="btn btn-red" onClick={() => setShowAdd(!showAdd)}>+ Add Artist</button>
        </div>
      </div>

      {showAdd && (
        <div className="card mb16 fade-in">
          <div className="section-title">REGISTER ARTIST</div>
          <div className="grid2">
            <div><label>Artist Name</label><input placeholder="Stage name" /></div>
            <div><label>Genre</label><input placeholder="Hip-Hop, R&B..." /></div>
            <div><label>Label / Imprint</label><input placeholder="VNC Records or Independent" /></div>
            <div><label>Revenue Split %</label><input type="number" placeholder="70" /></div>
          </div>
          <div className="flex gap8 mt12">
            <label className="switch"><input type="checkbox" defaultChecked /><span className="slider" /></label>
            <span style={{ fontSize: 13 }}>Sync with SoundoVault</span>
          </div>
          <button className="btn btn-red mt12" onClick={() => { notify("Artist registered!"); setShowAdd(false); }}>Register Artist</button>
        </div>
      )}

      <div className="grid2 mb16">
        {artists.map(a => (
          <div key={a.id} className="card card-hover" style={{ cursor: "pointer" }} onClick={() => setSelected(selected?.id === a.id ? null : a)}>
            <div className="flex sb mb8">
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: T.chrome }}>{a.genre} · {a.label}</div>
              </div>
              <div className="flex gap8">
                {a.svSync && <span className="tag tag-on">SV SYNC</span>}
              </div>
            </div>
            <div className="grid3" style={{ gap: 8 }}>
              <div><div className="stat-label">Tracks</div><div className="mono" style={{ color: T.white }}>{a.tracks}</div></div>
              <div><div className="stat-label">Total Spins</div><div className="mono" style={{ color: T.amber }}>{a.spins.toLocaleString()}</div></div>
              <div><div className="stat-label">Ad Revenue</div><div className="mono" style={{ color: T.green }}>${a.adRev.toLocaleString()}</div></div>
            </div>
            {selected?.id === a.id && (
              <div className="mt12 fade-in" style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                <div className="grid2" style={{ gap: 8 }}>
                  <div><div className="stat-label">Stream Revenue</div><div className="mono" style={{ color: T.blue }}>${a.streamRev.toLocaleString()}</div></div>
                  <div><div className="stat-label">Total Revenue</div><div className="mono" style={{ color: T.white, fontSize: 18 }}>${(a.adRev + a.streamRev).toLocaleString()}</div></div>
                  <div><div className="stat-label">Signed Date</div><div style={{ fontSize: 12 }}>{a.signed}</div></div>
                  <div><div className="stat-label">SV Sync</div><div>{a.svSync ? <span className="tag tag-on">Active</span> : <span className="tag tag-off">Inactive</span>}</div></div>
                </div>
                <div className="flex gap8 mt12">
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); notify("Music library opened"); }}>View Tracks</button>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); notify("Revenue report generated"); }}>Revenue Report</button>
                  <button className="btn btn-amber btn-sm" onClick={e => { e.stopPropagation(); notify("SoundoVault sync triggered"); }}>↻ Sync SV</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">SOUNDOVAULT INTEGRATION STATUS</div>
        <div style={{ background: T.slateLight, borderRadius: 8, padding: 16, border: `1px solid ${T.amber}33` }}>
          <div className="flex gap12 mb12">
            <div style={{ fontSize: 32 }}>🔗</div>
            <div>
              <div style={{ fontWeight: 700 }}>SoundoVault → VNC Radio Bridge</div>
              <div style={{ fontSize: 12, color: T.chrome }}>Automated music streaming pipeline — Powered by VNC</div>
            </div>
            <span className="tag tag-on" style={{ marginLeft: "auto" }}>Connected</span>
          </div>
          <div className="grid3" style={{ gap: 8 }}>
            <div style={{ fontSize: 12 }}><span style={{ color: T.chrome }}>Last Sync:</span> <span>2 min ago</span></div>
            <div style={{ fontSize: 12 }}><span style={{ color: T.chrome }}>Synced Artists:</span> <span className="mono">{artists.filter(a => a.svSync).length}</span></div>
            <div style={{ fontSize: 12 }}><span style={{ color: T.chrome }}>Pending Cuts:</span> <span className="mono">7</span></div>
          </div>
          <div className="flex gap8 mt12">
            <button className="btn btn-amber btn-sm" onClick={() => notify("Full sync initiated from SoundoVault")}>Force Full Sync</button>
            <button className="btn btn-ghost btn-sm">Configure Pipeline</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdManager({ notify }) {
  return (
    <div className="fade-in">
      <div className="flex sb mb16">
        <div className="bebas" style={{ fontSize: 22 }}>AD MANAGEMENT</div>
        <button className="btn btn-red" onClick={() => notify("New ad slot opened")}>+ New Ad Slot</button>
      </div>
      <div className="grid4 mb16">
        <StatCard label="Active Campaigns" value="12" color={T.green} />
        <StatCard label="MTD Revenue" value="$48,120" sub="+8%" color={T.amber} />
        <StatCard label="Avg CTR" value="8.9%" color={T.blue} />
        <StatCard label="Brands Partnered" value="24" color={T.red} />
      </div>
      <div className="card mb16">
        <div className="section-title">ACTIVE CAMPAIGNS</div>
        <table>
          <thead><tr><th>Brand</th><th>Ad Type</th><th>Station</th><th>Plays</th><th>Revenue</th><th>CTR</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {ADS.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.brand}</td>
                <td style={{ fontSize: 12, color: T.chrome }}>{a.type}</td>
                <td style={{ fontSize: 12 }}>{a.station}</td>
                <td className="mono">{a.plays.toLocaleString()}</td>
                <td className="mono" style={{ color: T.green }}>${a.revenue.toLocaleString()}</td>
                <td className="mono" style={{ color: T.amber }}>{a.ctr}</td>
                <td><span className={`tag ${a.status === "active" ? "tag-on" : "tag-off"}`}>{a.status}</span></td>
                <td>
                  <div className="flex gap4">
                    <button className="btn btn-ghost btn-sm" onClick={() => notify("Ad paused")}>Pause</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => notify("Report generated")}>Report</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="section-title">BRAND OUTREACH PIPELINE</div>
        <div className="grid3">
          {["Nike", "Hennessy", "McDonald's", "Cash App", "Sprite", "Beats by Dre"].map(brand => (
            <div key={brand} style={{ background: T.slateLight, borderRadius: 8, padding: 12, border: `1px solid ${T.border}` }}>
              <div className="flex sb">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{brand}</div>
                <span className="tag tag-off">Prospect</span>
              </div>
              <div style={{ fontSize: 11, color: T.chrome, marginTop: 6 }}>No contact yet</div>
              <button className="btn btn-ghost btn-sm mt8" style={{ width: "100%" }} onClick={() => notify(`AI drafting pitch for ${brand}`)}>Draft Pitch</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Support({ notify }) {
  return (
    <div className="fade-in">
      <div className="bebas mb16" style={{ fontSize: 22 }}>CUSTOMER SUPPORT</div>
      <div className="grid4 mb16">
        <StatCard label="Open Tickets" value={SUPPORT_TICKETS.filter(t => t.status === "open").length} color={T.red} />
        <StatCard label="High Priority" value={SUPPORT_TICKETS.filter(t => t.priority === "high").length} color={T.amber} />
        <StatCard label="Resolved Today" value="18" color={T.green} />
        <StatCard label="Avg Response" value="1.4h" color={T.blue} />
      </div>
      <div className="card">
        <div className="section-title">SUPPORT QUEUE</div>
        <table>
          <thead><tr><th>ID</th><th>User</th><th>Issue</th><th>Station</th><th>Priority</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>
            {SUPPORT_TICKETS.map(t => (
              <tr key={t.id}>
                <td className="mono" style={{ color: T.chrome }}>{t.id}</td>
                <td style={{ fontWeight: 600 }}>{t.user}</td>
                <td style={{ fontSize: 12 }}>{t.issue}</td>
                <td style={{ fontSize: 12, color: T.chrome }}>{t.station}</td>
                <td><span className={`tag ${t.priority === "high" ? "tag-live" : t.priority === "medium" ? "tag-sub" : "tag-off"}`}>{t.priority}</span></td>
                <td><span className={`tag ${t.status === "open" ? "tag-on" : "tag-off"}`}>{t.status}</span></td>
                <td style={{ fontSize: 12, color: T.chrome }}>{t.time}</td>
                <td>
                  <div className="flex gap4">
                    <button className="btn btn-ghost btn-sm" onClick={() => notify("Ticket resolved")}>Resolve</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => notify("Reply sent")}>Reply</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "stations", label: "Stations", icon: "📻" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "artists", label: "Artist Portal", icon: "🎤" },
  { id: "ads", label: "Ad Manager", icon: "💼" },
  { id: "support", label: "Support", icon: "🎧" },
  { id: "ai", label: "AI Assistant", icon: "🤖" },
];

function AdminDashboard({ onLogout, notify }) {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (tab) {
      case "overview": return <AdminOverview />;
      case "stations": return <StationManager notify={notify} />;
      case "analytics": return <Analytics />;
      case "artists": return <ArtistPortal notify={notify} />;
      case "ads": return <AdManager notify={notify} />;
      case "support": return <Support notify={notify} />;
      case "ai": return <AIHelper />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 60, background: T.slate, borderRight: `1px solid ${T.border}`, transition: "width .2s", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${T.border}` }}>
          {sidebarOpen ? (
            <div>
              <div className="bebas" style={{ fontSize: 22, color: T.red, letterSpacing: 3 }}>VNC RADIO</div>
              <div style={{ fontSize: 10, color: T.chrome, letterSpacing: 1 }}>ADMIN CONSOLE</div>
            </div>
          ) : (
            <div className="bebas" style={{ fontSize: 18, color: T.red }}>VNC</div>
          )}
        </div>

        <div style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {ADMIN_TABS.map(t => (
            <div key={t.id} className={`sidebar-item ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 8px", borderTop: `1px solid ${T.border}` }}>
          <div className="sidebar-item" onClick={onLogout}>
            <span>🚪</span>{sidebarOpen && <span>Logout</span>}
          </div>
          <div className="sidebar-item" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span>{sidebarOpen ? "◀" : "▶"}</span>{sidebarOpen && <span>Collapse</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LISTENER FRONTEND
// ============================================================
function ListenerFrontend({ onAdminAccess, notify }) {
  const [favorites, setFavorites] = useState([1, 3]);
  const [playing, setPlaying] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [filter, setFilter] = useState("all");

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    notify(favorites.includes(id) ? "Removed from favorites" : "Added to favorites ⭐");
  };

  const shareStation = (s) => {
    notify(`Sharing ${s.name} — watermark applied! 🎙️`);
  };

  const filtered = filter === "all" ? STATIONS : filter === "fm" ? STATIONS.filter(s => s.fm) : filter === "favs" ? STATIONS.filter(s => favorites.includes(s.id)) : STATIONS;

  return (
    <div style={{ minHeight: "100vh", background: T.black }}>
      {/* Header */}
      <div style={{ background: T.slate, borderBottom: `1px solid ${T.border}`, padding: "14px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="bebas" style={{ fontSize: 28, color: T.red, letterSpacing: 3 }}>VNC RADIO</div>
            <div style={{ fontSize: 10, color: T.chrome, letterSpacing: 2 }}>POWERED BY VNC</div>
          </div>
          <div className="flex gap8">
            {subscribed ? (
              <span className="tag tag-sub">👑 PRO MEMBER</span>
            ) : (
              <button className="btn btn-amber" onClick={() => setShowSub(true)}>Subscribe — Ad Free</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onAdminAccess} style={{ fontSize: 10, opacity: .3 }}>·</button>
          </div>
        </div>
      </div>

      {/* Now Playing Bar */}
      {playing && (
        <div style={{ background: `${T.red}22`, borderBottom: `1px solid ${T.red}33`, padding: "10px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
            <span className="tag tag-live pulse">● LIVE</span>
            <div style={{ fontWeight: 700 }}>{STATIONS.find(s => s.id === playing)?.name}</div>
            <Waveform bars={16} height={20} />
            <div style={{ fontSize: 12, color: T.chrome, marginLeft: "auto" }}>
              DJ: {STATIONS.find(s => s.id === playing)?.dj}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPlaying(null)}>■ Stop</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* Filter Bar */}
        <div className="flex gap8 mb16 wrap">
          {["all", "fm", "favs"].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? "btn-red" : "btn-ghost"}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All Stations" : f === "fm" ? "📡 FM Stations" : "⭐ My Favorites"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: T.chrome, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, display: "inline-block" }} />
            {STATIONS.reduce((a, s) => a + s.listeners, 0).toLocaleString()} listening now
          </div>
        </div>

        {/* Stations Grid */}
        <div className="grid3 mb24">
          {filtered.map(s => (
            <div key={s.id} className={`station-listener-card ${s.color} ${favorites.includes(s.id) ? "favorited" : ""}`} onClick={() => { setPlaying(s.id); notify(`Now playing: ${s.name}`); }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div className="bebas" style={{ fontSize: 20, letterSpacing: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: T.chrome }}>{s.genre}</div>
                </div>
                <div className="flex gap4" style={{ flexDirection: "column", alignItems: "flex-end" }}>
                  {s.live && <span className="tag tag-live" style={{ fontSize: 9 }}>LIVE</span>}
                  {s.fm && <span className="tag tag-fm" style={{ fontSize: 9 }}>{s.freq}</span>}
                </div>
              </div>

              <div style={{ fontSize: 12, color: T.chrome, marginBottom: 12 }}>{s.desc}</div>

              <div className="flex sb" style={{ marginBottom: 12 }}>
                <Waveform bars={10} height={20} active={s.live} />
                <div className="mono" style={{ fontSize: 11, color: T.chrome }}>{s.listeners.toLocaleString()} listeners</div>
              </div>

              <div className="flex gap8" onClick={e => e.stopPropagation()}>
                <button className={`btn btn-sm ${playing === s.id ? "btn-red" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => { setPlaying(playing === s.id ? null : s.id); notify(playing === s.id ? "Stopped" : `Tuned in to ${s.name}`); }}>
                  {playing === s.id ? "■ Playing" : "▶ Tune In"}
                </button>
                <button className={`btn btn-sm ${favorites.includes(s.id) ? "btn-amber" : "btn-ghost"}`} onClick={() => toggleFav(s.id)}>
                  {favorites.includes(s.id) ? "★" : "☆"}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => shareStation(s)}>↗</button>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Section */}
        {showSub && !subscribed && (
          <div className="fade-in" style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
            <div style={{ maxWidth: 500, width: "90%", background: T.slate, borderRadius: 16, border: `1px solid ${T.amber}44`, padding: 28 }}>
              <div className="flex sb mb16">
                <div className="bebas" style={{ fontSize: 26, color: T.amber }}>GO PRO</div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSub(false)}>✕</button>
              </div>
              <div className="grid2" style={{ gap: 16, marginBottom: 20 }}>
                <div className="sub-card">
                  <div className="tag tag-off mb8">FREE</div>
                  <div className="bebas" style={{ fontSize: 28 }}>$0<span style={{ fontSize: 14 }}>/mo</span></div>
                  <ul style={{ marginTop: 12, paddingLeft: 16, fontSize: 12, color: T.chrome, lineHeight: 2 }}>
                    <li>All stations (with ads)</li>
                    <li>Favorites & sharing</li>
                    <li>Standard quality</li>
                  </ul>
                  <button className="btn btn-ghost mt12" style={{ width: "100%" }} onClick={() => setShowSub(false)}>Continue Free</button>
                </div>
                <div className="sub-card premium">
                  <div className="tag tag-sub mb8">PRO</div>
                  <div className="bebas" style={{ fontSize: 28, color: T.amber }}>$9.99<span style={{ fontSize: 14 }}>/mo</span></div>
                  <ul style={{ marginTop: 12, paddingLeft: 16, fontSize: 12, lineHeight: 2 }}>
                    <li>✓ Zero advertisements</li>
                    <li>✓ Exclusive artist drops</li>
                    <li>✓ Online giveaways</li>
                    <li>✓ Hi-fi audio quality</li>
                    <li>✓ Early access content</li>
                  </ul>
                  <button className="btn btn-amber mt12" style={{ width: "100%" }} onClick={() => { setSubscribed(true); setShowSub(false); notify("Welcome to VNC Pro! 👑"); }}>
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onAdmin, onListener, savedCreds, onRemember }) {
  const [creds, setCreds] = useState({ user: savedCreds?.user || "", pass: savedCreds?.pass || "" });
  const [remember, setRemember] = useState(!!savedCreds);
  const [err, setErr] = useState("");

  const login = () => {
    const user = creds.user.trim();
    const pass = creds.pass.trim();
    if ((user === "admin" && pass === "vnc2024") || (user === "radio" && pass === "vncradio")) {
      setErr("");
      onRemember(remember ? { user, pass } : null);
      onAdmin();
    } else {
      setErr(`Invalid credentials — try "admin" / "vnc2024"`);
    }
  };

  return (
    <div className="login-container">
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="bebas" style={{ fontSize: 52, color: T.red, letterSpacing: 6, lineHeight: 1 }}>VNC</div>
          <div className="bebas" style={{ fontSize: 28, color: T.white, letterSpacing: 4 }}>RADIO</div>
          <div style={{ fontSize: 11, color: T.chrome, letterSpacing: 2, marginTop: 4 }}>BROADCAST MANAGEMENT PLATFORM</div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">ADMIN ACCESS</div>
          <div className="mb12">
            <label>Username</label>
            <input value={creds.user} onChange={e => setCreds({ ...creds, user: e.target.value })} placeholder="admin" />
          </div>
          <div className="mb12">
            <label>Password</label>
            <input type="password" value={creds.pass} onChange={e => setCreds({ ...creds, pass: e.target.value })} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div className="flex gap8 mb12" style={{ cursor: "pointer" }} onClick={() => setRemember(!remember)}>
            <label className="switch" style={{ width: 34, height: 19 }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span className="slider" />
            </label>
            <span style={{ fontSize: 12, color: T.chrome }}>Remember me on this device</span>
          </div>
          {err && <div style={{ color: T.red, fontSize: 12, marginBottom: 8 }}>{err}</div>}
          <button className="btn btn-red" style={{ width: "100%" }} onClick={login}>Sign In to Console</button>
          <div style={{ fontSize: 10, color: T.chrome, marginTop: 8, textAlign: "center" }}>Demo: admin / vnc2024</div>
        </div>

        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onListener}>
          Enter as Listener →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [view, setView] = useState("login"); // login | admin | listener
  const [notif, setNotif] = useState(null);
  const [savedCreds, setSavedCreds] = useState(null);

  const notify = (msg) => { setNotif(msg); };

  return (
    <>
      <style>{css}</style>
      {notif && <Notification msg={notif} onDone={() => setNotif(null)} />}
      {view === "login" && <LoginScreen onAdmin={() => setView("admin")} onListener={() => setView("listener")} savedCreds={savedCreds} onRemember={setSavedCreds} />}
      {view === "admin" && <AdminDashboard onLogout={() => setView("login")} notify={notify} />}
      {view === "listener" && <ListenerFrontend onAdminAccess={() => setView("login")} notify={notify} />}
    </>
  );
}
