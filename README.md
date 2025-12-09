# antifraud-gateway
Simple Cloudflare-based API gateway that proxies scam detection requests from AntifraudApp to external antifraud APIs. The current deployment acts as a running shell so the frontend can make calls while downstream services are still being defined.

## Prerequisites
1. **Node.js (20+ recommended).** Ensures compatibility with the TypeScript toolchain and Wrangler.
2. **npm or pnpm.** Used to install dev dependencies (`wrangler` and `typescript`).
3. **Cloudflare account with Worker access.** The project must exist in that account so `wrangler deploy` can publish it.
4. *(Optional)* `wrangler` CLI installed globally (`npm install -g wrangler`) if you prefer not to run it via `npx`.

## Environment setup
1. Clone the repo and `cd antifraud-gateway`.
2. Copy or create a `.dev.vars` file in the project root and populate it with the `API_SECRET_KEY` value you request from me. Do **not** commit the resulting file or the secret itself to GitHub.

```
API_SECRET_KEY=<obtain-from-lyc>
```
3. Export the file’s values before running Wrangler commands (e.g., `export $(cat .dev.vars | xargs)` or `source .dev.vars`).

## Installing dependencies
```bash
npm install
```

## Development workflow
 - `npx wrangler dev` spins up a local Worker URL for the frontend to call during integration testing.
 - `npx wrangler deploy` publishes the gateway defined by `src/index.ts` to the Cloudflare account.
 - The project currently uses the Cloudflare Worker runtime defined in `wrangler.toml`.

### API routes (prefixed with `/api`)
 - `GET /api/version` returns the gateway version metadata.
 - `GET /api/check-fraud?url=<target>` runs the placeholder fraud detection logic.
 - `GET /api/data` returns the simulated CSV data as JSON.

We can expand this guide later with linting, testing, or deployment automation as the gateway matures.
