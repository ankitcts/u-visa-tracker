/**
 * App Router route-transition loader. Shown automatically whenever a route
 * segment is navigating and its server-rendered content isn't ready yet.
 * Keeps the navbar + footer visible (layout.tsx renders around this).
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <span className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
