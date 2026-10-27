import { useState, useEffect, useRef, useCallback } from "react";

// Brand Kit: Ink / Acid / Brain / Ivory
const T = {
  black: "#111114",      // INK
  slate: "#1A1A1E",      // card bg
  slateLight: "#222226", // elevated card
  border: "#2A2A30",     // subtle border
  acid: "#C7FF3D",       // ACID green — primary accent
  acidDim: "#8FB82A",    // dimmed acid
  brain: "#F08AB8",      // BRAIN pink
  ivory: "#F6F3E8",      // IVORY — primary text
  chrome: "#9A9A9E",     // secondary text
  white: "#F6F3E8",      // alias for ivory
  // kept for semantic use in status tags
  green: "#C7FF3D",      // map green → acid
  red: "#C7FF3D",        // map red → acid (primary CTA)
  amber: "#F08AB8",      // map amber → brain pink
  blue: "#C7FF3D",       // map blue → acid
  purple: "#F08AB8",     // map purple → brain pink
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.black};color:${T.ivory};font-family:'Inter',sans-serif;min-height:100vh}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.slate}}::-webkit-scrollbar-thumb{background:${T.acid};border-radius:3px}
  .barlow{font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:1px;text-transform:uppercase}
  .bebas{font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:2px;text-transform:uppercase}
  .mono{font-family:'JetBrains Mono',monospace}
  .tag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .tag-live{background:${T.acid};color:${T.black}}
  .tag-on{background:${T.acid}22;color:${T.acid};border:1px solid ${T.acid}55}
  .tag-off{background:#ffffff11;color:${T.chrome};border:1px solid ${T.border}}
  .tag-sub{background:${T.brain}22;color:${T.brain};border:1px solid ${T.brain}55}
  .tag-fm{background:${T.acid}22;color:${T.acid};border:1px solid ${T.acid}44}
  .card{background:${T.slate};border:1px solid ${T.border};border-radius:10px;padding:16px}
  .card-hover:hover{border-color:${T.acid}55;transform:translateY(-1px);transition:all .2s}
  .btn{padding:8px 18px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s;letter-spacing:.5px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;font-size:14px}
  .btn-red{background:${T.acid};color:${T.black}}.btn-red:hover{background:#d9ff4d;box-shadow:0 0 20px ${T.acid}55}
  .btn-ghost{background:transparent;color:${T.chrome};border:1px solid ${T.border}}.btn-ghost:hover{border-color:${T.acid};color:${T.acid}}
  .btn-amber{background:${T.brain};color:${T.black}}.btn-amber:hover{background:#f5a0c8}
  .btn-sm{padding:5px 12px;font-size:12px}
  input,select,textarea{background:${T.slateLight};border:1px solid ${T.border};color:${T.ivory};border-radius:6px;padding:9px 12px;font-size:13px;font-family:'Inter',sans-serif;width:100%;outline:none;transition:border .2s}
  input:focus,select:focus,textarea:focus{border-color:${T.acid}88;box-shadow:0 0 0 2px ${T.acid}15}
  label{font-size:12px;color:${T.chrome};display:block;margin-bottom:4px;font-weight:500}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .flex{display:flex;align-items:center}.gap4{gap:4px}.gap8{gap:8px}.gap12{gap:12px}.gap16{gap:16px}
  .sb{justify-content:space-between}.wrap{flex-wrap:wrap}
  .mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mt16{margin-top:16px}.mt24{margin-top:24px}
  .mb4{margin-bottom:4px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb24{margin-bottom:24px}
  .stat-num{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:800;line-height:1;letter-spacing:1px}
  .stat-label{font-size:11px;color:${T.chrome};margin-top:4px;text-transform:uppercase;letter-spacing:1px}
  .section-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:18px;letter-spacing:3px;color:${T.acid};margin-bottom:12px;text-transform:uppercase}
  .waveform-bar{display:inline-block;background:${T.acid};border-radius:2px;animation:wave var(--d,.6s) ease-in-out infinite alternate;transform-origin:bottom}
  @keyframes wave{from{height:var(--min,4px)}to{height:var(--max,20px)}}
  .pulse{animation:pulse 2s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade-in{animation:fadeIn .3s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .sidebar-item{padding:10px 14px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;transition:all .15s;color:${T.chrome};margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px;font-family:'Barlow Condensed',sans-serif;font-size:15px}
  .sidebar-item:hover{background:${T.slateLight};color:${T.ivory}}
  .sidebar-item.active{background:${T.acid}18;color:${T.acid};border-left:3px solid ${T.acid}}
  .progress-bar{height:4px;background:${T.border};border-radius:2px;overflow:hidden}
  .progress-fill{height:100%;border-radius:2px;transition:width .5s}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${T.acid};border-bottom:1px solid ${T.border};font-weight:700}
  td{padding:10px 12px;border-bottom:1px solid ${T.border}22;vertical-align:middle}
  tr:hover td{background:${T.slateLight}88}
  .switch{position:relative;display:inline-block;width:40px;height:22px}
  .switch input{opacity:0;width:0;height:0}
  .slider{position:absolute;cursor:pointer;inset:0;background:${T.border};border-radius:22px;transition:.3s}
  .slider:before{content:"";position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.3s}
  input:checked + .slider{background:${T.acid}}
  input:checked + .slider:before{transform:translateX(18px)}
  .ai-msg{padding:12px 14px;border-radius:8px;font-size:13px;line-height:1.5;margin-bottom:8px}
  .ai-msg.assistant{background:${T.slateLight};border-left:3px solid ${T.acid}}
  .ai-msg.user{background:${T.acid}14;border-left:3px solid ${T.brain}}
  .station-card{background:${T.slate};border:1px solid ${T.border};border-radius:12px;padding:20px;position:relative;overflow:hidden;cursor:pointer;transition:all .2s}
  .station-card:hover{border-color:${T.acid};transform:translateY(-2px);box-shadow:0 4px 24px ${T.acid}18}
  .station-card.favorited{border-color:${T.brain}}
  .station-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px}
  .station-card.red::before{background:${T.acid}}.station-card.amber::before{background:${T.brain}}
  .station-card.blue::before{background:${T.acid}}.station-card.green::before{background:${T.acid}}
  .station-card.purple::before{background:${T.brain}}
  .modal-overlay{position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:200;padding:20px}
  .modal-box{background:${T.slate};border-radius:16px;padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;border:1px solid ${T.border}}
  .notification{position:fixed;top:20px;right:20px;z-index:999;background:${T.black};border:1px solid ${T.acid};border-radius:8px;padding:12px 18px;font-size:13px;font-weight:600;color:${T.acid};animation:slideIn .3s ease;font-family:'Barlow Condensed',sans-serif;font-size:15px;letter-spacing:.5px;text-transform:uppercase}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  .sub-banner{background:linear-gradient(135deg,${T.brain}18,${T.brain}0a);border:1px solid ${T.brain}44;border-radius:10px;padding:14px 18px;margin-bottom:16px}
  .error-msg{color:#ff6b6b;font-size:12px;margin-top:6px}
  .success-msg{color:${T.acid};font-size:12px;margin-top:6px}
  .acid-glow{box-shadow:0 0 30px ${T.acid}30}
  .brain-glow{box-shadow:0 0 20px ${T.brain}30}
  @media(max-width:768px){.grid2,.grid3,.grid4{grid-template-columns:1fr}}
`;

// ============================================================
// MOCK DATA
// ============================================================
const STATIONS = [
  { id:1, name:"VNC Hot 97", genre:"Hip-Hop / R&B", freq:"97.3 FM", color:"red", listeners:2847, city:"Atlanta, GA", live:true, fm:true, desc:"The hottest hits from the A", dj:"DJ Stackz" },
  { id:2, name:"VNC Trap City", genre:"Trap / Street", freq:"Online", color:"amber", listeners:1203, city:"Houston, TX", live:true, fm:false, desc:"Pure trap, all day every day", dj:"Lil Trap God" },
  { id:3, name:"VNC R&B Vibes", genre:"R&B / Soul", freq:"102.7 FM", color:"blue", listeners:3421, city:"Chicago, IL", live:true, fm:true, desc:"Smooth R&B for the culture", dj:"Silky Smooth" },
  { id:4, name:"VNC Gospel Hour", genre:"Gospel / Praise", freq:"Online", color:"green", listeners:891, city:"Memphis, TN", live:false, fm:false, desc:"Lift every voice", dj:"Minister Ray" },
  { id:5, name:"VNC Reggae Wave", genre:"Reggae / Dancehall", freq:"Online", color:"purple", listeners:567, city:"Miami, FL", live:true, fm:false, desc:"One love, all vibes", dj:"Irie Dan" },
  { id:6, name:"VNC Old School", genre:"Classic Hip-Hop", freq:"88.1 FM", color:"red", listeners:1988, city:"New York, NY", live:true, fm:true, desc:"90s & 2000s classics nonstop", dj:"Big Flex" },
];

const LISTENER_DATA = [
  { city:"Atlanta, GA", count:1247, station:"VNC Hot 97", sub:true },
  { city:"Chicago, IL", count:983, station:"VNC R&B Vibes", sub:true },
  { city:"Houston, TX", count:856, station:"VNC Trap City", sub:false },
  { city:"New York, NY", count:1102, station:"VNC Old School", sub:true },
  { city:"Miami, FL", count:432, station:"VNC Reggae Wave", sub:false },
  { city:"Los Angeles, CA", count:671, station:"VNC Hot 97", sub:true },
  { city:"Memphis, TN", count:298, station:"VNC Gospel Hour", sub:false },
  { city:"Dallas, TX", count:512, station:"VNC Trap City", sub:true },
];

const ADS = [
  { id:1, brand:"NikeAir Pro", type:"Audio 30s", station:"VNC Hot 97", plays:4200, revenue:12600, ctr:"8.4%", status:"active" },
  { id:2, brand:"Sprite Zero", type:"Audio 15s", station:"VNC Trap City", plays:2800, revenue:5600, ctr:"6.1%", status:"active" },
  { id:3, brand:"Cash App", type:"Audio 30s", station:"All Stations", plays:9100, revenue:27300, ctr:"11.2%", status:"active" },
  { id:4, brand:"Hennessy VS", type:"Sponsorship", station:"VNC Old School", plays:1400, revenue:8400, ctr:"7.8%", status:"paused" },
];

const SUPPORT_TICKETS = [
  { id:"TK-001", user:"Marcus T.", issue:"Can't access premium content", station:"VNC R&B Vibes", priority:"high", status:"open", time:"2h ago" },
  { id:"TK-002", user:"Destiny M.", issue:"Audio cutting out on mobile", station:"VNC Hot 97", priority:"medium", status:"open", time:"4h ago" },
  { id:"TK-003", user:"Jerome K.", issue:"Payment declined", station:"All", priority:"high", status:"resolved", time:"1d ago" },
  { id:"TK-004", user:"Tiffany B.", issue:"Can't find favorite station", station:"VNC Trap City", priority:"low", status:"open", time:"6h ago" },
];

// ============================================================
// UTILITIES
// ============================================================
function Waveform({ bars=12, height=28, active=true }) {
  return (
    <div className="flex gap4" style={{ alignItems:"flex-end", height }}>
      {Array.from({ length:bars }).map((_,i) => (
        <div key={i} className="waveform-bar" style={{
          width:3,
          "--min":`${Math.random()*4+2}px`,
          "--max":`${Math.random()*(height-6)+6}px`,
          "--d":`${(Math.random()*0.4+0.4).toFixed(2)}s`,
          animationDelay:`${(i*0.07).toFixed(2)}s`,
          opacity:active?1:0.3,
          animationPlayState:active?"running":"paused",
        }}/>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color=T.red, icon }) {
  return (
    <div className="card">
      <div className="flex sb">
        <div>
          <div className="stat-num" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
          {sub && <div style={{ fontSize:11, color:T.green, marginTop:4 }}>↑ {sub}</div>}
        </div>
        {icon && <div style={{ fontSize:28, opacity:.4 }}>{icon}</div>}
      </div>
    </div>
  );
}

function Notification({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, []);
  return <div className="notification">{msg}</div>;
}

function ProgressBar({ val, max, color=T.red }) {
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width:`${Math.min(100,(val/max)*100)}%`, background:color }}/>
    </div>
  );
}

// ============================================================
// AI ASSISTANT
// ============================================================
function AIHelper() {
  const [messages, setMessages] = useState([
    { role:"assistant", text:"Hey! I'm your VNC Radio AI assistant. I can help you craft social media campaigns, pitch ad partnerships, write station bios, or draft outreach to brands. What do you need?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role:m.role==="assistant"?"assistant":"user", content:m.text }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1000,
          system:`You are the AI growth & marketing assistant for VNC Radio — a professional broadcast platform. Help with: social media posts, brand partnership pitches, ad scripts, station promos, listener growth strategies. Urban radio culture voice. Keep it sharp and industry-authentic.`,
          messages:[...history, { role:"user", content:userMsg }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type==="text")?.text || "Let me think on that...";
      setMessages(prev => [...prev, { role:"assistant", text:reply }]);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", text:"Connection issue — try again in a moment." }]);
    } finally { setLoading(false); }
  }, [input, loading, messages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)" }}>
      <div className="flex gap8 mb16">
        <div style={{ width:36, height:36, borderRadius:"50%", background:`${T.acid}18`, border:`1px solid ${T.acid}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
        <div>
          <div style={{ fontWeight:600 }}>VNC AI Growth Assistant</div>
          <div style={{ fontSize:11, color:T.green }} className="flex gap4"><span className="pulse" style={{ width:6, height:6, borderRadius:"50%", background:T.green, display:"inline-block" }}/> Online</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", paddingRight:4 }}>
        {messages.map((m,i) => (
          <div key={i} className={`ai-msg ${m.role}`} style={{ whiteSpace:"pre-wrap" }}>{m.text}</div>
        ))}
        {loading && <div className="ai-msg assistant pulse">Thinking...</div>}
        <div ref={endRef}/>
      </div>
      <div className="flex gap8 mt12">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Ask about campaigns, pitches, social posts..."/>
        <button className="btn btn-red" onClick={send} disabled={loading}>Send</button>
      </div>
      <div className="flex gap8 mt8 wrap">
        {["Write an Instagram promo post","Pitch a brand for ads","Draft station intro copy","Grow listener strategy"].map(s => (
          <button key={s} className="btn btn-ghost btn-sm" onClick={() => setInput(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN SECTIONS
// ============================================================
function AdminOverview({ users }) {
  const totalListeners = STATIONS.reduce((a,s) => a+s.listeners, 0);
  const subCount = users.listeners.filter(u => u.subscribed).length;
  return (
    <div className="fade-in">
      <div className="flex sb mb16 wrap gap8">
        <div>
          <div className="bebas" style={{ fontSize:26 }}>BROADCAST COMMAND CENTER</div>
          <div style={{ fontSize:12, color:T.chrome }}>VNC Radio Network — Live Dashboard</div>
        </div>
        <div className="flex gap8">
          <span className="tag tag-live pulse">● LIVE</span>
          <span className="tag tag-on">{STATIONS.filter(s=>s.live).length} Stations On Air</span>
        </div>
      </div>
      <div className="grid4 mb16">
        <StatCard label="Active Listeners" value={totalListeners.toLocaleString()} sub="+12% today" color={T.acid} icon="📻"/>
        <StatCard label="Stations Live" value={STATIONS.filter(s=>s.live).length} color={T.acid} icon="🎙️"/>
        <StatCard label="Monthly Revenue" value="$48,120" sub="+8.3% MoM" color={T.brain} icon="💰"/>
        <StatCard label="Pro Subscribers" value={subCount || "3,847"} sub="+234 this week" color={T.brain} icon="👑"/>
      </div>
      <div className="grid2 mb16">
        <div className="card">
          <div className="section-title">STATIONS ON AIR</div>
          {STATIONS.map(s => (
            <div key={s.id} className="flex sb mb8" style={{ padding:"8px 0", borderBottom:`1px solid ${T.border}22` }}>
              <div className="flex gap8">
                <div style={{ width:8, height:8, borderRadius:"50%", background:s.live?T.green:T.border, marginTop:4 }} className={s.live?"pulse":""}/>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:T.chrome }}>{s.genre} · {s.dj}</div>
                </div>
              </div>
              <div className="flex gap8">
                <Waveform bars={8} height={20} active={s.live}/>
                <div className="mono" style={{ fontSize:12 }}>{s.listeners.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">LISTENER MAP — TOP CITIES</div>
          {LISTENER_DATA.map((l,i) => (
            <div key={i} className="mb8">
              <div className="flex sb" style={{ marginBottom:3 }}>
                <div style={{ fontSize:12 }}>{l.city}</div>
                <div className="mono" style={{ fontSize:12, color:T.chrome }}>{l.count.toLocaleString()}</div>
              </div>
              <ProgressBar val={l.count} max={1300} color={l.sub?T.brain:T.blue}/>
            </div>
          ))}
        </div>
      </div>
      <div className="grid2 mb16">
        <div className="card">
          <div className="section-title">REGISTERED LISTENERS ({users.listeners.length})</div>
          {users.listeners.length === 0 ? (
            <div style={{ color:T.chrome, fontSize:13, textAlign:"center", padding:"20px 0" }}>No listener accounts yet</div>
          ) : users.listeners.slice(0,8).map((u,i) => (
            <div key={i} className="flex sb mb8" style={{ fontSize:13, borderBottom:`1px solid ${T.border}22`, paddingBottom:8 }}>
              <div>
                <div style={{ fontWeight:600 }}>{u.name}</div>
                <div style={{ fontSize:11, color:T.chrome }}>{u.email}</div>
              </div>
              <span className={`tag ${u.subscribed?"tag-sub":"tag-off"}`}>{u.subscribed?"PRO":"FREE"}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">REGISTERED ARTISTS ({users.artists.length})</div>
          {users.artists.length === 0 ? (
            <div style={{ color:T.chrome, fontSize:13, textAlign:"center", padding:"20px 0" }}>No artist accounts yet</div>
          ) : users.artists.slice(0,8).map((u,i) => (
            <div key={i} className="flex sb mb8" style={{ fontSize:13, borderBottom:`1px solid ${T.border}22`, paddingBottom:8 }}>
              <div>
                <div style={{ fontWeight:600 }}>{u.artistName}</div>
                <div style={{ fontSize:11, color:T.chrome }}>{u.genre} · {u.email}</div>
              </div>
              <span className="tag tag-on">ACTIVE</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="section-title">TOP PERFORMING ADS</div>
        <table>
          <thead><tr><th>Brand</th><th>Type</th><th>Station</th><th>Plays</th><th>Revenue</th><th>CTR</th><th>Status</th></tr></thead>
          <tbody>
            {ADS.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight:600 }}>{a.brand}</td>
                <td style={{ color:T.chrome }}>{a.type}</td>
                <td>{a.station}</td>
                <td className="mono">{a.plays.toLocaleString()}</td>
                <td className="mono" style={{ color:T.green }}>${a.revenue.toLocaleString()}</td>
                <td className="mono" style={{ color:T.brain }}>{a.ctr}</td>
                <td><span className={`tag ${a.status==="active"?"tag-on":"tag-off"}`}>{a.status}</span></td>
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
  const [form, setForm] = useState({ name:"", genre:"", freq:"", city:"", dj:"", desc:"", fm:false });
  const [showForm, setShowForm] = useState(false);
  const toggleLive = id => { setStations(prev => prev.map(s => s.id===id?{...s,live:!s.live}:s)); notify("Station status updated"); };
  return (
    <div className="fade-in">
      <div className="flex sb mb16">
        <div className="bebas" style={{ fontSize:22 }}>STATION MANAGER</div>
        <button className="btn btn-red" onClick={() => setShowForm(!showForm)}>+ Add Station</button>
      </div>
      {showForm && (
        <div className="card mb16 fade-in">
          <div className="section-title">NEW STATION</div>
          <div className="grid2">
            <div><label>Station Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="VNC Station Name"/></div>
            <div><label>Genre</label><input value={form.genre} onChange={e => setForm({...form,genre:e.target.value})} placeholder="Hip-Hop / R&B"/></div>
            <div><label>Frequency / Type</label><input value={form.freq} onChange={e => setForm({...form,freq:e.target.value})} placeholder="98.7 FM or Online"/></div>
            <div><label>Base City</label><input value={form.city} onChange={e => setForm({...form,city:e.target.value})} placeholder="Atlanta, GA"/></div>
            <div><label>Head DJ</label><input value={form.dj} onChange={e => setForm({...form,dj:e.target.value})} placeholder="DJ Name"/></div>
            <div><label>Description</label><input value={form.desc} onChange={e => setForm({...form,desc:e.target.value})} placeholder="Station tagline..."/></div>
          </div>
          <div className="flex gap8 mt12">
            <label className="switch"><input type="checkbox" checked={form.fm} onChange={e => setForm({...form,fm:e.target.checked})}/><span className="slider"/></label>
            <span style={{ fontSize:13 }}>FM Broadcast Enabled</span>
          </div>
          <button className="btn btn-red mt12" onClick={() => { notify("Station created!"); setShowForm(false); }}>Create Station</button>
        </div>
      )}
      <div className="grid2">
        {stations.map(s => (
          <div key={s.id} className="card card-hover">
            <div className="flex sb mb8">
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{s.name}</div>
                <div style={{ fontSize:11, color:T.chrome }}>{s.genre}</div>
              </div>
              <div className="flex gap8">
                {s.fm && <span className="tag tag-fm">FM</span>}
                <span className={`tag ${s.live?"tag-live":"tag-off"}`}>{s.live?"LIVE":"OFF"}</span>
              </div>
            </div>
            <div style={{ fontSize:12, color:T.chrome, marginBottom:12 }}>{s.desc}</div>
            <div className="grid2" style={{ gap:8, marginBottom:12 }}>
              <div><div className="stat-label">Listeners</div><div className="mono" style={{ fontSize:16 }}>{s.listeners.toLocaleString()}</div></div>
              <div><div className="stat-label">DJ</div><div style={{ fontSize:13 }}>{s.dj}</div></div>
              <div><div className="stat-label">Frequency</div><div style={{ fontSize:13 }}>{s.freq}</div></div>
              <div><div className="stat-label">City</div><div style={{ fontSize:13 }}>{s.city}</div></div>
            </div>
            <Waveform bars={14} height={24} active={s.live}/>
            <div className="flex gap8 mt12">
              <button className={`btn btn-sm ${s.live?"btn-ghost":"btn-red"}`} onClick={() => toggleLive(s.id)}>{s.live?"Take Off Air":"Go Live"}</button>
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
      <div className="bebas mb16" style={{ fontSize:22 }}>ANALYTICS & INSIGHTS</div>
      <div className="grid4 mb16">
        <StatCard label="Total Spins Today" value="142,840" sub="+6% vs yesterday" color={T.acid}/>
        <StatCard label="Ad Revenue MTD" value="$48,120" sub="+8.3%" color={T.brain}/>
        <StatCard label="Avg Session" value="47 min" color={T.blue}/>
        <StatCard label="Churn Rate" value="2.1%" color={T.green}/>
      </div>
      <div className="grid2 mb16">
        <div className="card">
          <div className="section-title">LISTENER BREAKDOWN BY STATION</div>
          {STATIONS.map(s => (
            <div key={s.id} className="mb12">
              <div className="flex sb mb4">
                <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                <div className="mono" style={{ fontSize:12 }}>{s.listeners.toLocaleString()}</div>
              </div>
              <ProgressBar val={s.listeners} max={4000} color={s.color==="red"?T.acid:s.color==="amber"?T.brain:s.color==="blue"?T.blue:s.color==="green"?T.green:T.purple}/>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-title">GEOGRAPHIC DISTRIBUTION</div>
          <table>
            <thead><tr><th>City</th><th>Listeners</th><th>Station</th><th>Tier</th></tr></thead>
            <tbody>
              {LISTENER_DATA.map((l,i) => (
                <tr key={i}>
                  <td>{l.city}</td>
                  <td className="mono">{l.count.toLocaleString()}</td>
                  <td style={{ fontSize:11, color:T.chrome }}>{l.station}</td>
                  <td>{l.sub?<span className="tag tag-sub">PRO</span>:<span className="tag tag-off">FREE</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="section-title">BROADCAST SIGNAL MONITORING</div>
        <div className="grid3">
          {STATIONS.map(s => (
            <div key={s.id} style={{ background:T.slateLight, borderRadius:8, padding:14, border:`1px solid ${T.border}` }}>
              <div className="flex sb mb8">
                <div style={{ fontWeight:600, fontSize:13 }}>{s.name}</div>
                <span className={`tag ${s.fm?"tag-fm":"tag-on"}`}>{s.freq}</span>
              </div>
              <div className="grid2" style={{ gap:6, fontSize:11, color:T.chrome }}>
                <div>Signal: <span style={{ color:T.green }}>98.4%</span></div>
                <div>Bitrate: <span style={{ color:T.white }}>{s.fm?"320":"192"}kbps</span></div>
                <div>Latency: <span style={{ color:T.brain }}>{s.fm?"42":"18"}ms</span></div>
                <div>Uptime: <span style={{ color:T.white }}>99.7%</span></div>
              </div>
              <div className="mt8"><Waveform bars={16} height={20} active={s.live}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtistPortal({ notify, users }) {
  const [showAdd, setShowAdd] = useState(false);
  const combinedArtists = [
    { name:"Pharaoh Beats", genre:"Hip-Hop", tracks:24, spins:18420, adRev:4820, streamRev:2340, svSync:true },
    { name:"Aaliyah Rose", genre:"R&B", tracks:18, spins:31050, adRev:8920, streamRev:5100, svSync:true },
    { name:"Blaze 2X", genre:"Trap", tracks:31, spins:22100, adRev:5640, streamRev:3200, svSync:false },
    { name:"Pastor Keys", genre:"Gospel", tracks:12, spins:7890, adRev:1200, streamRev:980, svSync:true },
    ...users.artists.map(u => ({ name:u.artistName, genre:u.genre, tracks:0, spins:0, adRev:0, streamRev:0, svSync:false }))
  ];
  return (
    <div className="fade-in">
      <div className="flex sb mb16">
        <div>
          <div className="bebas" style={{ fontSize:22 }}>ARTIST PORTAL</div>
          <div style={{ fontSize:12, color:T.chrome }}>Music registry · Revenue tracking · SoundoVault sync</div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-ghost btn-sm" onClick={() => notify("SoundoVault sync initiated")}>⚡ Sync SoundoVault</button>
          <button className="btn btn-red" onClick={() => setShowAdd(!showAdd)}>+ Add Artist</button>
        </div>
      </div>
      {showAdd && (
        <div className="card mb16 fade-in">
          <div className="section-title">REGISTER ARTIST MANUALLY</div>
          <div className="grid2">
            <div><label>Artist Name</label><input placeholder="Stage name"/></div>
            <div><label>Genre</label><input placeholder="Hip-Hop, R&B..."/></div>
            <div><label>Label / Imprint</label><input placeholder="VNC Records or Independent"/></div>
            <div><label>Revenue Split %</label><input type="number" placeholder="70"/></div>
          </div>
          <div className="flex gap8 mt12">
            <label className="switch"><input type="checkbox" defaultChecked/><span className="slider"/></label>
            <span style={{ fontSize:13 }}>Sync with SoundoVault</span>
          </div>
          <button className="btn btn-red mt12" onClick={() => { notify("Artist registered!"); setShowAdd(false); }}>Register Artist</button>
        </div>
      )}
      <div className="grid2 mb16">
        {combinedArtists.map((a,i) => (
          <div key={i} className="card card-hover">
            <div className="flex sb mb8">
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{a.name}</div>
                <div style={{ fontSize:11, color:T.chrome }}>{a.genre}</div>
              </div>
              {a.svSync && <span className="tag tag-on">SV SYNC</span>}
            </div>
            <div className="grid3" style={{ gap:8 }}>
              <div><div className="stat-label">Tracks</div><div className="mono">{a.tracks}</div></div>
              <div><div className="stat-label">Spins</div><div className="mono" style={{ color:T.brain }}>{a.spins.toLocaleString()}</div></div>
              <div><div className="stat-label">Revenue</div><div className="mono" style={{ color:T.green }}>${(a.adRev+a.streamRev).toLocaleString()}</div></div>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="section-title">SOUNDOVAULT INTEGRATION</div>
        <div style={{ background:T.slateLight, borderRadius:8, padding:16, border:`1px solid ${T.brain}33` }}>
          <div className="flex gap12 mb12">
            <div style={{ fontSize:32 }}>🔗</div>
            <div>
              <div style={{ fontWeight:700 }}>SoundoVault → VNC Radio Bridge</div>
              <div style={{ fontSize:12, color:T.chrome }}>Automated music streaming pipeline</div>
            </div>
            <span className="tag tag-on" style={{ marginLeft:"auto" }}>Connected</span>
          </div>
          <div className="flex gap8 mt12">
            <button className="btn btn-amber btn-sm" onClick={() => notify("Full sync initiated")}>Force Full Sync</button>
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
        <div className="bebas" style={{ fontSize:22 }}>AD MANAGEMENT</div>
        <button className="btn btn-red" onClick={() => notify("New ad slot opened")}>+ New Ad Slot</button>
      </div>
      <div className="grid4 mb16">
        <StatCard label="Active Campaigns" value="12" color={T.green}/>
        <StatCard label="MTD Revenue" value="$48,120" sub="+8%" color={T.brain}/>
        <StatCard label="Avg CTR" value="8.9%" color={T.blue}/>
        <StatCard label="Brands Partnered" value="24" color={T.acid}/>
      </div>
      <div className="card mb16">
        <div className="section-title">ACTIVE CAMPAIGNS</div>
        <table>
          <thead><tr><th>Brand</th><th>Ad Type</th><th>Station</th><th>Plays</th><th>Revenue</th><th>CTR</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {ADS.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight:600 }}>{a.brand}</td>
                <td style={{ fontSize:12, color:T.chrome }}>{a.type}</td>
                <td style={{ fontSize:12 }}>{a.station}</td>
                <td className="mono">{a.plays.toLocaleString()}</td>
                <td className="mono" style={{ color:T.green }}>${a.revenue.toLocaleString()}</td>
                <td className="mono" style={{ color:T.brain }}>{a.ctr}</td>
                <td><span className={`tag ${a.status==="active"?"tag-on":"tag-off"}`}>{a.status}</span></td>
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
          {["Nike","Hennessy","McDonald's","Cash App","Sprite","Beats by Dre"].map(brand => (
            <div key={brand} style={{ background:T.slateLight, borderRadius:8, padding:12, border:`1px solid ${T.border}` }}>
              <div className="flex sb">
                <div style={{ fontWeight:600, fontSize:13 }}>{brand}</div>
                <span className="tag tag-off">Prospect</span>
              </div>
              <button className="btn btn-ghost btn-sm mt8" style={{ width:"100%" }} onClick={() => notify(`AI drafting pitch for ${brand}`)}>Draft Pitch</button>
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
      <div className="bebas mb16" style={{ fontSize:22 }}>CUSTOMER SUPPORT</div>
      <div className="grid4 mb16">
        <StatCard label="Open Tickets" value={SUPPORT_TICKETS.filter(t=>t.status==="open").length} color={T.acid}/>
        <StatCard label="High Priority" value={SUPPORT_TICKETS.filter(t=>t.priority==="high").length} color={T.brain}/>
        <StatCard label="Resolved Today" value="18" color={T.green}/>
        <StatCard label="Avg Response" value="1.4h" color={T.blue}/>
      </div>
      <div className="card">
        <div className="section-title">SUPPORT QUEUE</div>
        <table>
          <thead><tr><th>ID</th><th>User</th><th>Issue</th><th>Station</th><th>Priority</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>
            {SUPPORT_TICKETS.map(t => (
              <tr key={t.id}>
                <td className="mono" style={{ color:T.chrome }}>{t.id}</td>
                <td style={{ fontWeight:600 }}>{t.user}</td>
                <td style={{ fontSize:12 }}>{t.issue}</td>
                <td style={{ fontSize:12, color:T.chrome }}>{t.station}</td>
                <td><span className={`tag ${t.priority==="high"?"tag-live":t.priority==="medium"?"tag-sub":"tag-off"}`}>{t.priority}</span></td>
                <td><span className={`tag ${t.status==="open"?"tag-on":"tag-off"}`}>{t.status}</span></td>
                <td style={{ fontSize:12, color:T.chrome }}>{t.time}</td>
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
  { id:"overview", label:"Overview", icon:"📊" },
  { id:"stations", label:"Stations", icon:"📻" },
  { id:"analytics", label:"Analytics", icon:"📈" },
  { id:"artists", label:"Artist Portal", icon:"🎤" },
  { id:"ads", label:"Ad Manager", icon:"💼" },
  { id:"support", label:"Support", icon:"🎧" },
  { id:"ai", label:"AI Assistant", icon:"🤖" },
];

function AdminDashboard({ onLogout, notify, users }) {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const renderContent = () => {
    switch(tab) {
      case "overview": return <AdminOverview users={users}/>;
      case "stations": return <StationManager notify={notify}/>;
      case "analytics": return <Analytics/>;
      case "artists": return <ArtistPortal notify={notify} users={users}/>;
      case "ads": return <AdManager notify={notify}/>;
      case "support": return <Support notify={notify}/>;
      case "ai": return <AIHelper/>;
      default: return null;
    }
  };
  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <div style={{ width:sidebarOpen?220:60, background:T.slate, borderRight:`1px solid ${T.border}`, transition:"width .2s", flexShrink:0, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px 14px", borderBottom:`1px solid ${T.border}` }}>
          {sidebarOpen ? (
            <div>
              <div className="barlow" style={{ fontSize:24, color:T.acid, letterSpacing:2, lineHeight:1 }}>VNC RADIO</div>
              <div style={{ fontSize:9, color:T.chrome, letterSpacing:2, marginTop:2 }}>ADMIN CONSOLE</div>
            </div>
          ) : (
            <div className="barlow" style={{ fontSize:18, color:T.acid }}>VNC</div>
          )}
        </div>
        <div style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
          {ADMIN_TABS.map(t => (
            <div key={t.id} className={`sidebar-item ${tab===t.id?"active":""}`} onClick={() => { setTab(t.id); setSidebarOpen(false); }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              {sidebarOpen && <span>{t.label}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${T.border}` }}>
          <div className="sidebar-item" onClick={onLogout}><span>🚪</span>{sidebarOpen && <span>Logout</span>}</div>
          <div className="sidebar-item" onClick={() => setSidebarOpen(!sidebarOpen)}><span>{sidebarOpen?"◀":"▶"}</span>{sidebarOpen && <span>Collapse</span>}</div>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto" }}>
        <div style={{ padding:"20px 24px", maxWidth:1400, margin:"0 auto" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LISTENER FRONTEND
// ============================================================
function ListenerFrontend({ onBack, notify, currentUser, onSubscribe }) {
  const [favorites, setFavorites] = useState([1,3]);
  const [playing, setPlaying] = useState(null);
  const [showSub, setShowSub] = useState(false);
  const [filter, setFilter] = useState("all");
  const subscribed = currentUser?.subscribed || false;

  const toggleFav = id => {
    setFavorites(prev => prev.includes(id)?prev.filter(f=>f!==id):[...prev,id]);
    notify(favorites.includes(id)?"Removed from favorites":"Added to favorites ⭐");
  };
  const filtered = filter==="all"?STATIONS:filter==="fm"?STATIONS.filter(s=>s.fm):STATIONS.filter(s=>favorites.includes(s.id));

  return (
    <div style={{ minHeight:"100vh", background:T.black }}>
      <div style={{ background:T.slate, borderBottom:`1px solid ${T.border}`, padding:"14px 20px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div className="barlow" style={{ fontSize:30, color:T.acid, letterSpacing:2, lineHeight:1 }}>VNC RADIO</div>
            <div style={{ fontSize:9, color:T.chrome, letterSpacing:3, marginTop:2 }}>SOUND THAT STAYS ON YOUR MIND.</div>
          </div>
          <div className="flex gap8">
            {currentUser && <span style={{ fontSize:12, color:T.chrome }}>👤 {currentUser.name}</span>}
            {subscribed ? (
              <span className="tag tag-sub">👑 PRO MEMBER</span>
            ) : (
              <button className="btn btn-amber" onClick={() => setShowSub(true)}>Go Pro — Ad Free</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          </div>
        </div>
      </div>

      {!subscribed && (
        <div style={{ background:`${T.brain}11`, borderBottom:`1px solid ${T.brain}33`, padding:"10px 20px", textAlign:"center" }}>
          <span style={{ fontSize:12, color:T.brain }}>
            👑 <strong>VNC Pro</strong> — Ad-free listening + exclusive content + giveaways for just $9.99/mo
            <button className="btn btn-amber btn-sm" style={{ marginLeft:12 }} onClick={() => setShowSub(true)}>Upgrade Now</button>
          </span>
        </div>
      )}

      {playing && (
        <div style={{ background:`${T.acid}18`, borderBottom:`1px solid ${T.acid}33`, padding:"10px 20px" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:16 }}>
            <span className="tag tag-live pulse">● LIVE</span>
            <div style={{ fontWeight:700 }}>{STATIONS.find(s=>s.id===playing)?.name}</div>
            <Waveform bars={16} height={20}/>
            <div style={{ fontSize:12, color:T.chrome, marginLeft:"auto" }}>DJ: {STATIONS.find(s=>s.id===playing)?.dj}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPlaying(null)}>■ Stop</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>
        <div className="flex gap8 mb16 wrap">
          {["all","fm","favs"].map(f => (
            <button key={f} className={`btn btn-sm ${filter===f?"btn-red":"btn-ghost"}`} onClick={() => setFilter(f)}>
              {f==="all"?"All Stations":f==="fm"?"📡 FM Only":"⭐ Favorites"}
            </button>
          ))}
          <div style={{ marginLeft:"auto", fontSize:12, color:T.chrome }} className="flex gap8">
            <span className="pulse" style={{ width:8, height:8, borderRadius:"50%", background:T.green, display:"inline-block" }}/>
            {STATIONS.reduce((a,s)=>a+s.listeners,0).toLocaleString()} listening now
          </div>
        </div>

        <div className="grid3 mb24">
          {filtered.map(s => (
            <div key={s.id} className={`station-card ${s.color} ${favorites.includes(s.id)?"favorited":""}`} onClick={() => { setPlaying(s.id); notify(`Now playing: ${s.name}`); }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div className="bebas" style={{ fontSize:20, letterSpacing:2 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:T.chrome }}>{s.genre}</div>
                </div>
                <div className="flex gap4" style={{ flexDirection:"column", alignItems:"flex-end" }}>
                  {s.live && <span className="tag tag-live" style={{ fontSize:9 }}>LIVE</span>}
                  {s.fm && <span className="tag tag-fm" style={{ fontSize:9 }}>{s.freq}</span>}
                </div>
              </div>
              <div style={{ fontSize:12, color:T.chrome, marginBottom:12 }}>{s.desc}</div>
              <div className="flex sb" style={{ marginBottom:12 }}>
                <Waveform bars={10} height={20} active={s.live}/>
                <div className="mono" style={{ fontSize:11, color:T.chrome }}>{s.listeners.toLocaleString()} listeners</div>
              </div>
              <div className="flex gap8" onClick={e=>e.stopPropagation()}>
                <button className={`btn btn-sm ${playing===s.id?"btn-red":"btn-ghost"}`} style={{ flex:1 }} onClick={() => { setPlaying(playing===s.id?null:s.id); notify(playing===s.id?"Stopped":`Tuned in to ${s.name}`); }}>
                  {playing===s.id?"■ Playing":"▶ Tune In"}
                </button>
                <button className={`btn btn-sm ${favorites.includes(s.id)?"btn-amber":"btn-ghost"}`} onClick={() => toggleFav(s.id)}>{favorites.includes(s.id)?"★":"☆"}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => notify(`Sharing ${s.name} — VNC watermark applied! 🎙️`)}>↗</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSub && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="flex sb mb16">
              <div className="bebas" style={{ fontSize:26, color:T.acid }}>GO PRO</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowSub(false)}>✕</button>
            </div>
            <div className="grid2" style={{ gap:16, marginBottom:20 }}>
              <div style={{ background:T.slateLight, borderRadius:12, padding:20, border:`1px solid ${T.border}` }}>
                <div className="tag tag-off mb8">FREE</div>
                <div className="bebas" style={{ fontSize:28 }}>$0<span style={{ fontSize:14 }}>/mo</span></div>
                <ul style={{ marginTop:12, paddingLeft:16, fontSize:12, color:T.chrome, lineHeight:2 }}>
                  <li>All stations (with ads)</li>
                  <li>Favorites & sharing</li>
                  <li>Standard quality</li>
                </ul>
                <button className="btn btn-ghost mt12" style={{ width:"100%" }} onClick={() => setShowSub(false)}>Continue Free</button>
              </div>
              <div style={{ background:`linear-gradient(135deg,${T.slateLight},${T.slate})`, borderRadius:12, padding:20, border:`1px solid ${T.brain}44` }}>
                <div className="tag tag-sub mb8">PRO</div>
                <div className="bebas" style={{ fontSize:28, color:T.brain }}>$9.99<span style={{ fontSize:14 }}>/mo</span></div>
                <ul style={{ marginTop:12, paddingLeft:16, fontSize:12, lineHeight:2 }}>
                  <li>✓ Zero advertisements</li>
                  <li>✓ Curated playlists & drops</li>
                  <li>✓ Exclusive artist content</li>
                  <li>✓ Online giveaways</li>
                  <li>✓ Hi-fi audio quality</li>
                  <li>✓ Early access releases</li>
                </ul>
                <button className="btn btn-amber mt12" style={{ width:"100%" }} onClick={() => { onSubscribe(); setShowSub(false); notify("Welcome to VNC Pro! 👑"); }}>
                  Subscribe Now — $9.99/mo
                </button>
              </div>
            </div>
            <div style={{ fontSize:11, color:T.chrome, textAlign:"center" }}>Cancel anytime · Stripe-powered payments (coming soon)</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AUTH SCREENS
// ============================================================
function AuthScreen({ onAdminLogin, onListenerLogin, onArtistLogin, onRegisterListener, onRegisterArtist }) {
  const [mode, setMode] = useState("home"); // home | admin | listener-login | listener-reg | artist-login | artist-reg
  const [form, setForm] = useState({ user:"", pass:"", name:"", email:"", artistName:"", genre:"", label:"", confirm:"" });
  const [err, setErr] = useState("");

  const adminLogin = () => {
    const u = form.user.trim(), p = form.pass.trim();
    if ((u==="admin"&&p==="vnc2024")||(u==="radio"&&p==="vncradio")) { setErr(""); onAdminLogin(); }
    else setErr("Invalid admin credentials");
  };

  const listenerLogin = () => {
    const result = onListenerLogin(form.email.trim(), form.pass);
    if (!result.ok) setErr(result.msg);
  };

  const artistLogin = () => {
    const result = onArtistLogin(form.email.trim(), form.pass);
    if (!result.ok) setErr(result.msg);
  };

  const regListener = () => {
    if (!form.name.trim()||!form.email.trim()||!form.pass) return setErr("All fields required");
    if (form.pass!==form.confirm) return setErr("Passwords don't match");
    if (form.pass.length<6) return setErr("Password must be at least 6 characters");
    onRegisterListener({ name:form.name.trim(), email:form.email.trim(), pass:form.pass, subscribed:false });
  };

  const regArtist = () => {
    if (!form.artistName.trim()||!form.email.trim()||!form.pass||!form.genre) return setErr("All fields required");
    if (form.pass!==form.confirm) return setErr("Passwords don't match");
    onRegisterArtist({ artistName:form.artistName.trim(), name:form.name.trim()||form.artistName.trim(), email:form.email.trim(), pass:form.pass, genre:form.genre, label:form.label||"Independent" });
  };

  const F = (k,v) => { setErr(""); setForm(p=>({...p,[k]:v})); };

  if (mode==="home") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Background graphic motif — wavy lines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:-40, left:-60, width:500, height:200, background:`radial-gradient(ellipse,${T.acid}12 0%,transparent 70%)`, filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", top:-40, right:-60, width:400, height:200, background:`radial-gradient(ellipse,${T.brain}14 0%,transparent 70%)`, filter:"blur(40px)" }}/>
      </div>

      {/* Brain + Radio Logo SVG mark */}
      <div style={{ marginBottom:8, fontSize:72, lineHeight:1, textAlign:"center", filter:`drop-shadow(0 0 24px ${T.acid}40)` }}>🧠</div>

      <div style={{ textAlign:"center", marginBottom:10 }}>
        <div className="barlow" style={{ fontSize:72, color:T.ivory, letterSpacing:4, lineHeight:.9 }}>VNC RADIO</div>
        <div style={{ fontSize:13, color:T.acid, letterSpacing:4, marginTop:10, fontWeight:700, textTransform:"uppercase" }}>
          MUSIC / CULTURE / ALWAYS ON
        </div>
      </div>

      {/* Tagline */}
      <div style={{ textAlign:"center", marginBottom:40, maxWidth:380 }}>
        <div className="barlow" style={{ fontSize:26, color:T.chrome, letterSpacing:2, lineHeight:1.2 }}>
          SOUND THAT STAYS ON YOUR MIND.
        </div>
      </div>

      <div style={{ width:"100%", maxWidth:380, display:"flex", flexDirection:"column", gap:12 }}>
        <button className="btn btn-red" style={{ width:"100%", padding:"16px", fontSize:18 }} onClick={() => setMode("listener-login")}>
          📻 LISTEN NOW
        </button>
        <button className="btn btn-ghost" style={{ width:"100%", padding:"16px", fontSize:18 }} onClick={() => setMode("artist-login")}>
          🎤 ARTIST PORTAL
        </button>
        <div style={{ textAlign:"center", margin:"8px 0" }}>
          <span style={{ fontSize:12, color:T.chrome }}>New here? </span>
          <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer", textDecoration:"underline" }} onClick={() => setMode("listener-reg")}>
            Create free account
          </button>
          <span style={{ fontSize:12, color:T.chrome }}> or </span>
          <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer", textDecoration:"underline" }} onClick={() => setMode("artist-reg")}>
            apply as an artist
          </button>
        </div>

        {/* Sub brands / nav links */}
        <div className="flex gap8 wrap" style={{ justifyContent:"center", marginTop:8 }}>
          {["MUSIC","CULTURE","ARTISTS","STATIONS"].map(l => (
            <span key={l} style={{ fontSize:10, color:T.chrome, letterSpacing:2, opacity:.6 }}>{l}</span>
          ))}
        </div>

        <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16, textAlign:"center" }}>
          <button className="btn btn-ghost btn-sm" style={{ opacity:.3, fontSize:10, letterSpacing:2 }} onClick={() => setMode("admin")}>ADMIN ACCESS</button>
        </div>
      </div>
    </div>
  );

  const back = () => { setMode("home"); setErr(""); setForm({ user:"",pass:"",name:"",email:"",artistName:"",genre:"",label:"",confirm:"" }); };

  if (mode==="admin") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:42, marginBottom:4 }}>🧠</div>
          <div className="barlow" style={{ fontSize:48, color:T.acid, letterSpacing:4, lineHeight:.9 }}>VNC RADIO</div>
          <div style={{ fontSize:10, color:T.chrome, letterSpacing:3, marginTop:6 }}>ADMIN CONSOLE</div>
        </div>
        <div className="card mb12">
          <div className="section-title">ADMIN ACCESS</div>
          <div className="mb12"><label>Username</label><input value={form.user} onChange={e=>F("user",e.target.value)} placeholder="Username"/></div>
          <div className="mb12"><label>Password</label><input type="password" value={form.pass} onChange={e=>F("pass",e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&adminLogin()}/></div>
          {err && <div className="error-msg mb8">{err}</div>}
          <button className="btn btn-red" style={{ width:"100%" }} onClick={adminLogin}>Sign In to Console</button>
        </div>
        <button className="btn btn-ghost" style={{ width:"100%" }} onClick={back}>← Back</button>
      </div>
    </div>
  );

  if (mode==="listener-login") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="barlow" style={{ fontSize:52, color:T.acid, letterSpacing:4 }}>VNC RADIO</div>
          <div style={{ fontSize:11, color:T.chrome, letterSpacing:2 }}>LISTENER LOGIN</div>
        </div>
        <div className="card mb12">
          <div className="mb12"><label>Email</label><input type="email" value={form.email} onChange={e=>F("email",e.target.value)} placeholder="you@email.com"/></div>
          <div className="mb12"><label>Password</label><input type="password" value={form.pass} onChange={e=>F("pass",e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&listenerLogin()}/></div>
          {err && <div className="error-msg mb8">{err}</div>}
          <button className="btn btn-red" style={{ width:"100%" }} onClick={listenerLogin}>Sign In</button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:T.chrome }}>
            Don't have an account?{" "}
            <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer" }} onClick={() => { setMode("listener-reg"); setErr(""); }}>Sign up free</button>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width:"100%" }} onClick={back}>← Back</button>
      </div>
    </div>
  );

  if (mode==="listener-reg") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="barlow" style={{ fontSize:52, color:T.acid, letterSpacing:4 }}>VNC RADIO</div>
          <div style={{ fontSize:11, color:T.chrome, letterSpacing:2 }}>CREATE ACCOUNT</div>
        </div>
        <div className="card mb12">
          <div className="mb12"><label>Full Name</label><input value={form.name} onChange={e=>F("name",e.target.value)} placeholder="Your name"/></div>
          <div className="mb12"><label>Email</label><input type="email" value={form.email} onChange={e=>F("email",e.target.value)} placeholder="you@email.com"/></div>
          <div className="mb12"><label>Password</label><input type="password" value={form.pass} onChange={e=>F("pass",e.target.value)} placeholder="At least 6 characters"/></div>
          <div className="mb12"><label>Confirm Password</label><input type="password" value={form.confirm} onChange={e=>F("confirm",e.target.value)} placeholder="Repeat password"/></div>
          {err && <div className="error-msg mb8">{err}</div>}
          <button className="btn btn-red" style={{ width:"100%" }} onClick={regListener}>Create Free Account</button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:T.chrome }}>
            Already have an account?{" "}
            <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer" }} onClick={() => { setMode("listener-login"); setErr(""); }}>Sign in</button>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width:"100%" }} onClick={back}>← Back</button>
      </div>
    </div>
  );

  if (mode==="artist-login") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="barlow" style={{ fontSize:52, color:T.acid, letterSpacing:4 }}>VNC RADIO</div>
          <div style={{ fontSize:11, color:T.chrome, letterSpacing:2 }}>ARTIST LOGIN</div>
        </div>
        <div className="card mb12">
          <div className="mb12"><label>Email</label><input type="email" value={form.email} onChange={e=>F("email",e.target.value)} placeholder="artist@email.com"/></div>
          <div className="mb12"><label>Password</label><input type="password" value={form.pass} onChange={e=>F("pass",e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&artistLogin()}/></div>
          {err && <div className="error-msg mb8">{err}</div>}
          <button className="btn btn-red" style={{ width:"100%" }} onClick={artistLogin}>Sign In</button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:T.chrome }}>
            Want to work with VNC?{" "}
            <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer" }} onClick={() => { setMode("artist-reg"); setErr(""); }}>Apply now</button>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width:"100%" }} onClick={back}>← Back</button>
      </div>
    </div>
  );

  if (mode==="artist-reg") return (
    <div style={{ minHeight:"100vh", background:T.black, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div className="barlow" style={{ fontSize:52, color:T.acid, letterSpacing:4 }}>VNC RADIO</div>
          <div style={{ fontSize:11, color:T.chrome, letterSpacing:2 }}>ARTIST APPLICATION</div>
        </div>
        <div className="card mb12">
          <div style={{ background:`${T.brain}11`, border:`1px solid ${T.brain}33`, borderRadius:8, padding:12, marginBottom:16, fontSize:12, color:T.brain }}>
            🎤 Join VNC Radio — get your music on our stations, track your spins & revenue, and sync with SoundoVault.
          </div>
          <div className="mb12"><label>Artist / Stage Name</label><input value={form.artistName} onChange={e=>F("artistName",e.target.value)} placeholder="Your stage name"/></div>
          <div className="mb12"><label>Legal Name (optional)</label><input value={form.name} onChange={e=>F("name",e.target.value)} placeholder="For payment purposes"/></div>
          <div className="mb12"><label>Email</label><input type="email" value={form.email} onChange={e=>F("email",e.target.value)} placeholder="artist@email.com"/></div>
          <div className="mb12"><label>Primary Genre</label>
            <select value={form.genre} onChange={e=>F("genre",e.target.value)}>
              <option value="">Select genre...</option>
              {["Hip-Hop","R&B","Trap","Gospel","Reggae","Dancehall","Pop","Soul","Jazz","Other"].map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="mb12"><label>Label / Imprint (optional)</label><input value={form.label} onChange={e=>F("label",e.target.value)} placeholder="Independent or label name"/></div>
          <div className="mb12"><label>Password</label><input type="password" value={form.pass} onChange={e=>F("pass",e.target.value)} placeholder="At least 6 characters"/></div>
          <div className="mb12"><label>Confirm Password</label><input type="password" value={form.confirm} onChange={e=>F("confirm",e.target.value)} placeholder="Repeat password"/></div>
          {err && <div className="error-msg mb8">{err}</div>}
          <button className="btn btn-red" style={{ width:"100%" }} onClick={regArtist}>Submit Application</button>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:T.chrome }}>
            Already have an account?{" "}
            <button style={{ background:"none", border:"none", color:T.brain, fontSize:12, cursor:"pointer" }} onClick={() => { setMode("artist-login"); setErr(""); }}>Sign in</button>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ width:"100%" }} onClick={back}>← Back</button>
      </div>
    </div>
  );

  return null;
}

// ============================================================
// ARTIST DASHBOARD (logged-in artist view)
// ============================================================
function ArtistDashboard({ user, onLogout, notify }) {
  const mockData = { tracks:0, spins:0, adRev:0, streamRev:0 };
  return (
    <div style={{ minHeight:"100vh", background:T.black }}>
      <div style={{ background:T.slate, borderBottom:`1px solid ${T.border}`, padding:"14px 20px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div className="bebas" style={{ fontSize:24, color:T.acid, letterSpacing:3 }}>VNC RADIO — ARTIST PORTAL</div>
          <div className="flex gap8">
            <span style={{ fontSize:12, color:T.chrome }}>🎤 {user.artistName}</span>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ background:`${T.brain}11`, border:`1px solid ${T.brain}33`, borderRadius:10, padding:20, marginBottom:24 }}>
          <div className="bebas" style={{ fontSize:22, color:T.acid, marginBottom:8 }}>WELCOME, {user.artistName.toUpperCase()}!</div>
          <div style={{ fontSize:13, color:T.chrome, lineHeight:1.7 }}>
            Your application is under review by the VNC Radio team. Once approved, your music will be eligible for rotation on our stations.
            You'll be able to upload tracks, track your spins, and monitor your revenue here.
          </div>
          <div className="flex gap8 mt12">
            <span className="tag tag-sub">Genre: {user.genre}</span>
            <span className="tag tag-off">Status: Pending Review</span>
          </div>
        </div>
        <div className="grid4 mb16">
          <StatCard label="Tracks Uploaded" value={mockData.tracks} color={T.acid} icon="🎵"/>
          <StatCard label="Total Spins" value={mockData.spins} color={T.brain} icon="🔄"/>
          <StatCard label="Ad Revenue" value="$0" color={T.green} icon="💰"/>
          <StatCard label="Stream Revenue" value="$0" color={T.blue} icon="📊"/>
        </div>
        <div className="card">
          <div className="section-title">UPLOAD YOUR MUSIC</div>
          <div style={{ textAlign:"center", padding:"40px 0", color:T.chrome }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎵</div>
            <div style={{ fontSize:14, marginBottom:8 }}>Music upload coming soon</div>
            <div style={{ fontSize:12 }}>Connect your SoundoVault account to stream music directly</div>
            <button className="btn btn-amber mt16" onClick={() => notify("SoundoVault connect coming soon!")}>Connect SoundoVault</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [view, setView] = useState("auth"); // auth | admin | listener | artist-dash
  const [notif, setNotif] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({ listeners:[], artists:[] });

  const notify = msg => setNotif(msg);

  const onAdminLogin = () => setView("admin");

  const onListenerLogin = (email, pass) => {
    const u = users.listeners.find(u => u.email===email && u.pass===pass);
    if (!u) return { ok:false, msg:"No account found with those credentials" };
    setCurrentUser(u);
    setView("listener");
    return { ok:true };
  };

  const onArtistLogin = (email, pass) => {
    const u = users.artists.find(u => u.email===email && u.pass===pass);
    if (!u) return { ok:false, msg:"No artist account found with those credentials" };
    setCurrentUser(u);
    setView("artist-dash");
    return { ok:true };
  };

  const onRegisterListener = (data) => {
    setUsers(prev => ({ ...prev, listeners:[...prev.listeners, data] }));
    setCurrentUser(data);
    setView("listener");
    notify("Account created! Welcome to VNC Radio 🎙️");
  };

  const onRegisterArtist = (data) => {
    setUsers(prev => ({ ...prev, artists:[...prev.artists, data] }));
    setCurrentUser(data);
    setView("artist-dash");
    notify("Application submitted! Welcome to VNC Radio 🎤");
  };

  const onSubscribe = () => {
    const updated = { ...currentUser, subscribed:true };
    setCurrentUser(updated);
    setUsers(prev => ({ ...prev, listeners:prev.listeners.map(u => u.email===updated.email?updated:u) }));
  };

  return (
    <>
      <style>{css}</style>
      {notif && <Notification msg={notif} onDone={() => setNotif(null)}/>}
      {view==="auth" && (
        <AuthScreen
          onAdminLogin={onAdminLogin}
          onListenerLogin={onListenerLogin}
          onArtistLogin={onArtistLogin}
          onRegisterListener={onRegisterListener}
          onRegisterArtist={onRegisterArtist}
        />
      )}
      {view==="admin" && <AdminDashboard onLogout={() => setView("auth")} notify={notify} users={users}/>}
      {view==="listener" && <ListenerFrontend onBack={() => { setCurrentUser(null); setView("auth"); }} notify={notify} currentUser={currentUser} onSubscribe={onSubscribe}/>}
      {view==="artist-dash" && <ArtistDashboard user={currentUser} onLogout={() => { setCurrentUser(null); setView("auth"); }} notify={notify}/>}
    </>
  );
}
