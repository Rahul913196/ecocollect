import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import RequestCard from '../components/RequestCard.jsx'

const FILTERS = ['all', 'pending', 'approved', 'assigned', 'picked_up', 'completed', 'rejected']

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    let mounted = true
    api.get('/requests/mine')
      .then((res) => mounted && setRequests(res.data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  return (
    <div className="page container">
      <h2>My requests</h2>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0 1.5rem' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => <div key={i} className="loading-shimmer" style={{ height: 160 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <p>No requests match this filter.</p>
          <Link to="/sell-plastic" className="btn-primary">Sell plastic</Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  )
}
