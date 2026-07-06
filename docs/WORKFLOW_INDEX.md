# n8n Workflow Export Index

This folder contains the workflow exports copied from the `kmongare-workflows` repository and the repository-specific n8n workflow definitions.

## Included workflow exports

- `2Ptqsuf3wWnlOunc-OTP_Auth_Fixed_Single_Flow_.json`
  - Single-flow OTP authentication / validation workflow.

- `bDhS08iKZenqLskD-My_workflow.json`
  - Custom workflow for pay or claim submission and approvals.

- `DVy1qYdpa5QDtNHh-Fraud_Risk_Engine.json`
  - Fraud detection / risk engine workflow.

- `g2dd1M1EB9wiv9GS-EventCreation.json`
  - Event creation workflow export.

- `QPQpZaSShKhPaapM-EventCreation.json`
  - Second event creation workflow variant.

- `UXuh0VMqjNJlQ7mf-Recce.json`
  - Recce submission workflow.

- `nCciXSJHlESs4WeF-Approvals.json`
  - Requisition approval workflow with manager approval gating.

- `oJRTsPtJQgWFslrv-PrimeEdgeAi.json`
  - PrimeEdgeAI workflow export (system integration / master workflow variant).

- `SJUI5ohz4G7ZErCK-PrimeEdgeAi.json`
  - Another PrimeEdgeAI workflow variant.

- `n8n-event-registration-workflow.json`
  - Project-specific event registration workflow created for this repository.

- `n8n-event-workflow.json`
  - Project-specific event lifecycle approval workflow created for this repository.

## Usage instructions

1. Import the desired `.json` workflow into n8n.
2. Replace all `REPLACE_WITH_YOUR_CREDENTIAL` placeholders with your own n8n credential names.
3. Configure webhook paths and Google Sheets document IDs to match your live environment.
4. Use the `EventCreation` and `Recce` workflows for event and recce submissions.
5. Use the `Approvals` workflow for requisition approval routing.

## Notes

- Credential IDs have been sanitized in all imported JSON files.
- These files are intended to be the source exports for your system integration documentation.
- If you want, I can also add a separate `docs/WORKFLOW_DESCRIPTIONS.md` with field-level mappings and payload examples.
