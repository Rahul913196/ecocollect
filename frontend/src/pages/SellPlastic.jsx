import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'

const PLASTIC_TYPES = ['PET (bottles)', 'HDPE (containers)', 'LDPE (bags/film)', 'PP (caps/tubs)', 'Mixed plastic']

export default function SellPlastic() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    plastic_type: PLASTIC_TYPES[0], quantity_kg: '', address: '', pickup_date: '', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.quantity_kg || Number(form.quantity_kg) <= 0) errs.quantity_kg = 'Enter a quantity greater than 0'
    if (!form.address || form.address.trim().length < 5) errs.address = 'Enter a valid pickup address'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    try {
      await api.post('/requests', { ...form, quantity_kg: Number(form.quantity_kg) })
      setSuccess(true)
      setTimeout(() => navigate('/my-requests'), 1200)
    } catch (err) {
      setSubmitError(err.message || 'Could not submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page container">
      <div className="auth-shell card" style={{ maxWidth: 520 }}>
        <h2>Sell your plastic</h2>
        <p style={{ color: '#6B7268', marginTop: 0 }}>
          Tell us what you have — a collector will be assigned once it's approved.
        </p>

        {submitError && <div className="alert alert-error">{submitError}</div>}
        {success && <div className="alert alert-success">Request submitted! Redirecting…</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="plastic_type">Plastic type</label>
            <select id="plastic_type" name="plastic_type" value={form.plastic_type} onChange={handleChange}>
              {PLASTIC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity_kg">Estimated quantity (kg)</label>
            <input id="quantity_kg" name="quantity_kg" type="number" step="0.1" min="0.1" value={form.quantity_kg} onChange={handleChange} />
            {errors.quantity_kg && <span className="field-error">{errors.quantity_kg}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Pickup address</label>
            <textarea id="address" name="address" value={form.address} onChange={handleChange} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pickup_date">Preferred pickup date (optional)</label>
            <input id="pickup_date" name="pickup_date" type="date" value={form.pickup_date} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Gate code, best time to visit, etc." />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit request'}
          </button>
        </form>
      </div>
    </div>
  )
}
