import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Award, BarChart3, Bell, Bold, Bookmark, BriefcaseBusiness, Calendar,
  CheckCircle2, ChevronDown, ChevronRight, Clock3, Edit3, ExternalLink, Eye,
  FileImage, FileText, Flag, Hash, Heart, Info, Italic, Link2,
  List, ListOrdered, MapPin, Menu, MessageCircle, MoreHorizontal, Paperclip,
  Search, Send, Share2, ShieldCheck, Sparkles, TrendingUp, Type,
  UserPlus, X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import RecruiterSidebar from '../../components/common/RecruiterSidebar';
import CandidateSidebar from '../../components/common/CandidateSidebar';
import AdminToast from '../../components/common/AdminToast';
import { CandidatePageContext } from '../candidate/CandidateDashboard/CandidateDashboard';
import {
  getCommunityPosts,
  createCommunityPost,
  submitCommunityReport,
  isPostRemoved
} from '../../services/adminStorage';
import './CommunityPage.css';

const INITIAL_POSTS = [
  { id: 'salary-negotiation', initials: 'SJ', author: 'Sarah Jenkins', role: 'Senior Marketing Manager', time: '2 hours ago', category: 'Career Growth', pinned: true, title: 'How I negotiated a 30% increase in my base salary', excerpt: 'Salary negotiation can be the most stressful part of hiring. Here are the scripts, market research, and practical lessons that helped me prepare.', likes: 245, comments: 42 },
  { id: 'react-performance', initials: 'AJ', author: 'Alex Johnson', role: 'Senior Full Stack Engineer', time: '5 hours ago', category: 'Engineering', title: 'Optimizing React performance in large-scale applications', excerpt: 'A practical guide to memoization, virtualization, and the performance measurements that actually moved the needle for our team.', likes: 128, comments: 89 },
  { id: 'career-manager', initials: 'MT', author: 'Marcus Thorne', role: 'Project Director', time: '8 hours ago', category: 'Management', title: "The shift from IC to manager: what they don't tell you", excerpt: "Moving into management is a career change. Your success becomes the multiplication of your team's output, not only your own.", likes: 562, comments: 112 },
  { id: 'job-referrals', initials: 'ER', author: 'Elena Rodriguez', role: 'Product Designer', time: '1 day ago', category: 'Job Referrals', title: 'Referring five junior designers for open fintech roles', excerpt: 'Our design team is expanding. Share a portfolio with two strong case studies and I will review it for an internal referral.', likes: 319, comments: 156 }
];

const TOPICS = ['Career Growth', 'Interview Prep', 'Salary Negotiation', 'Work-Life Balance'];

function useCommunityBase() {
  const { pathname } = useLocation();
  return pathname.startsWith('/recruiter/community')
    ? '/recruiter/community'
    : '/candidate/community';
}

function readStorage(storage, key, fallback) {
  try {
    const value = storage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Storage fallback
  }
}

function readSavedPosts() {
  try {
    const saved = JSON.parse(readStorage(localStorage, 'community_saved', '{}'));
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function roleInfo(user, roleOverride) {
  const rememberedRole = readStorage(sessionStorage, 'community_account_role', '');
  const role = (roleOverride || user?.role || rememberedRole || 'candidate').toLowerCase();
  if (role.includes('recruit')) return { role: 'Recruiter', home: '/recruiter/dashboard', settings: '/recruiter/settings' };
  if (role.includes('admin')) return { role: 'Admin', home: '/admin/dashboard', settings: '/admin/settings' };
  return { role: 'Candidate', home: '/candidate/profile', settings: '/candidate/settings' };
}

/**
 * ReportPostModal — SCRUM-749 Live Reporting Modal
 */
function ReportPostModal({ item, isOpen, onClose, onReportSuccess }) {
  const { user } = useAuth();
  const [category, setCategory] = useState('Inappropriate');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const categories = [
    { value: 'Spam', label: 'Spam / Commercial Promotion', desc: 'Unsolicited links, promotional material, or repetitive spam.' },
    { value: 'Harassment', label: 'Harassment & Bullying', desc: 'Personal insults, targeted attacks, or hostile remarks.' },
    { value: 'Hate Speech', label: 'Hate Speech & Discrimination', desc: 'Discriminatory language based on identity or background.' },
    { value: 'Inappropriate', label: 'Inappropriate / Unprofessional', desc: 'NSFW content, vulgar language, or unprofessional conduct.' },
    { value: 'Misinformation', label: 'Scam / Phishing / Deceptive Info', desc: 'Fake job offers, phishing attempts, or fraud.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reporterName = user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Community Member';
    
    const report = submitCommunityReport({
      postId: item.id,
      title: item.title || `Reported ${item.type || 'Discussion'}`,
      snippet: item.excerpt || item.snippet || item.text || 'User-reported content',
      content: item.body || item.content || item.excerpt || item.text || 'No extended content provided.',
      category: category,
      reportedBy: reporterName,
      reason: reason,
      severity: severity,
      authorTrust: 65,
      flagMessage: reason ? `Flagged by ${reporterName}: "${reason}"` : `Flagged by ${reporterName} for ${category}`
    });

    setIsSubmitting(false);
    onReportSuccess?.(report);
    onClose();
  };

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal__header">
          <div className="report-modal__title-box">
            <div className="report-modal__alert-icon">
              <Flag size={18} />
            </div>
            <div>
              <h3>Report Discussion to Moderation Queue</h3>
              <p>Reports are forwarded directly to the Admin Moderation Team for review.</p>
            </div>
          </div>
          <button type="button" className="report-modal__close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-modal__body">
          <div className="report-modal__post-preview">
            <span className="report-preview-label">Target Content:</span>
            <h4>{item.title}</h4>
            <p className="report-preview-snippet">{item.excerpt || item.text || item.snippet || 'Discussion content'}</p>
            <div className="report-preview-author">Author: <strong>{item.author || item.name || 'Community Member'}</strong></div>
          </div>

          <div className="report-form-group">
            <label className="report-form-label">Reason for Flagging <span className="req">*</span></label>
            <div className="report-category-list">
              {categories.map((cat) => (
                <label key={cat.value} className={`report-category-card ${category === cat.value ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="reportCategory"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                  />
                  <div className="report-category-details">
                    <strong>{cat.label}</strong>
                    <small>{cat.desc}</small>
                  </div>
                  {category === cat.value && <CheckCircle2 size={16} className="report-category-check" />}
                </label>
              ))}
            </div>
          </div>

          <div className="report-form-group">
            <label className="report-form-label">Urgency / Severity Level</label>
            <select
              className="report-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="Low">Low - Minor Policy Infraction</option>
              <option value="Medium">Medium - Distracting / Inappropriate</option>
              <option value="High">High - Harmful / Scams / Hate Speech</option>
              <option value="Critical">Critical - Immediate Threat / Phishing</option>
            </select>
          </div>

          <div className="report-form-group">
            <label className="report-form-label">Additional Context / Details (Optional)</label>
            <textarea
              className="report-textarea"
              rows="3"
              placeholder="Explain why this content violates community guidelines..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="report-modal__footer">
            <button type="button" className="button secondary compact" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="button primary compact" disabled={isSubmitting}>
              {isSubmitting ? 'Dispatching Report...' : 'Submit to Admin Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommunityShell({ children, title = 'Community', action, roleOverride, toast, onDismissToast }) {
  const { user } = useAuth();
  const location = useLocation();
  const communityBase = useCommunityBase();
  const candidatePage = React.useContext(CandidatePageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const info = roleInfo(user, roleOverride);

  React.useEffect(() => {
    if (roleOverride) {
      writeStorage(sessionStorage, 'community_account_role', roleOverride);
    }
  }, [roleOverride]);

  React.useEffect(() => {
    if (info.role === 'Candidate') {
      candidatePage?.setPageLabel(title === 'Community' ? 'COMMUNITY' : `COMMUNITY / ${title.toUpperCase()}`);
    }
  }, [candidatePage, info.role, title]);

  const fallbackName = info.role === 'Recruiter' ? 'Sarah Parker' : 'Alex Rivera';
  const name = user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || fallbackName;
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  if (info.role === 'Candidate' && candidatePage) {
    return (
      <div className="community-shell community-shell--candidate community-shell--embedded">
        <AdminToast toast={toast} onDismiss={onDismissToast} />
        <main className="community-main" data-path={location.pathname}>{children}</main>
      </div>
    );
  }

  return (
    <div className={`community-shell community-shell--${info.role.toLowerCase()}`}>
      <AdminToast toast={toast} onDismiss={onDismissToast} />
      {info.role === 'Recruiter' ? (
        <RecruiterSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} activeItem="Community" />
      ) : (
        <CandidateSidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={{ ...(user || {}), name }}
        />
      )}
      <div className="community-workspace">
        <header className="community-topbar">
          <button className="community-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21}/></button>
          <div className="community-crumbs"><Link className="community-system-name" to={info.home}>IntelliHire</Link><ChevronRight size={15}/><Link to={info.role === 'Recruiter' ? '/recruiter/community' : '/candidate/community'}>Community</Link>{title !== 'Community' && <><ChevronRight size={15}/><span>{title}</span></>}</div>
          <div className="community-top-actions">
            {action}
            <button className="community-icon-button" aria-label="Notifications"><Bell size={19}/><i/></button>
            <Link className="community-user" to={`${communityBase}/profile/alex-johnson`}><span><strong>{name}</strong><small>{info.role}</small></span><b>{initials || 'AJ'}</b></Link>
          </div>
        </header>
        <main className="community-main" data-path={location.pathname}>{children}</main>
      </div>
    </div>
  );
}

function PostCard({ post, saved, onSave, onReport, isReported }) {
  const [liked, setLiked] = useState(false);
  const communityBase = useCommunityBase();

  return (
    <article className="forum-card post-card">
      <div className="post-author-row">
        <Link className="avatar" to={`${communityBase}/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}>{post.initials}</Link>
        <div>
          <Link to={`${communityBase}/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}><strong>{post.author}</strong></Link>
          <small>{post.role} · {post.time}</small>
        </div>
        <span className="category-pill">{post.category}</span>
        {post.pinned && <span className="pin-pill">Pinned</span>}
      </div>
      <Link to={`${communityBase}/post/${post.id}`} className="post-copy">
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
      </Link>
      <div className="post-actions">
        <button className={liked ? 'is-selected' : ''} onClick={() => setLiked(!liked)}>
          <Heart size={17}/>{post.likes + (liked ? 1 : 0)}
        </button>
        <Link to={`${communityBase}/post/${post.id}`}>
          <MessageCircle size={17}/>{post.comments}
        </Link>
        <button type="button"><Share2 size={17}/>Share</button>
        <button
          type="button"
          onClick={() => onReport?.(post)}
          className={`post-action-flag ${isReported ? 'is-reported' : ''}`}
          title="Report post to moderators"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'none', border: 'none', color: isReported ? '#FF5A65' : '#9599A6' }}
        >
          <Flag size={16} color={isReported ? '#FF5A65' : '#F0B90B'} />
          <span style={{ fontWeight: 600 }}>{isReported ? 'Reported' : 'Report'}</span>
        </button>
        <button className={saved ? 'is-selected save-action' : 'save-action'} onClick={onSave}>
          <Bookmark size={17}/>Save
        </button>
      </div>
    </article>
  );
}

export function CommunityPage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const [tab, setTab] = useState('Trending');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All topics');
  const [saved, setSaved] = useState(readSavedPosts);
  const [posts, setPosts] = useState(() => getCommunityPosts(INITIAL_POSTS));
  const [reportingPost, setReportingPost] = useState(null);
  const [reportedPostIds, setReportedPostIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loaded = getCommunityPosts(INITIAL_POSTS);
    setPosts(loaded.filter(p => !isPostRemoved(p.id)));
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (isPostRemoved(post.id)) return false;
      const matchesTopic = topic === 'All topics' || post.category === topic;
      const matchesQuery = `${post.title} ${post.excerpt} ${post.author}`.toLowerCase().includes(query.toLowerCase());
      return matchesTopic && matchesQuery;
    });
  }, [posts, query, topic]);

  const toggleSave = (id) => {
    const next = { ...saved, [id]: !saved[id] };
    setSaved(next);
    writeStorage(localStorage, 'community_saved', JSON.stringify(next));
  };

  const handleReportSuccess = (report) => {
    setReportedPostIds((prev) => [...prev, report.targetPostId]);
    setToast({
      type: 'success',
      message: `Report #${report.id} submitted. The admin moderation queue has been updated.`
    });
  };

  return (
    <CommunityShell
      roleOverride={roleOverride}
      toast={toast}
      onDismissToast={() => setToast(null)}
      action={<Link className="button primary compact" to={`${communityBase}/new`}>Create post</Link>}
    >
      <section className="community-hero">
        <div>
          <span className="eyebrow">IntelliHire community</span>
          <h1>Grow your career, together.</h1>
          <p>Ask better questions, trade real-world experience, and meet people building meaningful careers through IntelliHire.</p>
          <div className="hero-buttons">
            <Link className="button primary" to={`${communityBase}/new`}>Start a discussion</Link>
            <Link className="button secondary" to={`${communityBase}/guidelines`}>View guidelines</Link>
          </div>
        </div>
        <div className="hero-art"><Sparkles/><b>12,500+</b><span>helpful discussions</span></div>
      </section>

      <div className="community-grid">
        <aside className="forum-left">
          <label className="forum-search">
            <Search size={17}/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search discussions"/>
          </label>
          <section className="forum-card side-card">
            <h3><TrendingUp size={17}/>Popular topics</h3>
            {['All topics', ...TOPICS].map((item) => (
              <button key={item} className={topic === item ? 'is-active' : ''} onClick={() => setTopic(item)}>
                {item}<span>›</span>
              </button>
            ))}
          </section>
          <section className="forum-card community-pulse">
            <h3>Community pulse</h3>
            <p><span>Active now</span><strong>1,429</strong></p>
            <p><span>Total discussions</span><strong>12.5k</strong></p>
            <p><span>Experts online</span><strong>84</strong></p>
          </section>
        </aside>

        <section className="forum-feed">
          <div className="feed-tabs">
            {['Trending', 'Latest', 'Top rated'].map((item) => (
              <button className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          {filtered.length ? (
            filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                saved={saved[post.id]}
                onSave={() => toggleSave(post.id)}
                onReport={(p) => setReportingPost(p)}
                isReported={reportedPostIds.includes(post.id)}
              />
            ))
          ) : (
            <div className="forum-card empty-state">
              <Search/>
              <h2>No discussions found</h2>
              <p>Try another search or topic.</p>
            </div>
          )}
        </section>

        <aside className="forum-right">
          <section className="forum-card question-card">
            <MessageCircle/>
            <h3>Have a question?</h3>
            <p>Start a discussion and get practical answers from the community.</p>
            <Link className="button primary" to={`${communityBase}/new`}>Create new thread</Link>
          </section>
          <section className="forum-card">
            <h3>Trending right now</h3>
            {posts.slice(0, 3).map((post, index) => (
              <Link className="trend-row" to={`${communityBase}/post/${post.id}`} key={post.id}>
                <b>#{index + 1}</b>
                <span>{post.title}<small>{post.comments} replies</small></span>
              </Link>
            ))}
          </section>
          <section className="forum-card expert-card">
            <span className="avatar">AJ</span>
            <div>
              <small>Expert spotlight</small>
              <h3>Alex Johnson</h3>
              <p>Frontend systems and career mentoring</p>
            </div>
            <Link to={`${communityBase}/profile/alex-johnson`}>View profile</Link>
          </section>
        </aside>
      </div>

      <ReportPostModal
        item={reportingPost}
        isOpen={Boolean(reportingPost)}
        onClose={() => setReportingPost(null)}
        onReportSuccess={handleReportSuccess}
      />
    </CommunityShell>
  );
}

export function CreateDiscussionPage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const navigate = useNavigate();
  const { user } = useAuth();
  const info = roleInfo(user, roleOverride);
  const fallbackName = info.role === 'Recruiter' ? 'Sarah Parker' : 'Alex Rivera';
  const name = user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || fallbackName;
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Career Growth');
  const [previewing, setPreviewing] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const categories = [
    ['Career Growth', 'Tips for professional growth and job hunting'],
    ['Interview Prep', 'Technical and behavioral interview strategies'],
    ['Industry News', 'Latest trends in technology and recruitment'],
    ['Negotiation', 'How to handle offer and salary discussions']
  ];

  const publish = (e) => {
    e.preventDefault();
    if (title.trim() && body.trim()) {
      const newPost = createCommunityPost({
        id: `post-${Date.now()}`,
        title: title.trim(),
        body: body.trim(),
        excerpt: body.trim().slice(0, 140) + '...',
        category: category,
        author: name,
        role: info.role === 'Recruiter' ? 'Senior Talent Partner' : 'Software Engineer',
        initials: initials || 'ME',
      });
      navigate(`${communityBase}/post/${newPost.id}`);
    }
  };

  return (
    <CommunityShell title="Create discussion" roleOverride={roleOverride}>
      <div className="create-discussion-heading">
        <div>
          <h1>Create New Discussion</h1>
          <p>Share your insights and connect with the IntelliHire professional community.</p>
        </div>
        <div className="create-heading-actions">
          <button
            type="button"
            className={`button preview-button ${previewing ? 'is-active' : ''}`}
            onClick={() => setPreviewing(!previewing)}
          >
            <Eye size={17}/>{previewing ? 'Edit Post' : 'Live Preview'}
          </button>
          <button
            type="submit"
            form="create-discussion-form"
            className="button primary"
            disabled={!title.trim() || !body.trim()}
          >
            <Send size={17}/>Publish Post
          </button>
        </div>
      </div>

      <form id="create-discussion-form" className="editor-grid create-discussion-grid" onSubmit={publish}>
        <div className="create-discussion-main">
          <section className="forum-card editor-card">
            <h2><Type/>Post Content</h2>
            {!previewing ? (
              <>
                <label>
                  POST TITLE
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Optimizing React Performance for Enterprise Applications"
                    maxLength="120"
                  />
                  <small>Make it catchy and descriptive to attract the right audience.</small>
                </label>
                <label>
                  DETAILED DESCRIPTION
                  <div className="rich-editor">
                    <div className="editor-toolbar">
                      <button type="button" aria-label="Bold"><Bold size={17}/></button>
                      <button type="button" aria-label="Italic"><Italic size={17}/></button>
                      <i/>
                      <button type="button" aria-label="Bulleted list"><List size={17}/></button>
                      <button type="button" aria-label="Numbered list"><ListOrdered size={17}/></button>
                      <i/>
                      <button type="button" aria-label="Add link"><Link2 size={17}/></button>
                      <button type="button" aria-label="Add image"><FileImage size={17}/></button>
                      <button type="button" className="toolbar-more" aria-label="More formatting"><MoreHorizontal size={18}/></button>
                    </div>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Share the context, what you learned, and the question you would like the community to discuss..."
                      rows="15"
                    />
                    <div className="editor-status">
                      <span>Words: {body.trim() ? body.trim().split(/\s+/).length : 0}</span>
                      <span>Markdown supported</span>
                    </div>
                  </div>
                </label>
              </>
            ) : (
              <div className="post-preview">
                <span className="category-pill">{category}</span>
                <h1>{title || 'Your discussion title'}</h1>
                <p>{body || 'Your discussion content will appear here.'}</p>
              </div>
            )}
          </section>

          <section className="forum-card documents-card">
            <h2><Paperclip/>Supporting Documents</h2>
            <div className="documents-layout">
              <label className="document-dropzone">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.zip"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
                <span className="document-icon"><Paperclip size={22}/></span>
                <strong>Drag & drop files or <u>browse</u></strong>
                <small>PDF, JPEG, PNG, ZIP (Max 10MB)</small>
              </label>
              <div className="attached-files">
                <span>ATTACHED FILES</span>
                {attachedFile ? (
                  <div className="attached-file">
                    <Paperclip size={18}/>
                    <div>
                      <strong>{attachedFile.name}</strong>
                      <small>{Math.max(0.1, attachedFile.size / 1048576).toFixed(1)} MB</small>
                    </div>
                    <button type="button" onClick={() => setAttachedFile(null)} aria-label="Remove file">
                      <X size={17}/>
                    </button>
                  </div>
                ) : (
                  <p>No files attached yet</p>
                )}
                {attachedFile && (
                  <button type="button" onClick={() => setAttachedFile(null)}>Clear all attachments</button>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="create-discussion-aside">
          <section className="forum-card category-card">
            <h2><Hash/>Discussion Category</h2>
            {categories.map(([item, description]) => (
              <label className={category === item ? 'is-selected' : ''} key={item}>
                <input
                  type="radio"
                  name="category"
                  checked={category === item}
                  onChange={() => setCategory(item)}
                />
                <span>
                  <strong>{item}</strong>
                  <small>{description}</small>
                </span>
                {category === item && <CheckCircle2 size={16}/>}
              </label>
            ))}
            <button type="button" className="request-category">Request New Category<ChevronDown size={15}/></button>
          </section>

          <section className="forum-card posting-guidelines">
            <h2><Info/>Posting Guidelines</h2>
            <details open><summary>Be Professional<ChevronDown size={16}/></summary><p>Maintain a respectful and helpful tone. Avoid commercial self-promotion unless relevant to the context.</p></details>
            <details><summary>Search First<ChevronDown size={16}/></summary><p>Check for an existing discussion before creating a duplicate topic.</p></details>
            <details><summary>Use Tags Correctly<ChevronDown size={16}/></summary><p>Choose the category that best matches your discussion.</p></details>
            <div className="guideline-notice">
              <Info size={18}/>
              <span>Posts violating IntelliHire policies will be flagged and reviewed by moderators.</span>
            </div>
          </section>
        </aside>
      </form>
    </CommunityShell>
  );
}

export function DiscussionPage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const { postId } = useParams();
  const allPosts = getCommunityPosts(INITIAL_POSTS);
  const post = allPosts.find((item) => item.id === postId) || INITIAL_POSTS[1];
  const isDeleted = isPostRemoved(postId);

  const [comment, setComment] = useState('');
  const [savedDiscussion, setSavedDiscussion] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [reportingItem, setReportingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [comments, setComments] = useState([
    { initials: 'SM', name: 'Sarah Miller', role: 'Software Architect', time: '2 hours ago', text: 'Great breakdown. Measuring the user-facing outcome before choosing an optimization has saved our team months of unnecessary refactoring.', likes: 24 },
    { initials: 'MC', name: 'Marcus Chen', role: 'DevOps Engineer', time: '5 hours ago', text: 'I would add observability from day one. Performance work is much easier when traces make the actual bottleneck visible.', likes: 18 },
    { initials: 'ER', name: 'Elena Rodriguez', role: 'Senior Product Manager', time: '1 day ago', text: 'From a product perspective, I appreciate the emphasis on scalability. An adaptable architecture is a business requirement because it helps teams respond to changing user needs.', likes: 9 }
  ]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments([
      { initials: 'AJ', name: 'Alex Johnson', role: 'Community member', time: 'Just now', text: comment, likes: 0 },
      ...comments
    ]);
    setComment('');
  };

  const handleReportSuccess = (report) => {
    setToast({
      type: 'success',
      message: `Report #${report.id} submitted. Moderation team notified.`
    });
  };

  if (isDeleted) {
    return (
      <CommunityShell title="Discussion Removed" roleOverride={roleOverride}>
        <Link className="back-link discussion-back" to={communityBase}>
          <ArrowLeft size={17}/>Back to Career Community
        </Link>
        <div className="removed-post-banner">
          <ShieldCheck size={36} />
          <h2>Content Removed by Moderator</h2>
          <p>This discussion has been taken down by the IntelliHire community moderation team due to policy violations.</p>
          <Link className="button primary compact" to={communityBase}>
            Browse Other Discussions
          </Link>
        </div>
      </CommunityShell>
    );
  }

  return (
    <CommunityShell
      title="Discussion"
      roleOverride={roleOverride}
      toast={toast}
      onDismissToast={() => setToast(null)}
    >
      <Link className="back-link discussion-back" to={communityBase}>
        <ArrowLeft size={17}/>Back to Career Community
      </Link>

      <header className="discussion-detail-header">
        <div className="discussion-labels">
          <span className="category-pill">{post.category}</span>
          <span className="best-practice-pill">Best Practices</span>
        </div>
        <h1>{post.title}</h1>
        <div className="discussion-detail-meta">
          <Link className="avatar" to={`${communityBase}/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}>{post.initials}</Link>
          <div>
            <Link to={`${communityBase}/profile/${post.author.toLowerCase().replaceAll(' ', '-')}`}><strong>{post.author}</strong></Link>
            <small>{post.role || 'Lead Contributor'} · Posted {post.time}</small>
          </div>
          <span><Eye size={16}/>2.4k Views</span>
          <span><MessageCircle size={16}/>{comments.length} Comments</span>
          <div className="discussion-header-actions">
            <button
              type="button"
              className={savedDiscussion ? 'is-active' : ''}
              onClick={() => setSavedDiscussion(!savedDiscussion)}
            >
              <Bookmark size={17}/>{savedDiscussion ? 'Saved' : 'Save'}
            </button>
            <button type="button"><Share2 size={17}/>Share</button>
          </div>
        </div>
      </header>

      <div className="discussion-layout discussion-detail-layout">
        <article>
          <section className="forum-card article-body discussion-article">
            {post.body ? (
              <p>{post.body}</p>
            ) : (
              <>
                <p>As IntelliHire grows to support high-volume recruitment activity and community interactions, we have had to rethink the architecture behind the experience. A simple monolithic approach served the product well at the beginning, but scale requires a more resilient model.</p>
                <h2>Key Challenges in Recruitment Systems</h2>
                <p>Recruitment platforms have unique traffic patterns. Global hiring events create significant spikes, while quieter periods still require dependable availability. Our approach focuses on:</p>
                <ul>
                  <li>Event-driven communication for decoupled assessment scoring</li>
                  <li>Edge caching strategies for candidate profile performance</li>
                  <li>Queue management for processing-intensive tasks</li>
                  <li>Database partitioning for high-volume assessment data</li>
                </ul>
                <figure className="discussion-figure">
                  <div>
                    <span className="figure-laptop">
                      <i>IH</i><b>IntelliHire</b><small>Professional Career Community</small>
                    </span>
                    <span className="figure-team"><i/><i/><i/><i/></span>
                  </div>
                  <figcaption>Fig 1: Conceptual workspace for architectural planning</figcaption>
                </figure>
                <p>I would love to hear from other senior engineers and architects in the community. How are you handling data consistency across services in high-concurrency environments? Are you favoring eventual consistency or distributed transactions?</p>
              </>
            )}

            <div className="article-actions">
              <button
                type="button"
                className={upvoted ? 'is-active' : ''}
                onClick={() => setUpvoted(!upvoted)}
              >
                <Heart size={18}/>{post.likes + (upvoted ? 1 : 0)} Upvotes
              </button>
              <button type="button">
                <MessageCircle size={18}/>{comments.length} Comments
              </button>
              <button
                type="button"
                className="post-action-flag"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'none', border: 'none', color: '#F0B90B' }}
                onClick={() => setReportingItem({
                  id: post.id,
                  title: post.title,
                  excerpt: post.excerpt || post.body?.slice(0, 100),
                  body: post.body,
                  author: post.author,
                  type: 'Discussion Post'
                })}
              >
                <Flag size={17} color="#F0B90B" />
                <span style={{ fontWeight: 600 }}>Report Post</span>
              </button>
            </div>
          </section>

          <section className="comments discussion-comments">
            <div className="comments-heading">
              <h2>Comments <span>{comments.length}</span></h2>
              <small>Sort by: <strong>Top Comments</strong></small>
            </div>
            <div className="forum-card comment-editor detail-comment-editor">
              <span className="avatar">AJ</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this architecture..."
                rows="4"
              />
              <div>
                <button type="button" className="comment-cancel" onClick={() => setComment('')}>Cancel</button>
                <button type="button" className="button primary" onClick={addComment} disabled={!comment.trim()}>
                  Post Comment<Send size={15}/>
                </button>
              </div>
            </div>

            {comments.map((item, index) => (
              <article className="comment detail-comment" key={`${item.name}-${index}`}>
                <span className="avatar">{item.initials}</span>
                <div>
                  <p>
                    <strong>{item.name}</strong>
                    <em>{item.role}</em>
                    <small>{item.time}</small>
                    <button
                      type="button"
                      className="comment-flag-icon"
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9599A6', cursor: 'pointer' }}
                      title="Report comment"
                      onClick={() => setReportingItem({
                        id: `comment-${index}-${Date.now().toString().slice(-4)}`,
                        title: `Comment on "${post.title}"`,
                        text: item.text,
                        author: item.name,
                        type: 'Comment'
                      })}
                    >
                      <Flag size={14} />
                    </button>
                  </p>
                  <div>{item.text}</div>
                  <footer>
                    <button><Heart size={14}/>{item.likes} Upvotes</button>
                    <button>Reply</button>
                  </footer>
                </div>
              </article>
            ))}
            <button type="button" className="load-comments">Load more comments (39)</button>
          </section>
        </article>

        <aside className="discussion-rail detail-discussion-rail">
          <section className="forum-card related-discussions">
            <span className="rail-eyebrow"><TrendingUp size={15}/>Trending now</span>
            <h2>Related Discussions</h2>
            {allPosts.filter((item) => item.id !== post.id && !isPostRemoved(item.id)).map((item) => (
              <Link className="related-row" to={`${communityBase}/post/${item.id}`} key={item.id}>
                <span className="category-pill">{item.category}</span>
                {item.title}
                <small><MessageCircle size={12}/>{item.comments}</small>
              </Link>
            ))}
            <Link className="rail-all-link" to={communityBase}>View all related topics</Link>
          </section>

          <section className="forum-card popular-tags">
            <h2>Popular Tags</h2>
            <div className="tag-cloud">
              {['Microservices','Scalability','Architecture','Backend','DevOps','Cloud','Talent Platform','NodeJS'].map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </section>

          <section className="expert-review-card">
            <Sparkles/>
            <h2>Need expert architectural review?</h2>
            <p>Connect with verified lead architects for private code reviews and one-to-one strategy sessions.</p>
            <button type="button" className="button primary">Explore Expert Sessions</button>
          </section>

          <section className="moderation-note">
            <Clock3/>
            <span><strong>Active moderation</strong><small>Responses in approximately 15 minutes</small></span>
          </section>
        </aside>
      </div>

      <ReportPostModal
        item={reportingItem}
        isOpen={Boolean(reportingItem)}
        onClose={() => setReportingItem(null)}
        onReportSuccess={handleReportSuccess}
      />
    </CommunityShell>
  );
}

export function CommunityProfilePage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const { slug } = useParams();
  const isSelf = !slug || slug === 'alex-johnson';
  const [activeProfileTab, setActiveProfileTab] = useState('Recent Posts');
  const [connected, setConnected] = useState(false);
  const profilePosts = [
    { ...INITIAL_POSTS[1], date: 'Oct 24, 2026', category: 'Engineering' },
    { ...INITIAL_POSTS[0], id: 'serverless-future', date: 'Oct 12, 2026', category: 'Infrastructure', title: 'The Future of Serverless: Why Edge Functions Change Everything', excerpt: 'Exploring how modern edge platforms are redefining latency expectations for global applications.' },
    { ...INITIAL_POSTS[2], date: 'Sep 28, 2026', category: 'Career Growth', title: 'Transitioning from Mid-level to Senior: A Personal Journey' },
    { ...INITIAL_POSTS[3], id: 'graphql-rest', date: 'Sep 15, 2026', category: 'API Design', title: 'Demystifying GraphQL: When to Choose it Over REST', excerpt: 'An objective comparison of query languages and data-fetching paradigms based on product needs.' },
    { ...INITIAL_POSTS[1], id: 'design-systems-scale', date: 'Sep 06, 2026', category: 'Frontend', title: 'Building a Design System That Actually Scales Across Teams', excerpt: 'The practical governance, component boundaries, and contribution workflow that kept our shared UI library useful as the company grew.', likes: 206, comments: 48 },
    { ...INITIAL_POSTS[2], id: 'technical-mentoring', date: 'Aug 29, 2026', category: 'Leadership', title: 'A Practical Framework for Mentoring Early-Career Engineers', excerpt: 'How structured goals, thoughtful code reviews, and regular feedback can turn everyday project work into meaningful career development.', likes: 184, comments: 37 }
  ];

  return (
    <CommunityShell title="Member profile" roleOverride={roleOverride}>
      <section className="member-profile-hero">
        <div className="member-cover">
          <div className="member-cover-mark"><Sparkles/><span>IntelliHire Community</span></div>
          {isSelf && <button type="button" className="cover-edit"><Edit3 size={16}/>Edit Cover</button>}
        </div>
        <div className="member-identity">
          <div className="member-avatar">AJ<i/></div>
          <div className="member-title">
            <h1>Alex Johnson</h1>
            <p><BriefcaseBusiness size={16}/>Senior Full Stack Engineer @ TechFlow Systems</p>
            <span><MapPin size={15}/>Colombo, Sri Lanka <Calendar size={15}/>Member since Jan 2023</span>
          </div>
          <div className="member-actions">
            {!isSelf && <button type="button" className="button secondary"><MessageCircle size={17}/>Message</button>}
            <button type="button" className="button primary" onClick={() => setConnected(!connected)}>
              {isSelf ? <><Edit3 size={17}/>Edit Profile</> : <><UserPlus size={17}/>{connected ? 'Connected' : 'Connect'}</>}
            </button>
            <button type="button" className="member-more" aria-label="More member actions"><MoreHorizontal size={19}/></button>
          </div>
        </div>
      </section>

      <div className="member-profile-layout">
        <aside className="member-profile-sidebar">
          <section className="member-stat-grid">
            <div className="member-stat-card"><span>Community Posts</span><strong>42</strong><small><TrendingUp size={14}/>12% this month</small><i><MessageCircle size={20}/></i></div>
            <div className="member-stat-card"><span>Helpful Upvotes</span><strong>1.2k</strong><small><TrendingUp size={14}/>5% overall</small><i><Heart size={20}/></i></div>
            <div className="member-stat-card"><span>Assessments Passed</span><strong>15</strong><small><TrendingUp size={14}/>Top 1% rank</small><i><Award size={20}/></i></div>
            <div className="member-stat-card"><span>Connections</span><strong>284</strong><small>Professional network</small><i><UserPlus size={20}/></i></div>
          </section>

          <section className="forum-card member-overview">
            <h2>Professional Overview</h2>
            <p>Passionate about building scalable web applications and mentoring junior developers. Currently focusing on distributed systems and reactive UI patterns. Active contributor to the IntelliHire community and career coach.</p>
            <h3>Skills & Expertise</h3>
            <div className="member-skills">{['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Kubernetes', 'System Design'].map((skill) => <span key={skill}>{skill}</span>)}</div>
            <footer><Award size={17}/><span>Expert Contributor</span><a href="/candidate/cv-management">Full CV <ExternalLink size={13}/></a></footer>
          </section>

          <section className="forum-card member-badges">
            <h2>Community Badges</h2>
            <div>
              <span><i><Award/></i><b>Top Mentor</b></span>
              <span><i><FileText/></i><b>Writer</b></span>
              <span><i><BarChart3/></i><b>Rising Star</b></span>
            </div>
          </section>
        </aside>

        <section className="member-contributions">
          <div className="member-tabs">
            {['Recent Posts', 'Activity History', 'Certifications'].map((tab) => (
              <button type="button" className={activeProfileTab === tab ? 'is-active' : ''} onClick={() => setActiveProfileTab(tab)} key={tab}>
                {tab}
              </button>
            ))}
            <Link to={communityBase}>View All Posts</Link>
          </div>
          {activeProfileTab === 'Recent Posts' ? (
            <>
              <div className="member-post-grid">
                {profilePosts.map((post) => (
                  <Link className="member-post-card" to={`${communityBase}/post/${post.id}`} key={post.id}>
                    <header><span>{post.category}</span><time>{post.date}</time></header>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <footer>
                      <span><Heart size={16}/>{post.likes}</span>
                      <span><MessageCircle size={16}/>{post.comments}</span>
                      <Share2 size={16}/>
                      <Bookmark size={16}/>
                    </footer>
                  </Link>
                ))}
              </div>
              <Link className="button member-show-more" to={communityBase}>Show More Discussions</Link>
            </>
          ) : (
            <div className="member-tab-placeholder">
              <Sparkles/>
              <h2>{activeProfileTab}</h2>
              <p>This member's {activeProfileTab.toLowerCase()} will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </CommunityShell>
  );
}

export function SavedPostsPage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const saved = readSavedPosts();
  const allPosts = getCommunityPosts(INITIAL_POSTS);
  const items = allPosts.filter((post) => saved[post.id] && !isPostRemoved(post.id));

  return (
    <CommunityShell title="Saved posts" roleOverride={roleOverride}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Your library</span>
          <h1>Saved discussions</h1>
          <p>Keep useful conversations close for when you need them.</p>
        </div>
      </div>
      <div className="saved-list">
        {items.length ? (
          items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              saved
              onSave={() => {
                const next = { ...saved, [post.id]: false };
                writeStorage(localStorage, 'community_saved', JSON.stringify(next));
                window.location.reload();
              }}
            />
          ))
        ) : (
          <section className="forum-card empty-state">
            <Bookmark/>
            <h2>No saved posts yet</h2>
            <p>Use the save button on any discussion to add it here.</p>
            <Link className="button primary" to={communityBase}>Explore discussions</Link>
          </section>
        )}
      </div>
    </CommunityShell>
  );
}

export function GuidelinesPage({ roleOverride }) {
  const communityBase = useCommunityBase();
  const rules = [
    ['Be useful and professional', 'Write with respect. Challenge ideas with evidence, never attack the person sharing them.'],
    ['Protect privacy', 'Do not post personal contact details, private candidate information, interview content, or confidential company data.'],
    ['Search before posting', 'Check for an existing discussion and add to it when your question is already being answered.'],
    ['Use accurate categories', 'Choose the most relevant category and write a clear title so others can find your discussion.'],
    ['No spam or misleading content', 'Disclose relevant relationships and avoid repetitive promotion, scams, plagiarism, or misinformation.']
  ];

  return (
    <CommunityShell title="Guidelines" roleOverride={roleOverride}>
      <div className="guidelines-hero">
        <ShieldCheck/>
        <div>
          <span className="eyebrow">Community standards</span>
          <h1>A helpful, safe place for career conversations.</h1>
          <p>These rules apply to candidates, recruiters, and every community contributor.</p>
        </div>
      </div>
      <div className="guidelines-list">
        {rules.map(([title, copy], index) => (
          <section className="forum-card" key={title}>
            <b>{String(index + 1).padStart(2, '0')}</b>
            <div>
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </section>
        ))}
      </div>
      <section className="guidelines-footer">
        <div>
          <h2>See something that breaks these standards?</h2>
          <p>Use “Report” on the discussion. Moderators review reports in real-time and keep actions confidential.</p>
        </div>
        <Link className="button primary" to={communityBase}>Return to community</Link>
      </section>
    </CommunityShell>
  );
}

export default CommunityPage;
