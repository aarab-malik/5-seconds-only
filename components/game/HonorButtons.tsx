"use client";

import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

interface HonorButtonsProps {
  onSuccess: () => Promise<void>;
  onFail: () => Promise<void>;
  loading?: boolean;
}

export function HonorButtons({ onSuccess, onFail, loading }: HonorButtonsProps) {
  return (
    <Panel>
      <p className="text-ash text-sm mb-4 text-center">
        Say your answers on Discord — be honest!
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={onSuccess} disabled={loading}>
          I got 3!
        </Button>
        <Button size="lg" variant="danger" onClick={onFail} disabled={loading}>
          I failed
        </Button>
      </div>
    </Panel>
  );
}
