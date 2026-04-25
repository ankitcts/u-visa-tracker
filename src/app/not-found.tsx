import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-20 text-center space-y-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" className="text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
