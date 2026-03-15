/** Message-aware formatting helpers for counts, suffixes, and composite labels. */
import type { MessageSchema } from "./schema";

export function formatShowingProjects(messages: MessageSchema, visible: number, total: number) {
  return `${total}개 중 ${visible}${messages.common.summary.projectsVisibleLabel}`;
}

export function formatShowingTemplates(messages: MessageSchema, visible: number, total: number) {
  return `${total}개 중 ${visible}${messages.common.summary.templatesVisibleLabel}`;
}

export function formatBlocksCount(messages: MessageSchema, count: number) {
  return `${count}${messages.common.summary.blocksLabel}`;
}

export function formatCreateProjectName(messages: MessageSchema, label: string) {
  return `${label} ${messages.modeCard.projectNameSuffix}`;
}

export function formatCurrentScope(messages: MessageSchema, workspaceId: string) {
  return `${messages.settingsPage.currentScopeLabel}: ${workspaceId}`;
}

export function formatSavedAt(messages: MessageSchema, time: string) {
  return `${time} ${messages.composeShared.savedAtLabel}`;
}

export function formatComposeDocumentSaveFailed(messages: MessageSchema, reason: string) {
  return `${messages.composeShared.composeDocumentSaveFailedPrefix}: ${reason}`;
}

export function formatDesignIssuesNeedAttention(messages: MessageSchema, count: number) {
  return `${count}${messages.composeShared.designIssuesNeedAttentionSuffix}`;
}

export function formatAppliedAutomaticFixes(messages: MessageSchema, count: number) {
  return `${count}${messages.composeShared.appliedAutomaticFixesSuffix}`;
}

export function formatFavoriteTemplateSaveFailed(messages: MessageSchema, reason: string) {
  return `${messages.composeShared.favoriteTemplateSaveFailedPrefix}: ${reason}`;
}

export function formatTemplateApplied(messages: MessageSchema, label?: string) {
  return label
    ? `${messages.composeShared.templateAppliedPrefix}: ${label}`
    : messages.composeShared.templateAppliedPrefix;
}

export function formatTemplateStartFailed(messages: MessageSchema, reason: string) {
  return `${messages.composeShared.templateStartFailedPrefix}: ${reason}`;
}
