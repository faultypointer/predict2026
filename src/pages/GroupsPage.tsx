import { useTournament } from "../context/TournamentContext";
import { groups } from "../data/groups";
import GroupCard from "../components/standings/GroupCard";
import TeamBadge from "../components/teams/TeamBadge";

interface Props {
    onNavigate: (page: string, groupId?: string) => void;
}

export default function GroupsPage({ onNavigate }: Props) {
    const { groupStandings, thirdPlaceStandings } = useTournament();

    return (
        <div className="space-y-10 animate-fadeIn">
            {/* Quick explanation and instructions */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-sm">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white tracking-wide">Group Stage Predictions</h2>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                        Predict all group matches by clicking on the groups below. The standings will calculate automatically. The top 2 from each group plus the 8 best 3rd-placed teams will qualify for the Round of 32.
                    </p>
                </div>
            </div>

            {/* Grid of 12 Groups */}
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-md bg-blue-500"></span>
                    Tournament Groups
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groups.map((group) => {
                        const standings = groupStandings[group.id] || [];
                        return (
                            <GroupCard
                                key={group.id}
                                groupId={group.id}
                                standings={standings}
                                onClick={() => onNavigate("group", group.id)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Best 3rd Place Standings Widget */}
            <div className="border border-slate-800 bg-slate-900/30 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-md bg-amber-500"></span>
                            Best Third-Place Teams
                        </h2>
                        <p className="text-slate-400 text-xs">
                            Top 8 teams in this ranking will advance to the Round of 32.
                        </p>
                    </div>
                    <span className="px-3 py-1 text-[10px] font-black tracking-widest bg-amber-950/40 border border-amber-800/40 text-amber-400 rounded-full uppercase">
                        Real-Time Ranking
                    </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/20">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-950/40">
                                <th className="py-3 px-3 text-center w-12">Rank</th>
                                <th className="py-3 px-2 text-center w-12">Grp</th>
                                <th className="py-3 px-2 text-left">Team</th>
                                <th className="py-3 px-1 text-center w-10 hidden sm:table-cell">P</th>
                                <th className="py-3 px-1 text-center w-10">W</th>
                                <th className="py-3 px-1 text-center w-10">D</th>
                                <th className="py-3 px-1 text-center w-10">L</th>
                                <th className="py-3 px-1 text-center w-10 hidden sm:table-cell">GF</th>
                                <th className="py-3 px-1 text-center w-10 hidden sm:table-cell">GA</th>
                                <th className="py-3 px-2 text-center w-12">GD</th>
                                <th className="py-3 px-3 text-center w-14 text-slate-200">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {thirdPlaceStandings.map((row, index) => {
                                const rank = index + 1;
                                const qualifies = rank <= 8;
                                const rowClass = qualifies
                                    ? "border-l-4 border-emerald-500 bg-emerald-950/10 hover:bg-emerald-950/15"
                                    : "border-l-4 border-rose-950/20 bg-rose-950/5 hover:bg-rose-950/10 opacity-60";

                                const gdClass = row.goalDifference > 0 
                                    ? "text-emerald-400" 
                                    : row.goalDifference < 0 
                                    ? "text-rose-400" 
                                    : "text-slate-400";

                                return (
                                    <tr key={row.teamId} className={`border-b border-slate-800/55 transition-all ${rowClass}`}>
                                        {/* Rank Column */}
                                        <td className="py-3 px-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold
                                                ${qualifies 
                                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" 
                                                    : "bg-rose-950/40 text-rose-400 border border-rose-900/20"}`}
                                            >
                                                {rank}
                                            </span>
                                        </td>
                                        
                                        {/* Group Column */}
                                        <td className="py-3 px-2 text-center font-mono font-bold text-slate-400">
                                            {row.groupId}
                                        </td>

                                        {/* Team Name */}
                                        <td className="py-3 px-2 text-left font-semibold">
                                            <TeamBadge teamId={row.teamId} size="sm" />
                                        </td>

                                        {/* Stats */}
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-300 hidden sm:table-cell">{row.played}</td>
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.won}</td>
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.drawn}</td>
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.lost}</td>
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-400 hidden sm:table-cell">{row.goalsFor}</td>
                                        <td className="py-3 px-1 text-center font-mono text-xs text-slate-400 hidden sm:table-cell">{row.goalsAgainst}</td>
                                        <td className={`py-3 px-2 text-center font-mono text-xs ${gdClass}`}>
                                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                        </td>
                                        
                                        {/* Points */}
                                        <td className="py-3 px-3 text-center">
                                            <span className="font-mono text-sm font-extrabold text-white">{row.points}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
