# Deploying the Proposal Approval Webhook Function

The CORS error occurs because the N8N webhook doesn't allow browser requests. We've created a Supabase Edge Function to proxy the request server-side.

## Setup Steps

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Initialize Supabase in the project (if not already done)
```bash
supabase init
supabase login
```

### 3. Link to your project
```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```
Get your project ref from: https://app.supabase.com/projects

### 4. Deploy the edge function
```bash
supabase functions deploy send-proposal-approval
```

This will deploy the function to: `https://<PROJECT_REF>.functions.supabase.co/send-proposal-approval`

### 5. Verify deployment
```bash
supabase functions list
```

## How It Works

1. When a manager clicks "Approve & Sync", the React app calls our helper function
2. The helper invokes the Supabase Edge Function (no CORS issues)
3. The Edge Function proxies the request to the N8N webhook server-side
4. The approval data is sent to: `https://kenmongare.app.n8n.cloud/webhook/AllProposals`
5. The response is returned to the app with success/error status

## Troubleshooting

If you see "Function not found" error:
- Ensure the function is deployed: `supabase functions list`
- Check function logs: `supabase functions describe send-proposal-approval`
- View logs: `supabase functions logs send-proposal-approval --limit 10`

## Configuration

The function is already configured with:
- POST-only endpoint
- Validation of required fields (job_id, title, budget, submitted_by)
- Error handling and logging
- Payload forwarding to the AllProposals webhook
