import Flashcards from './Flashcards';
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  onSnapshot,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  X,
  ChevronRight,
  Search,
  Globe
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBCwiXJoPRrdKG1O_Je2Piwhpn-vWV2Eoo",
  authDomain: "lingua-bridge-7c8de.firebaseapp.com",
  projectId: "lingua-bridge-7c8de",
  storageBucket: "lingua-bridge-7c8de.firebasestorage.app",
  messagingSenderId: "7924231705",
  appId: "1:7924231705:web:31c39dffb725f96f5c8488"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_PASSWORD = 'lingua123';

const CATEGORIES = ['All', 'General', 'Vocabulary', 'Grammar', 'Reading', 'Video / Audio', 'Speaking', 'Listening'];

const CATEGORY_COLORS = {
  General:        { dot: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
  Vocabulary:     { dot: '#E5534B', bg: 'rgba(229,83,75,0.12)' },
  Grammar:        { dot: '#2EA87E', bg: 'rgba(46,168,126,0.12)' },
  Reading:        { dot: '#E8963A', bg: 'rgba(232,150,58,0.12)' },
  'Video / Audio':{ dot: '#3AB4F2', bg: 'rgba(58,180,242,0.12)' },
  Speaking:       { dot: '#D964D8', bg: 'rgba(217,100,216,0.12)' },
  Listening:      { dot: '#F2C94C', bg: 'rgba(242,201,76,0.12)' },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'General', description: '' });
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try { await signInAnonymously(auth); }
      catch (e) { console.error(e); }
    };
    init();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'studyLinks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, e => console.error(e));
  }, [user]);

  const filtered = links.filter(l => {
    const matchCat = activeCategory === 'All' || l.category === activeCategory;
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || (l.description || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleVerify = () => {
    if (pwInput === ADMIN_PASSWORD) { setIsUnlocked(true); setPwError(''); }
    else setPwError('Wrong password. Try again.');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url || !user) return;
    try {
      await addDoc(collection(db, 'studyLinks'), { ...newLink, createdAt: Date.now() });
      setNewLink({ title: '', url: '', category: 'General', description: '' });
      closeModal();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    const pw = window.prompt('Enter Einstein password to delete:');
    if (pw !== ADMIN_PASSWORD) { alert('Wrong password!'); return; }
    try { await deleteDoc(doc(db, 'studyLinks', id)); }
    catch (e) { console.error(e); }
  };

  const closeModal = () => { setShowModal(false); setIsUnlocked(false); setPwInput(''); setPwError(''); };

  if (!user) return (
    <div style={s.loading}>
      <div style={s.loadingInner}>
        <LogoMark size={48} />
        <p style={s.loadingText}>Connecting…</p>
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <LogoMark size={40} />
          <div>
            <div style={s.brandName}>LINGUA<span style={{ color: '#E5534B' }}>-BRIDGE</span></div>
            <div style={s.brandSub}>by Edvard</div>
          </div>
        </div>

        <div style={s.searchWrap}>
          <Search size={14} style={{ color: '#666', flexShrink: 0 }} />
          <input style={s.searchInput} placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <nav style={s.nav}>
          <button
            onClick={() => setActiveCategory('__flashcards__')}
            style={{ ...s.navItem, ...(activeCategory === '__flashcards__' ? s.navItemActive : {}) }}
          >
            <span style={{ ...s.navDot, background: activeCategory === '__flashcards__' ? '#F2C94C' : 'transparent', border: '1.5px solid #F2C94C' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Flashcards</span>
          </button>
          <p style={s.navLabel}>Categories</p>
          {CATEGORIES.map(cat => {
            const active = cat === activeCategory;
            const color = cat !== 'All' ? CATEGORY_COLORS[cat]?.dot : '#E5534B';
            const count = cat === 'All' ? links.length : links.filter(l => l.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}>
                <span style={{ ...s.navDot, background: active ? color : 'transparent', border: `1.5px solid ${color}` }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{cat}</span>
                <span style={s.navCount}>{count}</span>
              </button>
            );
          })}
        </nav>

        <div style={s.userChip}>
          <div style={s.avatar}>ES</div>
          <div>
            <div style={s.userName}>Edvard Stow</div>
            <div style={s.userRole}>Kreator</div>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.headerTitle}>{activeCategory === 'All' ? 'All Resources' : activeCategory === '__flashcards__' ? 'Flashcards' : activeCategory}</h1>
            <p style={s.headerSub}>{filtered.length} link{filtered.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button style={s.addBtn} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Link
          </button>
        </header>

        {activeCategory === '__flashcards__' ? <Flashcards /> : <div style={s.grid}>
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <Globe size={40} style={{ color: '#333', marginBottom: 16 }} />
              <p style={s.emptyText}>No links here yet.</p>
              <p style={s.emptySub}>Click "Add Link" to save your first resource.</p>
            </div>
          ) : (
            filtered.map(link => {
              const col = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.General;
              const hovered = hoveredId === link.id;
              return (
                <div
                  key={link.id}
                  style={{ ...s.card, ...(hovered ? s.cardHover : {}), borderColor: hovered ? col.dot : 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={() => setHoveredId(link.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={s.cardTop}>
                    <span style={{ ...s.catBadge, background: col.bg, color: col.dot }}>
                      <span style={{ ...s.catDot, background: col.dot }} />
                      {link.category}
                    </span>
                    <button onClick={() => handleDelete(link.id)} style={{ ...s.deleteBtn, opacity: hovered ? 1 : 0 }} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <h3 style={s.cardTitle}>{link.title}</h3>
                  {link.description && <p style={s.cardDesc}>{link.description}</p>}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ ...s.launchBtn, background: col.bg, color: col.dot, borderColor: col.dot + '44' }}>
                    <ExternalLink size={13} />
                    Open resource
                    <ChevronRight size={13} style={{ marginLeft: 'auto' }} />
                  </a>
                </div>
              );
            })
          )}
        </div>}
      </main>

      {showModal && (
        <div style={s.backdrop} onClick={closeModal}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalHeaderLeft}>
                <div style={s.modalIcon}>
                  {isUnlocked ? <Plus size={16} style={{ color: '#E5534B' }} /> : <Lock size={16} style={{ color: '#aaa' }} />}
                </div>
                <span style={s.modalTitle}>{isUnlocked ? 'New Resource' : 'Einstein Access'}</span>
              </div>
              <button onClick={closeModal} style={s.closeBtn}><X size={18} /></button>
            </div>

            <div style={s.modalBody}>
              {!isUnlocked ? (
                <div>
                  <p style={s.modalHint}>Enter the hub password to add a new link.</p>
                  <input type="password" placeholder="Password" style={s.input} value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVerify()} autoFocus />
                  {pwError && <p style={s.inputError}>{pwError}</p>}
                  <button style={s.primaryBtn} onClick={handleVerify}>Verify Access</button>
                </div>
              ) : (
                <form onSubmit={handleAdd}>
                  <label style={s.label}>Title</label>
                  <input style={s.input} placeholder="e.g. Cambridge Dictionary" value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} required />
                  <label style={s.label}>URL</label>
                  <input style={s.input} type="url" placeholder="https://..." value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} required />
                  <label style={s.label}>Short description (optional)</label>
                  <input style={s.input} placeholder="What's this resource for?" value={newLink.description} onChange={e => setNewLink({ ...newLink, description: e.target.value })} />
                  <label style={s.label}>Category</label>
                  <select style={s.input} value={newLink.category} onChange={e => setNewLink({ ...newLink, category: e.target.value })}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                  <button type="submit" style={{ ...s.primaryBtn, marginTop: 8 }}>Save to Cloud ↗</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M20 40 L20 80 M20 80 L50 80" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <path d="M50 40 C70 40,85 50,85 65 C85 80,70 90,50 90" stroke="#E5534B" strokeWidth="9" strokeLinecap="round" />
      <path d="M10 60 Q50 10 90 60" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

const s = {
  root: { display: 'flex', minHeight: '100vh', background: '#0E0E0E', color: '#E8E8E8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0E0E0E' },
  loadingInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  loadingText: { color: '#555', fontSize: 14 },
  sidebar: { width: 260, minHeight: '100vh', background: '#161616', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '28px 0 20px', flexShrink: 0 },
  sidebarTop: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 },
  brandName: { fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.2 },
  brandSub: { fontSize: 11, color: '#555', marginTop: 2, letterSpacing: '0.03em' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, margin: '0 14px 20px', background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '7px 12px' },
  searchInput: { background: 'none', border: 'none', outline: 'none', color: '#ccc', fontSize: 13, width: '100%' },
  nav: { flex: 1, padding: '0 10px', overflowY: 'auto' },
  navLabel: { fontSize: 10, fontWeight: 600, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: '7px 8px', borderRadius: 7, transition: 'all 0.15s', marginBottom: 2, textAlign: 'left' },
  navItemActive: { background: 'rgba(255,255,255,0.05)', color: '#E8E8E8' },
  navDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, transition: 'all 0.15s' },
  navCount: { fontSize: 11, color: '#444', fontVariantNumeric: 'tabular-nums' },
  userChip: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#E5534B', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: '#ddd', lineHeight: 1.3 },
  userRole: { fontSize: 10, color: '#555', letterSpacing: '0.05em' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0E0E0E', zIndex: 10 },
  headerTitle: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' },
  headerSub: { fontSize: 12, color: '#555', margin: '3px 0 0' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#E5534B', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', letterSpacing: '0.01em' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 32 },
  empty: { gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16 },
  emptyText: { fontSize: 16, color: '#555', margin: 0 },
  emptySub: { fontSize: 13, color: '#333', marginTop: 6 },
  card: { background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s' },
  cardHover: { background: '#1A1A1A', transform: 'translateY(-2px)' },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  catBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 20 },
  catDot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#E5534B', padding: 4, borderRadius: 5, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: 700, color: '#f0f0f0', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' },
  cardDesc: { fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 },
  launchBtn: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '7px 12px', borderRadius: 7, border: '1px solid', marginTop: 4, letterSpacing: '0.02em', transition: 'opacity 0.15s' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, width: '100%', maxWidth: 420, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#161616' },
  modalHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  modalIcon: { width: 30, height: 30, borderRadius: 8, background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 14, fontWeight: 700, color: '#ddd', letterSpacing: '0.02em' },
  closeBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4 },
  modalBody: { padding: 24 },
  modalHint: { fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.5, margin: '0 0 16px' },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, marginTop: 14 },
  input: { width: '100%', boxSizing: 'border-box', background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#E8E8E8', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  inputError: { fontSize: 12, color: '#E5534B', margin: '6px 0 0', fontWeight: 500 },
  primaryBtn: { width: '100%', marginTop: 20, padding: '11px', background: '#E5534B', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.15s' },
};