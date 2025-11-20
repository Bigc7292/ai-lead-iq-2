# Google Cloud Secret Manager Setup Guide

This project uses Google Cloud Secret Manager to securely store and retrieve sensitive configuration values (API keys, database credentials, etc.).

## Prerequisites

1.  **Google Cloud Project**: You must have a Google Cloud project.
    *   **Project ID**: `monospace-13`
2.  **Google Cloud SDK**: Ensure `gcloud` CLI is installed and authenticated.
    *   `gcloud auth login`
    *   `gcloud config set project monospace-13`

## 1. Enable Required APIs

Run the following command to enable the necessary Google Cloud APIs:

```bash
gcloud services enable secretmanager.googleapis.com cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com
```

## 2. Setup Secrets

We have a script to help you upload your secrets from your local `.env` file (or manual input) to Google Cloud Secret Manager.

1.  Ensure your `backend/.env` file has the correct values you want to upload.
2.  Run the setup script:

```bash
cd backend
npm run secrets:setup
```

This script will:
*   Read secrets from your `.env` file.
*   Create the secret in Secret Manager if it doesn't exist.
*   Add a new version of the secret if it already exists.

## 3. Verify Secrets

To verify that all required secrets are accessible and correctly stored:

```bash
cd backend
npm run secrets:verify
```

## 4. Grant Permissions to Cloud Run Service Account

When deploying to Cloud Run, the default service account needs permission to access these secrets.

1.  Find your Cloud Run service account email (usually `[project-number]-compute@developer.gserviceaccount.com`).
2.  Grant the **Secret Manager Secret Accessor** role:

```bash
# Get the project number
PROJECT_NUMBER=$(gcloud projects describe monospace-13 --format="value(projectNumber)")

# Grant access to the default compute service account
gcloud projects add-iam-policy-binding monospace-13 \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Local Development

For local development, the application supports a fallback mechanism:

1.  **Environment Variables**: If a variable is defined in `.env`, it takes precedence.
2.  **Secret Manager**: If not in `.env` and `GOOGLE_CLOUD_PROJECT` is set, it tries to fetch from Secret Manager (requires `gcloud auth application-default login`).

To test with real secrets locally:
1.  Run `gcloud auth application-default login`.
2.  Ensure `GOOGLE_CLOUD_PROJECT=monospace-13` is in your `.env`.
3.  Remove the specific secret key from your `.env` (so it fetches from cloud).

## Troubleshooting

*   **Error: Permission denied**: Ensure you have run `gcloud auth application-default login` locally, or that the Cloud Run service account has `roles/secretmanager.secretAccessor`.
*   **Error: Secret not found**: Run `npm run secrets:verify` to check which secrets are missing.
