// ✅ src/app/dashboard/page.js (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BudgetPage from "@/components/BudgetsPage";
export default async function Budgets() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <BudgetPage user={session.user} />;
}
