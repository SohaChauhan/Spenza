// ✅ src/app/dashboard/page.js (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import VisualizationPage from "@/components/VisualizationPage";
export default async function Visualizations() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <VisualizationPage user={session.user} />;
}
