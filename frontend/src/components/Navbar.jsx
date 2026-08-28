import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const styles = {
  nav: {
    height: 68,
    borderBottom: '1px solid var(--line)',
    background: 'var(--white)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  inner: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.4rem',
    fontWeight: 600,
    fontSize: '0.92rem',
  },
  points: {
    background: 'var(--sand-dim)',
    padding: '0.3rem 0.7rem',
    borderRadius: 999,
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--forest-dark)',
  },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardPath = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'collector'
      ? '/collector'
      : '/dashboard'

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span aria-hidden="true">♻️</span> EcoCollect
        </Link>

        <div style={styles.links}>
          <Link to="/">Home</Link>

          {!user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Get started
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to={dashboardPath}>Dashboard</Link>
              {user.role === 'user' && (
                <>
                  <Link to="/sell-plastic">Sell plastic</Link>
                  <Link to="/my-requests">My requests</Link>
                  <Link to="/rewards">Rewards</Link>
                  <span style={styles.points}>{user.reward_points} pts</span>
                </>
              )}
              <button className="btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
