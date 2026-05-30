import type { StandingsRow } from "../../types/tournament";
import StandingRow from "./StandingRow";

interface Props {
    rows: StandingsRow[];
}

export default function StandingsTable({ rows }: Props) {
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-800 text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-950/40">
                        <th className="py-3 px-3 text-center w-12">Pos</th>
                        <th className="py-3 px-2 text-left">Team</th>
                        <th className="py-3 px-1 text-center w-10 hidden sm:table-cell" title="Played">P</th>
                        <th className="py-3 px-1 text-center w-10" title="Wins">W</th>
                        <th className="py-3 px-1 text-center w-10" title="Draws">D</th>
                        <th className="py-3 px-1 text-center w-10" title="Losses">L</th>
                        <th className="py-3 px-1 text-center w-10 hidden sm:table-cell" title="Goals For">GF</th>
                        <th className="py-3 px-1 text-center w-10 hidden sm:table-cell" title="Goals Against">GA</th>
                        <th className="py-3 px-2 text-center w-12" title="Goal Difference">GD</th>
                        <th className="py-3 px-3 text-center w-14 text-slate-200" title="Points">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => {
                        const position = index + 1;
                        // Qualification zone rules:
                        // Top 2: Direct Qualification (direct)
                        // 3rd: Best Third place pool (playoff)
                        // 4th: Eliminated (none)
                        const highlightZone = position <= 2 
                            ? "direct" 
                            : position === 3 
                            ? "playoff" 
                            : "none";

                        return (
                            <StandingRow
                                key={row.teamId}
                                position={position}
                                row={row}
                                highlightZone={highlightZone}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
