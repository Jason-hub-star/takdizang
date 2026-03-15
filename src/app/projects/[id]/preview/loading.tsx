/** 프리뷰 페이지 로딩 스켈레톤 */
export default function Loading() {
  return (
    <main className="takdi-skeleton-shell min-h-screen p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="takdi-skeleton-block takdi-skeleton-line h-7 w-48 animate-pulse" />
        <div className="takdi-skeleton-block h-9 w-16 animate-pulse rounded-xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="takdi-skeleton-panel aspect-[9/16] animate-pulse rounded-[28px] p-4">
          <div className="takdi-skeleton-block h-full w-full rounded-[24px]" />
        </div>
      </div>

      <div className="takdi-skeleton-block takdi-skeleton-line mt-6 h-4 w-48 animate-pulse" />
    </main>
  );
}
