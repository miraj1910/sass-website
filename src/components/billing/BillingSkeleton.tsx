"use client";

export function BillingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="h-3.5 w-24 bg-zinc-800 rounded" />
          <div className="h-2.5 w-40 bg-zinc-800 rounded mt-1.5" />
        </div>
        <div className="h-7 w-28 bg-zinc-800 rounded-lg" />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-zinc-800 rounded" />
                <div className="h-4 w-14 bg-zinc-800 rounded-full" />
              </div>
              <div className="h-3 w-36 bg-zinc-800 rounded mt-2" />
            </div>
            <div className="text-right">
              <div className="h-4 w-20 bg-zinc-800 rounded" />
              <div className="h-2.5 w-14 bg-zinc-800 rounded mt-1" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-zinc-900 p-2.5">
                <div className="h-2.5 w-16 bg-zinc-800 rounded mb-1.5" />
                <div className="h-3 w-12 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="h-3.5 w-24 bg-zinc-800 rounded" />
          <div className="h-2.5 w-36 bg-zinc-800 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 w-20 bg-zinc-800 rounded" />
                <div className="h-3 w-24 bg-zinc-800 rounded" />
              </div>
              <div className="h-2 bg-zinc-800 rounded-full w-full" />
              <div className="flex items-center justify-between mt-1.5">
                <div className="h-2 w-12 bg-zinc-800 rounded" />
                <div className="h-2 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-3.5 w-24 bg-zinc-800 rounded" />
          <div className="h-2.5 w-36 bg-zinc-800 rounded" />
          <div className="rounded-lg border border-zinc-800 p-6 text-center">
            <div className="mx-auto h-6 w-6 bg-zinc-800 rounded-full mb-2" />
            <div className="h-3 w-32 bg-zinc-800 rounded mx-auto mb-1" />
            <div className="h-2.5 w-48 bg-zinc-800 rounded mx-auto" />
          </div>
          <div className="rounded-lg border border-zinc-800 p-6 text-center">
            <div className="mx-auto h-6 w-6 bg-zinc-800 rounded-full mb-2" />
            <div className="h-3 w-32 bg-zinc-800 rounded mx-auto mb-1" />
            <div className="h-2.5 w-48 bg-zinc-800 rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
