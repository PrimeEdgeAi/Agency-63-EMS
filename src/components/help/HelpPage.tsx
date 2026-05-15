import { useState } from 'react'
import { Card, PageHeader } from '../ui'

const FAQS = [
  {
    q: 'How do I create a new event?',
    a: 'Navigate to Events in the sidebar, click "+ New Event", fill in all details including the event story, category, budget and expected attendees, then submit.',
  },
  {
    q: 'What is a Recce Requisition?',
    a: 'A Recce (Reconnaissance) Requisition is a formal request to physically visit and inspect a venue before confirming it for an event. It ensures the space meets all technical, catering, and logistical requirements.',
  },
  {
    q: 'How do Pay Requests work?',
    a: 'Submit a Pay Request under the Finance section, providing vendor details, event, amount and category. It then enters an approval workflow — an administrator reviews and approves or rejects before payment is processed.',
  },
  {
    q: 'Why can\'t I log in?',
    a: 'Login is restricted to pre-approved email addresses only. Contact your system administrator to have your Google account email added to the approved access list in Settings.',
  },
  {
    q: 'What is the Event Story feature?',
    a: 'Every event can carry a narrative — a short story capturing its purpose, vision, and spirit. This helps the whole team communicate the soul of each event to stakeholders, vendors, and attendees.',
  },
  {
    q: 'Can I export event reports?',
    a: 'Yes. On any event detail page, use the Quick Actions panel to export a summary. Full reporting dashboards are coming in a future release.',
  },
]

const LINKS = [
  'Getting Started Guide',
  'Event Planning Checklist',
  'Finance Approval Process',
  'System Documentation',
  'Supabase Integration Notes',
  'Release Notes',
]

export function HelpPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="animate-fade-in">
      <PageHeader section="Support" title="Help Center" />
      <p style={{ color: '#888', fontSize: 15, marginBottom: 40, marginTop: -24 }}>
        Documentation, FAQs, and support resources for EventPortal.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* FAQ */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
            Frequently Asked Questions
          </h3>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                marginBottom: 10,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  background: open === i ? '#fafafa' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'Georgia, serif',
                  fontSize: 14,
                  color: '#111',
                  textAlign: 'left',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}
              >
                {faq.q}
                <span
                  style={{
                    fontSize: 20,
                    color: '#bbb',
                    transform: open === i ? 'rotate(45deg)' : 'none',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                    marginLeft: 16,
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div
                  className="animate-fade-in-fast"
                  style={{ padding: '0 24px 20px', fontSize: 14, color: '#666', lineHeight: 1.8 }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Contact Card */}
          <div
            style={{
              background: '#111',
              borderRadius: 16,
              padding: 28,
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 60%)',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 14 }}>✉</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'white' }}>
              Need more help?
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.75,
                marginBottom: 22,
              }}
            >
              Our team is available Monday – Friday, 8 am – 6 pm EAT.
            </p>
            <button
              style={{
                width: '100%',
                padding: 12,
                background: 'white',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 13,
                fontWeight: 600,
                color: '#111',
              }}
            >
              Contact Support
            </button>
          </div>

          {/* Quick Links */}
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111' }}>
              Quick Links
            </h3>
            {LINKS.map((l, i) => (
              <div
                key={l}
                style={{
                  padding: '11px 0',
                  borderBottom: i < LINKS.length - 1 ? '1px solid #fafafa' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => ((e.currentTarget.querySelector('span:last-child') as HTMLElement).style.color = '#111')}
                onMouseLeave={(e) => ((e.currentTarget.querySelector('span:last-child') as HTMLElement).style.color = '#ccc')}
              >
                <span style={{ fontSize: 13, color: '#555' }}>{l}</span>
                <span style={{ color: '#ccc', fontSize: 14, transition: 'color 0.15s' }}>→</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
