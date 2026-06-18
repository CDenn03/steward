import { Save } from "lucide-react";
import { updateOrgAction } from "./actions";
import type { OrganizationOverview } from "@/features/admin/repositories";

export async function OrgSettingsForm({ org }: { org: OrganizationOverview }) {
  return (
    <form action={updateOrgAction} className="p-5 space-y-4">
      <input type="hidden" name="id" value={org.id} />
      <div>
        <label className="block text-[12px] font-medium mb-1.5">Organisation Name</label>
        <input type="text" name="name" defaultValue={org.name}
          className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors" required />
      </div>
      <div>
        <label className="block text-[12px] font-medium mb-1.5">Slug</label>
        <input type="text" name="slug" defaultValue={org.slug}
          className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) font-mono transition-colors" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-medium mb-1.5">Currency</label>
          <select name="currency" defaultValue={org.currency}
            className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) transition-colors">
            <option value="KES">KES</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="UGX">UGX</option>
            <option value="TZS">TZS</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium mb-1.5">Fiscal Year Start</label>
          <input type="text" name="fiscalYearStart" defaultValue={org.fiscalYearStart}
            className="w-full px-3 py-2.5 text-[13px] bg-(--surface) border border-(--border) rounded-(--r-input) outline-none focus:border-(--primary) text-(--text) font-mono transition-colors" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium bg-(--primary) text-white rounded-(--r-btn) hover:opacity-90 transition-opacity">
          <Save size={13} /> Save Changes
        </button>
      </div>
    </form>
  );
}
