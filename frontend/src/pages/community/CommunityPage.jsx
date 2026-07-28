import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bell, Bookmark, BriefcaseBusiness, ChevronRight, Clock3,
  FileText, Flag, Heart, LayoutDashboard, Menu, MessageCircle,
  Paperclip, Search, Send, Settings, Share2, ShieldCheck, Sparkles, TrendingUp,
  UserRound, Users, X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import './CommunityPage.css';

const POSTS = [
  { id: 'salary-negotiation', initials: 'SJ', author: 'Sarah Jenkins', role: 'Senior Marketing Manager', time: '2 hours ago', category: 'Career Growth', pinned: true, title: 'How I negotiated a 30% increase in my base salary', excerpt: 'Salary negotiation can be the most stressful part of hiring. Here are the scripts, market research, and practical lessons that helped me prepare.', likes: 245, comments: 42 },
  { id: 'react-performance', initials: 'AJ', author: 'Alex Johnson', role: 'Senior Full Stack Engineer', time: '5 hours ago', category: 'Engineering', title: 'Optimizing React performance in large-scale applications', excerpt: 'A practical guide to memoization, virtualization, and the performance measurements that actually moved the needle for our team.', likes: 128, comments: 89 },
  { id: 'career-manager', initials: 'MT', author: 'Marcus Thorne', role: 'Project Director', time: '8 hours ago', category: 'Management', title: "The shift from IC to manager: what they don't tell you", excerpt: "Moving into management is a career change. Your success becomes the multiplication of your team's output, not only your own.", likes: 562, comments: 112 },
  { id: 'job-referrals', initials: 'ER', author: 'Elena Rodriguez', role: 'Product Designer', time: '1 day ago', category: 'Job Referrals', title: 'Referring five junior designers for open fintech roles', excerpt: 'Our design team is expanding. Share a portfolio with two strong case studies and I will review it for an internal referral.', likes: 319, comments: 156 }
];

const TOPICS = ['Career Growth', 'Interview Prep', 'Salary Negotiation', 'Work-Life Balance'];
const CATEGORIES = ['Announcements', 'Job Referrals', 'Tech Stack Q&A', 'Success Stories', 'Mental Health'];

function roleInfo(user) {
  const role = (user?.role || 'candidate').toLowerCase();
  if (role.includes('recruit')) return { role: 'Recruiter', home: '/recruiter/dashboard', settings: '/recruiter/settings' };
  if (role.includes('admin')) return { role: 'Admin', home: '/admin/dashboard', settings: '/admin/settings' };
  return { role: 'Candidate', home: '/candidate/profile', settings: '/candidate/settings' };
}

function CommunityShell({ children, title = 'Community', action }) {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const info = roleInfo(user);
  const name = user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Alex Johnson';
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const primary = info.role === 'Recruiter'
    ? [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/recruiter/dashboard' },
        { label: 'Job vacancies', icon: BriefcaseBusiness, to: '/recruiter/vacancies' },
        { label: 'Applicants', icon: Users, to: '/recruiter/applicants/all' }
      ]
    : info.role === 'Admin'
      ? [
          { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
          { label: 'Users', icon: Users, to: '/admin/users' },
          { label: 'Community mod.', icon: ShieldCheck, to: '/admin/community-mod' }
        ]
      : [
          { label: 'Dashboard', icon: LayoutDashboard, to: '/candidate/profile' },
          { label: 'Find jobs', icon: Search, to: '/candidate/jobs' },
          { label: 'My applications', icon: FileText, to: '/candidate/applications' }
        ];

  return (
    <div className="community-shell">
      {menuOpen && <button className="community-overlay" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <aside className={`community-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="community-brand"><span className="community-brand-mark" aria-hidden="true">IH</span><span>IntelliHire</span><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
        <nav>
          {primary.map(({ label, icon: Icon, to }) => <Link key={to} to={to}><Icon size={18}/><span>{label}</span></Link>)}
          <Link className="is-active" to="/community"><MessageCircle size={18}/><span>Community</span></Link>
          <Link to="/community/saved"><Bookmark size={18}/><span>Saved posts</span></Link>
          {info.role !== 'Admin' && <Link to="/community/profile/alex-johnson"><UserRound size={18}/><span>My community profile</span></Link>}
        </nav>
        <div className="community-sidebar-footer"><Link to={info.settings}><Settings size={18}/><span>Settings</span></Link></div>
      </aside>
      <div className="community-workspace">
        <header className="community-topbar">
          <button className="community-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21}/></button>
          <div className="community-crumbs"><Link className="community-system-name" to={info.home}>IntelliHire</Link><ChevronRight size={15}/><Link to="/community">Community</Link>{title !== 'Community' && <><ChevronRight size={15}/><span>{title}</span></>}</div>
          <div className="community-top-actions">
            {action}
            <button className="community-icon-button" aria-label="Notifications"><Bell size={19}/><i/></button>
            <Link className="community-user" to="/community/profile/alex-johnson"><span><strong>{name}</strong><small>{info.role}</small></span><b>{initials || 'AJ'}</b></Link>
          </div>
        </header>
        <main className="community-main" data-path={location.pathname}>{children}</main>
      </div>
    </div>
  );
}

function PostCard({ post, saved, onSave }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="forum-card post-card">
      <div className="post-author-row">
        <Link className="avatar" to={`/community/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}>{post.initials}</Link>
        <div><Link to={`/community/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}><strong>{post.author}</strong></Link><small>{post.role} · {post.time}</small></div>
        <span className="category-pill">{post.category}</span>
        {post.pinned && <span className="pin-pill">Pinned</span>}
      </div>
      <Link to={`/community/post/${post.id}`} className="post-copy"><h2>{post.title}</h2><p>{post.excerpt}</p></Link>
      <div className="post-actions">
        <button className={liked ? 'is-selected' : ''} onClick={() => setLiked(!liked)}><Heart size={17}/>{post.likes + (liked ? 1 : 0)}</button>
        <Link to={`/community/post/${post.id}`}><MessageCircle size={17}/>{post.comments}</Link>
        <button><Share2 size={17}/>Share</button>
        <button className={saved ? 'is-selected save-action' : 'save-action'} onClick={onSave}><Bookmark size={17}/>Save</button>
      </div>
    </article>
  );
}

export function CommunityPage() {
  const [tab, setTab] = useState('Trending');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('community_saved') || '{}'));
  const filtered = useMemo(() => POSTS.filter((post) =>
    (topic === 'All topics' || post.category === topic) &&
    `${post.title} ${post.excerpt} ${post.author}`.toLowerCase().includes(query.toLowerCase())
  ), [query, topic]);
  const toggleSave = (id) => {
    const next = { ...saved, [id]: !saved[id] };
    setSaved(next); localStorage.setItem('community_saved', JSON.stringify(next));
  };

  return (
    <CommunityShell action={<Link className="button primary compact" to="/community/new">Create post</Link>}>
      <section className="community-hero">
        <div><span className="eyebrow">IntelliHire community</span><h1>Grow your career, together.</h1><p>Ask better questions, trade real-world experience, and meet people building meaningful careers through IntelliHire.</p><div className="hero-buttons"><Link className="button primary" to="/community/new">Start a discussion</Link><Link className="button secondary" to="/community/guidelines">View guidelines</Link></div></div>
        <div className="hero-art"><Sparkles/><b>12,500+</b><span>helpful discussions</span></div>
      </section>
      <div className="community-grid">
        <aside className="forum-left">
          <label className="forum-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search discussions"/></label>
          <section className="forum-card side-card"><h3><TrendingUp size={17}/>Popular topics</h3>{['All topics', ...TOPICS].map((item) => <button key={item} className={topic === item ? 'is-active' : ''} onClick={() => setTopic(item)}>{item}<span>›</span></button>)}</section>
          <section className="forum-card community-pulse"><h3>Community pulse</h3><p><span>Active now</span><strong>1,429</strong></p><p><span>Total discussions</span><strong>12.5k</strong></p><p><span>Experts online</span><strong>84</strong></p></section>
        </aside>
        <section className="forum-feed">
          <div className="feed-tabs">{['Trending', 'Latest', 'Top rated'].map((item) => <button className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
          {filtered.length ? filtered.map((post) => <PostCard key={post.id} post={post} saved={saved[post.id]} onSave={() => toggleSave(post.id)}/>) : <div className="forum-card empty-state"><Search/><h2>No discussions found</h2><p>Try another search or topic.</p></div>}
        </section>
        <aside className="forum-right">
          <section className="forum-card question-card"><MessageCircle/><h3>Have a question?</h3><p>Start a discussion and get practical answers from the community.</p><Link className="button primary" to="/community/new">Create new thread</Link></section>
          <section className="forum-card"><h3>Trending right now</h3>{POSTS.slice(0, 3).map((post, index) => <Link className="trend-row" to={`/community/post/${post.id}`} key={post.id}><b>#{index + 1}</b><span>{post.title}<small>{post.comments} replies</small></span></Link>)}</section>
          <section className="forum-card expert-card"><span className="avatar">AJ</span><div><small>Expert spotlight</small><h3>Alex Johnson</h3><p>Frontend systems and career mentoring</p></div><Link to="/community/profile/alex-johnson">View profile</Link></section>
        </aside>
      </div>
    </CommunityShell>
  );
}

export function CreateDiscussionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Career Growth');
  const publish = (e) => { e.preventDefault(); if (title.trim() && body.trim()) navigate('/community/post/react-performance'); };
  return (
    <CommunityShell title="Create discussion">
      <div className="page-heading"><div><span className="eyebrow">Share your experience</span><h1>Create a new discussion</h1><p>Clear, specific questions receive the most helpful answers.</p></div></div>
      <form className="editor-grid" onSubmit={publish}>
        <section className="forum-card editor-card"><h2><FileText/>Post content</h2><label>Post title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What would you like to discuss?" maxLength="120"/><small>{title.length}/120 characters</small></label><label>Detailed description<textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add context, what you have tried, and the outcome you are looking for..." rows="13"/><small>Markdown supported</small></label><div className="attachment-box"><Paperclip/><span><strong>Add supporting files</strong><small>PDF, PNG or JPG · up to 10 MB</small></span><button type="button" className="button secondary">Browse</button></div></section>
        <aside><section className="forum-card category-card"><h2>Discussion category</h2>{['Career Growth', 'Interview Prep', 'Industry News', 'Negotiation', 'Tech Stack Q&A'].map((item) => <label className={category === item ? 'is-selected' : ''} key={item}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)}/><span><strong>{item}</strong><small>{item === 'Interview Prep' ? 'Technical and behavioral interview strategies' : 'Professional insights and community advice'}</small></span></label>)}</section><section className="forum-card guidelines-summary"><h3><ShieldCheck/>Before you post</h3><p>Be professional, search first, protect private information, and use the most relevant category.</p><Link to="/community/guidelines">Read full guidelines</Link></section><button className="button primary publish-button" disabled={!title.trim() || !body.trim()}><Send size={17}/>Publish discussion</button></aside>
      </form>
    </CommunityShell>
  );
}

export function DiscussionPage() {
  const { postId } = useParams();
  const post = POSTS.find((item) => item.id === postId) || POSTS[1];
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { initials: 'SM', name: 'Sarah Miller', role: 'Software Architect', time: '2 hours ago', text: 'Great breakdown. Measuring the user-facing outcome before choosing an optimization has saved our team months of unnecessary refactoring.', likes: 24 },
    { initials: 'MC', name: 'Marcus Chen', role: 'DevOps Engineer', time: '5 hours ago', text: 'I would add observability from day one. Performance work is much easier when traces make the actual bottleneck visible.', likes: 18 }
  ]);
  const addComment = () => { if (!comment.trim()) return; setComments([{ initials: 'AJ', name: 'Alex Johnson', role: 'Community member', time: 'Just now', text: comment, likes: 0 }, ...comments]); setComment(''); };
  return (
    <CommunityShell title="Discussion">
      <Link className="back-link" to="/community"><ArrowLeft size={17}/>Back to community</Link>
      <div className="discussion-layout">
        <article>
          <header className="discussion-header"><span className="category-pill">{post.category}</span><h1>{post.title}</h1><div className="post-author-row"><span className="avatar">{post.initials}</span><div><strong>{post.author}</strong><small>{post.role} · {post.time}</small></div></div></header>
          <section className="forum-card article-body"><p>When systems and careers grow, intuition is no longer enough. The most useful improvements begin with a clear baseline, a shared definition of success, and evidence from real users.</p><h2>Start with the real constraint</h2><p>Before changing tools or architecture, identify the slowest part of the experience. Measure it, document it, and agree on the outcome the team wants to improve.</p><ul><li>Capture a reliable baseline before making changes.</li><li>Prioritize changes users will actually notice.</li><li>Ship in small increments and compare the results.</li><li>Document trade-offs for the next person.</li></ul><div className="article-callout"><Sparkles/><p><strong>Community takeaway</strong><br/>Good advice includes context. Share what worked, what did not, and the constraints behind your choice.</p></div><p>What approaches have worked for your team? I would especially like to hear how you balance short-term delivery with long-term maintainability.</p><div className="article-actions"><button><Heart size={18}/>{post.likes} Upvotes</button><button><MessageCircle size={18}/>{comments.length} Comments</button><button><Flag size={17}/>Report</button></div></section>
          <section className="comments"><h2>Comments <span>{comments.length}</span></h2><div className="forum-card comment-editor"><span className="avatar">AJ</span><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share a constructive thought..." rows="3"/><button className="button primary" onClick={addComment} disabled={!comment.trim()}>Post comment</button></div>{comments.map((item, index) => <article className="comment" key={`${item.name}-${index}`}><span className="avatar">{item.initials}</span><div><p><strong>{item.name}</strong><em>{item.role}</em><small>{item.time}</small></p><div>{item.text}</div><button><Heart size={14}/>{item.likes} upvotes</button></div></article>)}</section>
        </article>
        <aside className="discussion-rail"><section className="forum-card"><h3>Related discussions</h3>{POSTS.filter((item) => item.id !== post.id).slice(0, 3).map((item) => <Link className="related-row" to={`/community/post/${item.id}`} key={item.id}>{item.title}<small>{item.comments} replies</small></Link>)}</section><section className="forum-card"><h3>Popular tags</h3><div className="tag-cloud">{['React', 'Career', 'Architecture', 'Interview', 'Remote work', 'Leadership'].map((tag) => <span key={tag}>#{tag}</span>)}</div></section><section className="moderation-note"><Clock3/><span><strong>Active moderation</strong><small>Typical response in under 15 minutes</small></span></section></aside>
      </div>
    </CommunityShell>
  );
}

export function CommunityProfilePage() {
  const { slug } = useParams();
  const isSelf = !slug || slug === 'alex-johnson';
  return (
    <CommunityShell title="Member profile">
      <section className="profile-cover"><div className="profile-pattern"/><div className="profile-identity"><span className="profile-avatar">AJ<i/></span><div><span className="eyebrow">{isSelf ? 'Your community profile' : 'Community member'}</span><h1>Alex Johnson</h1><p><BriefcaseBusiness size={16}/>Senior Full Stack Engineer · Colombo, Sri Lanka</p></div><button className="button primary">{isSelf ? 'Edit profile' : 'Connect'}</button></div></section>
      <div className="profile-grid"><aside><section className="profile-stats"><div><strong>42</strong><span>Posts</span></div><div><strong>1.2k</strong><span>Upvotes</span></div><div><strong>284</strong><span>Connections</span></div></section><section className="forum-card profile-about"><h2>Professional overview</h2><p>Building scalable web applications and mentoring early-career engineers. Interested in distributed systems, accessible product design, and practical career coaching.</p><h3>Skills & expertise</h3><div className="tag-cloud">{['React', 'TypeScript', 'Node.js', 'System Design', 'AWS'].map((tag) => <span key={tag}>{tag}</span>)}</div></section></aside><section><div className="page-heading compact-heading"><div><span className="eyebrow">Recent contributions</span><h2>Community posts</h2></div></div><div className="profile-post-grid">{POSTS.slice(0, 4).map((post) => <Link className="forum-card profile-post" to={`/community/post/${post.id}`} key={post.id}><span className="category-pill">{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><small><Heart size={15}/>{post.likes}<MessageCircle size={15}/>{post.comments}</small></Link>)}</div></section></div>
    </CommunityShell>
  );
}

export function SavedPostsPage() {
  const saved = JSON.parse(localStorage.getItem('community_saved') || '{}');
  const items = POSTS.filter((post) => saved[post.id]);
  return <CommunityShell title="Saved posts"><div className="page-heading"><div><span className="eyebrow">Your library</span><h1>Saved discussions</h1><p>Keep useful conversations close for when you need them.</p></div></div><div className="saved-list">{items.length ? items.map((post) => <PostCard key={post.id} post={post} saved onSave={() => { const next = { ...saved, [post.id]: false }; localStorage.setItem('community_saved', JSON.stringify(next)); window.location.reload(); }}/>) : <section className="forum-card empty-state"><Bookmark/><h2>No saved posts yet</h2><p>Use the save button on any discussion to add it here.</p><Link className="button primary" to="/community">Explore discussions</Link></section>}</div></CommunityShell>;
}

export function GuidelinesPage() {
  const rules = [
    ['Be useful and professional', 'Write with respect. Challenge ideas with evidence, never attack the person sharing them.'],
    ['Protect privacy', 'Do not post personal contact details, private candidate information, interview content, or confidential company data.'],
    ['Search before posting', 'Check for an existing discussion and add to it when your question is already being answered.'],
    ['Use accurate categories', 'Choose the most relevant category and write a clear title so others can find your discussion.'],
    ['No spam or misleading content', 'Disclose relevant relationships and avoid repetitive promotion, scams, plagiarism, or misinformation.']
  ];
  return <CommunityShell title="Guidelines"><div className="guidelines-hero"><ShieldCheck/><div><span className="eyebrow">Community standards</span><h1>A helpful, safe place for career conversations.</h1><p>These rules apply to candidates, recruiters, and every community contributor.</p></div></div><div className="guidelines-list">{rules.map(([title, copy], index) => <section className="forum-card" key={title}><b>{String(index + 1).padStart(2, '0')}</b><div><h2>{title}</h2><p>{copy}</p></div></section>)}</div><section className="guidelines-footer"><div><h2>See something that breaks these standards?</h2><p>Use “Report” on the discussion. Moderators review reports and keep actions confidential.</p></div><Link className="button primary" to="/community">Return to community</Link></section></CommunityShell>;
}

export default CommunityPage;
