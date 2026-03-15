/** Compose 에디터 로딩 스켈레톤 — 3패널 레이아웃 */
export default function Loading() {
  return (
    <div className="takdi-skeleton-shell flex h-screen flex-col">
      <div className="takdi-skeleton-panel flex h-14 items-center justify-between px-4">
        <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-32 animate-pulse" />
        <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-24 animate-pulse" />
        <div className="flex gap-2">
          <div className="takdi-skeleton-block takdi-skeleton-line h-7 w-14 animate-pulse" />
          <div className="takdi-skeleton-block takdi-skeleton-line h-7 w-14 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="takdi-skeleton-panel m-4 mr-0 w-56 animate-pulse rounded-[28px] p-4">
          <div className="takdi-skeleton-block takdi-skeleton-line mb-3 h-4 w-20" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-[rgb(247_239_231_/_0.72)] p-3">
                <div className="flex h-10 flex-col items-center justify-center gap-2">
                  <div className="takdi-skeleton-block h-5 w-5 rounded" />
                  <div className="takdi-skeleton-block takdi-skeleton-line h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8">
          <div className="mx-auto max-w-3xl animate-pulse space-y-4">
            <div className="takdi-skeleton-panel takdi-skeleton-block h-48 rounded-[32px]" />
            <div className="takdi-skeleton-panel takdi-skeleton-block h-32 rounded-[28px]" />
            <div className="takdi-skeleton-panel takdi-skeleton-block h-24 rounded-[24px]" />
          </div>
        </div>

        <div className="takdi-skeleton-panel m-4 ml-0 w-72 animate-pulse rounded-[28px] p-4">
          <div className="takdi-skeleton-block takdi-skeleton-line mb-4 h-4 w-16" />
          <div className="space-y-3">
            <div className="takdi-skeleton-block h-8 rounded-2xl" />
            <div className="takdi-skeleton-block h-8 rounded-2xl" />
            <div className="takdi-skeleton-block h-8 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
