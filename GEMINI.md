# Gemini CLI Documentation

This document provides instructions for interacting with this project via the Gemini CLI.

## Package Manager

Use `bun` for all package management commands in this project. Do not use `npm`.

## Redeploying the Application

To redeploy the application, you can use the `redeploy.sh` script. This script will:

1.  Check for the latest commit.
2.  Wait for the `backend-publish.yml` and `frontend-publish.yml` GitHub Actions to complete for that commit.
3.  If the workflows are successful (or if they don't run because there are no changes), it will `ssh` into the server and run `docker compose up -d --pull=always` to redeploy the application.

To run the script, execute the following command:

```bash
./redeploy.sh
```
