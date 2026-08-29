import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import RequestCard from '../components/RequestCard.jsx'
import WalletConnect from '../components/WalletConnect.jsx'

export default function UserDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get('/requests/mine')
      .then((res) => mounted && setRequests(res.data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const active = requests.filter((r) => !['completed', 'rejected'].includes(r.status))
  const completedCount = requests.filter((r) => r.status === 'completed').length

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p style={{ color: '#6B7268', margin: 0 }}>Here's what's happening with your pickups.</p>
        </div>
        <Link to="/sell-plastic" className="btn-primary">+ New pickup request</Link>
      </div>

      <div className="grid grid-4" style={{ margin: '2rem 0' }}>
        <div className="card">
          <p style={{ margin: 0, color: '#6B7268', fontSize: '0.85rem', fontWeight: 700 }}>REWARD POINTS</p>
          <h2 style={{ margin: '0.3rem 0 0' }}>{user?.reward_points ?? 0}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: '#6B7268', fontSize: '0.85rem', fontWeight: 700 }}>ACTIVE REQUESTS</p>
          <h2 style={{ margin: '0.3rem 0 0' }}>{active.length}</h2>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: '#6B7268', fontSize: '0.85rem', fontWeight: 700 }}>COMPLETED PICKUPS</p>
          <h2 style={{ margin: '0.3rem 0 0' }}>{completedCount}</h2>
        </div>
        <WalletConnect />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Recent requests</h3>
        <Link to="/my-requests" style={{ fontWeight: 700, color: 'var(--forest)', fontSize: '0.9rem' }}>View all →</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => <div key={i} className="loading-shimmer" style={{ height: 160 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state card">
          <p>No requests yet. Submit your first plastic pickup to start earning points.</p>
          <Link to="/sell-plastic" className="btn-primary">Sell plastic</Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {requests.slice(0, 3).map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  )
}
