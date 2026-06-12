import { useState, useRef } from "react";
import { useTournament } from "../context/TournamentContext";
import { getTeamById } from "../utils/teams";
import StandingsTable from "../components/standings/StandingsTable";
import PredictionModal from "../components/knockout/PredictionModal";
import TeamBadge from "../components/teams/TeamBadge";
import type { Match } from "../types/tournament";
import { Camera } from "lucide-react";
import { toPng } from "html-to-image";

interface Props {
    groupId: string;
    onBack: () => void;
}

// Inline compact fixture card
function FixtureCard({
    match,
    onSelect,
    onShare,
    hideActions = false,
}: {
    match: Match;
    onSelect: () => void;
    onShare: () => void;
    hideActions?: boolean;
}) {
    const { prediction } = match;
    const isPredicted =
        prediction.homeScore !== null && prediction.awayScore !== null;

    const resultLabel = isPredicted
        ? prediction.homeScore! > prediction.awayScore!
            ? "Home Win"
            : prediction.homeScore! < prediction.awayScore!
                ? "Away Win"
                : "Draw"
        : null;

    const resultColor = isPredicted
        ? prediction.homeScore! > prediction.awayScore!
            ? "text-blue-400"
            : prediction.homeScore! < prediction.awayScore!
                ? "text-cyan-400"
                : "text-amber-400"
        : null;

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare();
    };

    return (
        <button
            onClick={onSelect}
            disabled={hideActions}
            className={`w-full text-left rounded-2xl border p-3 transition-all duration-200 active:scale-[0.98] group relative
                ${isPredicted
                    ? "bg-slate-900/60 border-blue-500/25 hover:border-blue-500/50 shadow-sm shadow-blue-500/5"
                    : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                } ${hideActions ? "cursor-default active:scale-100" : ""}`}
        >
            <div className="flex items-center gap-3">
                {/* Home team */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <TeamBadge teamId={match.homeTeamId} size="sm" />
                </div>

                {/* Score / VS */}
                <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 min-w-[72px] justify-center">
                    {isPredicted ? (
                        <span className="text-base font-black font-mono text-white tracking-widest">
                            {prediction.homeScore}{" "}
                            <span className="text-slate-600">:</span>{" "}
                            {prediction.awayScore}
                        </span>
                    ) : (
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest select-none">
                            vs
                        </span>
                    )}
                </div>

                {/* Away team */}
                <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                    <TeamBadge teamId={match.awayTeamId} size="sm" />
                </div>
            </div>

            {/* Commentary/Notes if exists */}
            {isPredicted && prediction.comment && (
                <div className="mt-2 text-[10px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50 truncate text-left">
                    💬 "{prediction.comment}"
                </div>
            )}

            {/* Footer row */}
            {!hideActions && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                        {isPredicted && resultLabel ? (
                            <span className={`text-[9px] font-black uppercase tracking-widest ${resultColor}`}>
                                {resultLabel}
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                Not predicted
                            </span>
                        )}
                        {isPredicted && (
                            <button
                                onClick={handleShareClick}
                                className="p-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all active:scale-90"
                                title="Download Match prediction graphic"
                            >
                                <Camera size={10} />
                            </button>
                        )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider group-hover:text-slate-400 transition-colors">
                        {isPredicted ? "Edit →" : "Predict →"}
                    </span>
                </div>
            )}

            {/* Predicted indicator dot */}
            {isPredicted && !hideActions && (
                <div className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-blue-500 shadow shadow-blue-500/50" />
            )}
        </button>
    );
}

export default function GroupPage({ groupId, onBack }: Props) {
    const {
        groupMatches,
        groupStandings,
        resetGroupPredictions,
        currentProfile,
    } = useTournament();

    const [predictingMatchId, setPredictingMatchId] = useState<string | null>(null);
    const [sharingMatch, setSharingMatch] = useState<Match | null>(null);
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);

    const reportRef = useRef<HTMLDivElement>(null);
    const matchShareRef = useRef<HTMLDivElement>(null);

    // Filter matches for this group
    const matches = groupMatches.filter((m) => {
        const team = getTeamById(m.homeTeamId);
        return team?.groupId === groupId;
    });

    const standings = groupStandings[groupId] || [];

    const unpredicted = matches.filter(
        (m) => m.prediction.homeScore === null || m.prediction.awayScore === null
    );
    const predicted = matches.filter(
        (m) => m.prediction.homeScore !== null && m.prediction.awayScore !== null
    );

    const completedCount = predicted.length;

    // Handler to download a specific match card directly
    const handleShareMatch = async (match: Match) => {
        setSharingMatch(match);
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (matchShareRef.current) {
            try {
                const homeTeam = getTeamById(match.homeTeamId);
                const awayTeam = getTeamById(match.awayTeamId);
                const dataUrl = await toPng(matchShareRef.current, {
                    pixelRatio: 3,
                    cacheBust: true,
                    backgroundColor: "#020617",
                });
                const link = document.createElement("a");
                link.download = `prediction-${homeTeam?.name || "Home"}-vs-${awayTeam?.name || "Away"}.png`;
                link.href = dataUrl;
                link.click();
            } catch (error) {
                console.error("Failed to generate match image", error);
            } finally {
                setSharingMatch(null);
            }
        }
    };

    // Handler to download the entire group standings and predictions
    const handleDownloadGroupReport = async () => {
        if (!reportRef.current) return;
        setIsDownloadingReport(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 150));
            const dataUrl = await toPng(reportRef.current, {
                pixelRatio: 3,
                cacheBust: true,
                backgroundColor: "#020617",
                style: {
                    padding: "24px",
                }
            });
            const link = document.createElement("a");
            link.download = `group-${groupId}-predictions-report.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to generate group report", error);
        } finally {
            setIsDownloadingReport(false);
        }
    };

    const homeShareTeam = sharingMatch ? getTeamById(sharingMatch.homeTeamId) : null;
    const awayShareTeam = sharingMatch ? getTeamById(sharingMatch.awayTeamId) : null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Action Header controls (Hidden during print report) */}
            {!isDownloadingReport && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 active:scale-95 transition-all text-xs font-bold"
                        >
                            &larr; Back
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">
                                Group {groupId} Details
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Predicted matches:{" "}
                                <span className="text-white font-bold">{completedCount}</span>{" "}
                                / {matches.length}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {completedCount > 0 && (
                            <button
                                onClick={handleDownloadGroupReport}
                                className="px-3.5 py-2 rounded-xl bg-blue-950/20 border border-blue-900/35 hover:bg-blue-950/40 text-blue-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                            >
                                <Camera size={12} />
                                <span>Download Report</span>
                            </button>
                        )}
                        {completedCount > 0 && (
                            <button
                                onClick={() => resetGroupPredictions(groupId)}
                                className="px-3.5 py-2 rounded-xl bg-rose-950/20 border border-rose-900/35 hover:bg-rose-950/40 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                            >
                                Reset Group
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Printable Report Wrapper Container */}
            <div ref={reportRef} className="space-y-8 bg-slate-950">
                {/* Print-only custom header */}
                {isDownloadingReport && (
                    <div className="border-b border-slate-850 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest">
                                FIFA World Cup 2026 Predictions
                            </h2>
                            <p className="text-blue-400 font-bold text-xs">
                                Group {groupId} Standing &amp; Fixture Report
                            </p>
                        </div>
                        <div className="text-right text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                            Predicted by: {currentProfile}
                        </div>
                    </div>
                )}

                {/* Standings Table */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded bg-emerald-500" />
                        Live Standings
                    </h3>
                    <StandingsTable rows={standings} />

                    {/* Qualification key */}
                    <div className="bg-slate-950/25 border border-slate-900/60 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
                            <span>Positions 1 &amp; 2: Direct qualification to Round of 32</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30 inline-block" />
                            <span>Position 3: Eligible for best 3rd-place qualification</span>
                        </div>
                    </div>
                </div>

                {/* Fixtures */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Unpredicted fixtures (Only show if not printing report, or if they exist) */}
                    {(!isDownloadingReport || unpredicted.length > 0) && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-slate-600" />
                                To Predict
                                {unpredicted.length > 0 && !isDownloadingReport && (
                                    <span className="ml-auto text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                                        {unpredicted.length}
                                    </span>
                                )}
                            </h3>

                            {unpredicted.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800/50 bg-slate-900/20 p-6 text-center">
                                    <p className="text-xs text-slate-500 font-semibold">
                                        All matches predicted! ✓
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {unpredicted.map((match) => (
                                        <div key={match.id} className="relative">
                                            <FixtureCard
                                                match={match}
                                                onSelect={() => setPredictingMatchId(match.id)}
                                                onShare={() => handleShareMatch(match)}
                                                hideActions={isDownloadingReport}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Predicted fixtures */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                            <span className="w-1.5 h-3.5 rounded bg-blue-500" />
                            Predicted
                            {predicted.length > 0 && !isDownloadingReport && (
                                <span className="ml-auto text-[9px] font-black bg-blue-950/60 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full">
                                    {predicted.length}
                                </span>
                            )}
                        </h3>

                        {predicted.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-800/50 bg-slate-900/10 p-6 text-center">
                                <p className="text-xs text-slate-600 font-semibold">
                                    No predictions yet
                                </p>
                                <p className="text-[10px] text-slate-700 mt-1">
                                    Select a fixture to start
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {predicted.map((match) => (
                                    <div key={match.id} className="relative">
                                        <FixtureCard
                                            match={match}
                                            onSelect={() => setPredictingMatchId(match.id)}
                                            onShare={() => handleShareMatch(match)}
                                            hideActions={isDownloadingReport}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Report print-only brand footer */}
                {isDownloadingReport && (
                    <div className="text-center text-[9px] font-black text-slate-700 uppercase tracking-widest border-t border-slate-900 pt-4">
                        FIFA World Cup 2026 Bracket Challenger
                    </div>
                )}
            </div>

            {/* Prediction Modal */}
            {predictingMatchId && (
                <PredictionModal
                    matchId={predictingMatchId}
                    stage="groups"
                    onClose={() => setPredictingMatchId(null)}
                />
            )}

            {/* Global hidden container for individual match capture */}
            {sharingMatch && (
                <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
                    <div 
                        ref={matchShareRef} 
                        className="share-capture-card w-[500px] flex flex-col items-center space-y-6"
                    >
                        <div className="text-center space-y-1 w-full">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                FIFA World Cup 2026 Match Prediction
                            </span>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                Predicted by {currentProfile}
                            </h2>
                        </div>
                        
                        <div className="flex items-center justify-between w-full px-6 py-5 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{homeShareTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{homeShareTeam?.name || "TBD"}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center w-1/3">
                                <span className="text-3xl font-black font-mono text-white tracking-widest">
                                    {sharingMatch.prediction.homeScore} : {sharingMatch.prediction.awayScore}
                                </span>
                            </div>
                            <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
                                <span className="text-5xl leading-none">{awayShareTeam?.flag || "🏳️"}</span>
                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{awayShareTeam?.name || "TBD"}</span>
                            </div>
                        </div>

                        {sharingMatch.prediction.comment && (
                            <div className="w-full bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-center">
                                <p className="text-xs font-medium text-slate-300 italic">
                                    "{sharingMatch.prediction.comment}"
                                </p>
                            </div>
                        )}

                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest w-full text-center border-t border-slate-900 pt-3">
                            FIFA World Cup 2026 Bracket Challenger
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}