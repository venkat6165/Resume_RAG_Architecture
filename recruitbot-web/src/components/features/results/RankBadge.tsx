interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  const badgeClass =
    rank === 1
      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold shadow-amber-500/20'
      : rank === 2
      ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-black font-bold'
      : rank === 3
      ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 font-bold'
      : 'bg-white/10 text-text-muted font-semibold';

  return (
    <div
      className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] shrink-0 shadow-sm ${badgeClass}`}
    >
      #{rank}
    </div>
  );
}
