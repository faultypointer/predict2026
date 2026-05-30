import type { StandingsRow } from "../../types/tournament";
import { getTeamById } from "../../utils/teams";

interface Props {
    groupId: string;
    standings: StandingsRow[];
    onClick: () => void;
}

export default function GroupCard({ groupId, standings, onClick }: Props) {
    return (
        <div 
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/5"
        >
            {/* Header with neon border overlay on hover */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 group-hover:border-blue-500/20">
                <h3 className="text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-4 rounded-sm bg-blue-500 inline-block"></span>
                    Group {groupId}
                </h3>
                
                <span className="text-[10px] font-bold text-slate-500 tracking-wider group-hover:text-blue-400 transition-colors uppercase">
                    Predict &rarr;
                </span>
            </div>

            {/* Quick Standings Grid */}
            <div className="space-y-1.5">
                {standings.map((row, index) => {
                    const position = index + 1;
                    const team = getTeamById(row.teamId);
                    
                    if (!team) return null;

                    // Direct qualification zone highlights
                    const posColor = position <= 2 
                        ? "text-emerald-400 font-semibold" 
                        : position === 3
                        ? "text-amber-500/70"
                        : "text-slate-500";

                    return (
                        <div 
                            key={row.teamId} 
                            className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg transition-colors group-hover:bg-slate-950/20"
                        >
                            {/* Left: Position & Team Flag/Name */}
                            <div className="flex items-center gap-2 max-w-[70%] truncate">
                                <span className={`font-mono w-4 text-center ${posColor}`}>
                                    {position}
                                </span>
                                <span className="text-base leading-none select-none">{team.flag}</span>
                                <span className="font-semibold text-slate-300 group-hover:text-white transition-colors truncate">
                                    {team.name}
                                </span>
                            </div>

                            {/* Right: Matches Played & Points */}
                            <div className="flex items-center gap-3 font-mono">
                                <span className="text-[10px] text-slate-500" title="Predicted Matches Played">
                                    {row.played}P
                                </span>
                                <span className="w-6 text-right font-extrabold text-slate-200" title="Points">
                                    {row.points}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Subtle card bottom accent glow */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600/0 via-blue-500/0 to-cyan-500/0 group-hover:from-blue-600/30 group-hover:via-blue-500/60 group-hover:to-cyan-500/30 transition-all duration-300"></div>
        </div>
    );
}
