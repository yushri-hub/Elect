
# Cloud Voting App (Username + Password via Firebase Custom Tokens)

## What this is
- Next.js 14 on Vercel
- Firebase Firestore + Admin SDK
- Username/password (no email) using custom tokens
- Exactly 9 selections per voter
- Admin (developers) can add candidates and voters and view results

## Environment Variables (Vercel)
Set in **Vercel → Project → Settings → Environment Variables**:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_REQUIRED_COUNT=9
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}
INITIAL_SETUP_SECRET=choose-a-strong-secret
NEXT_PUBLIC_SETUP_MODE=true
```

> After creating the first developer via `/setup`, remove `NEXT_PUBLIC_SETUP_MODE` and redeploy.

## Firebase Setup
1. Create Firebase project
2. Enable Firestore (Production mode)
3. Generate a Service Account key (Project Settings → Service accounts) and paste the JSON into Vercel as `FIREBASE_SERVICE_ACCOUNT_JSON`
4. Firestore Rules → paste `FIRESTORE_RULES.txt`

## First Developer Account
1. Deploy to Vercel with the env vars above
2. Visit `/setup` on your deployed URL
3. Enter username, password, and the setup secret to create the first developer
4. Remove `NEXT_PUBLIC_SETUP_MODE` (and optionally `INITIAL_SETUP_SECRET`) from Vercel and redeploy

## Use the App
- Sign in at `/` with developer credentials → Admin
- **Manage Candidates**: add name + optional photo URL
- **Manage Voters**: add username + time window (the app generates a one-time password; only a hash is stored)
- Share the voter’s username + password + site URL
- During the window, a voter signs in and must select exactly 9 candidates to submit

## Notes
- Transactional vote endpoint prevents double-voting and handles concurrency
- Developer-only results
- Mobile-responsive layout
