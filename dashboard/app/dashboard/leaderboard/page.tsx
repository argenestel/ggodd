import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Trophy className="mx-auto mb-4 h-12 w-12 text-[var(--fg-muted)]" />
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="mt-2 text-[var(--fg-muted)]">
        Coming soon. Track top predictors, highest volume traders, and most successful streamers.
      </p>
    </div>
  );
}
