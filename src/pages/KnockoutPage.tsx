import { useTournament } from "../context/TournamentContext";
import BracketMatch from "../components/knockout/BracketMatch";
import { getTeamById } from "../utils/teams";

export default function KnockoutPage() {
    const { knockoutMatches, getKnockoutWinner } = useTournament();

    // Group knockout matches by round
    const r32Matches = knockoutMatches.filter((m) => m.stage === "R32");
    const r16Matches = knockoutMatches.filter((m) => m.stage === "R16");
    const qfMatches = knockoutMatches.filter((m) => m.stage === "QF");
    const sfMatches = knockoutMatches.filter((m) => m.stage === "SF");
    const finalMatch = knockoutMatches.find((m) => m.id === "F");
    const bronzeMatch = knockoutMatches.find((m) => m.id === "BF");

    // Determine Champion
    const championId = finalMatch ? getKnockoutWinner(finalMatch) : null;
    const champion = championId ? getTeamById(championId) : null;

    // Determine Bronze Winner
    const thirdPlaceId = bronzeMatch ? getKnockoutWinner(bronzeMatch) : null;
    const thirdPlaceTeam = thirdPlaceId ? getTeamById(thirdPlaceId) : null;

    return (
        <div className="space-y-8 animate-fadeIn w-full">
            {/* Champion Banner Celebration */}
            {champion && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600/20 via-yellow-500/30 to-amber-600/20 border-2 border-yellow-500/40 p-6 text-center shadow-2xl shadow-yellow-500/5 backdrop-blur-md animate-pulse">
                    <div className="absolute inset-0 bg-yellow-500/5 mix-blend-color-dodge pointer-events-none"></div>
                    <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black tracking-widest bg-yellow-500 text-slate-950 rounded-full uppercase shadow-lg shadow-yellow-500/20">
                            👑 Champion Crowned
                        </span>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-wider flex items-center justify-center gap-3">
                            <span>{champion.flag}</span>
                            <span className="bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent uppercase">
                                {champion.name}
                            </span>
                            <span>{champion.flag}</span>
                        </h2>
                        <p className="text-yellow-300/80 text-xs font-semibold uppercase tracking-widest font-mono">
                            World Cup 2026 Prediction Champion!
                        </p>
                        
                        {thirdPlaceTeam && (
                            <p className="text-slate-400 text-xs mt-2 pt-2 border-t border-yellow-500/10">
                                🥉 Third Place Play-off Winner: <span className="text-slate-200 font-bold">{thirdPlaceTeam.flag} {thirdPlaceTeam.name}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Horizontal Scrollable Bracket Viewport */}
            <div className="w-full overflow-x-auto pb-6 scrollbar-thin select-none">
                <div className="flex gap-6 min-w-[1280px] px-1">
                    
                    {/* ROUND OF 32 COLUMN */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="border-b border-slate-800 pb-3 mb-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-blue-500"></span>
                                Round of 32
                            </h3>
                            <p className="text-[10px] text-slate-500">16 Matches (Left &amp; Right)</p>
                        </div>
                        <div className="space-y-4 overflow-y-auto max-h-[80vh] pr-2">
                            {r32Matches.map((match) => (
                                <BracketMatch key={match.id} match={match} />
                            ))}
                        </div>
                    </div>

                    {/* ROUND OF 16 COLUMN */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="border-b border-slate-800 pb-3 mb-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-indigo-500"></span>
                                Round of 16
                            </h3>
                            <p className="text-[10px] text-slate-500">8 Matches</p>
                        </div>
                        <div className="space-y-8 py-4 overflow-y-auto max-h-[80vh] pr-2">
                            {r16Matches.map((match) => (
                                <BracketMatch key={match.id} match={match} />
                            ))}
                        </div>
                    </div>

                    {/* QUARTERFINALS COLUMN */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="border-b border-slate-800 pb-3 mb-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-purple-500"></span>
                                Quarterfinals
                            </h3>
                            <p className="text-[10px] text-slate-500">4 Matches</p>
                        </div>
                        <div className="space-y-16 py-12 overflow-y-auto max-h-[80vh] pr-2">
                            {qfMatches.map((match) => (
                                <BracketMatch key={match.id} match={match} />
                            ))}
                        </div>
                    </div>

                    {/* SEMIFINALS COLUMN */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="border-b border-slate-800 pb-3 mb-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-pink-500"></span>
                                Semifinals
                            </h3>
                            <p className="text-[10px] text-slate-500">2 Matches</p>
                        </div>
                        <div className="space-y-32 py-24 overflow-y-auto max-h-[80vh] pr-2">
                            {sfMatches.map((match) => (
                                <BracketMatch key={match.id} match={match} />
                            ))}
                        </div>
                    </div>

                    {/* FINALS COLUMN */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="border-b border-slate-800 pb-3 mb-2">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-3.5 rounded bg-yellow-500"></span>
                                Finals
                            </h3>
                            <p className="text-[10px] text-slate-500">Champion &amp; Bronze Final</p>
                        </div>
                        <div className="space-y-12 py-16">
                            {/* Final Match Block */}
                            {finalMatch && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-yellow-500/80 tracking-widest uppercase">
                                        🏆 World Cup Final
                                    </span>
                                    <BracketMatch match={finalMatch} />
                                </div>
                            )}

                            {/* Bronze Final Match Block */}
                            {bronzeMatch && (
                                <div className="space-y-2 pt-8 border-t border-slate-850">
                                    <span className="text-[10px] font-black text-amber-600/80 tracking-widest uppercase">
                                        🥉 Bronze Play-off
                                    </span>
                                    <BracketMatch match={bronzeMatch} />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Scroll indicator overlay for smaller screens */}
            <div className="text-center text-[10px] text-slate-500 font-semibold tracking-widest uppercase select-none lg:hidden animate-pulse">
                Swipe horizontally to explore bracket columns &rarr;
            </div>
        </div>
    );
}
