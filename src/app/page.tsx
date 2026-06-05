import { redirect } from "next/navigation";
// In production: check for active session and redirect to dashboard if already in an org,
// or to org-picker if the user has multiple orgs, or to login if unauthenticated.
export default function Home() {
  redirect("/org-picker");
}
