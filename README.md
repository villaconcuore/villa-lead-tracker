# Villa Lead Tracker

A no-login React/Vite MVP for tracking Villa Con Cuore leads in the browser.

Public app: https://villaconcuore.github.io/villa-lead-tracker/

## Features

- Clean mobile-friendly lead dashboard
- Lead stats for Total Leads, New, Due Follow-Ups, and Booked
- Add, edit, view, delete, and quick-update lead statuses
- Search and filters for lead status and lead type
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

This MVP stores leads in the browser using `localStorage`. There is no login, server, or shared database in this version. Clearing browser site data will clear saved leads.
