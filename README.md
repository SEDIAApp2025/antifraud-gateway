# Antifraud Gateway

Simple Cloudflare-based API gateway that proxies scam detection requests from AntifraudApp to external antifraud APIs. The current deployment acts as a running shell so the frontend can make calls while downstream services are still being defined.

This project serves as a backend for the Antifraud App, providing secure access to external APIs and internal datasets.

## Features

*   **API Gateway & Authentication**: Secure access using `x-api-key` header.
*   **Fraud Detection**: Integrates with Google Safe Browsing API to check for malicious URLs.
*   **Cellphone Data Lookup**: Retrieves high-risk phone number information from a CSV dataset.
*   **OpenAPI / Swagger UI**: Automatic API documentation generation and interactive testing interface.
*   **Cloudflare Worker**: Built on Cloudflare's edge network for low latency.

## Prerequisites

1.  **Node.js (20+ recommended).** Ensures compatibility with the TypeScript toolchain and Wrangler.
2.  **npm or pnpm.** Used to install dev dependencies (`wrangler` and `typescript`).
3.  **Cloudflare account with Worker access.** The project must exist in that account so `wrangler deploy` can publish it.
4.  *(Optional)* `wrangler` CLI installed globally (`npm install -g wrangler`) if you prefer not to run it via `npx`.

## Environment setup

1.  Clone the repo and `cd antifraud-gateway`.
2.  Copy or create a `.dev.vars` file in the project root and populate it with the secrets. **Do not commit the resulting file or the secret itself to GitHub.**

    ```properties
    # .dev.vars
    API_SECRET_KEY=<obtain-from-lyc>
    GOOGLE_SAFE_BROWSING_API_KEY=<your_google_api_key>
    ```

    *   `API_SECRET_KEY`: The key clients must provide in the `x-api-key` header.
    *   `GOOGLE_SAFE_BROWSING_API_KEY`: Your Google Cloud API Key with Safe Browsing API enabled.

3.  Export the file’s values before running Wrangler commands locally if needed (e.g., `export $(cat .dev.vars | xargs)` or `source .dev.vars`).

## Installing dependencies

```bash
npm install
```

## Development workflow

*   `npm run dev` (or `npx wrangler dev`) spins up a local Worker URL for the frontend to call during integration testing.
    *   The worker will start at `http://127.0.0.1:8787`.
*   `npm run deploy` (or `npx wrangler deploy`) publishes the gateway defined by `src/index.ts` to the Cloudflare account.
*   The project currently uses the Cloudflare Worker runtime defined in `wrangler.toml`.

## Deployment

This project uses **Tag-driven** GitHub Actions for automated deployment. Pushing to `main` does **not** trigger a deployment to production.

### How to Deploy (Tag-driven)
To deploy a new version to Cloudflare, you must push a git tag:

1.  **Commit your changes** to the `main` branch.
2.  **Create a release tag** (e.g., `v1.0.1`):
    ```bash
    git tag v1.0.1
    ```
3.  **Push the tag** to GitHub:
    ```bash
    git push origin v1.0.1
    ```

The CI/CD pipeline will detect the new tag, build the worker, and deploy it automatically.

### Managing Production Secrets
Secrets (API Keys) are not stored in the repository and must be configured manually in the Cloudflare environment. You can do this via the Cloudflare Dashboard or using Wrangler locally:

1.  **Login to Cloudflare** (if using Wrangler)
    ```bash
    npx wrangler login
    ```

2.  **Update Secrets**
    ```bash
    npx wrangler secret put API_SECRET_KEY
    npx wrangler secret put GOOGLE_SAFE_BROWSING_API_KEY
    ```


## API Documentation

This project uses `itty-router-openapi` to automatically generate OpenAPI v3 documentation.

*   **Swagger UI**: Visit `http://127.0.0.1:8787/api/docs` to view and test the API interactively.
*   **OpenAPI JSON**: Access the raw schema at `http://127.0.0.1:8787/api/openapi.json`.

### Key Endpoints

*   `GET /api/version`: Check API version and status (Public).
*   `GET /api/url-check?url=<url>`: Check if a URL is safe (Requires Auth).
*   `GET /api/cellphone`: Get all cellphone records (Requires Auth).
*   `GET /api/cellphone?phoneNumber=<number>`: Search for a specific phone number (Requires Auth).
*   `POST /api/ai-check`: AI-based fraud detection for text content (Requires Auth).

## Project Structure

```
src/
├── config/          # Configuration constants
├── data/            # Static data files (e.g., CSV)
├── endpoints/       # API Endpoint definitions (OpenAPI classes)
├── middleware/      # Request middleware (Auth, etc.)
├── services/        # Business logic and external API calls
├── utils/           # Helper functions
└── index.ts         # Entry point and Router setup
```
