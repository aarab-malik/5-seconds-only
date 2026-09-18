"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";
import {
  ALL_CATEGORIES,
  type CardRating,
  type GameSettings,
  RATING_ORDER,
} from "@/lib/game/types";

interface HostSettingsProps {
  settings: GameSettings;
  onSave: (settings: Partial<GameSettings>) => Promise<void>;
  disabled?: boolean;
}

export function HostSettings({ settings, onSave, disabled }: HostSettingsProps) {
  const [local, setLocal] = useState(settings);
  const [saving, setSaving] = useState(false);

  const toggleCategory = (cat: string) => {
    const enabled = local.enabledCategories.includes(cat)
      ? local.enabledCategories.filter((c) => c !== cat)
      : [...local.enabledCategories, cat];
    setLocal({ ...local, enabledCategories: enabled });
  };

  const handleRatingChange = (rating: CardRating) => {
    if (rating === "spicy" && !local.spicyConfirmed) {
      const ok = window.confirm(
        "Enable UNCENSORED (spicy) deck? This includes adult party prompts.",
      );
      if (!ok) return;
      setLocal({ ...local, maxRating: rating, spicyConfirmed: true });
      return;
    }
    setLocal({ ...local, maxRating: rating });
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(local);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Game settings</Label>
        {local.maxRating === "spicy" && local.spicyConfirmed && (
          <span className="text-xs font-mono uppercase tracking-widest text-brick border border-brick px-2 py-0.5 rounded">
            Uncensored
          </span>
        )}
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-ash mb-2">Rounds</p>
          <input
            type="number"
            min={1}
            max={10}
            value={local.totalRounds}
            onChange={(e) =>
              setLocal({ ...local, totalRounds: parseInt(e.target.value) || 3 })
            }
            className="w-full rounded border border-graphite bg-ink px-3 py-2 text-paper"
            disabled={disabled}
          />
        </div>

        <div>
          <p className="text-ash mb-2">Max rating</p>
          <div className="flex flex-wrap gap-2">
            {RATING_ORDER.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRatingChange(r)}
                disabled={disabled}
                className={`rounded px-3 py-1 border text-xs uppercase ${
                  local.maxRating === r
                    ? "border-paper text-paper bg-graphite"
                    : "border-graphite text-ash"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-ash mb-2">Win mode</p>
          <select
            value={local.winMode}
            onChange={(e) =>
              setLocal({
                ...local,
                winMode: e.target.value as "rounds" | "points",
              })
            }
            className="w-full rounded border border-graphite bg-ink px-3 py-2 text-paper"
            disabled={disabled}
          >
            <option value="rounds">Most points after rounds</option>
            <option value="points">First to points</option>
          </select>
        </div>

        {local.winMode === "points" && (
          <div>
            <p className="text-ash mb-2">Points to win</p>
            <input
              type="number"
              min={3}
              max={50}
              value={local.pointsToWin}
              onChange={(e) =>
                setLocal({
                  ...local,
                  pointsToWin: parseInt(e.target.value) || 10,
                })
              }
              className="w-full rounded border border-graphite bg-ink px-3 py-2 text-paper"
              disabled={disabled}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enableSteal"
            checked={local.enableSteal}
            onChange={(e) =>
              setLocal({ ...local, enableSteal: e.target.checked })
            }
            disabled={disabled}
          />
          <label htmlFor="enableSteal" className="text-paper">
            Enable steal attempts
          </label>
        </div>

        <div>
          <p className="text-ash mb-2">Categories</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                disabled={disabled}
                className={`text-xs px-2 py-1 rounded border ${
                  local.enabledCategories.includes(cat)
                    ? "border-paper text-paper"
                    : "border-graphite text-ash"
                }`}
              >
                {cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button className="mt-4 w-full" onClick={save} disabled={disabled || saving}>
        Save settings
      </Button>
    </Panel>
  );
}
