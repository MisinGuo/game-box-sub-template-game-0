export default function SearchLoading() {
  return (
    <div className="bg-slate-950 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-48 rounded bg-slate-800 mb-4" />
          <div className="h-14 w-full rounded bg-slate-900 border border-slate-800" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 rounded bg-slate-800" />
                <div className="h-5 w-20 rounded bg-slate-800" />
              </div>
              <div className="h-6 w-3/4 rounded bg-slate-800 mb-3" />
              <div className="h-4 w-1/3 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
