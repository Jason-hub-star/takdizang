/** 설정 페이지 탭 컨테이너 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleUser, BarChart3, Building2, Cpu } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useT } from "@/i18n/use-t";
import type { SettingsPageData } from "@/features/workspace-hub/home-feed";
import { AccountSection } from "./account-section";
import { UsageSection } from "./usage-section";
import { WorkspaceSection } from "./workspace-section";
import { ProviderSection } from "./provider-section";

const TAB_IDS = ["account", "usage", "workspace", "providers"] as const;
type TabId = (typeof TAB_IDS)[number];

function getInitialTab(): TabId {
  if (typeof window === "undefined") return "account";
  const hash = window.location.hash.replace("#", "");
  return TAB_IDS.includes(hash as TabId) ? (hash as TabId) : "account";
}

export function SettingsShell({ data }: { data: SettingsPageData }) {
  const { messages } = useT();
  const [activeTab, setActiveTab] = useState<TabId>("account");

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, []);

  const handleTabChange = useCallback((value: string) => {
    const tab = value as TabId;
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  }, []);

  const tabItems = [
    { id: "account" as const, label: messages.settingsPage.tabs.account, icon: CircleUser },
    { id: "usage" as const, label: messages.settingsPage.tabs.usage, icon: BarChart3 },
    { id: "workspace" as const, label: messages.settingsPage.tabs.workspace, icon: Building2 },
    { id: "providers" as const, label: messages.settingsPage.tabs.providers, icon: Cpu },
  ];

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-[rgb(214_199_184_/_0.55)] px-0">
        {tabItems.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="gap-2 px-4 py-2.5">
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="account">
        <AccountSection data={data} />
      </TabsContent>

      <TabsContent value="usage">
        <UsageSection data={data} />
      </TabsContent>

      <TabsContent value="workspace">
        <WorkspaceSection data={data} />
      </TabsContent>

      <TabsContent value="providers">
        <ProviderSection data={data} />
      </TabsContent>
    </Tabs>
  );
}
