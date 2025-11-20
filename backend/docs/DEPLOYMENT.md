# Deployment Guide - AI Lead IQ Backend

Complete guide for deploying the AI Lead IQ backend to Google Cloud Run.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Manual Deployment](#manual-deployment)
- [CI/CD Deployment](#cicd-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Install gcloud CLI
   # Visit: https://cloud.google.com/sdk/docs/install
   
   # Verify installation
   gcloud --version
   
   # Authenticate
   gcloud auth login
   
   # Set project
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Docker**
   ```bash
   # Verify Docker installation
   docker --version
   docker compose version
   ```

3. **Node.js 18+**
   ```bash
   node --version  # Should be >= 18.x
   npm --version
   ```

### Required Permissions

Ensure your Google Cloud service account has the following roles:
- `Cloud Run Admin`
- `Service Account User`
- `Cloud Build Editor`
- `Storage Admin`
- `Secret Manager Admin`

## Local Development

### Using Docker Compose

1. **Create `.env` file**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Start all services**
   ```bash
   cd ..  # Return to project root
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f redis
   docker-compose logs -f worker
   ```

4. **Test the API**
   ```bash
   curl http://localhost:3000/api/health
   ```

5. **Stop services**
   ```bash
   docker-compose down
   
   # With volume cleanup
   docker-compose down -v
   ```

### Using Node.js Directly

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start Redis (required for batch calls)**
   ```bash
   docker run -d --name redis-local -p 6379:6379 redis:7-alpine
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Run worker (in separate terminal)**
   ```bash
   npm run worker
   ```

## Manual Deployment

### Step 1: Build Docker Image Locally

```bash
cd backend

# Build the image
docker build -t ai-lead-iq-backend:test .

# Test the image locally
docker run -p 8080:8080 --env-file .env ai-lead-iq-backend:test

# In another terminal, test health endpoint
curl http://localhost:8080/api/health
```

### Step 2: Configure Google Cloud Secrets

Store sensitive environment variables in Secret Manager:

```bash
# Create secrets
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-supabase-url" | gcloud secrets create SUPABASE_URL --data-file=-
echo -n "your-supabase-key" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-
echo -n "your-gemini-key" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "your-minimax-key" | gcloud secrets create MINIMAX_API_KEY --data-file=-
echo -n "redis://your-redis-url:6379" | gcloud secrets create REDIS_URL --data-file=-
echo -n "your-encryption-key" | gcloud secrets create ENCRYPTION_KEY --data-file=-

# Verify secrets
gcloud secrets list
```

### Step 3: Deploy to Cloud Run

```bash
# Set environment variables
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

# Build and submit to Google Cloud Build
gcloud builds submit --config ../cloudbuild.yaml --project $PROJECT_ID

# Or use gcloud run deploy directly
gcloud run deploy backend \
  --image gcr.io/$PROJECT_ID/backend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "JWT_SECRET=JWT_SECRET:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest,MINIMAX_API_KEY=MINIMAX_API_KEY:latest,REDIS_URL=REDIS_URL:latest,ENCRYPTION_KEY=ENCRYPTION_KEY:latest" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 1 \
  --timeout 60 \
  --port 8080
```

### Step 4: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe backend \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "Service URL: $SERVICE_URL"

# Test health endpoint
curl $SERVICE_URL/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":"..."}
```

## CI/CD Deployment

### GitHub Actions Setup

1. **Create GitHub Secrets**

   Go to your repository → Settings → Secrets and variables → Actions → New repository secret

   Add the following secrets:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Service account JSON key (see below)

2. **Create Service Account Key**

   ```bash
   # Create service account
   gcloud iam service-accounts create github-actions \
     --display-name "GitHub Actions CI/CD"

   # Grant necessary roles
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member "serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role "roles/run.admin"

   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member "serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role "roles/iam.serviceAccountUser"

   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member "serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
     --role "roles/cloudbuild.builds.editor"

   # Create and download key
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account github-actions@$PROJECT_ID.iam.gserviceaccount.com

   # Copy the contents of github-actions-key.json to GCP_SA_KEY secret
   cat github-actions-key.json
   ```

3. **Trigger Deployment**

   ```bash
   # Push to main branch triggers automatic deployment
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   
   # Watch GitHub Actions workflow
   # Go to: https://github.com/your-username/your-repo/actions
   ```

### Workflow Details

The CI/CD pipeline runs 5 jobs:

1. **Security Audit**: Scans for vulnerabilities with `npm audit`
2. **Unit & Integration Tests**: Runs Jest with 90% coverage requirement
3. **E2E Tests**: Runs Playwright API tests with Redis
4. **Build**: Builds and tests Docker image
5. **Deploy**: Deploys to Cloud Run (main branch only)

**PR Requirements:**
- All tests must pass
- Coverage must meet 90% threshold
- No high/critical vulnerabilities
- Docker build must succeed

## Environment Configuration

### Production Environment Variables

Set via Google Secret Manager (recommended) or environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Port 8080 (Cloud Run default) |
| `JWT_SECRET` | Yes | JWT signing secret (32+ chars) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `MINIMAX_API_KEY` | Yes | MiniMax AI API key |
| `MINIMAX_GROUP_ID` | Yes | MiniMax group ID |
| `REDIS_URL` | Yes | Redis connection URL |
| `ENCRYPTION_KEY` | Yes | Data encryption key |
| `CORS_ORIGIN` | No | Allowed CORS origins (comma-separated) |
| `LOG_LEVEL` | No | Logging level (info/debug/error) |

### Redis Setup for Production

**Option 1: Google Cloud Memorystore (Recommended)**

```bash
# Create Redis instance
gcloud redis instances create ai-lead-iq-redis \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0

# Get connection info
gcloud redis instances describe ai-lead-iq-redis --region=$REGION

# Update REDIS_URL secret with the connection string
```

**Option 2: External Redis Provider**
- Upstash Redis
- Redis Labs
- AWS ElastiCache (if using AWS)

## Monitoring & Logging

### View Logs

```bash
# Stream logs in real-time
gcloud run services logs tail backend --region=$REGION

# View logs in Cloud Console
# https://console.cloud.google.com/run/detail/$REGION/backend/logs
```

### Monitoring Metrics

```bash
# View service metrics
gcloud run services describe backend \
  --region=$REGION \
  --format="value(status.url,status.conditions)"

# Access Cloud Console Monitoring
# https://console.cloud.google.com/run/detail/$REGION/backend/metrics
```

### Set Up Alerts

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert policies for:
   - High error rate (>5% 5xx responses)
   - High latency (>2s p95)
   - Low instance count (=0 for >5 min)
   - High memory usage (>90%)

## Rollback Procedures

### Rollback to Previous Revision

```bash
# List revisions
gcloud run revisions list \
  --service backend \
  --region=$REGION

# Rollback to specific revision
gcloud run services update-traffic backend \
  --region=$REGION \
  --to-revisions=backend-00005-abc=100

# Or rollback to previous version
gcloud run services update-traffic backend \
  --region=$REGION \
  --to-revisions=LATEST=0,backend-00004-xyz=100
```

### Emergency Rollback via GitHub

```bash
# Revert the breaking commit
git revert <commit-sha>
git push origin main

# OR reset to previous working commit
git reset --hard <previous-commit>
git push --force origin main  # Use with caution!
```

### Database Rollback

If database migrations caused issues:

```bash
# Connect to Supabase and run rollback SQL
# Or use Supabase dashboard to restore from backup
```

## Troubleshooting

### Common Issues

1. **Container fails to start**
   ```bash
   # Check logs
   gcloud run services logs read backend --region=$REGION --limit=50
   
   # Check environment variables
   gcloud run services describe backend --region=$REGION
   ```

2. **Secret access denied**
   ```bash
   # Grant Cloud Run service account access to secrets
   gcloud secrets add-iam-policy-binding JWT_SECRET \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **Redis connection timeout**
   - Check REDIS_URL is correct
   - Ensure Cloud Run can access Redis (VPC connector if needed)
   - Verify Redis instance is running

4. **High memory usage**
   ```bash
   # Increase memory allocation
   gcloud run services update backend \
     --region=$REGION \
     --memory=1Gi
   ```

## Best Practices

1. **Always test locally first** with Docker before deploying
2. **Use staging environment** before deploying to production
3. **Monitor error rates** after deployment for at least 30 minutes
4. **Keep secrets in Secret Manager**, never in code or environment files
5. **Enable Cloud Run audit logs** for compliance
6. **Set up budget alerts** to avoid unexpected costs
7. **Use custom domain** with Cloud Run for production

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Secret Manager Guide](https://cloud.google.com/secret-manager/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [GitHub Actions for GCP](https://github.com/google-github-actions)
