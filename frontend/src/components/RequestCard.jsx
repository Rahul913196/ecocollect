const STEPS = ['pending', 'approved', 'assigned', 'picked_up', 'completed']
const LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  assigned: 'Assigned',
  picked_up: 'Picked up',
  completed: 'Completed',
  rejected: 'Rejected',
}

export default function RequestCard({ request, actions }) {
  const isRejected = request.status === 'rejected'
  const activeIndex = STEPS.indexOf(request.status)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
        <div>
          <h4 style={{ marginBottom: '0.2rem' }}>{request.plastic_type} — {request.quantity_kg} kg</h4>
          <p style={{ margin: 0, color: '#6B7268', fontSize: '0.9rem' }}>{request.address}</p>
        </div>
        <span className={`badge badge-${request.status}`}>{LABELS[request.status]}</span>
      </div>

      {!isRejected && (
        <div className="pipeline" aria-label="Request progress">
          {STEPS.map((step, i) => (
            <span key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className={`pipeline-step ${i <= activeIndex ? 'active' : ''}`}>
                {LABELS[step]}
              </span>
              {i < STEPS.length - 1 && <span className="pipeline-arrow">→</span>}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '0.85rem', color: '#6B7268', marginTop: '0.5rem' }}>
        {request.collector_name && <p style={{ margin: '0.2rem 0' }}>Collector: {request.collector_name}</p>}
        {request.reward_points_awarded != null && (
          <p style={{ margin: '0.2rem 0', color: 'var(--forest-dark)', fontWeight: 700 }}>
            +{request.reward_points_awarded} points earned
          </p>
        )}
        {request.notes && <p style={{ margin: '0.2rem 0' }}>Note: {request.notes}</p>}
      </div>

      {actions && <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>{actions}</div>}
    </div>
  )
}
