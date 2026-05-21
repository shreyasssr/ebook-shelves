# Ebook Shelves

A full-stack ebook store built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js) or [bun](https://bun.sh/)

## Getting Started

> **Important:** All commands below must be run from inside the project directory. If you run `npm` from your home directory or any other location, you will get an `ENOENT: no such file or directory … package.json` error.

### 1. Clone the repository

```bash
git clone https://github.com/shreyasssr/ebook-shelves.git
```

### 2. Navigate into the project directory

```bash
cd ebook-shelves
```

> Make sure your terminal prompt shows you are inside the `ebook-shelves` folder before running any `npm` commands.

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root (next to `package.json`) and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

You can find these values in your [Supabase project settings](https://app.supabase.com/) under **Settings → API**.

### 5. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI components:** Radix UI + shadcn/ui
- **Routing:** React Router DOM v7
- **Data fetching:** TanStack Query
- **Backend / Auth:** Supabase
- **Forms:** React Hook Form + Zod

## Troubleshooting

### `npm error enoent Could not read package.json`

This error means you are running `npm` from the wrong directory. Make sure you have navigated into the project folder first:

```bash
cd ebook-shelves   # replace with the actual folder name if different
npm install
```

Verify you are in the correct directory by checking that a `package.json` file is present:

```bash
# Windows (PowerShell)
dir package.json

# macOS / Linux
ls package.json
```
