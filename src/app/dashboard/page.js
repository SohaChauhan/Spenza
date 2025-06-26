// ✅ src/app/dashboard/page.js (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardPage from "@/components/DashboardPage";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <DashboardPage user={session.user} />;
}
