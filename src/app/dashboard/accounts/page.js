// ✅ src/app/dashboard/page.js (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountPage from "@/components/AccountsPage";
export default async function page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <AccountPage user={session.user} />;
}
