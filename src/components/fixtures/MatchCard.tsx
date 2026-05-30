import type { Match } from "../../types/tournament";
import TeamBadge from "../teams/TeamBadge";

interface Props {
    match: Match;
    onPredict: (homeScore: number | null, awayScore: number | null) => void;
}

export default function MatchCard({ match, onPredict }: Props) {
    const { prediction } = match;
    const isPredicted = prediction.homeScore !== null && prediction.awayScore !== null;

    // Helper to increment/decrement score
    const handleScoreChange = (side: "home" | "away", delta: number) => {
        let currentHome = prediction.homeScore;
        let currentAway = prediction.awayScore;

        // If currently null, initialize to 0
        if (currentHome === null) currentHome = 0;
        if (currentAway === null) currentAway = 0;

        if (side === "home") {
            const nextScore = Math.max(0, currentHome + delta);
            onPredict(nextScore, currentAway);
        } else {
            const nextScore = Math.max(0, currentAway + delta);
            onPredict(currentHome, nextScore);
        }
    };

    // Quick winner selection (automatic 1-0 or 0-1)
    const handleQuickPick = (winner: "home" | "away" | "draw") => {
        if (winner === "home") {
            onPredict(1, 0);
        } else if (winner === "away") {
            onPredict(0, 1);
        } else {
            onPredict(1, 1); // Draw
        }
    };

    const handleClear = () => {
        onPredict(null, null);
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 bg-slate-900/40 backdrop-blur-sm
            ${isPredicted 
                ? "border-blue-500/30 shadow-lg shadow-blue-500/2" 
                : "border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/50"}`}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Home Team Badge Section */}
                <div 
                    onClick={() => handleQuickPick("home")}
                    className="flex-1 flex items-center justify-start gap-2 cursor-pointer w-full select-none rounded-xl p-1 hover:bg-slate-800/20 active:scale-95 transition-all"
                    title="Click to predict Home win"
                >
                    <TeamBadge teamId={match.homeTeamId} size="md" />
                </div>

                {/* Predictions Controller Widget */}
                <div className="flex items-center gap-3 bg-slate-950/40 rounded-xl px-4 py-2 border border-slate-800/80">
                    {/* Home Score Counter */}
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => handleScoreChange("home", -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-black text-slate-300 flex items-center justify-center transition-all"
                        >
                            -
                        </button>
                        <span className={`w-8 text-center text-lg font-black font-mono tracking-wider ${prediction.homeScore !== null ? "text-white" : "text-slate-500"}`}>
                            {prediction.homeScore ?? "-"}
                        </span>
                        <button 
                            onClick={() => handleScoreChange("home", 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-black text-slate-300 flex items-center justify-center transition-all"
                        >
                            +
                        </button>
                    </div>

                    <span className="text-slate-600 font-extrabold text-sm select-none">:</span>

                    {/* Away Score Counter */}
                    <div className="flex items-center gap-1.5">
                        <button 
                            onClick={() => handleScoreChange("away", -1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-black text-slate-300 flex items-center justify-center transition-all"
                        >
                            -
                        </button>
                        <span className={`w-8 text-center text-lg font-black font-mono tracking-wider ${prediction.awayScore !== null ? "text-white" : "text-slate-500"}`}>
                            {prediction.awayScore ?? "-"}
                        </span>
                        <button 
                            onClick={() => handleScoreChange("away", 1)}
                            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:scale-90 text-xs font-black text-slate-300 flex items-center justify-center transition-all"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Away Team Badge Section */}
                <div 
                    onClick={() => handleQuickPick("away")}
                    className="flex-1 flex items-center justify-end gap-2 cursor-pointer w-full select-none rounded-xl p-1 hover:bg-slate-800/20 active:scale-95 transition-all text-right"
                    title="Click to predict Away win"
                >
                    <TeamBadge teamId={match.awayTeamId} size="md" />
                </div>
            </div>

            {/* Quick action buttons footer */}
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-500">
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleQuickPick("home")}
                        className={`px-2 py-0.5 rounded border border-slate-800 hover:border-blue-500 hover:text-blue-400 font-bold transition-all
                            ${prediction.homeScore !== null && prediction.awayScore !== null && prediction.homeScore > prediction.awayScore 
                                ? "bg-blue-950/40 border-blue-500/50 text-blue-400" : ""}`}
                    >
                        Win Home
                    </button>
                    <button 
                        onClick={() => handleQuickPick("draw")}
                        className={`px-2 py-0.5 rounded border border-slate-800 hover:border-amber-500 hover:text-amber-400 font-bold transition-all
                            ${prediction.homeScore !== null && prediction.awayScore !== null && prediction.homeScore === prediction.awayScore 
                                ? "bg-amber-950/40 border-amber-500/50 text-amber-400" : ""}`}
                    >
                        Draw
                    </button>
                    <button 
                        onClick={() => handleQuickPick("away")}
                        className={`px-2 py-0.5 rounded border border-slate-800 hover:border-cyan-500 hover:text-cyan-400 font-bold transition-all
                            ${prediction.homeScore !== null && prediction.awayScore !== null && prediction.homeScore < prediction.awayScore 
                                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400" : ""}`}
                    >
                        Win Away
                    </button>
                </div>

                {isPredicted && (
                    <button 
                        onClick={handleClear}
                        className="text-rose-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider active:scale-95"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Card Background active predictor indicator */}
            {isPredicted && (
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl bg-blue-500 shadow-lg shadow-blue-500/50"></div>
            )}
        </div>
    );
}