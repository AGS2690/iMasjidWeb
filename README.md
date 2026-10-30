# iMasjid Web

React, TypeScript, and Vite frontend for iMasjid Connect.

## API environment configuration

The frontend reads `VITE_API_URL` as the API base URL, including the `/api`
path. Service calls append their endpoint paths to this value.

- `.env`: local development (`https://localhost:7031`)
- `.env.staging`: staging (`https://staging-api.example.com`)
- `.env.production`: production (`https://api.example.com`)

Replace the staging and production example URLs with the actual API base URLs
before building or deploying those environments. Include `/api` at the end.
Since these values are embedded in the frontend build, create a separate build
for each environment.

## Install and run

```sh
npm install
npm run dev
```

Vite starts the local frontend at `http://localhost:5173` by default. The local
API must be running at `https://localhost:7031`, and its HTTPS development
certificate must be trusted by the browser. The API must also allow requests
from the frontend origin if its CORS policy requires it.

## Staging

```sh
npm run dev:staging
npm run build:staging
```

## Production

```sh
npm run build
npm run preview
```
