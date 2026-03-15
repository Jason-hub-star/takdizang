/** Placeholder route for a future dedicated marketing landing page. */
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--takdi-bg)] px-6 py-12 text-[var(--takdi-text)]">
      <div className="mx-auto max-w-5xl space-y-8 rounded-[32px] border border-[rgb(218_205_192_/_0.8)] bg-[rgb(255_255_255_/_0.7)] p-8 shadow-[0_30px_80px_rgba(61,45,27,0.08)]">
        <div className="space-y-3">
          <p className="takdi-kicker">Landing</p>
          <h1 className="text-[clamp(2rem,3vw,3.4rem)] font-semibold tracking-[-0.05em]">
            랜딩페이지는 여기서 별도로 디자인하면 됩니다
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--takdi-text-muted)]">
            현재 `takdizang`의 메인 제품 영역은 `takdi` 본체 UI와 기능을 그대로 가져온 상태입니다.
            이 경로는 이후 마케팅용 랜딩을 따로 제작할 때 쓰기 위한 분리된 진입점입니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--takdi-text)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Studio 홈으로 이동
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-[rgb(214_199_184_/_0.78)] bg-[rgb(255_255_255_/_0.76)] px-5 py-3 text-sm font-medium text-[var(--takdi-text-muted)] transition hover:border-[rgb(212_184_166_/_0.86)] hover:text-[var(--takdi-text)]"
          >
            프로젝트 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
