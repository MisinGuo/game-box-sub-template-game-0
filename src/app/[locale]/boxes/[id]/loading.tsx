export default function BoxDetailLoading() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <div className="h-5 w-72 bg-slate-800 rounded animate-pulse" />
      </div>

      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 animate-pulse shrink-0" />

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
              </div>

              <div className="space-y-2 mb-6">
                <div className="h-5 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-800 rounded animate-pulse" />
              </div>

              <div className="flex gap-6 mb-6">
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
              </div>

              <div className="h-12 w-40 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded">
              <div className="aspect-square bg-slate-800 animate-pulse rounded-t" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
