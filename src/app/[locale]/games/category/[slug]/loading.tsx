function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-md bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800/90 animate-pulse ${className}`}
    />
  )
}

export default function GameCategoryLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.14),transparent_36%)]" />

      {/* 面包屑 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="flex items-center gap-2">
            <SkeletonBar className="h-4 w-16" />
            <SkeletonBar className="h-4 w-4" />
            <SkeletonBar className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* 返回按钮 */}
        <SkeletonBar className="h-10 w-24 mb-6" />

        {/* 品类介绍区 */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-4">
            <SkeletonBar className="h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-8 w-56" />
              <SkeletonBar className="h-4 w-80" />
            </div>
          </div>
          <div className="flex gap-6">
            <SkeletonBar className="h-5 w-32" />
            <SkeletonBar className="h-5 w-32" />
            <SkeletonBar className="h-5 w-32" />
          </div>
        </div>

        {/* 全部游戏区标题 */}
        <div className="space-y-2 mb-6">
          <SkeletonBar className="h-8 w-64" />
          <SkeletonBar className="h-4 w-48" />
        </div>

        {/* 游戏网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800/70 bg-slate-900/45 p-4 backdrop-blur-sm">
              <SkeletonBar className="aspect-square w-full rounded-lg mb-3" />
              <SkeletonBar className="h-4 w-20 mb-2" />
              <SkeletonBar className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
