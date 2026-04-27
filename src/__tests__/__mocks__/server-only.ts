// jest stub for Next.js's `server-only` sentinel module.
// In a Next build this throws if a module is imported on the client; in
// jest we just need it to resolve so the import statement doesn't fail.
export {};
