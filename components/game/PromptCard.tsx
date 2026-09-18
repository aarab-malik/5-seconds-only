"use client";

import { Panel, Label } from "@/components/ui/Panel";

interface PromptCardProps {
  prompt: string | null;
  waitingMessage?: string;
}

export function PromptCard({ prompt, waitingMessage }: PromptCardProps) {
  if (!prompt) {
    return (
      <Panel className="min-h-[160px] flex items-center justify-center text-center">
        <p className="text-ash text-lg">{waitingMessage ?? "Waiting for card…"}</p>
      </Panel>
    );
  }

  return (
    <Panel className="min-h-[160px]">
      <Label>Current question</Label>
      <p className="mt-4 text-paper text-2xl md:text-3xl font-display font-black leading-tight">
        {prompt}
      </p>
    </Panel>
  );
}
