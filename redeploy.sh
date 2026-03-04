#!/bin/bash

set -e

# Get the latest commit SHA
COMMIT_SHA=$(git rev-parse HEAD)
TIMEOUT=300 # 5 minutes
WAIT_INTERVAL=5 # 5 seconds
ELAPSED_TIME=0

echo "Waiting for GitHub Actions to finish for commit $COMMIT_SHA..."

BACKEND_RUN_ID=$(gh run list --workflow=backend-publish.yml --commit=$COMMIT_SHA --json databaseId --jq '.[0].databaseId' || echo "")
FRONTEND_RUN_ID=$(gh run list --workflow=frontend-publish.yml --commit=$COMMIT_SHA --json databaseId --jq '.[0].databaseId' || echo "")

# Wait for the backend workflow to complete
if [ -n "$BACKEND_RUN_ID" ]; then
    echo "Waiting for backend workflow (run $BACKEND_RUN_ID)..."
    gh run watch $BACKEND_RUN_ID --exit-status
    BACKEND_STATUS=$(gh run view $BACKEND_RUN_ID --json conclusion --jq '.conclusion')
    if [ "$BACKEND_STATUS" != "success" ]; then
        echo "Backend workflow failed. Not redeploying."
        exit 1
    fi
else
    echo "No backend workflow found for commit $COMMIT_SHA. Assuming no changes."
fi

# Wait for the frontend workflow to complete
if [ -n "$FRONTEND_RUN_ID" ]; then
    echo "Waiting for frontend workflow (run $FRONTEND_RUN_ID)..."
    gh run watch $FRONTEND_RUN_ID --exit-status
    FRONTEND_STATUS=$(gh run view $FRONTEND_RUN_ID --json conclusion --jq '.conclusion')
    if [ "$FRONTEND_STATUS" != "success" ]; then
        echo "Frontend workflow failed. Not redeploying."
        exit 1
    fi
else
    echo "No frontend workflow found for commit $COMMIT_SHA. Assuming no changes."
fi

echo "Workflows checked. Redeploying..."
ssh mtib@mtib-nas "cd containers; docker compose up -d todos-frontend todos-backend --pull=always"
