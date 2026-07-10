# N8N Webhook Test Data

## AllProposals Webhook Endpoint
```
https://kenmongare.app.n8n.cloud/webhook/AllProposals
```

---

## Test Payloads

### 1. Basic Proposal Approval
```json
{
  "job_id": "prop-001",
  "title": "Marketing Campaign Q3 2026",
  "budget": 125000,
  "submitted_by": "john.agent@example.com",
  "approved_at": "2026-07-10T14:30:00Z",
  "approval_status": "approved",
  "webhook_timestamp": "2026-07-10T14:30:00Z"
}
```

### 2. High Budget Event
```json
{
  "job_id": "prop-002",
  "title": "Annual Conference - Nairobi Convention Centre",
  "budget": 450000,
  "submitted_by": "sarah.manager@example.com",
  "approved_at": "2026-07-10T10:15:00Z",
  "approval_status": "approved",
  "webhook_timestamp": "2026-07-10T10:15:00Z"
}
```

### 3. Small Budget Proposal
```json
{
  "job_id": "prop-003",
  "title": "Office Supplies Requisition",
  "budget": 5500,
  "submitted_by": "mike.admin@example.com",
  "approved_at": "2026-07-10T09:00:00Z",
  "approval_status": "approved",
  "webhook_timestamp": "2026-07-10T09:00:00Z"
}
```

### 4. Bulk Event Proposal
```json
{
  "job_id": "prop-004",
  "title": "Product Launch - Westgate Mall Event",
  "budget": 750000,
  "submitted_by": "alice.events@example.com",
  "approved_at": "2026-07-10T13:45:00Z",
  "approval_status": "approved",
  "webhook_timestamp": "2026-07-10T13:45:00Z"
}
```

---

## Testing Methods

### Method 1: Using curl (Terminal)
```bash
curl -X POST https://kenmongare.app.n8n.cloud/webhook/AllProposals \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-001",
    "title": "Test Proposal",
    "budget": 50000,
    "submitted_by": "test@example.com",
    "approved_at": "2026-07-10T14:30:00Z",
    "approval_status": "approved",
    "webhook_timestamp": "2026-07-10T14:30:00Z"
  }'
```

### Method 2: Using Postman
1. Create new POST request
2. URL: `https://kenmongare.app.n8n.cloud/webhook/AllProposals`
3. Header: `Content-Type: application/json`
4. Body (raw JSON): Use any payload from above
5. Click Send

### Method 3: Using the App UI
1. Go to Manager → Proposals
2. You should see pending proposals from the database
3. Click "+ Approve & Set Budget" on any proposal
4. Enter a budget (e.g., 100000)
5. Click "Approve & Sync"
6. Check browser DevTools Console for logs

### Method 4: Using Node.js Script
Create `test-webhook.js`:
```javascript
const payload = {
  job_id: 'test-' + Date.now(),
  title: 'Test Proposal ' + new Date().toLocaleDateString(),
  budget: Math.floor(Math.random() * 500000) + 10000,
  submitted_by: 'test@example.com',
  approved_at: new Date().toISOString(),
  approval_status: 'approved',
  webhook_timestamp: new Date().toISOString(),
};

fetch('https://kenmongare.app.n8n.cloud/webhook/AllProposals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then(r => r.json())
  .then(d => console.log('✓ Success:', d))
  .catch(e => console.error('✗ Error:', e.message));
```

Then run:
```bash
node test-webhook.js
```

---

## Expected Responses

### Success Response (200)
```json
{
  "success": true,
  "message": "Proposal approved and recorded",
  "proposal_id": "prop-001",
  "timestamp": "2026-07-10T14:30:01Z"
}
```

### Error Response (400)
```json
{
  "error": "Missing required fields",
  "missing": ["job_id", "title"]
}
```

### Error Response (500)
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

---

## Debugging Tips

### Check Browser Console
After clicking "Approve & Sync":
1. Open DevTools (F12)
2. Go to Console tab
3. Look for logs like:
   - ✓ Approval sent via Supabase Edge Function
   - ✓ Approval sent directly to webhook
   - ✗ Error messages

### Check Network Tab
1. Open DevTools → Network tab
2. Click "Approve & Sync"
3. Look for requests to:
   - `supabase.functions.supabase.co/send-proposal-approval` (if using Edge Function)
   - `kenmongare.app.n8n.cloud/webhook/AllProposals` (direct or via proxy)
4. Check response status and body

### Edge Function Logs
```bash
supabase functions logs send-proposal-approval --limit 20
```

---

## Integration Checklist

- [ ] Test webhook receives POST requests
- [ ] Verify payload structure matches expectations
- [ ] Check N8N workflow processes approval data
- [ ] Confirm budget is correctly recorded
- [ ] Validate status field updates to "approved"
- [ ] Test multiple rapid approvals (stress test)
- [ ] Verify timestamps are accurate
- [ ] Check error handling (invalid data, network issues)

---

## Common Issues & Solutions

**Issue: 500 Internal Server Error**
- Check if Edge Function is deployed
- Verify Supabase project credentials
- Check N8N webhook URL is accessible

**Issue: CORS Error (Browser)**
- The app now uses Supabase Edge Function proxy
- If still seeing errors, ensure Edge Function is deployed
- Check browser console for detailed error

**Issue: Proposal not updating in N8N**
- Verify webhook is receiving the POST request (check N8N logs)
- Confirm all required fields are present
- Check N8N workflow is properly configured to handle the data

**Issue: Timeout**
- N8N webhook may be slow
- Check N8N execution status at: https://kenmongare.app.n8n.cloud
- May need to increase timeout in Edge Function
