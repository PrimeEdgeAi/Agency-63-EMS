# Integration boundaries and how the workflow is connected

## Purpose

This document explains how the event lifecycle workflow is connected to the Google Apps Script endpoint and how the Apps Script now only supports team/roles data.

## What the Apps Script now does

The Apps Script endpoint is now limited to team/roles operations only.
That means it should only receive:
- `roles` payloads
- bulk role arrays for team updates

It no longer handles:
- `event_submission`
- `recce`
- `requisition`
- `pay_request`

Those operations must be handled by a separate backend or workflow system.

## Why this separation exists

The app already has two kinds of data flows:
1. Team/roles maintenance
2. Event lifecycle operations

Keeping Apps Script only for team/roles prevents it from becoming a mixed-purpose endpoint and avoids accidental writes to the wrong sheets.

## How the integration works now

### Apps Script endpoint
- `POST` accepts only `roles` payloads.
- `GET` returns only the `Roles` sheet.
- This is the dedicated endpoint for team and role synchronization.

### Event workflow / n8n
- The event lifecycle should be handled separately.
- Use the production n8n webhook URL for the entry point:
  - `https://kenmongare.app.n8n.cloud/webhook/event-lifecycle`
- A proper workflow can still use n8n, Google Sheets, or another dedicated API.
- The workflow is responsible for:
  - creating proposal records
  - waiting for manager approval
  - creating events when approved
  - creating recce submissions
  - creating requisitions
  - creating pay requests
  - finalizing the job completion status

### Connection points

The current connection is:
- App submits a proposal/event request to the workflow.
- Workflow stores proposal state and pauses for manager approval.
- Once approved, the workflow advances through event, recce, requisition, and pay request steps.
- Apps Script is not part of the event workflow anymore, except for team/roles writes.

## Recommended architecture

1. `Apps Script` → team/roles only
2. `Google Sheets` / custom API / n8n → proposal + event workflow
3. `Manager approval` → handled by n8n `Wait` node or a dedicated approval endpoint
4. `Completion status` → stored in the event workflow backend, not in Apps Script

## Example roles payload

```json
{
  "type": "roles",
  "payload": [
    {
      "id": "1",
      "emp_id": "EMP001",
      "role": "agent",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "national_id": "12345678",
      "department": "Sales",
      "employmentType": "Full-time",
      "full_time": true,
      "manager_id": "2",
      "manager_name": "John Manager"
    }
  ]
}
```

## What changed in the Apps Script

- Removed support for event, recce, requisition, and pay request payloads.
- Kept only the `roles` write path.
- Reduced `doGet` to return only the Roles sheet.

## Summary

- The Apps Script is now a team/roles sync endpoint only.
- The event lifecycle should use a separate workflow backend.
- `roles` payloads are the only allowed write operation on the Google Apps Script side.

If you want, I can also produce a second doc that maps every n8n node to the exact data object it uses.