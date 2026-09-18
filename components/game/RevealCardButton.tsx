"use client";

import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";

interface RevealCardButtonProps {
  selectedPrompt: string | null;
  onReveal: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

export function RevealCardButton({
  selectedPrompt,
  onReveal,
  disabled,
  loading,
}: RevealCardButtonProps) {
  if (!selectedPrompt) return null;

  return (
    <Panel>
      <Label>Step 2 — Read in Discord</Label>
      <p className="text-ash text-sm mt-2 mb-3">
        Say this question out loud in voice chat, then reveal it to everyone.
      </p>
      <div className="rounded-lg border border-graphite bg-ink p-4 mb-4">
        <p className="text-paper text-lg font-semibold leading-snug">
          {selectedPrompt}
        </p>
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={onReveal}
        disabled={disabled || loading}
      >
        Reveal card & start timer
      </Button>
    </Panel>
  );
}
