import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'user' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const user = await register(form)
      const dest = user.role === 'collector' ? '/collector' : '/dashboard'
      navigate(dest)
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page container">
      <div className="auth-shell card">
        <h2>Create your account</h2>
        <p style={{ color: '#6B7268', marginTop: 0 }}>Start recycling and earning rewards.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am signing up as</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="user">A household — I want to sell plastic</option>
              <option value="collector">A collector — I want to pick up plastic</option>
            </select>
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: '0.9rem', marginTop: '1.2rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  )
}
