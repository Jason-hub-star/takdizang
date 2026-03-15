/** 홈 페이지 로딩 스켈레톤 */
export default function Loading() {
  return (
    <div className="takdi-skeleton-shell min-h-screen p-8">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="takdi-skeleton-block takdi-skeleton-line mb-3 h-8 w-52" />
        <div className="takdi-skeleton-block takdi-skeleton-line mb-8 h-4 w-72" />

        <div className="flex gap-4 pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="takdi-skeleton-panel flex min-w-45 flex-col items-center gap-3 rounded-[28px] p-6">
              <div className="takdi-skeleton-block h-12 w-12 rounded-2xl" />
              <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-16" />
              <div className="takdi-skeleton-block takdi-skeleton-line h-3 w-24" />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="takdi-skeleton-block takdi-skeleton-line mb-4 h-6 w-32" />
          <div className="takdi-skeleton-panel rounded-[28px] p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b border-[rgb(214_199_184_/_0.28)] px-6 py-4 last:border-0">
                <div className="flex items-center gap-4">
                <div className="takdi-skeleton-block h-10 w-10 rounded-xl" />
                <div className="flex-1">
                  <div className="takdi-skeleton-block takdi-skeleton-line h-4 w-32" />
                  <div className="takdi-skeleton-block takdi-skeleton-line mt-2 h-3 w-48" />
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
