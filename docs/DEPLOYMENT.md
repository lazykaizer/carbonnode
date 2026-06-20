## GitHub Secrets Required

Go to: GitHub Repo → Settings → Secrets and Variables → Actions → New Secret

Add these secrets:
| Secret Name | Value | Used In |
|-------------|-------|---------|
| GEMINI_API_KEY | Your Gemini API key | Cloud Run env |
| GCP_CREDENTIALS | GCP service account JSON content | deploy.yml |
| GCP_PROJECT_ID | Your GCP project ID | deploy.yml |
| CLOUD_RUN_SERVICE_NAME | carbonnode | deploy.yml |
| GCP_REGION | us-central1 | deploy.yml |

NEVER put these values in any file in the repo.
Always use ${{ secrets.SECRET_NAME }} in workflows.
