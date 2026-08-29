import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function truncate(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function WalletConnect() {
  const { user, connectWallet, disconnectWallet } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setError('')
    setBusy(true)
    try {
      await connectWallet()
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Could not connect wallet.')
    } finally {
      setBusy(false)
    }
  }

  const handleDisconnect = async () => {
    setError('')
    setBusy(true)
    try {
      await disconnectWallet()
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Could not disconnect wallet.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <p style={{ margin: 0, color: '#6B7268', fontSize: '0.85rem', fontWeight: 700 }}>WALLET</p>

      {user?.wallet_address ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
            🦊 {truncate(user.wallet_address)}
          </span>
          <button type="button" className="btn-secondary" disabled={busy} onClick={handleDisconnect} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            {busy ? 'Working…' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ color: '#6B7268', fontSize: '0.85rem', margin: '0 0 0.6rem' }}>
            Link a MetaMask wallet to your account.
          </p>
          <button type="button" className="btn-primary" disabled={busy} onClick={handleConnect} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            {busy ? 'Connecting…' : '🦊 Connect MetaMask'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: '0.6rem', marginBottom: 0 }}>{error}</p>}
    </div>
  )
}
