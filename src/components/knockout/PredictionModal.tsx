import { useState } from "react";
import { useTournament } from "../../context/TournamentContext";
import { teams } from "../../data/teams";
import { X, Search, Trophy } from "lucide-react";

interface PredictionModalProps {
    matchId: string;
    stage: "groups" | "knockout";
    onClose: () => void;
}

export default function PredictionModal({ matchId, stage, onClose }: PredictionModalProps) {
    const {
        groupMatches,
        knockoutMatches,
        updateGroupMatchPrediction,
        updateKnockoutMatchPrediction,
        resolveKnockoutTeam,
        getKnockoutWinner,
        assignTeamToKnockoutSlot,
    } = useTournament();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectingSide, setSelectingSide] = useState<"home" | "away" | null>(null);

    // 1. Fetch match and resolved teams based on stage
    if (stage === "groups") {
        const match = groupMatches.find((m) => m.id === matchId);
        if (!match) return null;

        const homeTeam = teams.find((t) => t.id === match.homeTeamId);
        const awayTeam = teams.find((t) => t.id === match.awayTeamId);
        const { homeScore, awayScore } = match.prediction;

        const handleScoreChange = (side: "home" | "away", delta: number) => {
            const currentHome = homeScore ?? 0;
            const currentAway = awayScore ?? 0;

            if (side === "home") {
                const nextScore = Math.max(0, currentHome + delta);
                updateGroupMatchPrediction(matchId, nextScore, currentAway);
            } else {
                const nextScore = Math.max(0, currentAway + delta);
                updateGroupMatchPrediction(matchId, currentHome, nextScore);
            }
        };

        const handleClear = () => {
            updateGroupMatchPrediction(matchId, null, null);
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                        <div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Group stage</span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Predict Score</h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            {/* Home Team */}
                            <div className="flex-1 flex flex-col items-center text-center space-y-2">
                                <span className="text-4xl select-none">{homeTeam?.flag}</span>
                                <span className="text-sm font-bold text-white leading-tight">{homeTeam?.name}</span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{homeTeam?.code}</span>

                                <div className="flex items-center gap-2 pt-2">
                                    <button 
                                        onClick={() => handleScoreChange("home", -1)}
                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center text-xl font-black text-white font-mono">
                                        {homeScore ?? "-"}
                                    </span>
                                    <button 
                                        onClick={() => handleScoreChange("home", 1)}
                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* VS separator */}
                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-slate-500 select-none">VS</span>
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex flex-col items-center text-center space-y-2">
                                <span className="text-4xl select-none">{awayTeam?.flag}</span>
                                <span className="text-sm font-bold text-white leading-tight">{awayTeam?.name}</span>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{awayTeam?.code}</span>

                                <div className="flex items-center gap-2 pt-2">
                                    <button 
                                        onClick={() => handleScoreChange("away", -1)}
                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center text-xl font-black text-white font-mono">
                                        {awayScore ?? "-"}
                                    </span>
                                    <button 
                                        onClick={() => handleScoreChange("away", 1)}
                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            {homeScore !== null || awayScore !== null ? (
                                <button 
                                    onClick={handleClear}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-rose-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                                >
                                    Clear prediction
                                </button>
                            ) : null}
                            <button 
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        // KNOCKOUT MATCH VIEW
        const match = knockoutMatches.find((m) => m.id === matchId);
        if (!match) return null;

        const homeTeam = resolveKnockoutTeam(match, "home");
        const awayTeam = resolveKnockoutTeam(match, "away");
        const winnerId = getKnockoutWinner(match);

        const { homeScore, awayScore, winnerId: predictionWinnerId } = match.prediction;

        const hasScores = homeScore !== null && awayScore !== null;
        const isTied = hasScores && homeScore === awayScore;

        const handleScoreChange = (side: "home" | "away", delta: number) => {
            const currentHome = homeScore ?? 0;
            const currentAway = awayScore ?? 0;

            if (side === "home") {
                const nextScore = Math.max(0, currentHome + delta);
                updateKnockoutMatchPrediction(matchId, nextScore, currentAway, predictionWinnerId);
            } else {
                const nextScore = Math.max(0, currentAway + delta);
                updateKnockoutMatchPrediction(matchId, currentHome, nextScore, predictionWinnerId);
            }
        };

        const handleSelectWinner = (teamId: string) => {
            updateKnockoutMatchPrediction(matchId, homeScore, awayScore, teamId);
        };

        const handleClear = () => {
            updateKnockoutMatchPrediction(matchId, null, null, null);
        };

        // Handle backward prediction team selection
        const handleAssignTeam = (teamId: string) => {
            if (!selectingSide) return;
            assignTeamToKnockoutSlot(matchId, selectingSide, teamId);
            setSelectingSide(null);
            setSearchTerm("");
        };

        // Filter and group teams for searchable team selection
        const filteredTeams = teams.filter((t) => {
            const query = searchTerm.toLowerCase();
            return t.name.toLowerCase().includes(query) || t.code.toLowerCase().includes(query);
        });

        // Group filtered teams by groupId
        const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                        <div>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                {match.stage === "BF" ? "Bronze Play-off" : match.stage === "F" ? "Final" : `${match.stage} - ${match.label}`}
                            </span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Predict Knockout Match</h3>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
                        {selectingSide ? (
                            // Backward Team Picker UI
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Assign Team to {selectingSide === "home" ? match.homeSource.placeholderCode : match.awaySource.placeholderCode}
                                    </h4>
                                    <button 
                                        onClick={() => { setSelectingSide(null); setSearchTerm(""); }}
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                                    >
                                        &larr; Back to predict
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                                    💡 <strong>Backward Prediction:</strong> Selecting a team here will automatically update the group standings and advance them through the intermediate bracket stages!
                                </p>

                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
                                    <input 
                                        type="text"
                                        placeholder="Search countries..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>

                                {/* Team lists */}
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                    {groupsList.map((gid) => {
                                        const groupTeams = filteredTeams.filter((t) => t.groupId === gid);
                                        if (groupTeams.length === 0) return null;

                                        return (
                                            <div key={gid} className="space-y-1.5">
                                                <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                                                    Group {gid}
                                                </h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {groupTeams.map((team) => (
                                                        <button 
                                                            key={team.id}
                                                            onClick={() => handleAssignTeam(team.id)}
                                                            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-blue-500/40 hover:bg-slate-900 transition-all text-left"
                                                        >
                                                            <span className="text-lg leading-none">{team.flag}</span>
                                                            <span className="text-xs font-semibold text-slate-200 truncate">{team.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {filteredTeams.length === 0 && (
                                        <div className="text-center py-8 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                            No teams match your search
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Standard Prediction UI
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    {/* Home Team */}
                                    <div className="flex-1 flex flex-col items-center text-center space-y-2">
                                        {homeTeam ? (
                                            <>
                                                <span className="text-4xl select-none">{homeTeam.flag}</span>
                                                <span className="text-sm font-bold text-white leading-tight">{homeTeam.name}</span>
                                                <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{homeTeam.code}</span>

                                                <div className="flex items-center gap-2 pt-2">
                                                    <button 
                                                        onClick={() => handleScoreChange("home", -1)}
                                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-xl font-black text-white font-mono">
                                                        {homeScore ?? "-"}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleScoreChange("home", 1)}
                                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs font-bold">
                                                    {match.homeSource.placeholderCode}
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium italic">
                                                    TBD ({match.homeSource.placeholderCode})
                                                </span>
                                                <button 
                                                    onClick={() => setSelectingSide("home")}
                                                    className="px-2.5 py-1 text-[9px] font-black tracking-wider uppercase bg-blue-950/40 text-blue-400 border border-blue-900/35 hover:bg-blue-950/60 rounded-lg active:scale-95 transition-all"
                                                >
                                                    Select Team
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* VS separator */}
                                    <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-black text-slate-500 select-none">VS</span>
                                    </div>

                                    {/* Away Team */}
                                    <div className="flex-1 flex flex-col items-center text-center space-y-2">
                                        {awayTeam ? (
                                            <>
                                                <span className="text-4xl select-none">{awayTeam.flag}</span>
                                                <span className="text-sm font-bold text-white leading-tight">{awayTeam.name}</span>
                                                <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{awayTeam.code}</span>

                                                <div className="flex items-center gap-2 pt-2">
                                                    <button 
                                                        onClick={() => handleScoreChange("away", -1)}
                                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center text-xl font-black text-white font-mono">
                                                        {awayScore ?? "-"}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleScoreChange("away", 1)}
                                                        className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs font-bold">
                                                    {match.awaySource.placeholderCode}
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium italic">
                                                    TBD ({match.awaySource.placeholderCode})
                                                </span>
                                                <button 
                                                    onClick={() => setSelectingSide("away")}
                                                    className="px-2.5 py-1 text-[9px] font-black tracking-wider uppercase bg-blue-950/40 text-blue-400 border border-blue-900/35 hover:bg-blue-950/60 rounded-lg active:scale-95 transition-all"
                                                >
                                                    Select Team
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Shootout/Penalties Selection Section */}
                                {isTied && homeTeam && awayTeam && (
                                    <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-850 space-y-3 animate-fade-in">
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                                            <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                                Select penalty shootout winner
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => handleSelectWinner(homeTeam.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95
                                                    ${winnerId === homeTeam.id 
                                                        ? "bg-blue-950/30 border-blue-500/50 text-white font-bold shadow-lg shadow-blue-500/5" 
                                                        : "bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300"}`}
                                            >
                                                <span className="text-xl mb-1">{homeTeam.flag}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider">{homeTeam.name}</span>
                                                <span className="text-[9px] font-bold text-blue-400 mt-1 uppercase font-mono">
                                                    {winnerId === homeTeam.id ? "Winner" : "Select"}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => handleSelectWinner(awayTeam.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95
                                                    ${winnerId === awayTeam.id 
                                                        ? "bg-blue-950/30 border-blue-500/50 text-white font-bold shadow-lg shadow-blue-500/5" 
                                                        : "bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-300"}`}
                                            >
                                                <span className="text-xl mb-1">{awayTeam.flag}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider">{awayTeam.name}</span>
                                                <span className="text-[9px] font-bold text-blue-400 mt-1 uppercase font-mono">
                                                    {winnerId === awayTeam.id ? "Winner" : "Select"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Shortcut buttons for resolved teams to change them easily */}
                                {(homeTeam || awayTeam) && (
                                    <div className="flex gap-2.5 justify-center py-2 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                                        <span>Click on a flag/team to manually advance them</span>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex gap-3 pt-2">
                                    {homeScore !== null || awayScore !== null ? (
                                        <button 
                                            onClick={handleClear}
                                            className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-rose-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                                        >
                                            Clear prediction
                                        </button>
                                    ) : null}
                                    <button 
                                        onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                                    >
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
