import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Budget from "@/models/Budget";

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  const { category, amount } = await req.json();

  await connectToDatabase();
  const updated = await Budget.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { category, amount },
    { new: true }
  );
  if (!updated) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  await connectToDatabase();
  const deleted = await Budget.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
