import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios.js'
import RequestCard from '../components/RequestCard.jsx'

export default function CollectorDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/collector/requests')
      setRequests(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handlePickup = async (id) => {
    setBusyId(id)
    try {
      await api.patch(`/collector/requests/${id}/pickup`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleComplete = async (id) => {
    setBusyId(id)
    try {
      await api.patch(`/collector/requests/${id}/complete`)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page container">
      <h2>Collector dashboard</h2>
      <p style={{ color: '#6B7268', marginTop: 0 }}>Requests assigned to you, ready for pickup.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => <div key={i} className="loading-shimmer" style={{ height: 180 }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state card"><p>No pickups assigned to you right now.</p></div>
      ) : (
        <div className="grid grid-3">
          {requests.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              actions={
                r.status === 'assigned' ? (
                  <button className="btn-primary btn-block" disabled={busyId === r.id} onClick={() => handlePickup(r.id)}>
                    Mark as picked up
                  </button>
                ) : r.status === 'picked_up' ? (
                  <button className="btn-primary btn-block" disabled={busyId === r.id} onClick={() => handleComplete(r.id)}>
                    Mark as completed
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
