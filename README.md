# Vault — Personal Document Archive

A private, searchable archive for your important documents (house, car, and
anything else). Upload files with a category, tags, and notes; browse a
date-sorted history; and find anything instantly with in-browser search.

Built to run **fully client-side** so it can be hosted for free on **GitHub
Pages**:

- **Next.js 16** (App Router, static export) + **React 19** + **Tailwind CSS v4**
- **Firebase** — Authentication (Google), Firestore (metadata), Storage (files)
- **MiniSearch** — fast fuzzy search over titles, categories, tags, and notes

## Features

- Google sign-in; every document is private to you (enforced by security rules)
- Upload documents with a **category**, **tags**, and **notes**
- **User-editable categories** (seeded with House, Car, Others)
- Instant client-side search with typo tolerance and prefix matching
- Filter by category and tags; newest-first history
- Edit metadata, download, and delete documents

## Prerequisites

- Node.js 20+
- A Firebase project (the **Blaze** pay-as-you-go plan is required to use
  Firebase Storage; the free tier quota still applies for personal use)

## 1. Configure Firebase

1. Create a project at the [Firebase console](https://console.firebase.google.com/).
2. **Authentication → Sign-in method →** enable **Google**.
3. **Firestore Database →** create a database (production mode).
4. **Storage →** get started (requires the Blaze plan).
5. **Project settings → General → Your apps →** add a **Web app** and copy the
   config values.
6. Deploy the security rules from this repo:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
   (or paste [`firestore.rules`](firestore.rules) and [`storage.rules`](storage.rules)
   into the console).

## 2. Set environment variables

Copy [`.env.example`](.env.example) to `.env.local` and fill in your Firebase
web config:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> These values are shipped to the browser by design. Access is secured by
> Firebase Auth and the security rules, not by hiding the config.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## 4. Deploy to GitHub Pages

The workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds the static export and publishes it on every push to `main`.

1. **Repository → Settings → Pages → Build and deployment → Source:** select
   **GitHub Actions**.
2. **Repository → Settings → Secrets and variables → Actions →** add each
   `NEXT_PUBLIC_FIREBASE_*` value as a secret (same names as above).
3. In the **Firebase console → Authentication → Settings → Authorized domains**,
   add your Pages domain (e.g. `your-username.github.io`) so Google sign-in works.
4. Push to `main`. The site deploys to
   `https://<your-username>.github.io/<repo>/`.

The base path is set automatically from the GitHub Pages action, so the app
works whether it is served from a sub-path or a custom domain.

## Production build (local)

```bash
npm run build   # outputs the static site to ./out
```

