import { useState } from 'react'
import type { AppUser } from '../../types'
import { APPROVED_EMAILS } from '../../data'
import { Card, PageHeader, Field, Input, Button } from '../ui'

interface SettingsPageProps {
  user: AppUser
}

const TABS = ['profile', 'notifications', 'access', 'appearance'] as const
type Tab = typeof TABS[number]

export function SettingsPage({ user }: SettingsPageProps) {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="animate-fade-in">
      <PageHeader section="System" title="Settings" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 18px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: tab === t ? '#111' : '#e5e5e5',
              background: tab === t ? '#111' : 'white',
              color: tab === t ? 'white' : '#888',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              textTransform: 'capitalize',
              fontWeight: tab === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Profile Form */}
        <Card style={{ padding: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600, color: '#111' }}>
            Profile Information
          </h3>
          <Field label="Full Name">
            <Input defaultValue={user.user_metadata.full_name ?? 'Alex Kamau'} />
          </Field>
          <Field label="Email">
            <Input defaultValue={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' } as React.CSSProperties} />
          </Field>
          <Field label="Role">
            <Input defaultValue="Event Administrator" />
          </Field>
          <Field label="Organisation">
            <Input defaultValue="EventPortal Ltd" />
          </Field>
          <Field label="Phone">
            <Input defaultValue="+254 700 000 000" type="tel" />
          </Field>
          <Button style={{ marginTop: 8 }}>Save Changes</Button>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Approved Emails */}
          <Card style={{ padding: 28 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#111' }}>
              Approved Emails
            </h3>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>
              Only these addresses can access the portal via Google OAuth.
            </p>
            {APPROVED_EMAILS.map((email) => (
              <div
                key={email}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#fafafa',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: '#333' }}>{email}</span>
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ Active</span>
              </div>
            ))}
            <button
              style={{
                marginTop: 8,
                width: '100%',
                padding: 10,
                border: '1.5px dashed #e5e5e5',
                borderRadius: 10,
                background: 'transparent',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 12,
                color: '#bbb',
              }}
            >
              + Add Approved Email
            </button>
          </Card>

          {/* System Info */}
          <div
            style={{
              background: '#111',
              borderRadius: 16,
              padding: 28,
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.025) 0%, transparent 60%)',
            }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: 'white' }}>
              System Info
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>
              Authentication via Supabase + Google OAuth
            </p>
            {[
              ['Database',      'Supabase PostgreSQL'],
              ['Auth Provider', 'Google OAuth 2.0'],
              ['Version',       'v1.0.0'],
              ['Environment',   'Production'],
              ['Region',        'af-south-1'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{k}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
