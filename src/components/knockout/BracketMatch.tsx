import type { KnockoutMatch } from "../../types/tournament";
import { useTournament } from "../../context/TournamentContext";
import TeamBadge from "../teams/TeamBadge";

interface Props {
    match: KnockoutMatch;
}

export default function BracketMatch({ match }: Props) {
    const { 
        resolveKnockoutTeam, 
        getKnockoutWinner, 
        updateKnockoutMatchPrediction 
    } = useTournament();

    const homeTeam = resolveKnockoutTeam(match, "home");
    const awayTeam = resolveKnockoutTeam(match, "away");
    const winnerId = getKnockoutWinner(match);

    const { homeScore, awayScore, winnerId: predictionWinnerId } = match.prediction;

    const hasScores = homeScore !== null && awayScore !== null;
    const isTied = hasScores && homeScore === awayScore;

    // Increment/decrement score handler
    const handleScoreChange = (side: "home" | "away", delta: number) => {
        let currentHome = homeScore ?? 0;
        let currentAway = awayScore ?? 0;

        if (side === "home") {
            const nextScore = Math.max(0, currentHome + delta);
            updateKnockoutMatchPrediction(match.id, nextScore, currentAway, predictionWinnerId);
        } else {
            const nextScore = Math.max(0, currentAway + delta);
            updateKnockoutMatchPrediction(match.id, currentHome, nextScore, predictionWinnerId);
        }
    };

    // Fast click winner-only advancement
    const handleTeamClick = (teamId: string) => {
        // If scores are tied, clicking a team marks them as the shootout/penalty winner
        if (isTied) {
            updateKnockoutMatchPrediction(match.id, homeScore, awayScore, teamId);
        } else if (!hasScores) {
            // No scores entered: clicking a team selects them as winner-only (e.g. 1-0 or 0-1)
            if (teamId === homeTeam?.id) {
                updateKnockoutMatchPrediction(match.id, 1, 0, null);
            } else if (teamId === awayTeam?.id) {
                updateKnockoutMatchPrediction(match.id, 0, 1, null);
            }
        }
    };

    const handleClear = () => {
        updateKnockoutMatchPrediction(match.id, null, null, null);
    };

    const isHomeWinner = winnerId && homeTeam && winnerId === homeTeam.id;
    const isAwayWinner = winnerId && awayTeam && winnerId === awayTeam.id;

    // Check if the match is fully resolved (i.e. we have a winner)
    const isFullyResolved = !!winnerId;

    return (
        <div className={`relative overflow-hidden rounded-xl border p-3 bg-slate-950/60 transition-all duration-300 w-full select-none
            ${isFullyResolved 
                ? "border-blue-500/40 shadow-lg shadow-blue-500/5 bg-slate-900/40" 
                : "border-slate-800 hover:border-slate-700/60"}`}
        >
            {/* Match Label */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-2 border-b border-slate-900 pb-1">
                <span>{match.label}</span>
                {isFullyResolved && (
                    <button 
                        onClick={handleClear}
                        className="text-rose-500 hover:text-rose-400 active:scale-95 transition-all text-[9px] uppercase font-bold tracking-wider"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Teams Rows */}
            <div className="space-y-2">
                {/* Home Team Row */}
                <div 
                    onClick={() => homeTeam && handleTeamClick(homeTeam.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-all
                        ${homeTeam ? "cursor-pointer" : "cursor-default"}
                        ${isHomeWinner ? "bg-blue-950/30 border border-blue-500/20 text-white font-bold" : "border border-transparent text-slate-300"}
                        ${homeTeam && !isHomeWinner && isFullyResolved ? "opacity-45" : ""}`}
                >
                    <div className="flex-1 truncate pr-1">
                        <TeamBadge 
                            teamId={homeTeam?.id} 
                            placeholderText={match.homeSource.placeholderCode}
                            size="sm"
                        />
                    </div>

                    {/* Shootout/Pen label if tied */}
                    {isTied && homeTeam && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded mr-2 tracking-wider uppercase
                            ${isHomeWinner ? "bg-blue-500 text-slate-950 shadow shadow-blue-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                            title="Click to select as Penalty Shootout Winner"
                        >
                            {isHomeWinner ? "ADV &bull; PEN" : "PEN?"}
                        </span>
                    )}

                    {/* Scores widget */}
                    {homeTeam && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => handleScoreChange("home", -1)}
                                className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 flex items-center justify-center transition-all"
                            >
                                -
                            </button>
                            <span className="w-5 text-center font-mono text-xs font-bold text-slate-200">
                                {homeScore ?? "-"}
                            </span>
                            <button 
                                onClick={() => handleScoreChange("home", 1)}
                                className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 flex items-center justify-center transition-all"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>

                {/* Away Team Row */}
                <div 
                    onClick={() => awayTeam && handleTeamClick(awayTeam.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-all
                        ${awayTeam ? "cursor-pointer" : "cursor-default"}
                        ${isAwayWinner ? "bg-blue-950/30 border border-blue-500/20 text-white font-bold" : "border border-transparent text-slate-300"}
                        ${awayTeam && !isAwayWinner && isFullyResolved ? "opacity-45" : ""}`}
                >
                    <div className="flex-1 truncate pr-1">
                        <TeamBadge 
                            teamId={awayTeam?.id} 
                            placeholderText={match.awaySource.placeholderCode}
                            size="sm"
                        />
                    </div>

                    {/* Shootout/Pen label if tied */}
                    {isTied && awayTeam && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded mr-2 tracking-wider uppercase
                            ${isAwayWinner ? "bg-blue-500 text-slate-950 shadow shadow-blue-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                            title="Click to select as Penalty Shootout Winner"
                        >
                            {isAwayWinner ? "ADV &bull; PEN" : "PEN?"}
                        </span>
                    )}

                    {/* Scores widget */}
                    {awayTeam && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => handleScoreChange("away", -1)}
                                className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 flex items-center justify-center transition-all"
                            >
                                -
                            </button>
                            <span className="w-5 text-center font-mono text-xs font-bold text-slate-200">
                                {awayScore ?? "-"}
                            </span>
                            <button 
                                onClick={() => handleScoreChange("away", 1)}
                                className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 flex items-center justify-center transition-all"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Glowing progress accent line */}
            {isFullyResolved && (
                <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500 shadow-md shadow-blue-500/50"></div>
            )}
        </div>
    );
}
