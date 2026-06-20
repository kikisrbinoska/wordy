import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../components/assets/logo_wordy.png';
import '../styles/landing.css';

const QUOTES = [
  { text: 'The scariest moment is always just before you start.', author: 'Stephen King' },
  { text: 'You can always edit a bad page. You can\'t edit a blank page.', author: 'Jodi Picoult' },
  { text: 'Write what should not be forgotten.', author: 'Isabel Allende' },
  { text: 'A word after a word after a word is power.', author: 'Margaret Atwood' },
  { text: 'Fill your paper with the breathings of your heart.', author: 'William Wordsworth' },
  { text: 'There is no greater agony than bearing an untold story inside you.', author: 'Maya Angelou' },
];

const FEATURES = [
  { icon: '✍️', title: 'Real-time Collaboration', desc: 'Write together with your team. See each other\'s cursors and changes instantly.' },
  { icon: '📄', title: 'Rich Text Editing', desc: 'Full formatting toolkit — headings, lists, tables, images and more.' },
  { icon: '💬', title: 'Inline Comments', desc: 'Leave feedback right on the text. Resolve threads as you go.' },
  { icon: '🕓', title: 'Version History', desc: 'Every change is saved. Restore any previous version with one click.' },
  { icon: '🔗', title: 'Easy Sharing', desc: 'Invite collaborators by username or share a direct link.' },
  { icon: '📥', title: 'Export Anywhere', desc: 'Download your work as PDF or DOCX whenever you need it.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const q = QUOTES[quoteIndex];

  return (
    <div className="landing">
      {/* Animated background orbs */}
      <div className="landing__orb landing__orb--1" />
      <div className="landing__orb landing__orb--2" />
      <div className="landing__orb landing__orb--3" />

      {/* Nav */}
      <nav className="landing__nav">
        <img src={logo} alt="Wordy" className="landing__nav-logo" />
        <div className="landing__nav-actions">
          <button className="landing__btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="landing__btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
<h1 className="landing__headline">
            Express Your<br />
            <span className="landing__headline-accent">Creativity</span>
          </h1>
          <p className="landing__subline">
            Write, collaborate, and share — all in one beautifully crafted workspace.
            Real-time editing with your whole team, no setup required.
          </p>
          <div className="landing__hero-actions">
            <button className="landing__btn-primary landing__btn-lg" onClick={() => navigate('/register')}>
              Start Writing Free
            </button>
          </div>
        </div>

        {/* Floating quote card */}
        <div className="landing__quote-card glass">
          <div className={`landing__quote-inner ${quoteVisible ? 'landing__quote-inner--visible' : ''}`}>
            <span className="landing__quote-mark">"</span>
            <p className="landing__quote-text">{q.text}</p>
            <p className="landing__quote-author">— {q.author}</p>
          </div>
          <div className="landing__quote-dots">
            {QUOTES.map((_, i) => (
              <span
                key={i}
                className={`landing__quote-dot ${i === quoteIndex ? 'landing__quote-dot--active' : ''}`}
                onClick={() => { setQuoteVisible(false); setTimeout(() => { setQuoteIndex(i); setQuoteVisible(true); }, 300); }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing__features">
        <h2 className="landing__features-title">Everything you need to write better</h2>
        <div className="landing__features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing__feature-card glass">
              <div className="landing__feature-icon">{f.icon}</div>
              <h3 className="landing__feature-title">{f.title}</h3>
              <p className="landing__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <div className="landing__cta-card glass">
          <img src={logo} alt="Wordy" className="landing__cta-logo" />
          <h2 className="landing__cta-title">Ready to start writing?</h2>
          <p className="landing__cta-sub">Join thousands of writers and teams already using Wordy.</p>
          <button className="landing__btn-primary landing__btn-lg" onClick={() => navigate('/register')}>
            Create Free Account
          </button>
        </div>
      </section>

      <footer className="landing__footer">
        <span>© 2026 Wordy. Since 2026.</span>
      </footer>
    </div>
  );
}
