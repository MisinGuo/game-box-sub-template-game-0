function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800/90 animate-pulse ${className}`}
    />
  )
}

export default function ReviewDetailLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.14),transparent_36%)]" />

      {/* 面包屑 */}
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-4 w-16" />
          <SkeletonBar className="h-4 w-4" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      </div>

      {/* 文章标题区 */}
      <div className="container mx-auto px-4 py-12 relative space-y-6">
        <div className="max-w-4xl space-y-4">
          <SkeletonBar className="h-10 w-96" />
          <SkeletonBar className="h-5 w-full" />
          <SkeletonBar className="h-5 w-3/4" />
        </div>

        {/* 文章信息 */}
        <div className="flex items-center gap-4 py-4 border-b border-slate-800">
          <SkeletonBar className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-48" />
          </div>
        </div>

        {/* 文章内容 */}
        <div className="max-w-4xl space-y-4 py-8">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonBar key={idx} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
