import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Rewards() {
  const { user, setUser } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/rewards/products')
      setProducts(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRedeem = async (product) => {
    setError('')
    setSuccess('')
    setBusyId(product.id)
    try {
      await api.post('/rewards/orders', { product_id: product.id })
      setSuccess(`Redeemed ${product.name}!`)
      setUser({ ...user, reward_points: user.reward_points - product.points_cost })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Rewards marketplace</h2>
          <p style={{ color: '#6B7268', margin: 0 }}>Redeem the points you've earned from recycling.</p>
        </div>
        <div className="badge" style={{ background: 'var(--forest)', color: 'var(--white)', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          {user?.reward_points ?? 0} points available
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>{success}</div>}

      {loading ? (
        <div className="grid grid-3" style={{ marginTop: '2rem' }}>
          {[1, 2, 3].map((i) => <div key={i} className="loading-shimmer" style={{ height: 200 }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state card" style={{ marginTop: '2rem' }}>
          <p>No products available yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-3" style={{ marginTop: '2rem' }}>
          {products.map((p) => {
            const canAfford = (user?.reward_points ?? 0) >= p.points_cost
            return (
              <div key={p.id} className="card">
                <h4>{p.name}</h4>
                <p style={{ color: '#6B7268', fontSize: '0.9rem' }}>{p.description}</p>
                <p style={{ fontWeight: 800, color: 'var(--forest-dark)' }}>{p.points_cost} points</p>
                <button
                  className="btn-primary btn-block"
                  disabled={!canAfford || busyId === p.id}
                  onClick={() => handleRedeem(p)}
                >
                  {canAfford ? 'Redeem' : 'Not enough points'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
