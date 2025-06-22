#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

# Check if a name parameter is provided
if [ -z "$1" ]; then
    error "❌ Please provide a name for your deployment"
    echo "Usage: ./deploy.sh <app-name> [--update]"
    exit 1
fi

APP_NAME=$1
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

# Check if project ID was retrieved successfully
if [ -z "$PROJECT_ID" ]; then
    error "❌ Failed to get Google Cloud project ID. Are you logged in?"
    exit 1
fi

IS_UPDATE=false

# Check for update flag
if [ "$2" = "--update" ]; then
    IS_UPDATE=true
elif [ ! -z "$2" ]; then
    error "❌ Invalid second argument. Use --update if you want to update an existing deployment"
    echo "Usage: ./deploy.sh <app-name> [--update]"
    exit 1
fi

# Submit build to Cloud Build
log "📥 Submitting build to Cloud Build..."
if ! gcloud builds submit --config=cloudbuild.yaml --substitutions=_SERVICE_NAME=$APP_NAME .; then
    error "❌ Cloud Build submission failed"
    exit 1
fi
success "📦 Build submitted successfully"

if [ "$IS_UPDATE" = true ]; then
    log "🚀 Deploying new revision to Cloud Run as '$APP_NAME'..."
    if ! gcloud run deploy $APP_NAME \
        --image gcr.io/$PROJECT_ID/$APP_NAME \
        --platform managed \
        --region us-central1; then
        error "❌ Deployment update failed"
        exit 1
    fi
    success "🚀 Update complete! Your new version should be available soon"
else
    log "🚀 Creating new deployment on Cloud Run as '$APP_NAME'..."
    if ! gcloud run deploy $APP_NAME \
        --image gcr.io/$PROJECT_ID/$APP_NAME \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars="NODE_ENV=production"; then
        error "❌ Initial deployment failed"
        exit 1
    fi
    success "🚀 Deployment complete! Your app should be available soon"
fi
