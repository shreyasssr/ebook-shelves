# EbookStore (PocketBase / React / Vite)

Welcome to the **EbookStore** project! This repository contains a modern web application built using **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**, fully powered by a **PocketBase** backend.

> **Backend Status: PocketBase is fully connected.** 
> Auth, the book catalog, checkout (via secure server-side hooks), order history, and the complete Admin dashboard are now wired up natively to PocketBase.

---

## Features

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui setup)
- **Icons**: Lucide React
- **Backend / Database**: PocketBase (SQLite, Go)
- **Secure File Delivery**: Native PocketBase hooks generating secure token-based download URLs for eBooks.

---

## Getting Started

### 1. Backend Setup (PocketBase)

Download [PocketBase](https://pocketbase.io/), place the binary in the project root, and run:
```bash
./pocketbase serve
```
Then, go to `http://localhost:8090/_/` (Admin UI) -> Settings -> Sync -> **Import collections** and upload the `pb_schema.json` file to provision the database schema.

### 2. Frontend Setup

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
