"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { clamp } from "@/lib/utils";

interface HostScoreEditorProps {
  score: number;
  onAdjust: (delta: number) => Promise<void>;
  onSet: (score: number) => Promise<void>;
}

export function HostScoreEditor({
  score,
  onAdjust,
  onSet,
}: HostScoreEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(score));

  const save = async () => {
    const n = clamp(parseInt(value, 10) || 0, 0, 999);
    await onSet(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={999}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-16 rounded border border-graphite bg-ink px-2 py-1 text-paper font-mono text-sm"
        />
        <Button size="sm" onClick={save}>Save</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" onClick={() => onAdjust(-1)}>−</Button>
      <button
        type="button"
        onClick={() => {
          setValue(String(score));
          setEditing(true);
        }}
        className="font-mono text-lg text-paper min-w-[2ch] text-center"
      >
        {score}
      </button>
      <Button size="sm" variant="ghost" onClick={() => onAdjust(1)}>+</Button>
    </div>
  );
}
