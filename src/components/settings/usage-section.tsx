/** 사용량 탭 — 월간 개요 + 타입별 브레이크다운 + 최근 이력 */
"use client";

import { useT } from "@/i18n/use-t";
import { SummaryCard } from "@/components/shared/summary-card";
import { UsageProgressBar } from "@/components/shared/usage-progress-bar";
import type { SettingsPageData } from "@/features/workspace-hub/home-feed";

function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function UsageSection({ data }: { data: SettingsPageData }) {
  const { messages } = useT();
  const m = messages.settingsPage.usageSection;

  return (
    <div className="space-y-8">
      {/* 월간 개요 */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.monthlyOverview}</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SummaryCard
            title={m.monthlyEvents}
            value={String(data.usage.monthlyEventCount)}
            description={m.monthlyEventsDescription}
          />
          <SummaryCard
            title={m.exports}
            value={String(data.usage.exportCount)}
            description={m.exportsDescription}
          />
          <SummaryCard
            title={m.estimatedCost}
            value={`$${data.usage.totalEstimatedCost.toFixed(2)}`}
            description={m.estimatedCostDescription}
          />
        </div>
      </div>

      {/* 타입별 브레이크다운 */}
      <div className="takdi-panel-strong rounded-[1.9rem] p-6">
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.perTypeBreakdown}</h3>
        <p className="mt-1 text-sm text-[var(--takdi-text-muted)]">{m.perTypeDescription}</p>
        <div className="mt-5 space-y-4">
          {data.usage.perType.map((item) => (
            <UsageProgressBar
              key={item.eventType}
              label={item.label}
              used={item.used}
              limit={item.limit}
              costPerUnit={item.costPerUnit}
            />
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="takdi-panel-strong rounded-[1.9rem] p-6">
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.recentActivity}</h3>
        <p className="mt-1 text-sm text-[var(--takdi-text-muted)]">{m.recentActivityDescription}</p>

        {data.recentActivity.length > 0 ? (
          <div className="mt-5 space-y-3">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="takdi-activity-item">
                <div>
                  <p className="text-sm font-semibold text-[var(--takdi-text)]">{item.label}</p>
                  <p className="mt-1 text-sm text-[var(--takdi-text-muted)]">{item.detail}</p>
                </div>
                <div className="text-sm text-[var(--takdi-text-subtle)] md:text-right">
                  <p>{formatDateTime(item.createdAt)}</p>
                  <p className="mt-1">
                    {item.costEstimate != null ? `$${item.costEstimate.toFixed(2)}` : m.noCostInfo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--takdi-text-muted)]">{m.noActivity}</p>
        )}
      </div>
    </div>
  );
}
