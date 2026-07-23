import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Menu, X,
  Briefcase, Target, TrendingUp, FileText, Search, Zap, Calendar, Users,
  Upload, BrainCircuit, BarChart3,
  ArrowRight,
  UserPlus, FileSearch, Rocket,
  Globe, Star, ShieldCheck,
} from 'lucide-react';
import logo from '../../logo.png';

/* ──────────────────────────────────────────────
   Shared Components
   ────────────────────────────────────────────── */

function Button({ children, variant = 'primary', size = 'md', className = '', to, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap';

  const variants = {
    primary: 'bg-accent text-primary hover:bg-accent-dark hover:shadow-[0_6px_20px_rgba(240,185,11,0.3)]',
    secondary: 'bg-transparent text-text-on-dark border border-border-dark hover:border-accent hover:bg-accent/10',
    ghost: 'bg-transparent text-text-secondary border border-border hover:border-accent hover:bg-accent-light hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

function Card({ children, hover = true, className = '', ...props }) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-5 transition-all duration-200 ${
        hover ? 'hover:border-accent hover:shadow-md hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function Badge({ variant = 'hero', children, className = '' }) {
  const variants = {
    hero: 'bg-accent/15 text-accent-dark',
    salary: 'bg-accent-light text-accent-dark',
    skill: 'bg-transparent border border-border text-text-secondary',
    dark: 'bg-primary-light text-text-on-dark',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

function NumberBadge({ number, size = 'md', active = false, className = '' }) {
  const padded = String(number).padStart(2, '0');

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold ${
        active
          ? 'bg-accent text-primary border-2 border-accent'
          : 'bg-transparent text-text-on-dark-muted border-2 border-border-dark'
      } ${sizes[size]} ${className}`}
    >
      {padded}
    </div>
  );
}

function JobCard({ job }) {
  const initials = job.company
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colors = ['bg-accent/20 text-accent-dark', 'bg-accent-info/20 text-accent-info', 'bg-accent-success/20 text-accent-success', 'bg-primary-light text-text-on-dark'];
  const colorIndex = job.company.charCodeAt(0) % colors.length;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:border-accent hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${colors[colorIndex]}`}>
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="text-text-primary font-semibold text-sm leading-tight truncate">{job.title}</h4>
          <p className="text-text-secondary text-xs mt-0.5">{job.company} · {job.location}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <Badge key={tag} variant="skill">{tag}</Badge>
        ))}
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <Button variant="ghost" size="sm" className="flex-1">View Details</Button>
        <Button variant="primary" size="sm" className="flex-1">Apply</Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Section Components
   ────────────────────────────────────────────── */

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-border-dark">
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center relative">
        <div className="hidden md:flex items-center gap-8 justify-start">
          <a href="#matched-roles" className="text-text-on-dark-muted text-sm font-medium hover:text-text-on-dark transition-colors">Find Jobs</a>
          <a href="#how-recruiters-hire" className="text-text-on-dark-muted text-sm font-medium hover:text-text-on-dark transition-colors">Recruiters</a>
        </div>

        <a href="/" className="flex items-center justify-center gap-2.5">
          <img src={logo} alt="IntelliHire" className="h-9 w-auto" />
          <span className="text-accent text-lg font-bold">IntelliHire</span>
        </a>

        <div className="hidden md:flex items-center gap-4 justify-end">
          <button className="text-text-on-dark-muted hover:text-text-on-dark transition-colors relative">
            <Bell size={20} />
          </button>
          <Link to="/signin" className="text-text-on-dark text-sm font-medium hover:text-accent transition-colors">Login</Link>
          <Button variant="primary" size="sm" to="/signup">Sign Up</Button>
        </div>

        <button
          className="md:hidden text-text-on-dark justify-self-end"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border-dark bg-primary px-6 py-4 flex flex-col gap-4">
          <a href="#matched-roles" className="text-text-on-dark-muted text-sm font-medium hover:text-text-on-dark">Find Jobs</a>
          <a href="#how-recruiters-hire" className="text-text-on-dark-muted text-sm font-medium hover:text-text-on-dark">Recruiters</a>
          <div className="flex items-center gap-4 pt-2 border-t border-border-dark">
            <Link to="/signin" className="text-text-on-dark text-sm font-medium hover:text-accent">Login</Link>
            <Button variant="primary" size="sm" to="/signup">Sign Up</Button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-primary to-primary-dark text-text-on-dark">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 flex flex-col items-start gap-6">
        <Badge variant="dark">AI-Powered Hiring Platform</Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
          Hire Smarter,{' '}
          <span className="italic text-accent">Land Faster</span>
        </h1>

        <p className="text-text-on-dark-muted text-base md:text-lg max-w-xl leading-relaxed">
          IntelliHire matches candidates and recruiters using AI-driven analysis —
          cutting hiring time, improving fit, and removing friction from the process.
        </p>

        <div className="flex flex-wrap gap-3 mt-2">
          <Button variant="primary" size="lg" to="/signup">Get Started as a Candidate</Button>
          <Button variant="secondary" size="lg" to="/recruiter/signup">Hire Better as a Recruiter</Button>
        </div>
      </div>
    </section>
  );
}

const candidateFeatures = [
  { icon: FileText, title: 'CV AI Analysis', description: 'Get instant AI-powered feedback on your resume with actionable improvement suggestions.' },
  { icon: Target, title: 'Smart Matching', description: 'Our algorithm surfaces roles that align with your skills, experience, and career goals.' },
  { icon: TrendingUp, title: 'Career Prep', description: 'Access interview coaching, salary insights, and personalized career growth plans.' },
  { icon: Briefcase, title: 'Direct Connect', description: 'Skip the queue — get matched directly with hiring managers at top companies.' },
];

const recruiterFeatures = [
  { icon: Search, title: 'AI Discovery', description: 'Automatically surface the best candidates from thousands of profiles in seconds.' },
  { icon: Zap, title: 'Smart Shortlist', description: 'AI-ranked candidate shortlists based on role requirements and cultural fit.' },
  { icon: Calendar, title: 'Auto Scheduler', description: 'Schedule interviews instantly with automated calendar coordination.' },
  { icon: Users, title: 'Insight Panel', description: 'Real-time analytics on pipeline health, candidate engagement, and time-to-hire.' },
];

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="w-11 h-11 rounded-lg bg-primary flex items-center justify-center">
        <Icon size={20} className="text-accent" />
      </div>
      <h4 className="text-text-primary font-semibold text-sm">{title}</h4>
      <p className="text-text-secondary text-xs leading-relaxed">{description}</p>
    </Card>
  );
}

function BuiltForGrowth() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-bg-page py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Built for Growth</p>
          <h2 className="text-text-primary text-2xl md:text-3xl font-bold">A Platform for Both Sides</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div id="jobs" className="text-left">
            <h3 className="text-text-primary font-bold text-lg mb-4">For Candidates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidateFeatures.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>

          <div id="recruiters" className="text-left">
            <h3 className="text-text-primary font-bold text-lg mb-4">For Recruiters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recruiterFeatures.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const recruiterSteps = [
  { num: 1, icon: Upload, title: 'Post a Role', description: 'Define the role, required skills, and culture preferences in minutes.' },
  { num: 2, icon: BrainCircuit, title: 'AI Matches', description: 'Our engine scans thousands of profiles and surfaces top-fit candidates.' },
  { num: 3, icon: Users, title: 'Review & Shortlist', description: 'Browse ranked candidates, compare profiles, and build your shortlist.' },
  { num: 4, icon: BarChart3, title: 'Hire & Track', description: 'Schedule interviews, make offers, and track pipeline metrics in real time.' },
];

function HowRecruitersHireFaster() {
  return (
    <section id="how-recruiters-hire" className="min-h-screen flex flex-col justify-center bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">How It Works</p>
          <h2 className="text-text-on-dark text-2xl md:text-3xl font-bold">How Recruiters Hire Faster</h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-5 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] border-t-2 border-dashed border-border-dark" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {recruiterSteps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-4 relative">
                <NumberBadge number={step.num} active size="lg" />
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                  <step.icon size={22} className="text-accent" />
                </div>
                <h4 className="text-text-on-dark font-semibold text-sm">{step.title}</h4>
                <p className="text-text-on-dark-muted text-xs leading-relaxed max-w-[220px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const mockJobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'NexaPay',
    location: 'Remote',
    salary: '$95k – $130k',
    tags: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    title: 'Backend Engineer',
    company: 'Orbit Health',
    location: 'Austin, TX',
    salary: '$100k – $140k',
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
  },
  {
    title: 'Full Stack Developer',
    company: 'Vantage Learning',
    location: 'New York, NY',
    salary: '$85k – $115k',
    tags: ['Python', 'React', 'MongoDB'],
  },
  {
    title: 'DevOps Engineer',
    company: 'ClearRoute Logistics',
    location: 'Chicago, IL',
    salary: '$110k – $145k',
    tags: ['Docker', 'Kubernetes', 'Terraform'],
  },
  {
    title: 'Product Designer',
    company: 'BrightPath AI',
    location: 'San Francisco, CA',
    salary: '$90k – $125k',
    tags: ['Figma', 'UI/UX', 'Design Systems'],
  },
  {
    title: 'Data Analyst',
    company: 'Greenfield Analytics',
    location: 'Remote',
    salary: '$75k – $105k',
    tags: ['SQL', 'Python', 'Tableau'],
  },
];

function ExploreMatchedRoles() {
  return (
    <section id="matched-roles" className="min-h-screen flex flex-col justify-center bg-bg-page py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Opportunities</p>
            <h2 className="text-text-primary text-2xl md:text-3xl font-bold">Explore Matched Roles</h2>
          </div>
          <a href="#all-jobs" className="hidden sm:inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:underline">
            View All Opportunities <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockJobs.map((job) => (
            <JobCard key={job.title} job={job} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <a href="#all-jobs" className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:underline">
            View All Opportunities <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

const gettingStartedSteps = [
  { num: 1, icon: UserPlus, title: 'Create Your Profile', description: 'Sign up and upload your resume — our AI does the heavy lifting from day one.' },
  { num: 2, icon: FileSearch, title: 'Get Matched', description: 'Receive personalized job recommendations and recruiter connections instantly.' },
  { num: 3, icon: Rocket, title: 'Land Your Role', description: 'Apply with one click, prep with AI coaching, and start your next chapter.' },
];

function GettingStarted() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-bg-page py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-2">Get Started</p>
          <h2 className="text-text-primary text-2xl md:text-3xl font-bold">Getting Started Is Easy</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {gettingStartedSteps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center gap-4">
              <NumberBadge number={step.num} active size="lg" />
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <step.icon size={22} className="text-accent" />
              </div>
              <h4 className="text-text-primary font-semibold">{step.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed max-w-[280px]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: '98%', label: 'Match Accuracy' },
  { value: '2.4k+', label: 'Hires Made' },
  { value: '12min', label: 'Avg. Time to Shortlist' },
  { value: '$42M', label: 'Salaries Matched' },
];

function StatsBar() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-primary py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-accent text-3xl md:text-4xl font-bold">{stat.value}</p>
              <p className="text-text-on-dark-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-bg-page py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-primary via-primary-dark to-primary p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <h2 className="text-text-on-dark text-2xl md:text-3xl font-bold max-w-lg">
              Ready to Transform Your Hiring Journey?
            </h2>
            <p className="text-text-on-dark-muted text-sm md:text-base max-w-md">
              Join thousands of candidates and recruiters already using IntelliHire to find the perfect match.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Button variant="primary" size="lg" to="/signup">Sign Up as Candidate</Button>
              <Button variant="secondary" size="lg" to="/recruiter/signup">Register as Recruiter</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const footerLinks = {
  Platform: ['Find Jobs', 'AI Matching', 'Career Prep', 'Salary Insights'],
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  Resources: ['Help Center', 'API Docs', 'Privacy Policy', 'Terms of Service'],
};

const socialIcons = [
  { icon: Globe, label: 'Website' },
  { icon: Star, label: 'Starred' },
  { icon: ShieldCheck, label: 'Trusted' },
];

function Footer() {
  return (
    <footer className="bg-primary-dark text-text-on-dark">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <img src={logo} alt="IntelliHire" className="h-7 w-auto mb-3" />
            <p className="text-text-on-dark-muted text-sm max-w-xs leading-relaxed">
              AI-powered hiring that connects the right candidates with the right roles — faster, smarter, and more fairly.
            </p>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h5 className="font-semibold text-sm mb-3">{heading}</h5>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-text-on-dark-muted text-sm hover:text-accent transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-8">
          {socialIcons.map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#social"
              className="w-9 h-9 rounded-full border border-border-dark flex items-center justify-center text-text-on-dark-muted hover:text-accent hover:border-accent transition-colors"
              aria-label={label}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        <div className="border-t border-border-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-on-dark-muted text-xs">&copy; {new Date().getFullYear()} IntelliHire. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="text-text-on-dark-muted text-xs hover:text-accent transition-colors">Privacy</a>
            <a href="#terms" className="text-text-on-dark-muted text-xs hover:text-accent transition-colors">Terms</a>
            <a href="#cookies" className="text-text-on-dark-muted text-xs hover:text-accent transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   Landing Page
   ────────────────────────────────────────────── */

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BuiltForGrowth />
      <HowRecruitersHireFaster />
      <ExploreMatchedRoles />
      <GettingStarted />
      <StatsBar />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;
