import { Brain, ChevronRight, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  getDueFlashcards,
  getFlashcardStats,
  reviewFlashcard,
} from "@/actions/features";
import type { FlashcardData, FlashcardStats } from "@/db/schema";

export function FlashcardView() {
  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionReviewed, setSessionReviewed] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [dueCards, cardStats] = await Promise.all([
      getDueFlashcards(),
      getFlashcardStats(),
    ]);
    setCards(dueCards);
    setStats(cardStats);
    setCurrentIndex(0);
    setFlipped(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currentCard = cards[currentIndex];

  const handleRate = async (rating: number) => {
    if (!currentCard) return;
    await reviewFlashcard(currentCard.id, rating);
    setSessionReviewed((n) => n + 1);
    setFlipped(false);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reload to check for more
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading flashcards…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center p-6">
      {/* Stats bar */}
      <div className="mb-8 flex w-full max-w-2xl items-center justify-center gap-6">
        <StatBadge
          icon={<Zap className="h-4 w-4 text-yellow-500" />}
          label="Due Today"
          value={stats?.due_today ?? 0}
        />
        <StatBadge
          icon={<Brain className="h-4 w-4 text-purple-500" />}
          label="Total Cards"
          value={stats?.total_cards ?? 0}
        />
        <StatBadge
          icon={<RotateCcw className="h-4 w-4 text-green-500" />}
          label="Reviewed"
          value={sessionReviewed}
        />
        <StatBadge
          icon={<ChevronRight className="h-4 w-4 text-blue-500" />}
          label="Streak"
          value={stats?.streak ?? 0}
        />
      </div>

      {/* Card area */}
      {!currentCard ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="text-5xl">🎉</div>
          <p className="text-xl font-medium">All caught up!</p>
          <p className="text-sm text-muted-foreground">
            {stats?.total_cards
              ? "No cards due right now. Come back later!"
              : "No flashcards found. Add Q: and A: lines in your notes to create cards."}
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6">
          {/* Progress */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {currentIndex + 1} / {cards.length}
            </span>
            <div className="h-1.5 w-48 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((currentIndex + 1) / cards.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <button
            type="button"
            onClick={() => setFlipped(!flipped)}
            className="w-full max-w-lg cursor-pointer perspective-1000"
          >
            <div
              className={`relative min-h-64 rounded-xl border-2 border-border bg-card p-8 shadow-lg transition-transform duration-500 [transform-style:preserve-3d] ${
                flipped ? "[transform:rotateX(180deg)]" : ""
              }`}
            >
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 [backface-visibility:hidden]">
                <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Question
                </span>
                <p className="text-center text-lg">{currentCard.question}</p>
                <span className="mt-6 text-xs text-muted-foreground">
                  Click to flip
                </span>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 [backface-visibility:hidden] [transform:rotateX(180deg)]">
                <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Answer
                </span>
                <p className="text-center text-lg">{currentCard.answer}</p>
              </div>
            </div>
          </button>

          {/* Rating buttons */}
          {flipped && (
            <div className="flex gap-3">
              <RateButton
                label="Again"
                sublabel="< 1m"
                color="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                onClick={() => handleRate(0)}
              />
              <RateButton
                label="Hard"
                sublabel="< 10m"
                color="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
                onClick={() => handleRate(2)}
              />
              <RateButton
                label="Good"
                sublabel="1d"
                color="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                onClick={() => handleRate(3)}
              />
              <RateButton
                label="Easy"
                sublabel="4d"
                color="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                onClick={() => handleRate(4)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      {icon}
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function RateButton({
  label,
  sublabel,
  color,
  onClick,
}: {
  label: string;
  sublabel: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-5 py-3 text-center transition-colors ${color}`}
    >
      <p className="font-medium text-sm">{label}</p>
      <p className="text-[10px] opacity-70">{sublabel}</p>
    </button>
  );
}
