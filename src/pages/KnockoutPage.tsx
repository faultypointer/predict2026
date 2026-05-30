import { useState } from "react";
import { useTournament } from "../context/TournamentContext";
import BracketMatch from "../components/knockout/BracketMatch";
import PredictionModal from "../components/knockout/PredictionModal"
import { getTeamById } from "../utils/teams";
import { Trophy, Medal } from "lucide-react";

export default function KnockoutPage() {
    const { knockoutMatches, getKnockoutWinner } = useTournament();
    const [predictingMatchId, setPredictingMatchId] = useState<string | null>(null);

    // Group knockout matches by round and side
    const r32Left = knockoutMatches.filter((m) => m.stage === "R32").slice(0, 8);
    const r32Right = knockoutMatches.filter((m) => m.stage === "R32").slice(8, 16);

    const r16Left = knockoutMatches.filter((m) => m.stage === "R16").slice(0, 4);
    const r16Right = knockoutMatches.filter((m) => m.stage === "R16").slice(4, 8);

    const qfLeft = knockoutMatches.filter((m) => m.stage === "QF").slice(0, 2);
    const qfRight = knockoutMatches.filter((m) => m.stage === "QF").slice(2, 4);

    const sfLeft = knockoutMatches.filter((m) => m.stage === "SF").slice(0, 1);
    const sfRight = knockoutMatches.filter((m) => m.stage === "SF").slice(1, 2);

    const finalMatch = knockoutMatches.find((m) => m.id === "F");
    const bronzeMatch = knockoutMatches.find((m) => m.id === "BF");

    // Champion
    const championId = finalMatch ? getKnockoutWinner(finalMatch) : null;
    const champion = championId ? getTeamById(championId) : null;

    // Bronze Winner
    const thirdPlaceId = bronzeMatch ? getKnockoutWinner(bronzeMatch) : null;
    const thirdPlaceTeam = thirdPlaceId ? getTeamById(thirdPlaceId) : null;

    // Mobile tabs state
    const [activeMobileTab, setActiveMobileTab] = useState<"R32" | "R16" | "QF" | "SF" | "Finals">("Finals");

    return (
        <div className="space-y-6 animate-fadeIn w-full">
            {/* Champion Banner Celebration */}
            {champion && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20 border border-yellow-500/30 p-5 text-center shadow-xl shadow-yellow-500/5 backdrop-blur-md animate-pulse">
                    <div className="absolute inset-0 bg-yellow-500/5 mix-blend-color-dodge pointer-events-none"></div>
                    <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black tracking-widest bg-yellow-500 text-slate-950 rounded-full uppercase shadow">
                            👑 Prediction Champion
                        </span>
                        <h2 className="text-xl md:text-3xl font-black text-white tracking-wider flex items-center justify-center gap-2">
                            <span>{champion.flag}</span>
                            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent uppercase">
                                {champion.name}
                            </span>
                            <span>{champion.flag}</span>
                        </h2>
                        <p className="text-yellow-400/80 text-[9px] font-bold uppercase tracking-widest font-mono">
                            World Cup 2026 Prediction Winner!
                        </p>

                        {thirdPlaceTeam && (
                            <p className="text-slate-400 text-[10px] mt-1 pt-1.5 border-t border-yellow-500/10 flex items-center justify-center gap-1">
                                <Medal className="w-3 h-3 text-amber-600" />
                                <span>Third Place:</span>
                                <span className="text-slate-200 font-bold">{thirdPlaceTeam.flag} {thirdPlaceTeam.name}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* MOBILE ROUND TABS BAR */}
            <div className="lg:hidden flex items-center justify-between bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto scrollbar-none">
                {(["R32", "R16", "QF", "SF", "Finals"] as const).map((tab) => {
                    const labels = { R32: "R32", R16: "R16", QF: "QF", SF: "SF", Finals: "Finals" };
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveMobileTab(tab)}
                            className={`flex-1 min-w-[60px] py-2 text-center rounded-lg text-[10px] font-black tracking-widest uppercase transition-all
                                ${activeMobileTab === tab
                                    ? "bg-slate-800 text-white shadow"
                                    : "text-slate-500 hover:text-slate-300"}`}
                        >
                            {labels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* MOBILE COMPACT LIST VIEW */}
            <div className="lg:hidden space-y-4">
                {activeMobileTab === "R32" && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 pl-1">Round of 32</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {knockoutMatches.filter((m) => m.stage === "R32").map((match) => (
                                <BracketMatch
                                    key={match.id}
                                    match={match}
                                    onSelect={() => setPredictingMatchId(match.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {activeMobileTab === "R16" && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 pl-1">Round of 16</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {knockoutMatches.filter((m) => m.stage === "R16").map((match) => (
                                <BracketMatch
                                    key={match.id}
                                    match={match}
                                    onSelect={() => setPredictingMatchId(match.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {activeMobileTab === "QF" && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 pl-1">Quarterfinals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {knockoutMatches.filter((m) => m.stage === "QF").map((match) => (
                                <BracketMatch
                                    key={match.id}
                                    match={match}
                                    onSelect={() => setPredictingMatchId(match.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {activeMobileTab === "SF" && (
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 pl-1">Semifinals</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {knockoutMatches.filter((m) => m.stage === "SF").map((match) => (
                                <BracketMatch
                                    key={match.id}
                                    match={match}
                                    onSelect={() => setPredictingMatchId(match.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {activeMobileTab === "Finals" && (
                    <div className="space-y-5">
                        {finalMatch && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>World Cup Final</span>
                                </h4>
                                <BracketMatch
                                    match={finalMatch}
                                    onSelect={() => setPredictingMatchId(finalMatch.id)}
                                />
                            </div>
                        )}
                        {bronzeMatch && (
                            <div className="space-y-2 pt-4 border-t border-slate-900">
                                <h4 className="text-[10px] font-black text-amber-600/90 uppercase tracking-widest pl-1 flex items-center gap-1">
                                    <Medal className="w-3.5 h-3.5" />
                                    <span>Bronze Final (Third Place)</span>
                                </h4>
                                <BracketMatch
                                    match={bronzeMatch}
                                    onSelect={() => setPredictingMatchId(bronzeMatch.id)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DESKTOP SINGLE-PAGE FOTMOB BRACKET */}
            <div className="hidden lg:grid lg:grid-cols-9 gap-4 items-stretch h-[740px] select-none p-1 rounded-3xl border border-slate-900 bg-slate-950/20">
                {/* 1. LEFT R32 */}
                <div className="flex flex-col justify-around h-full py-1">
                    {r32Left.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 2. LEFT R16 */}
                <div className="flex flex-col justify-around h-full py-6">
                    {r16Left.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 3. LEFT QF */}
                <div className="flex flex-col justify-around h-full py-16">
                    {qfLeft.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 4. LEFT SF */}
                <div className="flex flex-col justify-around h-full py-28">
                    {sfLeft.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 5. CENTER COLUMN (FINALS) */}
                <div className="flex flex-col justify-center gap-12 h-full px-2 text-center border-x border-slate-900/60 bg-slate-950/30">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center space-y-1 mb-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
                                <Trophy className="w-5 h-5 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">
                                World Cup Final
                            </span>
                        </div>
                        {finalMatch && (
                            <BracketMatch
                                match={finalMatch}
                                onSelect={() => setPredictingMatchId(finalMatch.id)}
                            />
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-900/80">
                        <div className="flex flex-col items-center justify-center space-y-1 mb-2">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                <Medal className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                Bronze Play-off
                            </span>
                        </div>
                        {bronzeMatch && (
                            <BracketMatch
                                match={bronzeMatch}
                                onSelect={() => setPredictingMatchId(bronzeMatch.id)}
                            />
                        )}
                    </div>
                </div>

                {/* 6. RIGHT SF */}
                <div className="flex flex-col justify-around h-full py-28">
                    {sfRight.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 7. RIGHT QF */}
                <div className="flex flex-col justify-around h-full py-16">
                    {qfRight.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 8. RIGHT R16 */}
                <div className="flex flex-col justify-around h-full py-6">
                    {r16Right.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>

                {/* 9. RIGHT R32 */}
                <div className="flex flex-col justify-around h-full py-1">
                    {r32Right.map((match) => (
                        <BracketMatch
                            key={match.id}
                            match={match}
                            onSelect={() => setPredictingMatchId(match.id)}
                        />
                    ))}
                </div>
            </div>

            {/* PREDICTION MODAL */}
            {predictingMatchId && (
                <PredictionModal
                    matchId={predictingMatchId}
                    stage="knockout"
                    onClose={() => setPredictingMatchId(null)}
                />
            )}
        </div>
    );
}
