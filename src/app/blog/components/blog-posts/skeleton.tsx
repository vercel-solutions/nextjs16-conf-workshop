export default function BlogPostsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({length: 6}).map((_, index) => (
        <div key={index} className="bg-card overflow-hidden rounded-lg border">
          <div className="bg-muted aspect-video animate-pulse" />
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <div className="bg-muted h-6 animate-pulse rounded" />
              <div className="bg-muted h-6 animate-pulse rounded" />
            </div>
            <div className="bg-muted mb-1 h-4 animate-pulse rounded" />
            <div className="bg-muted mb-6 h-4 w-3/4 animate-pulse rounded" />
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
              <div>
                <div className="bg-muted mb-1 h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
