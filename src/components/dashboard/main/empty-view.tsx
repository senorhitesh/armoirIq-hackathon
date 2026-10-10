"use client";

import Button from "@/components/_ui/button";
import { useUiStore, type NavId } from "@/stores/ui-store";
import { CubeIcon, LayersIcon, DotsIcon } from "@/components/_common/icons";

const views: Partial<Record<NavId, { title: string; icon: typeof CubeIcon }>> = {
  projects: { title: "Projects", icon: CubeIcon },
  "team-projects": { title: "Projects", icon: CubeIcon },
  views: { title: "Views", icon: LayersIcon },
  "team-views": { title: "Views", icon: LayersIcon },
  more: { title: "More", icon: DotsIcon },
};

export default function EmptyView({ nav }: { nav: NavId }) {
  const setNav = useUiStore((state) => state.setNav);
  const view = views[nav] ?? { title: "This section", icon: DotsIcon };
  const Icon = view.icon;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="bg-secondary shadow-ring flex size-12 items-center justify-center rounded-2xl">
        <Icon aria-hidden className="text-icon size-5" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold text-foreground">{view.title}</h2>
        <p className="text-muted-foreground max-w-[26em] text-sm">
          Navigate to the Workspace Kanban or Ads Analytics to view live campaign data.
        </p>
      </div>
      <Button variant="primary" size="md" onClick={() => setNav("workspace")}>
        Go to Workspace
      </Button>
    </div>
  );
}
