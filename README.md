# Payslips

Payslip statistics dashboard. Data stored in Firestore, cached in localStorage.

## Setup

```bash
npm install
npm run dev
```

## Firestore Data Structure

Collection: `payslips`

Each document represents one month:

```json
{
  "year": 2025,
  "month": 3,
  "gross": 850000,
  "net": 565000,
  "tax": 285000,
  "bonus": 0
}
```

## Firebase Project

Uses the same Firebase project as rezsi (`rezis-25e67`).

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payslips/{document} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

## Data Loading Strategy

1. On first load: fetch from Firestore, store in localStorage
2. On subsequent loads: use localStorage cache
3. "Refresh Data" button: re-fetches from Firestore and updates localStorage

## Build

```bash
npm run build
```

Output goes to `docs/` for GitHub Pages.
