import type { PageId } from '../../types'
import type { PayRequest } from '../../types'
import { Card } from '../ui'

interface PendingPayRequestsProps {
  requests: PayRequest[]
  setActive: (id: PageId) => void
}

export function PendingPayRequests({ requests, setActive }: PendingPayRequestsProps) {
  const pendingRequests = requests.filter((p) => p.status === 'pending')

  return (
    <Card style={{ padding: 24 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111' }}>
        Pending Pay Requests
      </h3>
      {pendingRequests.map((pr) => (
        <div
          key={pr.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #fafafa',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{pr.vendor}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{pr.event}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
            KES {pr.amount.toLocaleString()}
          </div>
        </div>
      ))}
      <button
        onClick={() => setActive('payrequest')}
        style={{ marginTop: 12, fontSize: 12, color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        View all pay requests →
      </button>
    </Card>
  )
}
