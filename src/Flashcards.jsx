import React, { useState } from 'react';

const CARDS = [
  { id: 1, front: "Zero in on", back: "Enfocarse en", example: "The teacher asked students to zero in on pronunciation accuracy." },
  { id: 2, front: "Mitigate", back: "Mitigar / Reducir", example: "Good planning helps mitigate risks." },
  { id: 3, front: "Nonetheless", back: "Sin embargo / No obstante", example: "The task was difficult; nonetheless, they completed it." },
  { id: 4, front: "Brush up on", back: "Repasar / Reforzar", example: "I need to brush up on my grammar before the test." },
  { id: 5, front: "Ambiguous", back: "Ambiguo / Poco claro", example: "The instructions were ambiguous and confusing." },
  { id: 6, front: "Underscore", back: "Subrayar / Destacar", example: "This mistake underscores the importance of clarity." },
  { id: 7, front: "Get by", back: "Arreglárselas / Sobrevivir", example: "He can get by with basic English." },
  { id: 8, front: "Reflect upon / Ponder", back: "Reflexionar / Pensar profundamente", example: "She reflected upon her decisions." },
  { id: 9, front: "Boil down to", back: "Reducirse a / Resumirse en", example: "The problem boils down to poor communication." },
  { id: 10, front: "Stem from", back: "Derivar de / Provenir de", example: "His success stems from hard work." },
  { id: 11, front: "Fall short (of)", back: "Quedarse corto / No alcanzar", example: "The results fell short of expectations." },
  { id: 12, front: "Come across as", back: "Dar la impresión de", example: "He comes across as confident." },
  { id: 13, front: "Take for granted", back: "Dar por sentado", example: "We often take clean water for granted." },
  { id: 14, front: "Account for", back: "Explicar / Representar", example: "This factor accounts for the increase." },
  { id: 15, front: "At stake", back: "En juego / En riesgo", example: "Your reputation is at stake." },
  { id: 16, front: "Run into", back: "Encontrarse con / Toparse con", example: "I ran into an old friend yesterday." },
  { id: 17, front: "Rule out", back: "Descartar", example: "We can't rule out other possibilities." },
  { id: 18, front: "Carry out", back: "Llevar a cabo", example: "The team carried out the plan successfully." },
  { id: 19, front: "Come down to", back: "Depender de / Reducirse a", example: "It all comes down to discipline." },
  { id: 20, front: "Get the hang of", back: "Agarrarle la onda / Aprender a hacer algo", example: "You'll get the hang of it with practice." },
];

export default function Flashcards() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);
  const [filter, setFilter] = useState('all');

  const filtered = CARDS.filter(c => {
    if (filter === 'known') return known.includes(c.id);
    if (filter === 'learning') return learning.includes(c.id);
    return true;
  });

  const card = filtered[current];
  const progress = Math.round(((current + 1) / filtered.length) * 100);

  const next = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.min(i + 1, filtered.length - 1)), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setCurrent(i => Math.max(i - 1, 0)), 150); };

  const markKnown = () => {
    setKnown(k => k.includes(card.id) ? k : [...k, card.id]);
    setLearning(l => l.filter(id => id !== card.id));
    next();
  };

  const markLearning = () => {
    setLearning(l => l.includes(card.id) ? l : [...l, card.id]);
    setKnown(k => k.filter(id => id !== card.id));
    next();
  };

  const reset = () => { setCurrent(0); setFlipped(false); setKnown([]); setLearning([]); setFilter('all'); };

  if (!card) return (
    <div style={s.done}>
      <p style={s.doneTitle}>🎉 All done!</p>
      <p style={s.doneSub}>{known.length} known · {learning.length} still learning</p>
      <button style={s.resetBtn} onClick={reset}>Start Over</button>
    </div>
  );

  return (
    <div style={s.root}>

      {/* Stats bar */}
      <div style={s.statsBar}>
        <span style={s.statKnown}>✓ {known.length} known</span>
        <span style={s.statLearning}>↺ {learning.length} learning</span>
        <span style={s.statTotal}>{current + 1} / {filtered.length}</span>
      </div>

      {/* Filter tabs */}
      <div style={s.tabs}>
        {['all', 'known', 'learning'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setCurrent(0); setFlipped(false); }}
            style={{ ...s.tab, ...(filter === f ? s.tabActive : {}) }}
          >
            {f === 'all' ? 'All cards' : f === 'known' ? '✓ Known' : '↺ Learning'}
          </button>
        ))}
        <button onClick={reset} style={s.resetSmall}>Reset</button>
      </div>

      {/* Progress bar */}
      <div style={s.progressWrap}>
        <div style={{ ...s.progressBar, width: progress + '%' }} />
      </div>

      {/* Card */}
      <div style={s.scene} onClick={() => setFlipped(f => !f)}>
        <div style={{ ...s.card, ...(flipped ? s.cardFlipped : {}) }}>

          {/* Front */}
          <div style={s.cardFace}>
            <span style={s.cardLabel}>ENGLISH</span>
            <h2 style={s.cardWord}>{card.front}</h2>
            <p style={s.cardHint}>tap to reveal</p>
          </div>

          {/* Back */}
          <div style={{ ...s.cardFace, ...s.cardBack }}>
            <span style={{ ...s.cardLabel, color: '#2EA87E' }}>ESPAÑOL</span>
            <h2 style={{ ...s.cardWord, color: '#2EA87E' }}>{card.back}</h2>
            <p style={s.cardExample}>"{card.example}"</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={s.actions}>
        <button onClick={prev} style={s.navBtn} disabled={current === 0}>←</button>
        <button onClick={markLearning} style={s.learningBtn}>Still learning</button>
        <button onClick={markKnown} style={s.knownBtn}>I know this ✓</button>
        <button onClick={next} style={s.navBtn} disabled={current === filtered.length - 1}>→</button>
      </div>

    </div>
  );
}

const s = {
  root: { padding: '32px', maxWidth: 640, margin: '0 auto' },
  statsBar: { display: 'flex', gap: 16, marginBottom: 20, fontSize: 13 },
  statKnown: { color: '#2EA87E', fontWeight: 600 },
  statLearning: { color: '#E8963A', fontWeight: 600 },
  statTotal: { marginLeft: 'auto', color: '#555', fontWeight: 600 },
  tabs: { display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' },
  tab: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#666', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' },
  tabActive: { background: 'rgba(229,83,75,0.15)', borderColor: '#E5534B', color: '#E5534B' },
  resetSmall: { marginLeft: 'auto', background: 'none', border: 'none', color: '#444', fontSize: 12, cursor: 'pointer' },
  progressWrap: { height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' },
  progressBar: { height: '100%', background: '#E5534B', borderRadius: 2, transition: 'width 0.3s' },
  scene: { perspective: 1000, cursor: 'pointer', marginBottom: 24 },
  card: { position: 'relative', height: 280, transformStyle: 'preserve-3d', transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)', borderRadius: 20 },
  cardFlipped: { transform: 'rotateY(180deg)' },
  cardFace: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  cardBack: { transform: 'rotateY(180deg)', background: '#0f1f1a', border: '1px solid rgba(46,168,126,0.2)' },
  cardLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#444', textTransform: 'uppercase' },
  cardWord: { fontSize: 28, fontWeight: 800, color: '#f0f0f0', margin: 0, textAlign: 'center', letterSpacing: '-0.02em' },
  cardHint: { fontSize: 12, color: '#333', margin: 0 },
  cardExample: { fontSize: 13, color: '#2EA87E', textAlign: 'center', fontStyle: 'italic', margin: 0, lineHeight: 1.5, opacity: 0.8 },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  navBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, width: 44, height: 44, color: '#666', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  learningBtn: { flex: 1, padding: '12px', background: 'rgba(232,150,58,0.1)', border: '1px solid rgba(232,150,58,0.3)', borderRadius: 10, color: '#E8963A', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  knownBtn: { flex: 1, padding: '12px', background: 'rgba(46,168,126,0.1)', border: '1px solid rgba(46,168,126,0.3)', borderRadius: 10, color: '#2EA87E', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  done: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', gap: 12 },
  doneTitle: { fontSize: 28, fontWeight: 800, color: '#fff', margin: 0 },
  doneSub: { fontSize: 14, color: '#555', margin: 0 },
  resetBtn: { marginTop: 8, background: '#E5534B', border: 'none', borderRadius: 10, padding: '12px 32px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};