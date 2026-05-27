# Villa Lead Tracker

A no-login React/Vite MVP for tracking Villa Con Cuore leads in the browser.

Public app: https://villaconcuore.github.io/villa-lead-tracker/

## Features

- Clean mobile-friendly lead dashboard
- Lead stats for Total Leads, New, Due Follow-Ups, and Booked
- Add, edit, view, delete, and quick-update lead statuses
- Search by name, organization, email, phone, source, status, and notes
- Filter by status and sort by newest, follow-up date, or status
- Lead statuses: New, Contacted, Follow-Up, Interested, Booked, and Not Interested
- CSV export of the current filtered lead list
- Browser persistence with `localStorage`
- Off-white, black, gallery-style interface

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Start the local app:

```bash
npm run dev
```

4. Open the local URL shown in your terminal, usually `http://localhost:5173`.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.

## Data storage

This MVP stores leads in the browser using `localStorage`. There is no login, server, or shared database in this version.

Important limitation: each teammate's browser keeps its own copy of the lead list. Opening the public link works without accounts, but leads added on one person's device will not automatically appear on another person's device. Clearing browser site data will clear that browser's saved leads.

Safest next upgrade for shared team data: keep the same no-login public interface, then add a small shared backend such as Supabase, Firebase, or Airtable so everyone sees the same lead list. A simple shared passcode can be added later if the public link needs light protection without full user accounts.

## Deployment

The public app is deployed with GitHub Pages from `.github/workflows/deploy.yml`. Vite is configured with `base: "/villa-lead-tracker/"` in `vite.config.js`; keep that value unchanged unless the public URL changes.
