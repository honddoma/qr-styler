import { Suspense } from "react";
import EditClient from "@/components/EditClient";

export default async function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense>
      <EditClient slug={slug} />
    </Suspense>
  );
}
