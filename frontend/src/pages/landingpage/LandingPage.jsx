import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Bell, BrainCircuit, Briefcase, Calendar, Check,
  ChevronRight, FileSearch, FileText, Globe2, LockKeyhole, Menu, Rocket,
  Search, ShieldCheck, Sparkles, Target, TrendingUp, Upload,
  UserPlus, Users, X, Zap,
} from 'lucide-react';
import logo from '../../logo.png';
import './LandingPage.css';

const Button = ({ children, variant = 'primary', size = 'md', className = '', to, ...props }) => {
  const classes = `ih-button ih-button--${variant} ih-button--${size} ${className}`;
  return to ? <Link to={to} className={classes} {...props}>{children}</Link> : <button className={classes} {...props}>{children}</button>;
};

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) return node?.classList.add('is-visible');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { node.classList.add('is-visible'); observer.unobserve(node); }
    }, { threshold: .12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`ih-reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>;
}

const Heading = ({ eyebrow, title, description, light, left }) => (
  <div className={`ih-heading ${light ? 'light' : ''} ${left ? 'left' : ''}`}>
    <span className="ih-eyebrow"><Sparkles size={13} />{eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}
  </div>
);

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`ih-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="ih-nav-inner">
        <a href="/" className="ih-brand"><img src={logo} alt="" /><span>IntelliHire</span></a>
        <div className="ih-links"><a href="#matched-roles">Find Jobs</a><a href="#how-recruiters-hire">Recruiters</a></div>
        <div className="ih-actions"><button aria-label="Notifications"><Bell size={18} /></button><Link to="/signin">Login</Link><Button to="/signup" size="sm">Sign Up <ArrowRight size={15} /></Button></div>
        <button className="ih-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <div className="ih-mobile"><a href="#matched-roles" onClick={() => setOpen(false)}>Find Jobs</a><a href="#how-recruiters-hire" onClick={() => setOpen(false)}>Recruiters</a><Link to="/signin">Login</Link><Button to="/signup" size="sm">Sign Up</Button></div>}
    </nav>
  );
}

function Dashboard() {
  return (
    <div className="ih-dashboard-wrap">
      <div className="ih-float-card ih-float-card--one"><span>★</span><div><b>95% Resume Match</b><small>Excellent role alignment</small></div></div>
      <div className="ih-float-card ih-float-card--two"><span>🤖</span><div><b>AI Recommendation</b><small>Strong candidate profile</small></div></div>
      <div className="ih-float-card ih-float-card--three"><span>✓</span><div><b>Candidate Shortlisted</b><small>Moved to interview</small></div></div>
      <div className="ih-float-card ih-float-card--four"><span>◷</span><div><b>Interview Scheduled</b><small>Tuesday · 10:30 AM</small></div></div>
      <div className="ih-dashboard">
        <header><div><i />Live talent intelligence</div><span>Updated now</span></header>
        <main>
          <div className="ih-dashboard-tabs"><span className="active">Resume Screening</span><span>Candidate Ranking</span><span>Interview Analytics</span></div>
          <div className="ih-score"><div className="ih-ring"><strong>95</strong><small>% match</small></div><div><label>AI Match Score</label><b>Top-ranked candidate</b><small>Skills, experience and career goals aligned</small></div></div>
          <div className="ih-skills">{['Resume screening', 'Job matching', 'Interview readiness'].map((skill, i) => <span key={skill}><Check size={12} />{skill}<b>{[98, 95, 91][i]}%</b></span>)}</div>
          <div className="ih-pipeline"><div><small>Screened</small><b>248</b></div><div><small>AI ranked</small><b>32</b></div><div><small>Shortlisted</small><b>8</b></div></div>
        </main>
      </div>
    </div>
  );
}

function Hero() {
  const people = [['PM','Product Manager','p1'],['QA','QA Engineer','p2'],['SE','Software Engineer','p3'],['BA','Business Analyst','p4'],['UX','UX Designer','p5'],['DE','Data Engineer','p6'],['DO','DevOps Engineer','p7'],['DS','Data Scientist','p8']];
  const trust = [[BrainCircuit,'AI-Powered'],[ShieldCheck,'Secure Platform'],[Zap,'Fast Hiring'],[TrendingUp,'Career Development']];
  return (
    <section className="ih-hero">
      <div className="ih-noise" /><div className="ih-glow one" /><div className="ih-glow two" /><div className="ih-orbit outer" /><div className="ih-orbit inner" />
      {people.map(([initials, role, cls]) => <div className={`ih-person ${cls}`} key={initials}><span>{initials}</span><small>{role}</small></div>)}
      <div className="ih-particles" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div>
      <div className="ih-hero-inner">
        <div className="ih-copy"><Reveal>
          <span className="ih-hero-badge"><Sparkles size={13} />Trusted by Recruiters &amp; Job Seekers <ChevronRight size={14} /></span>
          <span className="ih-kicker">AI-Powered Recruitment &amp; Career Preparation</span>
          <h1>Hire Smarter.<br /><em>Build Better Teams.</em></h1>
          <p>IntelliHire streamlines recruitment with AI-powered resume screening, intelligent candidate ranking, automated interview scheduling, AI mock interviews, and personalized career guidance—helping recruiters hire faster and candidates prepare smarter.</p>
          <div className="ih-hero-actions"><Button to="/signup" size="lg">Get Started <ArrowRight size={17} /></Button><a href="#how-recruiters-hire" className="ih-button ih-button--secondary ih-button--lg">Explore the Platform</a></div>
          <div className="ih-partners"><small>Trusted integrations</small><div>{['NEXA','ORBIT','VANTAGE','BRIGHTPATH'].map(name => <span key={name}>{name}</span>)}</div></div>
        </Reveal></div>
        <Reveal className="ih-visual" delay={180}><Dashboard /></Reveal>
      </div>
      <div className="ih-trust">{trust.map(([Icon,label]) => <div key={label}><Icon size={18} />{label}</div>)}</div>
    </section>
  );
}

const candidateFeatures = [
  [FileText,'CV AI Analysis','Get instant AI-powered feedback on your resume with actionable improvement suggestions.'],
  [Target,'Smart Matching','Our algorithm surfaces roles that align with your skills, experience, and career goals.'],
  [TrendingUp,'Career Prep','Access interview coaching, salary insights, and personalized career growth plans.'],
  [Briefcase,'Direct Connect','Skip the queue — get matched directly with hiring managers at top companies.'],
];
const recruiterFeatures = [
  [Search,'AI Discovery','Automatically surface the best candidates from thousands of profiles in seconds.'],
  [Zap,'Smart Shortlist','AI-ranked candidate shortlists based on role requirements and cultural fit.'],
  [Calendar,'Auto Scheduler','Schedule interviews instantly with automated calendar coordination.'],
  [Users,'Insight Panel','Real-time analytics on pipeline health, candidate engagement, and time-to-hire.'],
];

const Feature = ({ item: [Icon,title,description], i }) => <Reveal className="ih-feature" delay={(i % 4) * 70}><div><Icon size={21} /></div><ArrowRight size={17} /><h4>{title}</h4><p>{description}</p></Reveal>;

function BuiltForGrowth() {
  return <section className="ih-section ih-soft"><div className="ih-container">
    <Reveal><Heading eyebrow="Built for Growth" title="One intelligent platform. Two powerful journeys." description="Purpose-built tools help candidates stand out and give recruiters the signal they need to hire with confidence." /></Reveal>
    <div className="ih-audiences">
      {[['01','For Candidates','Turn your potential into opportunity.',candidateFeatures,'jobs'],['02','For Recruiters','Move from volume to best-fit talent.',recruiterFeatures,'recruiters']].map(([num,title,sub,features,id], group) =>
        <div id={id} className={`ih-audience ${group ? 'blue' : ''}`} key={title}><header><span>{num}</span><div><h3>{title}</h3><p>{sub}</p></div></header><div className="ih-feature-grid">{features.map((item,i) => <Feature item={item} i={i} key={item[1]} />)}</div></div>)}
    </div>
  </div></section>;
}

const steps = [
  [Upload,'Post a Role','Define the role, required skills, and culture preferences in minutes.'],
  [BrainCircuit,'AI Matches','Our engine scans thousands of profiles and surfaces top-fit candidates.'],
  [Users,'Review & Shortlist','Browse ranked candidates, compare profiles, and build your shortlist.'],
  [BarChart3,'Hire & Track','Schedule interviews, make offers, and track pipeline metrics in real time.'],
];

function HowItWorks() {
  return <section id="how-recruiters-hire" className="ih-section ih-dark"><div className="ih-container">
    <Reveal><Heading eyebrow="How It Works" title="How Recruiters Hire Faster" description="A clear, intelligent workflow from opening a role to welcoming the right person." light /></Reveal>
    <div className="ih-step-grid">{steps.map(([Icon,title,description],i) => <Reveal className="ih-step" delay={i*90} key={title}><header><span>{String(i+1).padStart(2,'0')}</span><div><Icon size={22} /></div></header><h3>{title}</h3><p>{description}</p></Reveal>)}</div>
  </div></section>;
}

const jobs = [
  ['Senior Frontend Developer','NexaPay','Remote','$95k – $130k',['React','TypeScript','Tailwind CSS'],96],
  ['Backend Engineer','Orbit Health','Austin, TX','$100k – $140k',['Node.js','PostgreSQL','AWS'],93],
  ['Full Stack Developer','Vantage Learning','New York, NY','$85k – $115k',['Python','React','MongoDB'],91],
  ['DevOps Engineer','ClearRoute Logistics','Chicago, IL','$110k – $145k',['Docker','Kubernetes','Terraform'],89],
  ['Product Designer','BrightPath AI','San Francisco, CA','$90k – $125k',['Figma','UI/UX','Design Systems'],88],
  ['Data Analyst','Greenfield Analytics','Remote','$75k – $105k',['SQL','Python','Tableau'],87],
];

function JobCard({ job: [title,company,location,salary,tags,match], i }) {
  const initials = company.split(' ').map(word => word[0]).join('').slice(0,2);
  return <Reveal className="ih-job" delay={(i%3)*70}><header><span>{initials}</span><label><Sparkles size={12} />{match}% match</label></header><h3>{title}</h3><p>{company}<i />{location}</p><div className="ih-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div><footer><strong>{salary}</strong><div><Button variant="ghost" size="sm">View Details</Button><Button size="sm">Apply</Button></div></footer></Reveal>;
}

function Roles() {
  return <section id="matched-roles" className="ih-section"><div className="ih-container">
    <Reveal className="ih-heading-row"><Heading eyebrow="Opportunities" title="Explore Matched Roles" description="AI-ranked openings based on your skills, goals, and experience." left /><a href="#all-jobs">View All Opportunities <ArrowRight size={16} /></a></Reveal>
    <div className="ih-job-grid">{jobs.map((job,i) => <JobCard job={job} i={i} key={job[0]} />)}</div>
  </div></section>;
}

const startSteps = [
  [UserPlus,'Create Your Profile','Sign up and upload your resume — our AI does the heavy lifting from day one.'],
  [FileSearch,'Get Matched','Receive personalized job recommendations and recruiter connections instantly.'],
  [Rocket,'Land Your Role','Apply with one click, prep with AI coaching, and start your next chapter.'],
];

function GettingStarted() {
  return <section className="ih-section ih-soft"><div className="ih-container">
    <Reveal><Heading eyebrow="Get Started" title="Getting Started Is Easy" description="Your next opportunity is only three simple steps away." /></Reveal>
    <div className="ih-start-grid">{startSteps.map(([Icon,title,description],i) => <Reveal className="ih-start" delay={i*90} key={title}><small>{String(i+1).padStart(2,'0')}</small><div><Icon size={25} /></div><h3>{title}</h3><p>{description}</p>{i<2 && <ChevronRight />}</Reveal>)}</div>
  </div></section>;
}

const stats = [
  ['98%','Match Accuracy'],
  ['2.4k+','Hires Made'],
  ['12min','Avg. Time to Shortlist'],
  ['$42M','Salaries Matched'],
  ['10k+','Candidates Prepared'],
  ['500+','Recruiter Teams'],
];
const Stats = () => <section className="ih-stats"><div className="ih-container">{stats.map(([value,label],i) => <Reveal delay={i*70} key={label}><strong>{value}</strong><span>{label}</span></Reveal>)}</div></section>;

function CTA() {
  return <section className="ih-cta-wrap"><Reveal className="ih-cta"><div className="ih-cta-grid" /><div className="ih-cta-glow" /><span className="ih-eyebrow"><Sparkles size={13} />The smarter way forward</span><h2>Ready to Transform Your Hiring Journey?</h2><p>Join thousands of candidates and recruiters already using IntelliHire to find the perfect match.</p><footer><Button to="/signup" size="lg">Sign Up as Candidate <ArrowRight size={17} /></Button><Button to="/recruiter/signup" variant="secondary" size="lg">Register as Recruiter</Button></footer></Reveal></section>;
}

const footerLinks = { Platform:['Find Jobs','AI Matching','Career Prep','Salary Insights'], Company:['About Us','Careers','Blog','Press'], Resources:['Help Center','API Docs','Privacy Policy','Terms of Service'] };
function Footer() {
  return <footer className="ih-footer"><div className="ih-container"><main><div><a href="/" className="ih-brand"><img src={logo} alt="" /><span>IntelliHire</span></a><p>AI-powered hiring that connects the right candidates with the right roles — faster, smarter, and more fairly.</p><span><LockKeyhole size={14} />Secure by design</span></div>{Object.entries(footerLinks).map(([heading,links]) => <div key={heading}><h3>{heading}</h3>{links.map(link => <a key={link} href={`#${link.toLowerCase().replace(/\s+/g,'-')}`}>{link}</a>)}</div>)}</main><section><p>© {new Date().getFullYear()} IntelliHire. All rights reserved.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#cookies">Cookies</a><a href="#global"><Globe2 size={16} /></a></div></section></div></footer>;
}

export default function LandingPage() {
  return <div className="ih-page"><Navbar /><main><Hero /><BuiltForGrowth /><HowItWorks /><Roles /><GettingStarted /><Stats /><CTA /></main><Footer /></div>;
}
