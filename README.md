# FirstGold Bank Core Banking

Angular SSR dashboard for core banking workflows: role-based access, customer management, KYC review, transactions, account actions, and branch-level reporting.

## Current Scope

This project is frontend-ready for demo and stakeholder review. It uses simulated users and mock banking data, so a real production launch still requires a backend API, audited authentication, authorization enforcement on the server, and a regulated data store.

## Local Development

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
```

`npm run typecheck` validates the application and test TypeScript without producing build artifacts. `npm test` and `npm run build` use Angular's esbuild pipeline.

## Production Build

```bash
npm run build
npm run serve:ssr:banking-system
```

The SSR server reads `PORT`, defaulting to `4000`, and serves the compiled app from `dist/banking-system`.

## Production Readiness Notes

- Replace mock auth in `src/app/core/services/auth.service.ts` with a secure identity provider flow.
- Replace mock data services with authenticated API calls and server-side authorization.
- Keep the server security headers in `src/server.ts` enabled behind your reverse proxy.
- Configure HTTPS, secure cookies, audit logging, backups, monitoring, and regulatory controls before live banking use.
