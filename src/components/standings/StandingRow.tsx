import type { StandingsRow } from "../../types/tournament";
import TeamBadge from "../teams/TeamBadge";

interface Props {
    position: number;
    row: StandingsRow;
    highlightZone: "direct" | "playoff" | "none";
}

export default function StandingRow({ position, row, highlightZone }: Props) {
    // Determine background color based on qualification zone
    const zoneClasses = {
        direct: "border-l-4 border-emerald-500 bg-emerald-950/15 hover:bg-emerald-950/25",
        playoff: "border-l-4 border-amber-500/60 bg-amber-950/5 hover:bg-amber-950/10",
        none: "border-l-4 border-transparent hover:bg-slate-800/40",
    };

    const gdClass = row.goalDifference > 0 
        ? "text-emerald-400 font-medium" 
        : row.goalDifference < 0 
        ? "text-rose-400 font-medium" 
        : "text-slate-400";

    return (
        <tr className={`border-b border-slate-800/60 transition-all duration-150 ${zoneClasses[highlightZone]}`}>
            {/* Position Column */}
            <td className="py-3 px-3 text-center">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold font-mono
                    ${highlightZone === "direct" ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" : 
                      highlightZone === "playoff" ? "bg-amber-950/80 text-amber-400 border border-amber-800/20" : 
                      "text-slate-400"}`}
                >
                    {position}
                </span>
            </td>

            {/* Team Badging Column */}
            <td className="py-3 px-2 text-left font-semibold">
                <TeamBadge teamId={row.teamId} size="sm" />
            </td>

            {/* Detailed Stats Columns */}
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-300 hidden sm:table-cell">{row.played}</td>
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.won}</td>
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.drawn}</td>
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-300">{row.lost}</td>
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-400 hidden sm:table-cell">{row.goalsFor}</td>
            <td className="py-3 px-1 text-center font-mono text-xs text-slate-400 hidden sm:table-cell">{row.goalsAgainst}</td>
            <td className={`py-3 px-2 text-center font-mono text-xs ${gdClass}`}>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
            
            {/* Points Column */}
            <td className="py-3 px-3 text-center">
                <span className="font-mono text-sm font-extrabold text-white tracking-wide">{row.points}</span>
            </td>
        </tr>
    );
}
