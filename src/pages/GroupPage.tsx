import { useTournament } from "../context/TournamentContext";
import { getTeamById } from "../utils/teams";
import StandingsTable from "../components/standings/StandingsTable";
import MatchCard from "../components/fixtures/MatchCard";

interface Props {
    groupId: string;
    onBack: () => void;
}

export default function GroupPage({ groupId, onBack }: Props) {
    const { 
        groupMatches, 
        groupStandings, 
        updateGroupMatchPrediction, 
        resetGroupPredictions 
    } = useTournament();

    // Filter matches for this group
    const matches = groupMatches.filter((m) => {
        const team = getTeamById(m.homeTeamId);
        return team?.groupId === groupId;
    });

    const standings = groupStandings[groupId] || [];

    // Calculate prediction completion progress for this group
    const completedCount = matches.filter(
        (m) => m.prediction.homeScore !== null && m.prediction.awayScore !== null
    ).length;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header controls and breadcrumb */}
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
                            Predicted matches: {completedCount} / {matches.length}
                        </p>
                    </div>
                </div>

                {completedCount > 0 && (
                    <button 
                        onClick={() => resetGroupPredictions(groupId)}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/20 border border-rose-900/35 hover:bg-rose-950/40 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                        Reset Group
                    </button>
                )}
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Standings Table */}
                <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded bg-emerald-500"></span>
                        Live Standings
                    </h3>
                    <StandingsTable rows={standings} />
                    
                    {/* Footnote about qualification rules */}
                    <div className="bg-slate-950/25 border border-slate-900/60 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed space-y-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block"></span>
                            <span>Positions 1 &amp; 2: Direct qualification to Round of 32</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30 inline-block"></span>
                            <span>Position 3: Eligible for best 3rd-place qualification</span>
                        </div>
                    </div>
                </div>

                {/* Right: Group Stage Fixtures */}
                <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded bg-blue-500"></span>
                        Fixtures &amp; Predictions
                    </h3>

                    <div className="space-y-4">
                        {matches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onPredict={(homeScore, awayScore) => 
                                    updateGroupMatchPrediction(match.id, homeScore, awayScore)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
