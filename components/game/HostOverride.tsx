"use client";

import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";

interface HostOverrideProps {
  onAward: () => Promise<void>;
  onDeny: () => Promise<void>;
  onSkip: () => Promise<void>;
  onForceSteal: () => Promise<void>;
  onSkipDraw: () => Promise<void>;
  visible: boolean;
}

export function HostOverride({
  onAward,
  onDeny,
  onSkip,
  onForceSteal,
  onSkipDraw,
  visible,
}: HostOverrideProps) {
  if (!visible) return null;

  return (
    <Panel className="border-brick/50">
      <Label>Host controls</Label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" onClick={onAward}>Award point</Button>
        <Button size="sm" variant="danger" onClick={onDeny}>Deny</Button>
        <Button size="sm" variant="secondary" onClick={onSkip}>Skip turn</Button>
        <Button size="sm" variant="secondary" onClick={onForceSteal}>
          Force steal
        </Button>
        <Button size="sm" variant="ghost" onClick={onSkipDraw} className="col-span-2">
          Skip draw
        </Button>
      </div>
    </Panel>
  );
}
