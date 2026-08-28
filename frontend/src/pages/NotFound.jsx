import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <h1>404</h1>
      <p style={{ color: '#6B7268' }}>This page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  )
}
