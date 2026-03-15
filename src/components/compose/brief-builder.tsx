"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, LayoutTemplate as LayoutTemplateIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ComposeTemplateSummary,
  getComposeTemplate,
  listComposeTemplates,
} from "@/lib/api-client";
import {
  HOOK_LIBRARY,
  HOOK_STYLES,
  PERSUASION_FRAMEWORKS,
  PLATFORM_WIDTHS,
  PRODUCT_CATEGORIES,
  type HookStyle,
  type PersuasionFramework,
} from "@/lib/constants";
import {
  getBestTemplate,
  getTemplateByFramework,
  getTemplatesByCategory,
  type LayoutTemplate,
} from "@/lib/layout-templates";
import type { MoodboardPreset } from "@/lib/moodboard-presets";
import type { Block, BlockDocument, BlockType } from "@/types/blocks";
import { formatBlocksCount } from "@/i18n/format";
import { instantiateTemplateDocument } from "@/lib/compose-templates";
import { useT } from "@/i18n/use-t";
import { WORKSPACE_CONTROL, WORKSPACE_SURFACE, WORKSPACE_TEXT } from "@/lib/workspace-surface";
import { BLOCK_TEMPLATES } from "./block-palette";
import { MoodboardPicker } from "./moodboard-picker";

interface BriefBuilderProps {
  open: boolean;
  currentPlatformName: string;
  onClose: () => void;
  onApplyTemplate: (doc: BlockDocument, sourceLabel?: string) => boolean;
}

function createEmptyBlock(type: BlockType): Block | null {
  const template = BLOCK_TEMPLATES.find((item) => item.type === type);
  return template ? template.create() : null;
}

function templateToBlocks(template: LayoutTemplate): Block[] {
  return template.sequence
    .map((type) => createEmptyBlock(type))
    .filter((block): block is Block => block !== null);
}

export function BriefBuilder({
  open,
  currentPlatformName,
  onClose,
  onApplyTemplate,
}: BriefBuilderProps) {
  const { messages } = useT();
  const [activeTab, setActiveTab] = useState<"guided" | "saved">("guided");
  const [category, setCategory] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);
  const [framework, setFramework] = useState<PersuasionFramework>("aida");
  const [hookStyle, setHookStyle] = useState<HookStyle | null>(null);
  const [selectedMoodboardPreset, setSelectedMoodboardPreset] = useState<MoodboardPreset | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<ComposeTemplateSummary[]>([]);
  const [savedTemplatesLoading, setSavedTemplatesLoading] = useState(false);
  const [selectedSavedTemplateId, setSelectedSavedTemplateId] = useState<string | null>(null);
  const [applyingSavedTemplate, setApplyingSavedTemplate] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setSavedTemplatesLoading(true);

    listComposeTemplates()
      .then((response) => {
        if (!cancelled) {
          setSavedTemplates(response.templates);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedTemplates([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSavedTemplatesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleMoodboardSelect = useCallback((preset: MoodboardPreset) => {
    setSelectedMoodboard(preset.id);
    setSelectedMoodboardPreset(preset);
  }, []);

  const handleApplyGuided = useCallback(() => {
    const explicitTemplate = selectedTemplate
      ? getTemplatesByCategory(category).find((template) => template.id === selectedTemplate)
      : null;
    const template =
      explicitTemplate ?? getTemplateByFramework(framework) ?? getBestTemplate(category);
    const blocks = templateToBlocks(template);

    if (hookStyle && category && HOOK_LIBRARY[category]) {
      const hookText = HOOK_LIBRARY[category][hookStyle];
      if (hookText) {
        const heroIndex = blocks.findIndex((block) => block.type === "hero");
        if (heroIndex >= 0) {
          const hero = blocks[heroIndex];
          if (hero.type === "hero" && hero.overlays.length > 0) {
            blocks[heroIndex] = {
              ...hero,
              overlays: hero.overlays.map((overlay, index) =>
                index === 0 ? { ...overlay, text: hookText } : overlay,
              ),
            };
          }
        }
      }
    }

    const didApply = onApplyTemplate(
      {
        format: "blocks",
        blocks,
        platform: {
          width: PLATFORM_WIDTHS[currentPlatformName] ?? 780,
          name: currentPlatformName,
        },
        theme: selectedMoodboardPreset?.theme,
        version: 1,
      },
      template.label,
    );
    if (didApply) {
      onClose();
    }
  }, [
    category,
    currentPlatformName,
    framework,
    hookStyle,
    onApplyTemplate,
    onClose,
    selectedMoodboardPreset,
    selectedTemplate,
  ]);

  const handleApplySaved = useCallback(async () => {
    if (!selectedSavedTemplateId || applyingSavedTemplate) {
      return;
    }

    setApplyingSavedTemplate(true);
    try {
      const response = await getComposeTemplate(selectedSavedTemplateId);
      const didApply = onApplyTemplate(
        instantiateTemplateDocument(response.template.snapshot),
        response.template.name,
      );
      if (didApply) {
        onClose();
      }
    } finally {
      setApplyingSavedTemplate(false);
    }
  }, [applyingSavedTemplate, onApplyTemplate, onClose, selectedSavedTemplateId]);

  if (!open) {
    return null;
  }

  const templates = category ? getTemplatesByCategory(category) : [];
  const hookOptions = category && HOOK_LIBRARY[category] ? HOOK_LIBRARY[category] : null;

  return (
    <div className="takdi-overlay-backdrop fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className={`takdi-overlay-panel max-h-[85vh] w-[560px] overflow-y-auto rounded-[28px] p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutTemplateIcon className={`h-5 w-5 ${WORKSPACE_TEXT.accent}`} />
            <h2 className={`text-base font-semibold ${WORKSPACE_TEXT.title}`}>{messages.composeShared.composeTemplatesTitle}</h2>
          </div>
          <button onClick={onClose} className={`${WORKSPACE_TEXT.muted} hover:text-[var(--takdi-text)]`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`mb-5 inline-flex rounded-full p-1 ${WORKSPACE_SURFACE.softInset}`}>
          <button
            type="button"
            onClick={() => setActiveTab("guided")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              activeTab === "guided" ? WORKSPACE_CONTROL.accentTint : WORKSPACE_TEXT.body
            }`}
          >
            {messages.composeShared.guided}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              activeTab === "saved" ? WORKSPACE_CONTROL.accentTint : WORKSPACE_TEXT.body
            }`}
          >
            {messages.composeShared.saved}
          </button>
        </div>

        {activeTab === "saved" ? (
          <div>
            {savedTemplatesLoading ? (
              <div className={`flex items-center justify-center py-10 text-sm ${WORKSPACE_TEXT.body}`}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {messages.composeShared.loadingSavedTemplates}
              </div>
            ) : savedTemplates.length === 0 ? (
              <div className={`rounded-[24px] border border-dashed p-6 text-center ${WORKSPACE_SURFACE.softInset}`}>
                <Bookmark className={`mx-auto mb-2 h-5 w-5 ${WORKSPACE_TEXT.muted}`} />
                <p className={`text-sm font-medium ${WORKSPACE_TEXT.title}`}>{messages.composeShared.noSavedFavoritesTitle}</p>
                <p className={`mt-1 text-xs ${WORKSPACE_TEXT.body}`}>{messages.composeShared.noSavedFavoritesDescription}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedSavedTemplateId(template.id)}
                    className={`w-full rounded-[24px] border px-4 py-3 text-left transition ${
                      selectedSavedTemplateId === template.id
                        ? WORKSPACE_CONTROL.accentTint
                        : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-semibold ${WORKSPACE_TEXT.title}`}>{template.name}</p>
                        <p className={`truncate text-xs ${WORKSPACE_TEXT.body}`}>
                          {template.previewTitle ?? messages.composeShared.savedTemplatePreviewFallback}
                        </p>
                      </div>
                      <div className={`text-right text-[11px] ${WORKSPACE_TEXT.muted}`}>
                        <div>{formatBlocksCount(messages, template.blockCount)}</div>
                        <div>{new Date(template.updatedAt).toLocaleDateString("ko-KR")}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button
              onClick={handleApplySaved}
              disabled={!selectedSavedTemplateId || applyingSavedTemplate}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl ${WORKSPACE_CONTROL.accentButton}`}
            >
              {applyingSavedTemplate ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {messages.composeShared.applyingTemplate}
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  {messages.common.actions.applySavedTemplate}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.body}`}>{messages.composeShared.category}</label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map((categoryOption) => (
                  <button
                    key={categoryOption.value}
                    onClick={() => {
                      setCategory(categoryOption.value);
                      setSelectedTemplate(null);
                      setHookStyle(null);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      category === categoryOption.value
                        ? WORKSPACE_CONTROL.accentButton
                        : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                    }`}
                  >
                    {categoryOption.label}
                  </button>
                ))}
              </div>
            </div>

            {category && (
              <div className="mb-5">
                <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.body}`}>{messages.composeShared.framework}</label>
                <div className="space-y-1.5">
                  {PERSUASION_FRAMEWORKS.map((frameworkOption) => (
                    <button
                      key={frameworkOption.value}
                      onClick={() => {
                        setFramework(frameworkOption.value);
                        setSelectedTemplate(null);
                      }}
                    className={`w-full rounded-[20px] border px-3 py-2 text-left transition ${
                      framework === frameworkOption.value
                        ? WORKSPACE_CONTROL.accentTint
                        : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                    }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${WORKSPACE_TEXT.title}`}>{frameworkOption.label}</span>
                        <span className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>
                          {formatBlocksCount(messages, frameworkOption.sequence.length)}
                        </span>
                      </div>
                      <p className={`mt-0.5 text-[11px] ${WORKSPACE_TEXT.body}`}>{frameworkOption.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hookOptions && (
              <div className="mb-5">
                <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.body}`}>{messages.composeShared.hook}</label>
                <div className="grid grid-cols-2 gap-2">
                  {HOOK_STYLES.map((hookOption) => {
                    const text = hookOptions[hookOption.value];
                    return (
                      <button
                        key={hookOption.value}
                        onClick={() => setHookStyle(hookOption.value)}
                        className={`rounded-[20px] border px-3 py-2 text-left transition ${
                          hookStyle === hookOption.value
                            ? WORKSPACE_CONTROL.accentTint
                            : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                        }`}
                      >
                        <span className={`text-xs font-semibold ${WORKSPACE_TEXT.title}`}>{hookOption.label}</span>
                        <p className={`mt-0.5 line-clamp-2 text-[10px] ${WORKSPACE_TEXT.body}`}>&ldquo;{text}&rdquo;</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {category && templates.length > 0 && (
              <div className="mb-5">
                <label className={`mb-1.5 block text-xs font-medium ${WORKSPACE_TEXT.body}`}>{messages.composeShared.layoutStructure}</label>
                <div className="space-y-1.5">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`w-full rounded-[20px] border px-3 py-2.5 text-left transition ${
                        selectedTemplate === template.id
                          ? WORKSPACE_CONTROL.accentTint
                          : `${WORKSPACE_CONTROL.subtleButton} shadow-none`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${WORKSPACE_TEXT.title}`}>{template.label}</span>
                        <span className={`text-[10px] ${WORKSPACE_TEXT.muted}`}>
                          {formatBlocksCount(messages, template.sequence.length)}
                        </span>
                      </div>
                      <p className={`mt-0.5 text-[11px] ${WORKSPACE_TEXT.body}`}>{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category && (
              <div className="mb-5">
                <MoodboardPicker
                  category={category}
                  selected={selectedMoodboard}
                  onSelect={handleMoodboardSelect}
                />
              </div>
            )}

            <Button
              onClick={handleApplyGuided}
              disabled={!category}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl ${WORKSPACE_CONTROL.accentButton}`}
            >
              <LayoutTemplateIcon className="h-4 w-4" />
              {messages.common.actions.applyGuidedTemplate}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
