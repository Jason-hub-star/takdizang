/** AI 프로바이더 탭 — 연결 상태 카드 */
"use client";

import { ImageIcon, MessageSquareText, Film } from "lucide-react";
import { useT } from "@/i18n/use-t";
import { Badge } from "@/components/ui/badge";
import type { SettingsPageData } from "@/features/workspace-hub/home-feed";

interface ProviderCardProps {
  name: string;
  description: string;
  status: "active" | "mock";
  statusLabel: string;
  icon: React.ReactNode;
}

function ProviderCard({ name, description, status, statusLabel, icon }: ProviderCardProps) {
  return (
    <div className="takdi-panel-strong flex items-start gap-4 rounded-[1.8rem] p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgb(248_241_232_/_0.8)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--takdi-text)]">{name}</span>
          <Badge
            variant={status === "active" ? "default" : "outline"}
            className={
              status === "active"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
            }
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--takdi-text-muted)]">{description}</p>
      </div>
    </div>
  );
}

export function ProviderSection({ data }: { data: SettingsPageData }) {
  const { messages } = useT();
  const m = messages.settingsPage.providersSection;

  const providers = [
    {
      name: m.kieAi,
      description: m.kieAiDescription,
      status: data.providers.kieAi,
      icon: <ImageIcon className="h-5 w-5 text-[var(--takdi-text-muted)]" />,
    },
    {
      name: m.gemini,
      description: m.geminiDescription,
      status: data.providers.gemini,
      icon: <MessageSquareText className="h-5 w-5 text-[var(--takdi-text-muted)]" />,
    },
    {
      name: m.remotion,
      description: m.remotionDescription,
      status: data.providers.remotion,
      icon: <Film className="h-5 w-5 text-[var(--takdi-text-muted)]" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.sectionTitle}</h3>
        <p className="mt-1 text-sm text-[var(--takdi-text-muted)]">{m.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {providers.map((p) => (
          <ProviderCard
            key={p.name}
            name={p.name}
            description={p.description}
            status={p.status}
            statusLabel={p.status === "active" ? m.statusActive : m.statusMock}
            icon={p.icon}
          />
        ))}
      </div>

      <div className="takdi-panel rounded-[1.9rem] border-dashed p-6">
        <p className="text-sm text-[var(--takdi-text-muted)]">{m.apiKeysComingSoon}</p>
      </div>
    </div>
  );
}
