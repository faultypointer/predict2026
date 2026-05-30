import { useState, useEffect } from "react";
import { TournamentProvider, useTournament } from "./context/TournamentContext";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";
import KnockoutPage from "./pages/KnockoutPage";
import { getTeamById } from "./utils/teams";

function AppContent() {
    // Custom Router State
    const [route, setRoute] = useState<{ page: string; groupId?: string }>(() => {
        // Initial route parsing
        const hash = window.location.hash;
        if (hash.startsWith("#/groups/")) {
            const groupId = hash.substring(9).toUpperCase();
            return { page: "group", groupId };
        }
        if (hash === "#/knockout") {
            return { page: "knockout" };
        }
        return { page: "groups" };
    });

    const { groupMatches, knockoutMatches, resetAllPredictions } = useTournament();

    // Listen to hashchange events
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith("#/groups/")) {
                const groupId = hash.substring(9).toUpperCase();
                setRoute({ page: "group", groupId });
            } else if (hash === "#/knockout") {
                setRoute({ page: "knockout" });
            } else {
                setRoute({ page: "groups" });
            }
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // Navigation trigger helpers
    const navigate = (page: string, groupId?: string) => {
        if (page === "group" && groupId) {
            window.location.hash = `#/groups/${groupId.toLowerCase()}`;
        } else if (page === "knockout") {
            window.location.hash = "#/knockout";
        } else {
            window.location.hash = "#/groups";
        }
    };

    // Global Stats Calculation
    const predictedGroupCount = groupMatches.filter(
        (m) => m.prediction.homeScore !== null && m.prediction.awayScore !== null
    ).length;

    const predictedKnockoutCount = knockoutMatches.filter(
        (m) => m.prediction.homeScore !== null && m.prediction.awayScore !== null
    ).length;

    const totalPredicted = predictedGroupCount + predictedKnockoutCount;
    const totalMatches = groupMatches.length + knockoutMatches.length; // 72 + 32 = 104 matches

    const finalMatch = knockoutMatches.find((m) => m.id === "F");
    // Resolve champion team if final predicted
    const resolvedChampionId = finalMatch ? useTournament().getKnockoutWinner(finalMatch) : null;
    const championTeam = resolvedChampionId ? getTeamById(resolvedChampionId) : null;

    const handleResetAll = () => {
        if (window.confirm("Are you sure you want to clear all predictions? This will reset all standings and bracket progression.")) {
            resetAllPredictions();
            navigate("groups");
        }
    };

    return (
        <div className="min-height-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
            {/* Premium Header Nav Bar */}
            <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/85 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: Brand Title */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("groups")}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-blue-500/20">
                            <span className="text-lg font-black tracking-tighter">🏆</span>
                        </div>
                        <div>
                            <h1 className="text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                                World Cup 2026
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40 tracking-widest uppercase">
                                    Predictor
                                </span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">
                                Client-Side Tournament Predictor
                            </p>
                        </div>
                    </div>

                    {/* Middle: Navigation Tabs */}
                    <nav className="flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
                        <button
                            onClick={() => navigate("groups")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all
                                ${route.page === "groups" || route.page === "group"
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-200"}`}
                        >
                            📊 Groups Stage
                        </button>
                        <button
                            onClick={() => navigate("knockout")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase transition-all
                                ${route.page === "knockout"
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-400 hover:text-slate-200"}`}
                        >
                            🏆 Knockout Stage
                        </button>
                    </nav>

                    {/* Right: Real-time Prediction Dashboard */}
                    <div className="flex items-center gap-4">
                        {/* Progress Stats Widget */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                                Progress Status
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                        style={{ width: `${(totalPredicted / totalMatches) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="font-mono text-xs font-extrabold text-white">
                                    {totalPredicted}/{totalMatches}
                                </span>
                            </div>
                        </div>

                        {/* Champion Display if predicted */}
                        {championTeam && (
                            <div className="flex items-center gap-2 bg-yellow-950/20 border border-yellow-800/30 px-3 py-1 rounded-xl shadow-inner">
                                <span className="text-xs">👑</span>
                                <span className="text-xs font-extrabold text-yellow-400 uppercase tracking-wider truncate max-w-[80px]">
                                    {championTeam.name}
                                </span>
                            </div>
                        )}

                        {/* Reset All Predictions */}
                        {totalPredicted > 0 && (
                            <button
                                onClick={handleResetAll}
                                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-500 hover:text-rose-400 hover:border-slate-700 active:scale-95 transition-all text-xs font-bold"
                                title="Reset all predictions"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {route.page === "groups" && (
                    <GroupsPage onNavigate={navigate} />
                )}
                {route.page === "group" && route.groupId && (
                    <GroupPage
                        groupId={route.groupId}
                        onBack={() => navigate("groups")}
                    />
                )}
                {route.page === "knockout" && (
                    <KnockoutPage />
                )}
            </main>

            {/* Elegant Footer */}
            <footer className="border-t border-slate-900 py-6 bg-slate-950/60 text-center">
                <div className="max-w-7xl mx-auto px-4 text-[10px] font-bold text-slate-600 tracking-wider uppercase space-y-1">
                    <p>&copy; 2026 World Cup Predictor &bull; Fully Client-Side React Webapp</p>
                    <p className="font-normal text-slate-700 italic lowercase">
                        built with react 19, typescript, vite, tailwindcss
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <TournamentProvider>
            <AppContent />
        </TournamentProvider>
    );
}
