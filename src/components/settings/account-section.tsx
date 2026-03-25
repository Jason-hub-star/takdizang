/** 내 계정 탭 — 프로필, 비밀번호, 연결 계정, 위험 영역 */
"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, ChevronDown, KeyRound, Mail, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n/use-t";
import { updateProfile, uploadAvatar, changePassword } from "@/lib/api-client";
import { InlineEdit } from "@/components/shared/inline-edit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SettingsPageData } from "@/features/workspace-hub/home-feed";

export function AccountSection({ data }: { data: SettingsPageData }) {
  const { messages } = useT();
  const m = messages.settingsPage.account;
  const { profile } = data;

  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const isOAuth = profile.authProvider !== "email";

  const handleNameSave = useCallback(
    async (newName: string) => {
      try {
        const { profile: updated } = await updateProfile({ displayName: newName });
        setDisplayName(updated.displayName ?? "");
        toast.success(m.profileUpdated);
      } catch {
        toast.error(m.profileUpdateFailed);
        throw new Error();
      }
    },
    [m],
  );

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const { avatarUrl: newUrl } = await uploadAvatar(file);
        setAvatarUrl(newUrl);
        toast.success(m.avatarUpdated);
      } catch {
        toast.error(m.avatarUpdateFailed);
      }
      e.target.value = "";
    },
    [m],
  );

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPw.length < 8) {
        toast.error(m.passwordMinLength);
        return;
      }
      if (newPw !== confirmPw) {
        toast.error(m.passwordMismatch);
        return;
      }
      setPwSaving(true);
      try {
        await changePassword({ currentPassword: currentPw, newPassword: newPw });
        toast.success(m.passwordChanged);
        setPasswordOpen(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } catch {
        toast.error(m.passwordChangeFailed);
      } finally {
        setPwSaving(false);
      }
    },
    [currentPw, newPw, confirmPw, m],
  );

  const initials = (displayName || profile.email || "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="space-y-8">
      {/* 프로필 */}
      <div className="takdi-panel-strong rounded-[1.9rem] p-6">
        <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.sectionTitle}</h3>
        <div className="mt-6 flex items-start gap-6">
          {/* 아바타 */}
          <button
            type="button"
            onClick={handleAvatarClick}
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(214_199_184_/_0.65)] bg-[rgb(248_241_232_/_0.8)] transition-colors hover:border-[var(--takdi-accent)]"
            title={m.avatar}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-[var(--takdi-text-muted)]">{initials}</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          {/* 이름 + 이메일 */}
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="takdi-stat-label">{m.displayName}</p>
              <div className="mt-1">
                <InlineEdit
                  value={displayName}
                  onSave={handleNameSave}
                  placeholder={m.displayNamePlaceholder}
                  className="text-base font-semibold text-[var(--takdi-text)]"
                />
              </div>
            </div>
            <div>
              <p className="takdi-stat-label">{m.email}</p>
              <p className="mt-1 text-sm text-[var(--takdi-text)]">{profile.email}</p>
              <p className="mt-0.5 text-xs text-[var(--takdi-text-subtle)]">{m.emailDescription}</p>
            </div>
            <p className="text-xs text-[var(--takdi-text-subtle)]">{m.avatarUploadHint}</p>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      {!isOAuth && (
        <div className="takdi-panel-strong rounded-[1.9rem] p-6">
          <button
            type="button"
            onClick={() => setPasswordOpen(!passwordOpen)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-[var(--takdi-text-muted)]" />
              <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.changePassword}</h3>
            </div>
            <ChevronDown className={`h-5 w-5 text-[var(--takdi-text-subtle)] transition-transform ${passwordOpen ? "rotate-180" : ""}`} />
          </button>

          {passwordOpen && (
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--takdi-text-muted)]">{m.currentPassword}</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgb(214_199_184_/_0.84)] bg-[rgb(255_255_255_/_0.84)] px-3 py-2 text-sm outline-none focus:border-[var(--takdi-accent)] focus:ring-2 focus:ring-[rgb(244_222_213_/_0.9)]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--takdi-text-muted)]">{m.newPassword}</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgb(214_199_184_/_0.84)] bg-[rgb(255_255_255_/_0.84)] px-3 py-2 text-sm outline-none focus:border-[var(--takdi-accent)] focus:ring-2 focus:ring-[rgb(244_222_213_/_0.9)]"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--takdi-text-muted)]">{m.confirmPassword}</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[rgb(214_199_184_/_0.84)] bg-[rgb(255_255_255_/_0.84)] px-3 py-2 text-sm outline-none focus:border-[var(--takdi-accent)] focus:ring-2 focus:ring-[rgb(244_222_213_/_0.9)]"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" disabled={pwSaving} className="rounded-xl">
                {pwSaving ? "변경 중..." : m.changePassword}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* 연결된 계정 */}
      <div className="takdi-panel-strong rounded-[1.9rem] p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-[var(--takdi-text-muted)]" />
          <h3 className="text-lg font-semibold text-[var(--takdi-text)]">{m.connectedAccounts}</h3>
        </div>
        <div className="mt-4 flex items-center gap-3">
          {isOAuth ? (
            <>
              <Badge variant="secondary" className="gap-1.5">
                <Mail className="h-3 w-3" /> Google
              </Badge>
              <span className="text-sm text-[var(--takdi-text-muted)]">{m.googleConnected}</span>
            </>
          ) : (
            <>
              <Badge variant="outline" className="gap-1.5">
                <KeyRound className="h-3 w-3" /> Email
              </Badge>
              <span className="text-sm text-[var(--takdi-text-muted)]">{m.emailPasswordAccount}</span>
            </>
          )}
        </div>
      </div>

      {/* 위험 영역 */}
      <div className="rounded-[1.9rem] border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-700">{m.dangerZone}</h3>
        </div>
        <p className="mt-2 text-sm text-red-600/80">{m.deleteAccountWarning}</p>
        <Button
          variant="destructive"
          className="mt-4 rounded-xl"
          onClick={() => toast.info(m.comingSoon)}
        >
          {m.deleteAccount}
        </Button>
      </div>
    </div>
  );
}
