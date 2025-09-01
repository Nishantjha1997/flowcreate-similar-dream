import { Skeleton } from "@/components/ui/skeleton";

export function TemplatesSkeleton() {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <Skeleton className="h-10 w-96 mx-auto" />
          <Skeleton className="h-6 w-128 mx-auto" />
        </div>
        
        {/* Carousel skeleton */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex space-x-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-1/3 space-y-4">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation buttons skeleton */}
          <Skeleton className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full" />
          <Skeleton className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full" />
        </div>

        {/* Dots indicator skeleton */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>

        {/* Browse all button skeleton */}
        <div className="mt-16 text-center">
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </div>
    </section>
  );
}