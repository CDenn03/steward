"use client";

import { useState } from "react";
import { useOrg } from "@/lib/org/context";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/shared/file-upload";
import {
  updateOrganizationAction,
  updateUserProfileAction,
  updateNotificationPreferencesAction,
  getProfilePhotoUploadUrlAction,
  saveProfilePhotoAction,
  getLogoUploadUrlAction,
  saveLogoAction,
} from "@/features/settings/actions";

export default function SettingsPage() {
  const { active } = useOrg();
  const [orgSaving, setOrgSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [orgName, setOrgName] = useState(active?.orgName ?? "");
  const [currency, setCurrency] = useState(active?.currency ?? "KES");
  const [fiscalYearStart, setFiscalYearStart] = useState("01-01");
  const [userName, setUserName] = useState(active?.userName ?? "");
  const [userEmail, setUserEmail] = useState(active?.userEmail ?? "");
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    "Budget submitted for review": true,
    "Approval decisions": true,
    "Outstanding reports reminder": false,
    "Account balance alerts": false,
  });
  const [notifMsg, setNotifMsg] = useState("");

  const handleOrgSave = async () => {
    setOrgSaving(true);
    await updateOrganizationAction({ name: orgName, currency, fiscalYearStart });
    setOrgSaving(false);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    await updateUserProfileAction({ name: userName, email: userEmail });
    setProfileSaving(false);
  };

  const handleNotifToggle = async (label: string) => {
    const updated = { ...notifPrefs, [label]: !notifPrefs[label] };
    setNotifPrefs(updated);
    const res = await updateNotificationPreferencesAction(updated);
    if ("error" in res) setNotifMsg("Failed to save preference");
    else setNotifMsg("Preference saved");
    setTimeout(() => setNotifMsg(""), 3000);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your organisation and account settings" />
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Organisation</p></CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Input label="Organisation Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <Input label="Fiscal Year Start" value={fiscalYearStart} onChange={(e) => setFiscalYearStart(e.target.value)} />
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleOrgSave} loading={orgSaving}>Save Changes</Button>
                <FileUpload
                  accept="image/png,image/jpeg,image/webp"
                  label="Upload Logo"
                  description="PNG, JPEG or WebP, max 10 MB"
                  getUploadUrl={getLogoUploadUrlAction}
                  saveKey={saveLogoAction}
                />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Approval Workflow</p></CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {[
                { label: "Finance Review Required",    desc: "Budgets must pass finance review before chair approval" },
                { label: "Two-stage Approval",         desc: "Finance Officer then Chairperson must both approve" },
                { label: "Expenditure Report Required",desc: "Reports must be submitted after each event" },
              ].map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 py-2 border-b border-(--border) last:border-0">
                  <div>
                    <p className="text-[13px] font-medium">{s.label}</p>
                    <p className="text-[12px] text-(--muted)">{s.desc}</p>
                  </div>
                  <div
                    role="switch"
                    aria-checked={false}
                    tabIndex={0}
                    className="w-9 h-5 bg-(--border) rounded-full flex items-center shrink-0 cursor-pointer transition-colors hover:bg-(--muted)"
                    onClick={() => {}}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") {} }}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm ml-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Your Profile</p></CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[16px] font-semibold text-(--primary)">
                  {active?.userInitials ?? "?"}
                </div>
                <div>
                  <p className="text-[14px] font-medium">{active?.userName ?? "—"}</p>
                  <p className="text-[12px] text-(--muted)">{active?.userEmail ?? "—"}</p>
                </div>
              </div>
              <Input label="Full Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
              <Input label="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} type="email" />
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleProfileSave} loading={profileSaving}>Update Profile</Button>
                <FileUpload
                  accept="image/png,image/jpeg,image/webp"
                  label="Upload Photo"
                  description="PNG, JPEG or WebP, max 10 MB"
                  getUploadUrl={getProfilePhotoUploadUrlAction}
                  saveKey={saveProfilePhotoAction}
                />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle><p className="text-[14px] font-medium">Notifications</p></CardTitle></CardHeader>
            <CardBody className="space-y-3">
              {Object.keys(notifPrefs).map((label) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-(--border) last:border-0">
                  <p className="text-[13px]">{label}</p>
                  <div
                    role="switch"
                    aria-checked={notifPrefs[label]}
                    tabIndex={0}
                    className={`w-9 h-5 rounded-full flex items-center shrink-0 cursor-pointer transition-colors ${
                      notifPrefs[label] ? "bg-(--primary)" : "bg-(--border)"
                    }`}
                    onClick={() => handleNotifToggle(label)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleNotifToggle(label);
                      }
                    }}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        notifPrefs[label] ? "ml-[18px]" : "ml-0.5"
                      }`}
                    />
                  </div>
                </div>
              ))}
              {notifMsg && (
                <p className="text-[11px] text-(--muted) text-right">{notifMsg}</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
