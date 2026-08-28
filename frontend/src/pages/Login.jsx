import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      const dest = user.role === 'admin' ? '/admin' : user.role === 'collector' ? '/collector' : '/dashboard'
      navigate(dest)
    } catch (err) {
      setError(err.message || 'Could not log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page container">
      <div className="auth-shell card">
        <h2>Log in</h2>
        <p style={{ color: '#6B7268', marginTop: 0 }}>Welcome back to EcoCollect.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p style={{ fontSize: '0.9rem', marginTop: '1.2rem', textAlign: 'center' }}>
          New here? <Link to="/register" style={{ color: 'var(--forest)', fontWeight: 700 }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
