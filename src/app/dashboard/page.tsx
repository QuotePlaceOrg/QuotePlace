import { redirect } from "next/navigation";
// /dashboard was a thin duplicate of the profile. Canonical route is /profile.
export default function DashboardRedirect() { redirect("/profile"); }
