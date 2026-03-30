function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800/90 animate-pulse ${className}`}
    />
  )
}

export default function ContentLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.14),transparent_36%)]" />

      <div className="container relative py-4">
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-4 w-16" />
          <SkeletonBar className="h-4 w-4" />
          <SkeletonBar className="h-4 w-20" />
        </div>
      </div>

      <section className="relative border-b border-slate-800/80 bg-gradient-to-br from-sky-500/10 via-slate-950 to-slate-900/40">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <SkeletonBar className="h-7 w-28 mx-auto rounded-full" />
            <SkeletonBar className="h-12 w-56 mx-auto" />
            <SkeletonBar className="h-6 w-3/4 mx-auto" />
          </div>
        </div>
      </section>

      <section className="container relative py-12 space-y-14">
        {Array.from({ length: 2 }).map((_, sectionIdx) => (
          <div key={sectionIdx} className="space-y-6">
            <div className="flex items-center gap-3">
              <SkeletonBar className="h-10 w-10 rounded-lg" />
              <SkeletonBar className="h-8 w-40" />
              <SkeletonBar className="h-6 w-10 ml-auto" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-xl border border-slate-800/70 bg-slate-900/45 p-4 backdrop-blur-sm"
                >
                  <SkeletonBar className="h-5 w-3/4 mb-3" />
                  <SkeletonBar className="h-4 w-full mb-2" />
                  <SkeletonBar className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
