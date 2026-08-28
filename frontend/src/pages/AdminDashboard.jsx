import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios.js'
import RequestCard from '../components/RequestCard.jsx'

const TABS = [
  { key: 'pending', label: 'Pending approval' },
  { key: 'approved', label: 'Ready to assign' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [collectors, setCollectors] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [assignChoice, setAssignChoice] = useState({})

  const loadRequests = useCallback(async (status) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/requests', { params: { status } })
      setRequests(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRequests(tab) }, [tab, loadRequests])

  useEffect(() => {
    api.get('/admin/collectors').then((res) => setCollectors(res.data)).catch(() => {})
    api.get('/admin/analytics').then((res) => setAnalytics(res.data)).catch(() => {})
  }, [])

  const handleApprove = async (id) => {
    setBusyId(id)
    try {
      await api.patch(`/admin/requests/${id}/approve`)
      loadRequests(tab)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    setBusyId(id)
    try {
      await api.patch(`/admin/requests/${id}/reject`)
      loadRequests(tab)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleAssign = async (id) => {
    const collectorId = assignChoice[id]
    if (!collectorId) return
    setBusyId(id)
    try {
      await api.patch(`/admin/requests/${id}/assign`, { collector_id: collectorId })
      loadRequests(tab)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page container">
      <h2>Admin dashboard</h2>

      {analytics && (
        <div className="grid grid-4" style={{ margin: '1.5rem 0 2rem' }}>
          <div className="card">
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6B7268' }}>TOTAL REQUESTS</p>
            <h3 style={{ margin: '0.3rem 0 0' }}>{analytics.total_requests}</h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6B7268' }}>KG RECYCLED</p>
            <h3 style={{ margin: '0.3rem 0 0' }}>{analytics.total_kg_recycled}</h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6B7268' }}>USERS</p>
            <h3 style={{ margin: '0.3rem 0 0' }}>{analytics.total_users}</h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#6B7268' }}>COLLECTORS</p>
            <h3 style={{ margin: '0.3rem 0 0' }}>{analytics.total_collectors}</h3>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => <div key={i} className="loading-shimmer" style={{ height: 180 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state card"><p>Nothing here right now.</p></div>
      ) : (
        <div className="grid grid-3">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              actions={
                tab === 'pending' ? (
                  <>
                    <button className="btn-primary" disabled={busyId === r.id} onClick={() => handleApprove(r.id)}>Approve</button>
                    <button className="btn-danger" disabled={busyId === r.id} onClick={() => handleReject(r.id)}>Reject</button>
                  </>
                ) : tab === 'approved' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <select
                      value={assignChoice[r.id] || ''}
                      onChange={(e) => setAssignChoice({ ...assignChoice, [r.id]: e.target.value })}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: '1.5px solid var(--line)' }}
                    >
                      <option value="">Select collector…</option>
                      {collectors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn-primary" disabled={busyId === r.id || !assignChoice[r.id]} onClick={() => handleAssign(r.id)}>
                      Assign
                    </button>
                  </div>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
