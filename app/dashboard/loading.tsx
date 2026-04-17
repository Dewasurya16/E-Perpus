// app/admin/loading.tsx
// Muncul otomatis oleh Next.js saat navigasi antar tab (server component re-render)

export default function AdminLoading() {
  return (
    <div className="flex h-screen bg-[#F4F6F4] overflow-hidden">

      {/* ── Sidebar skeleton ── */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-slate-200/60 flex-shrink-0">
        <div className="h-20 flex items-center gap-4 px-7 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-200 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-2 w-14 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="h-2 w-24 bg-slate-100 rounded mb-4 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse">
              <div className="w-5 h-5 bg-slate-200 rounded-md flex-shrink-0" />
              <div className="h-3 bg-slate-200 rounded flex-1" style={{ width: `${60 + i * 8}%` }} />
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-24 bg-slate-200 rounded" />
              <div className="h-2 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header skeleton */}
        <header className="h-16 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
            <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </header>

        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 lg:pb-10">
          <div className="max-w-[1300px] mx-auto space-y-4">

            {/* Hero banner skeleton */}
            <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl h-32 animate-pulse" />

            {/* Stats row skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0" />
                    <div className="space-y-2">
                      <div className="h-6 w-10 bg-slate-200 rounded" />
                      <div className="h-2 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table skeleton */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 flex gap-3">
                <div className="h-10 flex-1 bg-slate-100 rounded-xl" />
                <div className="h-10 w-28 bg-slate-100 rounded-xl" />
              </div>
              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-6 py-4">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded" style={{ width: `${40 + (i % 4) * 15}%` }} />
                      <div className="h-2 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                    <div className="h-5 w-14 bg-slate-100 rounded-lg" />
                    <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>

            {/* Shimmer pulse overlay visual hint */}
            <div className="flex items-center justify-center py-4 gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#1B4332]/30 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Data...</p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}