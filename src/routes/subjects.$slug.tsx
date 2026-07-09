import { createFileRoute, Outlet } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { getSubjectBySlug } from "@/lib/db/papers.functions";
import { SiteLayout } from "@/components/site/SiteLayout";

const subjectQ = (slug: string) =>
  queryOptions({
    queryKey: ["subject", slug],
    queryFn: () => getSubjectBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/subjects/$slug")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(subjectQ(params.slug));
  },
  component: () => <Outlet />,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-8 text-destructive">{error.message}</div>
    </SiteLayout>
  ),
});
