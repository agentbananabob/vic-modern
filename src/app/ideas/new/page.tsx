import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { IdeaForm } from "@/components/ideas/IdeaForm";

export default async function NewIdeaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Submit Investment Idea</h1>
      <p className="text-sm text-gray-500 mb-6">Share a long or short thesis with the community.</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <IdeaForm />
      </div>
    </div>
  );
}
