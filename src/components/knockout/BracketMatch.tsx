import type { KnockoutMatch } from "../../types/tournament";
import { useTournament } from "../../context/TournamentContext";
import TeamBadge from "../teams/TeamBadge";

interface Props {
    match: KnockoutMatch;
    onSelect?: () => void;
}

export default function BracketMatch({ match, onSelect }: Props) {
    const { resolveKnockoutTeam, getKnockoutWinner } = useTournament();

    const homeTeam = resolveKnockoutTeam(match, "home");
    const awayTeam = resolveKnockoutTeam(match, "away");
    const winnerId = getKnockoutWinner(match);

    const { homeScore, awayScore } = match.prediction;

    const hasScores = homeScore !== null && awayScore !== null;
    const isTied = hasScores && homeScore === awayScore;

    const isHomeWinner = winnerId && homeTeam && winnerId === homeTeam.id;
    const isAwayWinner = winnerId && awayTeam && winnerId === awayTeam.id;

    // Fully resolved check
    const isFullyResolved = !!winnerId;

    return (
        <div 
            onClick={onSelect}
            className={`relative overflow-hidden rounded-xl border p-2.5 bg-slate-950/60 transition-all duration-300 w-full select-none cursor-pointer hover:scale-[1.02]
                ${isFullyResolved 
                    ? "border-blue-500/40 shadow-lg shadow-blue-500/5 bg-slate-900/40 hover:border-blue-500/60" 
                    : "border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/50"}`}
        >
            {/* Match Label */}
            <div className="flex items-center justify-between text-[9px] font-black text-slate-500 mb-1.5 border-b border-slate-900 pb-0.5">
                <span>{match.label}</span>
                {isFullyResolved && (
                    <span className="text-[8px] text-blue-400 font-extrabold uppercase tracking-widest">
                        Resolved
                    </span>
                )}
            </div>

            {/* Teams Rows */}
            <div className="space-y-1.5">
                {/* Home Team Row */}
                <div 
                    className={`flex items-center justify-between p-1 rounded-lg transition-all text-xs
                        ${isHomeWinner ? "bg-blue-950/30 border border-blue-500/20 text-white font-bold" : "border border-transparent text-slate-400"}
                        ${homeTeam && !isHomeWinner && isFullyResolved ? "opacity-45" : ""}`}
                >
                    <div className="flex-1 truncate pr-1">
                        <TeamBadge 
                            teamId={homeTeam?.id} 
                            placeholderText={match.homeSource.placeholderCode}
                            size="sm"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                        {isTied && isHomeWinner && (
                            <span className="text-[8px] font-black px-1 py-0.5 rounded bg-blue-500 text-slate-950 font-sans tracking-wide">
                                PEN
                            </span>
                        )}
                        <span className={`w-4 text-right font-bold text-sm ${isHomeWinner ? "text-blue-400" : "text-slate-300"}`}>
                            {homeScore ?? "-"}
                        </span>
                    </div>
                </div>

                {/* Away Team Row */}
                <div 
                    className={`flex items-center justify-between p-1 rounded-lg transition-all text-xs
                        ${isAwayWinner ? "bg-blue-950/30 border border-blue-500/20 text-white font-bold" : "border border-transparent text-slate-400"}
                        ${awayTeam && !isAwayWinner && isFullyResolved ? "opacity-45" : ""}`}
                >
                    <div className="flex-1 truncate pr-1">
                        <TeamBadge 
                            teamId={awayTeam?.id} 
                            placeholderText={match.awaySource.placeholderCode}
                            size="sm"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                        {isTied && isAwayWinner && (
                            <span className="text-[8px] font-black px-1 py-0.5 rounded bg-blue-500 text-slate-950 font-sans tracking-wide">
                                PEN
                            </span>
                        )}
                        <span className={`w-4 text-right font-bold text-sm ${isAwayWinner ? "text-blue-400" : "text-slate-300"}`}>
                            {awayScore ?? "-"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Glowing progress accent line */}
            {isFullyResolved && (
                <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500 shadow-md shadow-blue-500/50"></div>
            )}
        </div>
    );
}
