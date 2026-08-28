import { useEffect, useState } from 'react'

const HOLD_MS = 4200
const FADE_MS = 500
const REDUCED_HOLD_MS = 400

function Bottle({ delay }) {
  return (
    <svg
      className="intro-bottle"
      style={{ animationDelay: `${delay}s` }}
      width="16" height="38" viewBox="0 0 14 34" fill="none"
    >
      <path
        d="M5 1h4v3.2c0 .5.2.9.5 1.3.7.8 1.5 2 1.5 3.9V31a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.4c0-1.9.8-3.1 1.5-3.9.3-.4.5-.8.5-1.3V1Z"
        fill="var(--sand)"
      />
      <rect x="4.5" y="0.5" width="5" height="2" rx="0.6" fill="var(--sand)" />
    </svg>
  )
}

export default function IntroSplash() {
  const [phase, setPhase] = useState('show') // show -> fadeout -> done
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mql.matches)

    document.body.style.overflow = 'hidden'
    const holdTime = mql.matches ? REDUCED_HOLD_MS : HOLD_MS

    const t1 = setTimeout(() => setPhase('fadeout'), holdTime)
    const t2 = setTimeout(() => {
      setPhase('done')
      document.body.style.overflow = ''
    }, holdTime + FADE_MS)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div className={`intro-overlay ${phase === 'fadeout' ? 'intro-fadeout' : ''}`} role="presentation" aria-hidden="true">
      {!reduced && (
        <div className="intro-scene">
          <div className="intro-bottles">
            <Bottle delay={0} />
            <Bottle delay={0.22} />
            <Bottle delay={0.44} />
          </div>

          <svg className="intro-bin" width="120" height="86" viewBox="0 0 120 86" fill="none">
            <path d="M18 20h84l-8 58a6 6 0 0 1-6 5.2H32a6 6 0 0 1-6-5.2L18 20Z" stroke="var(--sand)" strokeWidth="2.5" />
            <path d="M10 20h100" stroke="var(--sand)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M46 20V11a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v9" stroke="var(--sand)" strokeWidth="2.5" />
          </svg>

          <svg className="intro-leaf" width="34" height="46" viewBox="0 0 34 46" fill="none">
            <path
              d="M17 46V22C17 10 24 2 33 1c1 11-3 20-10 24"
              stroke="var(--moss)" strokeWidth="2.6" strokeLinecap="round" fill="none"
            />
            <path
              d="M17 30C10 27 5 20 5 11c9-1 15 4 17 12"
              stroke="var(--moss)" strokeWidth="2.6" strokeLinecap="round" fill="none"
            />
          </svg>
        </div>
      )}

      <div className="intro-wordmark">
        <span aria-hidden="true" style={{ marginRight: '0.4rem' }}>♻️</span>EcoCollect
        <div className="intro-tagline">Recycle. Earn. Repeat.</div>
      </div>
    </div>
  )
}
