import PocketBase from "pocketbase";

export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090");
pb.autoCancellation(false); // React StrictMode double-fetches otherwise
