import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const POINTS_PER_KG = 10 // mirrors backend/app/routers/collector.py

const steps = [
  {
    title: 'Request a pickup',
    text: 'Tell us what plastic you have and where to collect it from.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
        <rect x="5" y="6" width="14" height="15" rx="2" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    title: 'We assign a collector',
    text: 'An admin approves the request and routes it to a nearby collector.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-6.1 7-11.2A7 7 0 0 0 5 9.8C5 14.9 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.3" />
      </svg>
    ),
  },
  {
    title: 'Collector picks it up',
    text: 'Your plastic is weighed and picked up from your address.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    title: 'Earn reward points',
    text: 'Points land in your account and unlock products in the marketplace.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16l-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3Z" />
      </svg>
    ),
  },
]

function BottleIcon({ filled }) {
  return (
    <svg width="14" height="34" viewBox="0 0 14 34" fill="none" style={{ opacity: filled ? 1 : 0.28, transform: filled ? 'translateY(0)' : 'translateY(2px)' }}>
      <path
        d="M5 1h4v3.2c0 .5.2.9.5 1.3.7.8 1.5 2 1.5 3.9V31a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.4c0-1.9.8-3.1 1.5-3.9.3-.4.5-.8.5-1.3V1Z"
        fill="currentColor"
      />
      <rect x="4.5" y="0.5" width="5" height="2" rx="0.6" fill="currentColor" />
    </svg>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [kg, setKg] = useState(5)
  const points = Math.floor(kg * POINTS_PER_KG)
  const bottleCount = Math.min(8, Math.max(1, Math.round(kg / 1.5)))

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <div className="rise-in">
            <div className="hero-kicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 22c-4.5 0-8-3.5-8-8 0-6 8-12 8-12s8 6 8 12c0 4.5-3.5 8-8 8Z" />
              </svg>
              Plastic pickup, weighed &amp; rewarded
            </div>
            <h1>
              Your recycling <em>has a price.</em><br />We just pay it.
            </h1>
            <p className="hero-sub">
              EcoCollect connects households with local collectors — request a pickup,
              track it stage by stage, and redeem the points you earn for real products.
            </p>
            <div className="hero-ctas">
              {user ? (
                <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">Create free account</Link>
                  <Link to="/login" className="btn-secondary">I already have an account</Link>
                </>
              )}
            </div>
            <div className="hero-trust">
              <div><strong>{POINTS_PER_KG} pts</strong>per kg collected</div>
              <div><strong>5 stages</strong>tracked in real time</div>
              <div><strong>0 ₹</strong>cost to request a pickup</div>
            </div>
          </div>

          <div className="estimator rise-in" style={{ animationDelay: '0.1s' }}>
            <div className="estimator-label">See what your plastic is worth</div>
            <div className="estimator-kg-row">
              <span className="num">{kg}</span>
              <span>kg to collect</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={kg}
              onChange={(e) => setKg(Number(e.target.value))}
              aria-label="Kilograms of plastic to collect"
            />
            <div className="estimator-result">
              <div>
                <div className="pts-num">{points}</div>
                <div className="pts-label">reward points</div>
              </div>
              <div className="estimator-bottles" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <BottleIcon key={i} filled={i < bottleCount} />
                ))}
              </div>
            </div>
            <p className="estimator-note">Points are credited the moment a collector marks your pickup complete.</p>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '4.5rem 1.5rem 4rem' }}>
        <h2 style={{ maxWidth: 460 }}>How a pickup request moves</h2>
        <p style={{ color: '#6B7268', maxWidth: 460, marginTop: '0.4rem' }}>
          Every request travels through the same five checkpoints, so you always know where it stands.
        </p>
        <div className="timeline">
          {steps.map((s, i) => (
            <div key={s.title} className="timeline-step">
              <div className="timeline-marker">{s.icon}</div>
              <span className="timeline-num">{String(i + 1).padStart(2, '0')}</span>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="impact">
        <svg className="impact-divider" viewBox="0 0 1200 44" preserveAspectRatio="none">
          <path d="M0 44 C 300 0, 900 0, 1200 44 Z" fill="var(--forest-dark)" />
        </svg>
        <div className="container" style={{ padding: '0 1.5rem 4rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--white)' }}>Every kilogram counts</h2>
          <p style={{ maxWidth: 520, margin: '0 auto', opacity: 0.85 }}>
            Collectors and admins keep the pipeline moving — from request to pickup to
            completion — so nothing sits in a landfill that didn't have to.
          </p>
        </div>
      </section>
    </div>
  )
}
