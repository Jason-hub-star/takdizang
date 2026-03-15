/** 결과 페이지 로딩 스켈레톤 */
export default function Loading() {
  return (
    <div className="takdi-skeleton-shell min-h-screen">
      <header className="takdi-skeleton-panel sticky top-0 z-10 mx-4 mt-4 flex items-center justify-between rounded-[26px] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-28 animate-pulse" />
          <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-24 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="takdi-skeleton-block h-7 w-24 animate-pulse rounded-xl" />
          <div className="takdi-skeleton-block h-7 w-16 animate-pulse rounded-xl" />
        </div>
      </header>

      <main className="p-8">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="takdi-skeleton-panel takdi-skeleton-block h-64 rounded-[32px]" />
          <div className="takdi-skeleton-panel takdi-skeleton-block h-48 rounded-[28px]" />
          <div className="takdi-skeleton-panel takdi-skeleton-block h-32 rounded-[24px]" />
        </div>
      </main>
    </div>
  );
}
