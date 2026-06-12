import { useState, useRef } from "react";
import { useTournament } from "../../context/TournamentContext";
import { teams } from "../../data/teams";
import { X, Search, Trophy, Camera } from "lucide-react";
import { toPng } from "html-to-image";

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
        currentProfile,
        updateMatchComment,
    } = useTournament();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectingSide, setSelectingSide] = useState<"home" | "away" | null>(null);

    const match = stage === "groups"
        ? groupMatches.find((m) => m.id === matchId)
        : knockoutMatches.find((m) => m.id === matchId);

    const [comment, setComment] = useState(match?.prediction?.comment || "");
    const [isDownloading, setIsDownloading] = useState(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    if (!match) return null;

    const handleDownload = async (homeTeamName: string, awayTeamName: string) => {
        if (!shareCardRef.current) return;
        setIsDownloading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 150));
            const dataUrl = await toPng(shareCardRef.current, {
                pixelRatio: 3,
                cacheBust: true,
                backgroundColor: "#020617",
            });
            const link = document.createElement("a");
            link.download = `prediction-${homeTeamName}-vs-${awayTeamName}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to generate image", error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Render for Groups Stage
    if (stage === "groups") {
        const groupMatch = groupMatches.find((m) => m.id === matchId);
        if (!groupMatch) return null;

        const homeTeam = teams.find((t) => t.id === groupMatch.homeTeamId);
        const awayTeam = teams.find((t) => t.id === groupMatch.awayTeamId);
        const { homeScore, awayScore } = groupMatch.prediction;

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
                    <div className="p-6 space-y-5">
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

                        {/* Commentary Input */}
                        <div className="space-y-1.5 border-t border-slate-800/50 pt-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                Match Analysis / Notes
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => {
                                    setComment(e.target.value);
                                    updateMatchComment(matchId, "groups", e.target.value);
                                }}
                                placeholder="Write your thoughts or prediction reasoning..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-16"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 pt-1">
                            <div className="flex gap-3">
                                {homeScore !== null || awayScore !== null ? (
                                    <button 
                                        onClick={handleClear}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-rose-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                                    >
                                        Clear
                                    </button>
                                ) : null}
                                <button 
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                                >
                                    Done
                                </button>
                            </div>
                            
                            {(homeScore !== null || awayScore !== null) && (
                                <button
                                    onClick={() => handleDownload(homeTeam?.name || "Home", awayTeam?.name || "Away")}
                                    disabled={isDownloading}
                                    className="w-full py-2 rounded-xl border border-blue-500/20 hover:border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/30 text-blue-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <Camera size={14} className={isDownloading ? "animate-pulse" : ""} />
                                    <span>{isDownloading ? "Generating Card..." : "Download Match Graphic"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hidden Capture Card */}
                <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                    <div 
                        ref={shareCardRef} 
                        className="share-capture-card w-[500px] flex flex-col items-center space-y-6"
                    >
                        <div className="text-center space-y-1 w-full">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                FIFA World Cup 2026 Prediction
                            </span>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Predicted by {currentProfile}
                            </h2>
                        </div>
                        
                        <div className="flex items-center justify-between w-full px-6 py-5 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{homeTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{homeTeam?.name || "TBD"}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center w-1/3">
                                <span className="text-3xl font-black font-mono text-white tracking-widest">
                                    {homeScore !== null ? homeScore : "-"} : {awayScore !== null ? awayScore : "-"}
                                </span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{awayTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{awayTeam?.name || "TBD"}</span>
                            </div>
                        </div>

                        {comment && (
                            <div className="w-full bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-center">
                                <p className="text-xs font-medium text-slate-300 italic">
                                    "{comment}"
                                </p>
                            </div>
                        )}

                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest w-full text-center border-t border-slate-900 pt-3">
                            FIFA World Cup 2026 Bracket Challenger
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        // KNOCKOUT MATCH VIEW
        const knockoutMatch = knockoutMatches.find((m) => m.id === matchId);
        if (!knockoutMatch) return null;

        const homeTeam = resolveKnockoutTeam(knockoutMatch, "home");
        const awayTeam = resolveKnockoutTeam(knockoutMatch, "away");
        const winnerId = getKnockoutWinner(knockoutMatch);

        const { homeScore, awayScore, winnerId: predictionWinnerId } = knockoutMatch.prediction;

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

        const handleAssignTeam = (teamId: string) => {
            if (!selectingSide) return;
            assignTeamToKnockoutSlot(matchId, selectingSide, teamId);
            setSelectingSide(null);
            setSearchTerm("");
        };

        const filteredTeams = teams.filter((t) => {
            const query = searchTerm.toLowerCase();
            return t.name.toLowerCase().includes(query) || t.code.toLowerCase().includes(query);
        });

        const groupsList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                        <div>
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                {knockoutMatch.stage === "BF" ? "Bronze Play-off" : knockoutMatch.stage === "F" ? "Final" : `${knockoutMatch.stage} - ${knockoutMatch.label}`}
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
                    <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
                        {selectingSide ? (
                            // Backward Team Picker UI
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Assign Team to {selectingSide === "home" ? knockoutMatch.homeSource.placeholderCode : knockoutMatch.awaySource.placeholderCode}
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
                                                    {knockoutMatch.homeSource.placeholderCode}
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium italic">
                                                    TBD ({knockoutMatch.homeSource.placeholderCode})
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
                                                    {knockoutMatch.awaySource.placeholderCode}
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium italic">
                                                    TBD ({knockoutMatch.awaySource.placeholderCode})
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

                                {/* Commentary Input */}
                                {homeTeam && awayTeam && (
                                    <div className="space-y-1.5 border-t border-slate-800/50 pt-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                            Match Analysis / Notes
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => {
                                                setComment(e.target.value);
                                                updateMatchComment(matchId, "knockout", e.target.value);
                                            }}
                                            placeholder="Write your thoughts or prediction reasoning..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-16"
                                        />
                                    </div>
                                )}

                                {/* Shortcut info */}
                                {(homeTeam || awayTeam) && (
                                    <div className="flex gap-2.5 justify-center py-1 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                                        <span>Click on a flag/team to manually advance them</span>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/50">
                                    <div className="flex gap-3">
                                        {homeScore !== null || awayScore !== null ? (
                                            <button 
                                                onClick={handleClear}
                                                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-850 text-rose-500 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                                            >
                                                Clear
                                            </button>
                                        ) : null}
                                        <button 
                                            onClick={onClose}
                                            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/10"
                                        >
                                            Done
                                        </button>
                                    </div>

                                    {homeTeam && awayTeam && (homeScore !== null || awayScore !== null) && (
                                        <button
                                            onClick={() => handleDownload(homeTeam.name, awayTeam.name)}
                                            disabled={isDownloading}
                                            className="w-full py-2 rounded-xl border border-blue-500/20 hover:border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/30 text-blue-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5"
                                        >
                                            <Camera size={14} className={isDownloading ? "animate-pulse" : ""} />
                                            <span>{isDownloading ? "Generating Card..." : "Download Match Graphic"}</span>
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Hidden Capture Card */}
                <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                    <div 
                        ref={shareCardRef} 
                        className="share-capture-card w-[500px] flex flex-col items-center space-y-6"
                    >
                        <div className="text-center space-y-1 w-full">
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                FIFA World Cup 2026 Knockout Prediction
                            </span>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Predicted by {currentProfile}
                            </h2>
                        </div>
                        
                        <div className="flex items-center justify-between w-full px-6 py-5 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{homeTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{homeTeam?.name || "TBD"}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center w-1/3">
                                <span className="text-3xl font-black font-mono text-white tracking-widest">
                                    {homeScore !== null ? homeScore : "-"} : {awayScore !== null ? awayScore : "-"}
                                </span>
                                {isTied && winnerId && (
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-slate-950 font-sans tracking-wide mt-2">
                                        PEN WINNER: {winnerId === homeTeam?.id ? homeTeam?.name : awayTeam?.name}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{awayTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{awayTeam?.name || "TBD"}</span>
                            </div>
                        </div>

                        {comment && (
                            <div className="w-full bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-center">
                                <p className="text-xs font-medium text-slate-300 italic">
                                    "{comment}"
                                </p>
                            </div>
                        )}

                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest w-full text-center border-t border-slate-900 pt-3">
                            FIFA World Cup 2026 Bracket Challenger
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
