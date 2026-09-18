import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Panel, Label } from "@/components/ui/Panel";

export default function HomePage() {
  return (
    <div className="flex min-h-[80dvh] flex-col justify-center gap-8">
      <header className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-ash mb-3">
          Party game
        </p>
        <h1 className="font-display text-4xl md:text-6xl text-paper leading-none">
          5 SECONDS
          <br />
          ONLY
        </h1>
        <p className="mt-4 text-ash max-w-md mx-auto text-sm leading-relaxed">
          Draw a two-sided card, read your question in Discord, reveal it to
          everyone, and name 3 answers before time runs out.
        </p>
      </header>

      <Panel className="max-w-sm mx-auto w-full border-2 border-graphite">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-graphite bg-ink p-4 text-center">
            <Label>Side A</Label>
            <p className="mt-2 text-paper text-sm font-semibold">
              Name 3 pizza toppings
            </p>
          </div>
          <div className="rounded border border-paper bg-paper p-4 text-center text-ink">
            <Label className="!text-graphite">Side B</Label>
            <p className="mt-2 text-sm font-semibold">Name 3 pasta shapes</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ash">
          Pick one · read aloud · reveal · 5.5s timer
        </p>
      </Panel>

      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto w-full">
        <Link href="/create" className="flex-1">
          <Button size="lg" className="w-full">Create game</Button>
        </Link>
        <Link href="/join" className="flex-1">
          <Button size="lg" variant="secondary" className="w-full">
            Join game
          </Button>
        </Link>
      </div>
    </div>
  );
}
