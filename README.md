# X2P — Mobile Expense PWA (modeled on SAP Concur)

An installable Progressive Web App covering the four things actually asked for: **Login, Expenses,
Expense Reports (Claims), and the Approval process** — rebuilt with your X2P branding, no extra pillars.

Built with **React + Vite + vite-plugin-pwa** (installable, offline-capable, one codebase for
iOS/Android/desktop).

## How this maps to Concur

| Concur concept | What it does | X2P equivalent |
|---|---|---|
| Home screen with quick-action tiles | Central hub linking out to each pillar | `src/pages/Home.jsx` — tile grid for Expenses / Reports / Approvals |
| **ExpenseIt** | Camera-first capture; snap a receipt, AI extracts merchant/date/amount, saved as a standalone expense | `src/pages/CaptureExpense.jsx` — same flow, reachable from the Home CTA and the bottom-tab camera button |
| **Expenses** (unassigned line items) | Individual transactions — from ExpenseIt or manual entry — that don't belong to a report yet | `src/pages/Expenses.jsx`, `ExpenseDetail.jsx` |
| **Expense Reports** (Claims) | A named bundle of expenses that gets submitted as a single unit | `src/pages/Reports.jsx`, `ReportDetail.jsx` |
| Report-level approval | Approvers act on the whole report (Approve / Send Back), not individual receipts | `src/pages/Approvals.jsx` — queue of submitted reports |
| Sign-in | Username/password login, checked against your real backend | `src/pages/Login.jsx` + `src/lib/auth.js` — see below |
| Bottom tabs + camera action | Quick access to core sections with a raised camera button | `src/components/BottomNav.jsx` |

Deliberately left out: Trips/itinerary, side-drawer navigation, and the mock card-feed import — none of
those were part of the ask, so they've been removed rather than kept as demo clutter.

## Expense types

`src/store/store.jsx` exports `CATEGORY_GROUPS`, matching the grouped expense-type list from Concur's
Standard Edition default set (Air Travel, Ground Transportation, Lodging, Meals & Entertainment, Fees &
Subscriptions, Other), shown as `<optgroup>` sections in every category picker. `CATEGORIES` is the same
list flattened, for anywhere a plain array is more convenient.

## Claim/report lifecycle

```
Expense created (ExpenseIt / manual)
        │
        ▼
  added to an Expense Report  ──►  Report: Not Submitted (draft)
        │
        ▼
  employee taps Submit  ──►  Report: Submitted
        │
        ▼
  manager Approves ──► Approved ──► (simulated finance settlement) ──► Paid
        │
        └─ manager Sends Back ──► Sent Back ──► employee edits & resubmits
```

## What's mocked (and what a production build needs)

- **Auth** — sign-in goes through a single integration point, `src/lib/auth.js`, following the same
  mock-until-configured pattern as the OCR service below. Right now `VITE_AUTH_API_URL` is unset, so
  `login()` runs in mock mode: the login screen shows an employee/manager demo toggle and accepts any
  non-empty username/password.

  A real endpoint is included at **`php-backend/api/login.php`** — it authenticates against your existing
  `companies` + `useraccounts` tables (same schema as your current `login.php`), but replies with JSON
  instead of a redirect, and uses PDO with parameterized queries instead of building SQL from the raw
  input. It still checks the password with `sha1()` to match your current `useraccounts.Password` column
  (no data migration needed to start); switch to `password_hash()`/`password_verify()` (bcrypt) for
  new/changed passwords when you're ready. Deploy that file, fill in the DB connection env vars
  (`DB_HOST`/`DB_NAME`/`DB_USER`/`DB_PASS`) and the profile/role query near the bottom (adjust the
  column names to whatever actually stores display name, title, department, and employee/manager role in
  your schema — that part is a best guess), then set `VITE_AUTH_API_URL` in `.env.local` to wherever it's
  hosted. No changes needed in `Login.jsx`.
- **OCR (ExpenseIt)** — extraction goes through a single integration point, `src/lib/ocr.js`. Right now
  `VITE_OCR_API_URL` is unset, so `scanReceipt()` runs in mock mode and returns sample data after a short
  delay. Once the PaddleOCR-based backend is hosted, copy `.env.example` to `.env.local`, set
  `VITE_OCR_API_URL` (and `VITE_OCR_API_KEY` if needed), and the same function will `POST` the receipt
  image to `${VITE_OCR_API_URL}/scan` and map the JSON response into the review form — no changes needed
  in `CaptureExpense.jsx`. Every AI-filled field is marked with an **AI** badge, and the review screen
  shows a disclaimer (mirroring Concur's own ExpenseIt notice) asking the user to check the data before
  saving; if the scan fails, the form falls back to blank fields for manual entry instead of blocking the
  user.
- **Backend (expenses/reports)** — all data lives in the browser's `localStorage` via
  `src/store/store.jsx`. Swap the `dispatch` calls for `fetch` calls against your API; the screens and
  state machine don't need to change.

## Run it locally

Requirements: **Node.js 18+** and npm.

```bash
cd x2p-app
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). On login, choose **Employee** or **Manager**
(demo toggle, mock-auth mode only), enter any username/password, and sign in. Switch roles any time from
the **Profile** screen (reached via the avatar in the top-right).

### Try the whole flow

1. Tap **Capture a receipt** on Home (or the camera tab) → snap/upload a photo → review the
   auto-filled fields → **Save expense**.
2. Open the new expense → **Add to an expense report** → create a new report.
3. Open the report → **Submit report**.
4. Switch to **Manager view** (Profile → Manager view) → **Approvals** → open the report → **Approve**
   (or **Send Back** with a comment).
5. Approving auto-advances the report to **Paid** after a few seconds, simulating the finance/PIS
   settlement step.

## Offline mode

The service worker caches the app shell after the first visit, and all expense/report data is written to
`localStorage`, so drafts and captures survive a dropped connection. An offline banner appears on Home
whenever the device is disconnected.

## Install it as an app

```bash
npm run build
npm run preview
```

Open the preview URL — your browser will offer **"Install app"** (Chrome/Edge address-bar icon, or
Safari's Share → **Add to Home Screen** on iOS). Deploy the contents of `dist/` to any static host
(Vercel, Netlify, Azure Static Web Apps) for a shareable install link — no app-store submission needed.

## Project structure

```
src/
  pages/
    Login.jsx              Username/password sign-in (src/lib/auth.js)
    Home.jsx                Hub: ExpenseIt CTA, tile grid, recent expenses
    CaptureExpense.jsx      ExpenseIt camera-first capture + AI-extraction review
    Expenses.jsx            Flat list of expense line items, filterable
    ExpenseDetail.jsx       Edit an expense, attach it to a report
    Reports.jsx             List of expense reports
    ReportDetail.jsx        Report contents, submit, manager approve/send-back
    Approvals.jsx           Manager's report approval queue
    Profile.jsx             Account info, role switch (demo), sign out
  components/
    TopBar.jsx, BottomNav.jsx                Navigation chrome
    ExpenseRow.jsx, ReportRow.jsx            Shared list rows
  store/store.jsx            App state, seed data, expense/report reducer
  lib/                        auth.js, ocr.js (backend integration points), format.js, useOnline.js
  assets/logo.png             Your X2P logo
php-backend/api/login.php      JSON login endpoint for your existing MySQL backend
public/icons/                  App icons generated from your logo (all PWA sizes + maskable)
vite.config.js                  vite-plugin-pwa config (manifest, offline caching)
```

## Design notes

Palette and icon set are derived from the X2P logo mark (`#046307`). Layout patterns — tile grid on Home,
flat list rows with chevrons, segmented filter control, sticky bottom action bar on report/expense detail
— mirror Concur's current Fiori Horizon mobile look (rounded cards, light theme, bottom tabs with a raised
camera action), executed in X2P's own green palette and Space Grotesk/Inter/IBM Plex Mono type system
rather than Concur's blue/Fiori type system.
