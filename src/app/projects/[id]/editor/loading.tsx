/** 노드 에디터 로딩 스켈레톤 — 3패널 레이아웃 */
export default function Loading() {
  return (
    <div className="takdi-skeleton-shell flex h-screen">
      <div className="takdi-skeleton-panel m-4 mr-0 w-64 animate-pulse rounded-[28px] p-5">
        <div className="takdi-skeleton-block takdi-skeleton-line mb-2 h-4 w-20" />
        <div className="takdi-skeleton-block takdi-skeleton-line mb-4 h-3 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-[rgb(247_239_231_/_0.72)] p-3">
              <div className="takdi-skeleton-block h-8 w-8 rounded-xl" />
              <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 animate-pulse p-8">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-8 rounded-[32px] border border-[rgb(214_199_184_/_0.24)] bg-[rgb(255_255_255_/_0.24)] px-8 py-16">
          <div className="takdi-skeleton-block h-20 w-36 rounded-[24px]" />
          <div className="takdi-skeleton-block h-1 w-16 rounded-full" />
          <div className="takdi-skeleton-block h-20 w-36 rounded-[24px]" />
          <div className="takdi-skeleton-block h-1 w-16 rounded-full" />
          <div className="takdi-skeleton-block h-20 w-36 rounded-[24px]" />
        </div>
      </div>

      <div className="takdi-skeleton-panel m-4 ml-0 w-80 animate-pulse rounded-[28px] p-5">
        <div className="takdi-skeleton-block takdi-skeleton-line mb-4 h-4 w-24" />
        <div className="space-y-3">
          <div className="takdi-skeleton-block h-8 rounded-2xl" />
          <div className="takdi-skeleton-block h-8 rounded-2xl" />
          <div className="takdi-skeleton-block h-8 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
