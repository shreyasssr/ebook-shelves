# EbookStore (TanStack / Vite React App)

Welcome to the **EbookStore** project! This repository contains a modern web application built using **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

> **No backend is currently connected.** This project previously used
> Supabase, Firebase, and Algolia; all three were removed. Auth, the book
> catalog, cart persistence-to-server, checkout, order history, and the
> admin dashboards are present as UI shells but do not fetch or write any
> real data until a backend is wired back up. See `CLEANUP_PROMPT.md` for
> what was removed and why, and `PROJECT_IDEAS.md` for what to build next.

---

## 🚀 Features

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui setup)
- **Icons**: Lucide React
- **Backend / Database**: none currently — see note above
- **State Management & Data Fetching**: TanStack React Query

---

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

There's nothing to fill in yet — add variables here once a backend is connected.

### 3. Development Server

Run the development server locally:

```bash
npm run dev
```

Open your browser at `http://localhost:5173` (or the port indicated in your terminal).

---

## 📜 Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run preview` - Locally previews the production build.
- `npm run lint` - Runs ESLint to check for code quality issues.
- `npm run format` - Formats the codebase using Prettier.

---

## 📁 Project Structure

```text
EbookStore/
├── src/             # React application source code
├── package.json     # Project dependencies & scripts
└── vite.config.ts   # Vite configuration
```
