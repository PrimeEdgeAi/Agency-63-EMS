import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ALL_PROPOSALS_WEBHOOK = 'https://kenmongare.app.n8n.cloud/webhook/AllProposals'

interface ApprovalPayload {
  job_id: string
  title: string
  budget: number
  submitted_by: string
  approved_at: string
  approval_status: 'approved'
  webhook_timestamp: string
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload: ApprovalPayload = await req.json()

    // Validate required fields
    if (!payload.job_id || !payload.title || !payload.budget || !payload.submitted_by) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Forward to N8N webhook
    const response = await fetch(ALL_PROPOSALS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      console.error('N8N webhook error:', response.status, data)
      return new Response(
        JSON.stringify({ 
          error: 'Webhook failed',
          details: data,
          status: response.status 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
