import { FormEvent, useEffect, useMemo, useState } from 'react'

type View = 'home' | 'explore' | 'solve' | 'following' | 'messages' | 'notifications' | 'profile' | 'leaderboard'
type ProblemStatus = 'Open' | 'In progress' | 'Solved'
type Attachment = { name: string; type: string; size: number }
type Problem = {
  id: number
  title: string
  summary: string
  description: string
  category: string
  location: string
  status: ProblemStatus
  tags: string[]
  author: string
  initials: string
  accent: string
  votes: number
  watchers: number
  created: string
  updates: string[]
  attachments?: Attachment[]
  repository?: string
}

const categories = ['All topics', 'Climate', 'Community', 'Education', 'Health', 'Mobility', 'Technology']
const people = [
  { name: 'Maya Chen', handle: '@mayac', initials: 'MC', role: 'Systems designer', points: 2840, color: '#b7f36b' },
  { name: 'Jon Bell', handle: '@jonbell', initials: 'JB', role: 'Civic technologist', points: 2210, color: '#ffd26e' },
  { name: 'Amara Okafor', handle: '@amarao', initials: 'AO', role: 'Community organizer', points: 1980, color: '#c8b6ff' },
]

const starterProblems: Problem[] = [
  {
    id: 1, title: 'How might we make neighborhood composting effortless?', summary: 'Most apartment dwellers want to compost, but collection points are too far away and the rules are confusing.',
    description: 'In dense neighborhoods, good intentions meet a maze of different bins, pickup calendars, and overflowing drop-off sites. We are looking for a small, testable intervention that makes the first composting habit feel obvious.',
    category: 'Climate', location: 'Portland, OR', status: 'In progress', tags: ['waste', 'behavior change', 'neighborhoods'],
    author: 'Maya Chen', initials: 'MC', accent: '#b7f36b', votes: 184, watchers: 48, created: '2 days ago',
    updates: ['Maya shared a map of existing drop-off points', 'Jon joined the working group'],
  },
  {
    id: 2, title: 'A softer landing for students who move schools', summary: 'When families relocate, students lose context, friendships, and sometimes months of learning momentum.',
    description: 'School transfers are often treated as paperwork instead of a human transition. We want to understand the first 30 days and prototype a welcome ritual that works for students, teachers, and parents.',
    category: 'Education', location: 'Austin, TX', status: 'Open', tags: ['schools', 'belonging', 'research'],
    author: 'Amara Okafor', initials: 'AO', accent: '#c8b6ff', votes: 127, watchers: 31, created: '4 days ago',
    updates: ['Amara is collecting stories from transfer students'],
  },
  {
    id: 3, title: 'Can we help night-shift workers get home safely?', summary: 'The last bus leaves before many essential workers clock out, leaving a costly and unsafe gap in mobility.',
    description: 'A late-night transit gap affects nurses, hospitality staff, cleaners, and warehouse teams. Let’s map the routes people actually take and explore shared, trusted alternatives with employers and cities.',
    category: 'Mobility', location: 'Chicago, IL', status: 'Open', tags: ['transit', 'safety', 'work'],
    author: 'Jon Bell', initials: 'JB', accent: '#ffd26e', votes: 96, watchers: 24, created: '1 week ago',
    updates: ['Jon posted a first-pass route map'],
  },
  {
    id: 4, title: 'Making local health resources easier to trust', summary: 'People often find the right support only after asking the right person — a luxury not everyone has.',
    description: 'Information about free clinics, food support, and mental-health services is fragmented and hard to evaluate. We are exploring a community-maintained directory with clear signals of freshness and trust.',
    category: 'Health', location: 'Detroit, MI', status: 'Solved', tags: ['access', 'care', 'local'],
    author: 'Maya Chen', initials: 'MC', accent: '#b7f36b', votes: 241, watchers: 77, created: '3 weeks ago',
    updates: ['The pilot directory is live in two neighborhoods', 'Impact report shared'],
  },
  {
    id: 5, title: 'What would make a public park feel like yours?', summary: 'Many city parks are technically open to everyone but don’t feel welcoming to everyone.',
    description: 'We are listening for the quiet signals that tell people whether they belong in a public space. Bring an observation, a story, or a tiny experiment we can try with neighbors.',
    category: 'Community', location: 'Philadelphia, PA', status: 'In progress', tags: ['public space', 'belonging', 'design'],
    author: 'Amara Okafor', initials: 'AO', accent: '#c8b6ff', votes: 83, watchers: 19, created: '5 days ago',
    updates: ['A weekend listening walk is planned for Saturday'],
  },
  {
    id: 6, title: 'A shared signal for repairing instead of replacing', summary: 'Repair shops and people who need them struggle to find one another before an item becomes waste.',
    description: 'The knowledge to fix everyday things exists, but it is distributed among neighbors and small businesses. How might we help a repair request find the right pair of hands in time?',
    category: 'Technology', location: 'Online / global', status: 'Open', tags: ['repair', 'circular economy', 'marketplace'],
    author: 'Jon Bell', initials: 'JB', accent: '#ffd26e', votes: 72, watchers: 15, created: '1 week ago',
    updates: ['A prototype intake form is ready for testing'],
  },
]

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? initial } catch { return initial }
  })
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)) }, [key, value])
  return [value, setValue] as const
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    search: 'M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z',
    home: 'M3 10.8L12 3l9 7.8v9.2a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z',
    compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zm3.7-12.7l-2.1 4.2-4.2 2.1 2.1-4.2 4.2-2.1z',
    bookmark: 'M6 4a2 2 0 012-2h8a2 2 0 012 2v18l-6-3.5L6 22V4z',
    message: 'M21 11.5a8 8 0 01-9 8 9.6 9.6 0 01-3.5-.7L3 21l1.7-4.9A8 8 0 1121 11.5z',
    bell: 'M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
    user: 'M20 21a8 8 0 00-16 0m12-13a4 4 0 11-8 0 4 4 0 018 0z',
    plus: 'M12 5v14m-7-7h14',
    arrow: 'M5 12h14m-5-5l5 5-5 5',
    spark: 'M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3zm7 13l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z',
    check: 'M5 12l4 4L19 6',
    heart: 'M20.8 8.8a5 5 0 00-8.8-3.3 5 5 0 00-8.8 3.3C3.2 14 12 20 12 20s8.8-6 8.8-11.2z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 6l12 12M18 6L6 18',
    send: 'M22 2L11 13m0 0l-1 9 4-6 8-14z',
  }
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name] || paths.spark} /></svg>
}

function Avatar({ initials, color = '#b7f36b', size = 'md' }: { initials: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${size}`} style={{ background: color }}>{initials}</span>
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selected, setSelected] = useState<Problem | null>(null)
  const [problems, setProblems] = useStored<Problem[]>('unsolved-problems', starterProblems)
  const [saved, setSaved] = useStored<number[]>('unsolved-saved', [1, 4])
  const [voted, setVoted] = useStored<number[]>('unsolved-voted', [])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All topics')
  const [status, setStatus] = useState<'All statuses' | ProblemStatus>('All statuses')
  const [sort, setSort] = useState('Trending')
  const [showCreate, setShowCreate] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [solveProblem, setSolveProblem] = useState<Problem | null>(null)
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800) }
  const navigate = (next: View) => { setView(next); setSelected(null); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openProblem = (problem: Problem) => { setSelected(problem); setView('explore'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const toggleSaved = (id: number) => { setSaved((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]); notify(saved.includes(id) ? 'Removed from your watchlist' : 'Added to your watchlist') }
  const toggleVote = (id: number) => {
    setVoted((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id])
    setProblems((old) => old.map((p) => p.id === id ? { ...p, votes: p.votes + (voted.includes(id) ? -1 : 1) } : p))
  }

  const filteredProblems = useMemo(() => {
    const result = problems.filter((p) => {
      const haystack = `${p.title} ${p.summary} ${p.category} ${p.location} ${p.tags.join(' ')}`.toLowerCase()
      return haystack.includes(search.toLowerCase()) && (category === 'All topics' || p.category === category) && (status === 'All statuses' || p.status === status)
    })
    return [...result].sort((a, b) => sort === 'Newest' ? b.id - a.id : sort === 'Most supported' ? b.votes - a.votes : b.votes + b.watchers - a.votes - a.watchers)
  }, [problems, search, category, status, sort])

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate('home')} aria-label="UNSOLVED home"><span className="brand-mark">U</span><span>UNSOLVED</span></button>
        <div className="top-search"><Icon name="search" /><input value={search} onChange={(e) => { setSearch(e.target.value); if (e.target.value) setView('explore') }} placeholder="Search problems, places, ideas..." /><kbd>⌘ K</kbd></div>
        <div className="top-actions"><button className="icon-button mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Icon name="menu" /></button><button className="create-button" onClick={() => setShowCreate(true)}><Icon name="plus" /> <span>Post a problem</span></button><button className="avatar-button" onClick={() => navigate('profile')}><Avatar initials="RK" color="#ffd26e" /></button></div>
      </header>
      <div className="layout">
        <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
          <nav>
            <p className="nav-label">Workspace</p>
            <NavItem icon="home" label="Home" active={view === 'home'} onClick={() => navigate('home')} />
            <NavItem icon="compass" label="Explore" active={view === 'explore'} onClick={() => navigate('explore')} badge={problems.length} />
            <NavItem icon="bookmark" label="Following" active={view === 'following'} onClick={() => navigate('following')} />
            <NavItem icon="message" label="Messages" active={view === 'messages'} onClick={() => navigate('messages')} badge={3} />
            <NavItem icon="bell" label="Notifications" active={view === 'notifications'} onClick={() => navigate('notifications')} badge={5} />
            <p className="nav-label nav-label-spaced">People</p>
            <NavItem icon="user" label="My profile" active={view === 'profile'} onClick={() => navigate('profile')} />
            <NavItem icon="spark" label="Leaderboard" active={view === 'leaderboard'} onClick={() => navigate('leaderboard')} />
          </nav>
          <div className="sidebar-bottom"><div className="side-callout"><span className="callout-icon"><Icon name="spark" /></span><strong>Have a hunch?</strong><p>Small observations can become big shifts.</p><button onClick={() => setShowCreate(true)}>Share yours <Icon name="arrow" /></button></div><div className="user-row" onClick={() => navigate('profile')}><Avatar initials="RK" color="#ffd26e" size="sm" /><div><strong>Riley Kim</strong><span>Explorer · 120 pts</span></div><span className="dots">•••</span></div></div>
        </aside>
        <main className="main-content">
          {view === 'home' && <Home problems={problems} saved={saved} onExplore={() => navigate('explore')} onOpen={openProblem} onCreate={() => setShowCreate(true)} onToggleSaved={toggleSaved} />}
          {view === 'solve' && <SolveHub problems={problems.filter((p) => p.status !== 'Solved')} onSolve={setSolveProblem} />}
          {view === 'explore' && (selected ? <ProblemDetail problem={selected} saved={saved.includes(selected.id)} voted={voted.includes(selected.id)} onBack={() => setSelected(null)} onSave={() => toggleSaved(selected.id)} onVote={() => toggleVote(selected.id)} onCreate={() => setShowCreate(true)} onSolve={() => setSolveProblem(selected)} notify={notify} /> : <Explore problems={filteredProblems} search={search} setSearch={setSearch} category={category} setCategory={setCategory} status={status} setStatus={setStatus} sort={sort} setSort={setSort}           onOpen={openProblem} saved={saved} onSave={toggleSaved} onCreate={() => setShowCreate(true)} onSolve={setSolveProblem} />)}
          {view === 'following' && <Following problems={problems.filter((p) => saved.includes(p.id))} onOpen={openProblem} onExplore={() => navigate('explore')} onSave={toggleSaved} />}
          {view === 'messages' && <Messages notify={notify} />}
          {view === 'notifications' && <Notifications onOpen={openProblem} />}
          {view === 'profile' && <Profile problems={problems} saved={saved} onOpen={openProblem} onExplore={() => navigate('explore')} />}
          {view === 'leaderboard' && <Leaderboard />}
        </main>
      </div>
      <button className="assistant-fab" onClick={() => setShowAssistant(true)}><Icon name="spark" /><span>Ask Scout</span></button>
      {selected && <button className="solve-fab" onClick={() => setSolveProblem(selected)}><Icon name="spark" /> Solve this problem</button>}
      {showCreate && <EnhancedCreateModal onClose={() => setShowCreate(false)} onCreate={(newProblem) => { setProblems((old) => [newProblem, ...old]); setShowCreate(false); notify('Your problem is now live — welcome to the table!'); setSelected(newProblem); setView('explore') }} />}
      {solveProblem && <SolveWorkspace problem={solveProblem} onClose={() => setSolveProblem(null)} notify={notify} />}
      {showAssistant && <Assistant onClose={() => setShowAssistant(false)} onNavigate={(term) => { setSearch(term); setView('explore'); setShowAssistant(false) }} />}
      {toast && <div className="toast"><Icon name="check" />{toast}</div>}
    </div>
  )
}

function NavItem({ icon, label, active, onClick, badge }: { icon: string; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon name={icon} /><span>{label}</span>{badge ? <em>{badge}</em> : null}</button>
}

function Home({ problems, saved, onExplore, onOpen, onCreate, onToggleSaved }: { problems: Problem[]; saved: number[]; onExplore: () => void; onOpen: (p: Problem) => void; onCreate: () => void; onToggleSaved: (id: number) => void }) {
  const featured = problems[0]
  return <div className="page home-page">
    <section className="hero"><div className="eyebrow"><span className="eyebrow-dot" /> A calmer internet for making change</div><h1>Find what matters.<br /><em>Solve it together.</em></h1><p className="hero-copy">UNSOLVED is where everyday friction becomes collective progress. Bring a problem, follow a thread, or lend a hand.</p><div className="hero-actions"><button className="primary-button" onClick={onExplore}>Explore problems <Icon name="arrow" /></button><button className="text-button" onClick={onCreate}>Share a problem <Icon name="plus" /></button></div><div className="hero-stats"><span><strong>2,481</strong> curious people</span><span><strong>634</strong> problems in motion</span><span><strong>89</strong> solved together</span></div></section>
    <section className="section-block"><div className="section-heading"><div><p className="kicker">Worth your attention</p><h2>Problems in motion</h2></div><button className="link-button" onClick={onExplore}>View all <Icon name="arrow" /></button></div><div className="featured-grid"><ProblemCard problem={featured} featured saved={saved.includes(featured.id)} onOpen={onOpen} onSave={onToggleSaved} /><div className="mini-list">{problems.slice(1, 4).map((p) => <ProblemRow key={p.id} problem={p} onOpen={onOpen} />)}</div></div></section>
    <section className="section-block soft-section"><div className="section-heading"><div><p className="kicker">A little momentum</p><h2>What the community is noticing</h2></div></div><div className="notice-grid"><div className="notice-card"><div className="notice-top"><span className="topic-pill climate">CLIMATE</span><span>↑ 36 this week</span></div><p>Repair, reuse, and sharing are moving from niche habits to neighborhood infrastructure.</p><div className="stacked-avatars"><Avatar initials="MC" color="#b7f36b" size="sm" /><Avatar initials="JB" color="#ffd26e" size="sm" /><Avatar initials="AO" color="#c8b6ff" size="sm" /><span>+ 128 others</span></div></div><div className="notice-card accent-notice"><span className="quote-mark">“</span><p>We don’t need more hot takes. We need better questions, held by more people.</p><strong>— Community note, April 2024</strong></div></div></section>
  </div>
}

function Explore({ problems, search, setSearch, category, setCategory, status, setStatus, sort, setSort, onOpen, saved, onSave, onCreate, onSolve }: { problems: Problem[]; search: string; setSearch: (v: string) => void; category: string; setCategory: (v: string) => void; status: string; setStatus: (v: 'All statuses' | ProblemStatus) => void; sort: string; setSort: (v: string) => void; onOpen: (p: Problem) => void; saved: number[]; onSave: (id: number) => void; onCreate: () => void; onSolve: (p: Problem) => void }) {
  return <div className="page"><div className="page-header"><div><p className="kicker">The open table</p><h1>Explore problems</h1><p className="page-subtitle">Start with a question. Stay for the people working on it.</p></div><button className="primary-button" onClick={onCreate}><Icon name="plus" /> Post a problem</button></div><div className="filter-bar"><div className="filter-search"><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by keyword, place, or topic" /></div><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value as 'All statuses' | ProblemStatus)}><option>All statuses</option><option>Open</option><option>In progress</option><option>Solved</option></select><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Trending</option><option>Newest</option><option>Most supported</option></select></div><div className="results-line"><span><strong>{problems.length}</strong> problems found</span><span className="results-hint">Every problem is an invitation, not a verdict.</span></div>{problems.length ? <div className="problem-grid">{problems.map((p) => <ProblemCard key={p.id} problem={p} saved={saved.includes(p.id)} onOpen={onOpen} onSave={onSave} onSolve={onSolve} />)}</div> : <EmptyState search={search} onClear={() => { setSearch(''); setCategory('All topics'); setStatus('All statuses') }} onCreate={onCreate} />}</div>
}

function ProblemCard({ problem, featured = false, saved, onOpen, onSave, onSolve }: { problem: Problem; featured?: boolean; saved: boolean; onOpen: (p: Problem) => void; onSave: (id: number) => void; onSolve?: (p: Problem) => void }) {
  return <article className={`problem-card ${featured ? 'featured-card' : ''}`} onClick={() => onOpen(problem)}><div className="card-top"><span className={`topic-pill ${problem.category.toLowerCase()}`}>{problem.category}</span><button className={`save-button ${saved ? 'saved' : ''}`} onClick={(e) => { e.stopPropagation(); onSave(problem.id) }} aria-label={saved ? 'Remove from watchlist' : 'Save problem'}><Icon name="bookmark" /></button></div><h3>{problem.title}</h3><p>{problem.summary}</p><div className="tag-list">{problem.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div><div className="card-footer"><div className="author"><Avatar initials={problem.initials} color={problem.accent} size="sm" /><span>{problem.author}</span></div><div className="card-metrics"><span>↑ {problem.votes}</span><span>◌ {problem.watchers}</span></div></div>{featured && <div className="card-location">◉ {problem.location}</div>}{onSolve && problem.status !== 'Solved' && <button className="card-solve-button" onClick={(e) => { e.stopPropagation(); onSolve(problem) }}><Icon name="spark" /> Solve this problem</button>}</article>
}

function ProblemRow({ problem, onOpen }: { problem: Problem; onOpen: (p: Problem) => void }) {
  return <button className="problem-row" onClick={() => onOpen(problem)}><span className="row-number">0{problem.id}</span><div><div className="row-title">{problem.title}</div><span className="row-meta">{problem.category} · {problem.location}</span></div><span className={`status-dot ${problem.status.toLowerCase().replace(' ', '-')}`} /><Icon name="arrow" /></button>
}

function ProblemDetail({ problem, saved, voted, onBack, onSave, onVote, onCreate, onSolve, notify }: { problem: Problem; saved: boolean; voted: boolean; onBack: () => void; onSave: () => void; onVote: () => void; onCreate: () => void; onSolve: () => void; notify: (message: string) => void }) {
  const [comment, setComment] = useState('')
  return <div className="page detail-page"><button className="back-button" onClick={onBack}>← Back to explore</button><div className="detail-layout"><article className="detail-main"><div className="detail-kicker"><span className={`topic-pill ${problem.category.toLowerCase()}`}>{problem.category}</span><span className={`status-label ${problem.status.toLowerCase().replace(' ', '-')}`}><span /> {problem.status}</span><span>·</span><span>{problem.created}</span></div><h1>{problem.title}</h1><p className="detail-summary">{problem.summary}</p><div className="detail-author"><Avatar initials={problem.initials} color={problem.accent} /><div><strong>{problem.author}</strong><span>Problem author · {problem.location}</span></div><button className="outline-button follow-author" onClick={() => notify('You are now following this person')}>Follow</button></div><div className="prose"><p>{problem.description}</p><h3>What a good next step might look like</h3><p>We’re not looking for a perfect answer yet. Add a lived experience, a useful connection, or a small experiment that helps this question become more specific.</p></div><div className="detail-actions"><button className={`support-button ${voted ? 'supported' : ''}`} onClick={onVote}><span>↑</span> {voted ? 'Supported' : 'Support'} <b>{problem.votes}</b></button><button className={`outline-button ${saved ? 'saved-outline' : ''}`} onClick={onSave}><Icon name="bookmark" /> {saved ? 'Watching' : 'Watch problem'}</button><button className="icon-button" onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => notify('Link copied to clipboard'))}><span>↗</span></button></div><div className="conversation"><div className="section-heading"><div><p className="kicker">The conversation</p><h2>Make it more useful</h2></div><span className="comment-count">{problem.updates.length + 8} contributions</span></div><div className="comment-compose"><Avatar initials="RK" color="#ffd26e" /><div><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add context, a question, or a small idea..." rows={3} /><div className="compose-bottom"><span>Be specific. Be generous.</span><button className="primary-button small" disabled={!comment.trim()} onClick={() => { setComment(''); notify('Your contribution was added') }}>Share contribution <Icon name="send" /></button></div></div></div><Comment initials="JB" color="#ffd26e" name="Jon Bell" time="Yesterday" text="I’ve seen this too. The drop-off point near Division is technically close, but the opening hours make it impossible for people working late." /><Comment initials="AO" color="#c8b6ff" name="Amara Okafor" time="Yesterday" text="Could a shared neighborhood steward model work here? Happy to help test with two apartment buildings." /></div></article><aside className="detail-aside"><div className="aside-card"><p className="kicker">Want to help?</p><h3>Bring your perspective.</h3><p>The strongest progress starts with a detail only you noticed.</p><button className="primary-button full" onClick={() => document.querySelector<HTMLTextAreaElement>('.comment-compose textarea')?.focus()}>Add your voice <Icon name="arrow" /></button></div><div className="aside-card updates-card"><div className="aside-title"><h3>Recent movement</h3><span>↗</span></div>{problem.updates.map((update) => <div className="update-item" key={update}><span className="update-line" /><div><strong>{update}</strong><span>In this problem</span></div></div>)}<button className="link-button" onClick={() => notify('You will get updates for this problem')}>See all activity <Icon name="arrow" /></button></div><button className="quiet-invite" onClick={onCreate}><Icon name="plus" /><span><strong>Know a problem like this?</strong><small>Start a new thread</small></span><Icon name="arrow" /></button></aside></div></div>
}

function Comment({ initials, color, name, time, text }: { initials: string; color: string; name: string; time: string; text: string }) {
  return <div className="comment"><Avatar initials={initials} color={color} /><div><div className="comment-meta"><strong>{name}</strong><span>{time}</span></div><p>{text}</p><button className="comment-action">↩ Reply</button><button className="comment-action">♡ Support</button></div></div>
}

function SolveHub({ problems, onSolve }: { problems: Problem[]; onSolve: (problem: Problem) => void }) {
  return <div className="page solve-hub"><div className="page-header"><div><p className="kicker">Make progress together</p><h1>Find a problem to solve</h1><p className="page-subtitle">Bring your skills, evidence, and curiosity. Scout will help turn each thread into a practical plan.</p></div><span className="solve-stat"><strong>{problems.length}</strong> active opportunities</span></div><div className="solve-banner"><div><span className="scout-orb"><Icon name="spark" /></span></div><div><h2>Solving is a team sport</h2><p>Choose a real problem, add your perspective, attach evidence, and work with the author toward a tested solution.</p></div></div><div className="solve-opportunity-grid">{problems.map((problem) => <article className="solve-opportunity" key={problem.id}><div className="card-top"><span className={`topic-pill ${problem.category.toLowerCase()}`}>{problem.category}</span><span className={`status-label ${problem.status.toLowerCase().replace(' ', '-')}`}><span /> {problem.status}</span></div><h3>{problem.title}</h3><p>{problem.summary}</p><div className="solve-opportunity-footer"><span>{problem.location} · {problem.watchers} watching</span><button className="primary-button small" onClick={() => onSolve(problem)}>Open solve workspace <Icon name="arrow" /></button></div></article>)}</div></div>
}

function Following({ problems, onOpen, onExplore, onSave }: { problems: Problem[]; onOpen: (p: Problem) => void; onExplore: () => void; onSave: (id: number) => void }) {
  return <div className="page"><div className="page-header"><div><p className="kicker">Your orbit</p><h1>Following</h1><p className="page-subtitle">Threads you chose to keep close.</p></div></div>{problems.length ? <div className="problem-grid">{problems.map((p) => <ProblemCard key={p.id} problem={p} saved onOpen={onOpen} onSave={onSave} />)}</div> : <EmptyState search="your watchlist" onClear={onExplore} onCreate={onExplore} />}</div>
}

function EmptyState({ search, onClear, onCreate }: { search: string; onClear: () => void; onCreate: () => void }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="compass" /></span><h2>Nothing here yet</h2><p>We couldn’t find a problem matching “{search}”. Try a broader search or start the conversation yourself.</p><div><button className="outline-button" onClick={onClear}>Clear filters</button><button className="primary-button" onClick={onCreate}>Post a problem <Icon name="plus" /></button></div></div>
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Problem) => void }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [cat, setCat] = useState('Community')
  const [location, setLocation] = useState('My neighborhood')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) return
    onCreate({ id: Date.now(), title: title.trim(), summary: summary.trim(), description: summary.trim(), category: cat, location, status: 'Open', tags: [cat.toLowerCase(), 'new perspective'], author: 'Riley Kim', initials: 'RK', accent: '#ffd26e', votes: 1, watchers: 0, created: 'just now', updates: ['You opened this question'] })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal-card"><div className="modal-header"><div><p className="kicker">Open a new thread</p><h2>What feels unsolved?</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><p className="modal-intro">Good problems are specific enough to picture and open enough to explore. You don’t need the answer yet.</p><form onSubmit={submit}><label>Give it a clear headline<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How might we..." maxLength={100} /></label><label>Tell us what you’re noticing<textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Share the friction, who experiences it, and why it matters." rows={4} maxLength={280} /><span className="char-count">{summary.length}/280</span></label><div className="form-row"><label>Topic<select value={cat} onChange={(e) => setCat(e.target.value)}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></label><label>Where is this happening?<input value={location} onChange={(e) => setLocation(e.target.value)} /></label></div><div className="modal-footer"><span>Posting as <strong>Riley Kim</strong></span><button type="submit" className="primary-button" disabled={!title.trim() || !summary.trim()}>Publish problem <Icon name="arrow" /></button></div></form></div></div>
}

function EnhancedCreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: Problem) => void }) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [cat, setCat] = useState('Community')
  const [location, setLocation] = useState('My neighborhood')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [refined, setRefined] = useState(false)
  const refine = () => {
    if (!summary.trim()) return
    setSummary(`People in ${location || 'this community'} are experiencing this recurring challenge: ${summary.trim()} The impact is meaningful, and we are looking for practical, testable ways to improve the situation.`)
    setRefined(true)
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) return
    onCreate({ id: Date.now(), title: title.trim(), summary: summary.trim(), description: summary.trim(), category: cat, location, attachments, status: 'Open', tags: [cat.toLowerCase(), 'new perspective'], author: 'Riley Kim', initials: 'RK', accent: '#ffd26e', votes: 1, watchers: 0, created: 'just now', updates: ['You opened this question'] })
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="modal-card"><div className="modal-header"><div><p className="kicker">Open a new thread</p><h2>What feels unsolved?</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><p className="modal-intro">Describe it naturally. Scout can turn your first thought into a clear, useful problem brief.</p><form onSubmit={submit}><label>Give it a clear headline<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How might we..." maxLength={100} /></label><label>Tell us what you’re noticing<textarea value={summary} onChange={(e) => { setSummary(e.target.value); setRefined(false) }} placeholder="Explain the friction in your own words." rows={4} maxLength={600} /><span className="char-count">{summary.length}/600</span></label><button type="button" className="ai-refine-button" onClick={refine}><Icon name="spark" /> {refined ? 'Refined by Scout' : 'Refine with Scout AI'}</button><div className="form-row"><label>Topic<select value={cat} onChange={(e) => setCat(e.target.value)}>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></label><label>Where is this happening?<input value={location} onChange={(e) => setLocation(e.target.value)} /></label></div><label className="file-drop">Add photos and videos to describe the problem <span>Show the context, condition, or moment where the problem happens</span><input type="file" multiple accept="image/*,video/*" onChange={(e) => setAttachments(Array.from(e.target.files || []).map((file) => ({ name: file.name, type: file.type || 'media', size: file.size })))} />{attachments.length > 0 && <small>{attachments.length} file{attachments.length === 1 ? '' : 's'} ready to attach</small>}</label><div className="modal-footer"><span>Posting as <strong>Riley Kim</strong></span><button type="submit" className="primary-button" disabled={!title.trim() || !summary.trim()}>Publish problem <Icon name="arrow" /></button></div></form></div></div>
}

function SolveWorkspace({ problem, onClose, notify }: { problem: Problem; onClose: () => void; notify: (message: string) => void }) {
  const [files, setFiles] = useStored<Attachment[]>(`unsolved-solve-files-${problem.id}`, problem.attachments || [])
  const [repo, setRepo] = useStored<string>(`unsolved-solve-repo-${problem.id}`, problem.repository || '')
  const [solution, setSolution] = useStored<string>(`unsolved-solution-draft-${problem.id}`, '')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['I have the problem context. Share your constraints, files, or current approach and I will help you break this into testable steps.'])
  const ask = (e: FormEvent) => { e.preventDefault(); if (!message.trim()) return; setMessages((old) => [...old, `You: ${message.trim()}`, 'Scout: Start by turning this into a small experiment. I suggest documenting the current workflow, choosing one measurable outcome, and testing with two real users.']); setMessage('') }
  return <div className="modal-backdrop"><div className="solve-card"><div className="modal-header"><div><p className="kicker">Collaboration workspace</p><h2>Solve this problem</h2><p className="solve-problem-title">{problem.title}</p></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><div className="solution-draft"><div><p className="kicker">Your solution draft</p><h3>Describe how this problem could be solved</h3><p>Capture your approach, assumptions, steps, and expected outcome. Your draft saves automatically.</p></div><textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Describe the proposed solution in detail..." rows={6} /><span className="draft-status">{solution ? 'Draft saved locally' : 'Start writing to create a draft'}</span></div><div className="solve-grid"><section><div className="solve-section"><h3>Project evidence</h3><p>Add the context your team needs to make progress.</p><label className="file-drop">Add photos, videos, CAD, PDFs, or code files<input type="file" multiple accept="image/*,video/*,.pdf,.cad,.step,.stp,.stl,.obj,.zip,.txt" onChange={(e) => setFiles((old) => [...old, ...Array.from(e.target.files || []).map((file) => ({ name: file.name, type: file.type || 'project file', size: file.size }))])} />{files.length > 0 && <div className="attachment-list">{files.map((file) => <span key={`${file.name}-${file.size}`}>◻ {file.name}</span>)}</div>}</label><label>Git repository<input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/..." type="url" /></label><button className="primary-button" onClick={() => notify('Workspace context saved for your team')}><Icon name="check" /> Save workspace</button></div></section><section className="solve-ai"><div className="solve-ai-head"><span className="scout-orb"><Icon name="spark" /></span><div><h3>Scout AI mentor</h3><p>Context-aware guidance, not a black-box answer.</p></div></div><div className="solve-chat">{messages.map((item, index) => <div className={item.startsWith('You:') ? 'assistant-message user-message' : 'assistant-message'} key={`${item}-${index}`}>{item}</div>)}</div><form className="assistant-input" onSubmit={ask}><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about the next step..." /><button type="submit"><Icon name="send" /></button></form></section></div></div></div>
}

function Assistant({ onClose, onNavigate }: { onClose: () => void; onNavigate: (term: string) => void }) {
  const [input, setInput] = useState('')
  const [asked, setAsked] = useState(false)
  const submit = (e: FormEvent) => { e.preventDefault(); if (input.trim()) setAsked(true) }
  return <div className="assistant-panel"><div className="assistant-head"><div><span className="scout-orb"><Icon name="spark" /></span><div><strong>Scout</strong><span>Your thoughtful co-pilot</span></div></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><div className="assistant-body">{!asked ? <><p className="assistant-greeting">Hi Riley. What are you curious about today?</p><p className="assistant-muted">I can help you find a thread, make an idea more specific, or spot the next useful step.</p><div className="suggestion-list"><button onClick={() => onNavigate('climate')}>Find problems about climate <Icon name="arrow" /></button><button onClick={() => onNavigate('my city')}>What is my city noticing? <Icon name="arrow" /></button><button onClick={() => setInput('Help me sharpen a problem')} >Help me sharpen a problem <Icon name="arrow" /></button></div></> : <><div className="assistant-message user-message">{input}</div><div className="assistant-message"><strong>A useful place to start:</strong><p>Try naming the person who feels this friction most often, then describe the moment it shows up. Specific details help the right people recognize themselves in the problem.</p><button className="link-button" onClick={() => onNavigate(input)}>Explore related threads <Icon name="arrow" /></button></div></>}</div><form className="assistant-input" onSubmit={submit}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Scout anything..." /><button type="submit" aria-label="Send"><Icon name="send" /></button></form></div>
}

function Messages({ notify }: { notify: (message: string) => void }) {
  const [active, setActive] = useState(0)
  const threads = [{ person: 'Amara Okafor', initials: 'AO', color: '#c8b6ff', preview: 'I added the notes from our listening walk…', time: '9:42 AM', unread: 2 }, { person: 'Jon Bell', initials: 'JB', color: '#ffd26e', preview: 'The route map is ready for a second look.', time: 'Yesterday', unread: 1 }, { person: 'Compost working group', initials: 'CW', color: '#b7f36b', preview: 'Maya: Welcome, Riley! 🌱', time: 'Tue', unread: 0 }]
  return <div className="page messages-page"><div className="page-header"><div><p className="kicker">Keep the thread going</p><h1>Messages</h1></div><button className="primary-button" onClick={() => notify('New conversation started')}> <Icon name="plus" /> New message</button></div><div className="messages-layout"><div className="thread-list">{threads.map((t, i) => <button className={`thread-row ${active === i ? 'active' : ''}`} onClick={() => setActive(i)} key={t.person}><Avatar initials={t.initials} color={t.color} /><div><strong>{t.person}</strong><p>{t.preview}</p></div><div className="thread-time">{t.time}{t.unread ? <em>{t.unread}</em> : null}</div></button>)}</div><div className="chat-window"><div className="chat-header"><Avatar initials={threads[active].initials} color={threads[active].color} /><div><strong>{threads[active].person}</strong><span>Working on a better question</span></div></div><div className="chat-messages"><div className="chat-day">TODAY</div><div className="bubble received">Hey Riley — thanks for joining this thread. Your note about the late pickup was exactly the detail we were missing.<span>9:31 AM</span></div><div className="bubble sent">Happy to help. I can ask two neighbors about their current routine this week.</div><div className="bubble received">That would be wonderful. No need to solve it yet — just help us see it clearly. 🌱<span>9:42 AM</span></div></div><form className="chat-compose" onSubmit={(e) => { e.preventDefault(); notify('Message sent') }}><input placeholder="Write a message..." /><button className="primary-button" type="submit"><Icon name="send" /></button></form></div></div></div>
}

function Notifications({ onOpen }: { onOpen: (p: Problem) => void }) {
  return <div className="page notifications-page"><div className="page-header"><div><p className="kicker">Stay in the loop</p><h1>Notifications</h1></div><button className="link-button">Mark all as read</button></div><div className="notification-list"><NotificationItem icon="↑" title="Your support made a difference" text="“How might we make neighborhood composting effortless?” reached 184 supporters." time="12 min ago" unread onClick={() => onOpen(starterProblems[0])} /><NotificationItem icon="✦" title="Amara replied to your contribution" text="“A softer landing for students who move schools” has a new perspective." time="2 hours ago" unread /><NotificationItem icon="↗" title="Jon invited you to collaborate" text="Join the late-night mobility working group." time="Yesterday" unread /><NotificationItem icon="◌" title="A problem you watch is moving" text="The local health resources pilot shared an impact report." time="3 days ago" onClick={() => onOpen(starterProblems[3])} /></div></div>
}

function NotificationItem({ icon, title, text, time, unread, onClick }: { icon: string; title: string; text: string; time: string; unread?: boolean; onClick?: () => void }) {
  return <button className={`notification-item ${unread ? 'unread' : ''}`} onClick={onClick}><span className="notification-icon">{icon}</span><div><strong>{title}</strong><p>{text}</p><span>{time}</span></div>{unread && <i />}</button>
}

function Profile({ problems, saved, onOpen, onExplore }: { problems: Problem[]; saved: number[]; onOpen: (p: Problem) => void; onExplore: () => void }) {
  return <div className="page profile-page"><section className="profile-hero"><div className="profile-cover" /><div className="profile-content"><Avatar initials="RK" color="#ffd26e" size="lg" /><div className="profile-name"><h1>Riley Kim</h1><p>@rileykim · Explorer, listener, occasional soup-maker</p><span>📍 Oakland, CA · Joined April 2024</span></div><button className="outline-button">Edit profile</button></div></section><div className="profile-grid"><div><div className="profile-stats"><div><strong>120</strong><span>points</span></div><div><strong>8</strong><span>contributions</span></div><div><strong>6</strong><span>watching</span></div><div><strong>3</strong><span>collaborations</span></div></div><section className="profile-section"><div className="section-heading"><div><p className="kicker">Your activity</p><h2>Contributions</h2></div></div><div className="activity-card"><span className="activity-icon">↑</span><div><strong>You supported “How might we make neighborhood composting effortless?”</strong><span>2 days ago · +2 points</span></div></div><div className="activity-card"><span className="activity-icon">✦</span><div><strong>You joined the late-night mobility working group</strong><span>5 days ago · +10 points</span></div></div></section></div><aside className="profile-side"><div className="profile-side-card"><p className="kicker">Your watchlist</p><h3>{saved.length} problems close to you</h3><div className="watch-mini">{problems.filter((p) => saved.includes(p.id)).slice(0, 3).map((p) => <button key={p.id} onClick={() => onOpen(p)}><span style={{ background: p.accent }} />{p.title}</button>)}</div><button className="link-button" onClick={onExplore}>Browse more <Icon name="arrow" /></button></div><div className="profile-side-card points-card"><span className="scout-orb"><Icon name="spark" /></span><h3>Keep showing up</h3><p>One more thoughtful contribution unlocks your “Good question” badge.</p><div className="progress"><span style={{ width: '72%' }} /></div><small>8 of 10 contributions</small></div></aside></div></div>
}

function Leaderboard() {
  return <div className="page leaderboard-page"><div className="page-header"><div><p className="kicker">People-powered progress</p><h1>Leaderboard</h1><p className="page-subtitle">Recognition for the people who make questions more useful.</p></div><button className="outline-button">This month⌄</button></div><div className="leader-hero"><div className="podium second"><Avatar initials="JB" color="#ffd26e" size="lg" /><span>2</span><strong>Jon Bell</strong><small>2,210 pts</small></div><div className="podium first"><div className="crown">✦</div><Avatar initials="MC" color="#b7f36b" size="lg" /><span>1</span><strong>Maya Chen</strong><small>2,840 pts</small></div><div className="podium third"><Avatar initials="AO" color="#c8b6ff" size="lg" /><span>3</span><strong>Amara Okafor</strong><small>1,980 pts</small></div></div><div className="leader-table">{people.map((p, i) => <div className="leader-row" key={p.name}><span className="leader-rank">{i + 1}</span><Avatar initials={p.initials} color={p.color} /><div><strong>{p.name}</strong><span>{p.role}</span></div><b>{p.points.toLocaleString()} <small>pts</small></b><span className="trend">↗ {i === 0 ? 12 : i === 1 ? 8 : 5}</span></div>)}</div></div>
}
