import type { Match } from "../../types/tournament";
import TeamBadge from "../teams/TeamBadge";

interface Props {
    match: Match;
}

export default function MatchCard({ match }: Props) {
    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <TeamBadge teamId={match.homeTeamId} />
                </div>

                <div className="flex items-center gap-2 px-4">
                    <button className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-state-600">
                        {match.prediction.homeScore ?? "-"}
                    </button>

                    <span className="text-slate-400">:</span>

                    <button className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-state-600">
                        {match.prediction.awayScore ?? "-"}
                    </button>
                </div>

                <div className="flex-1 flex justify-end">
                    <TeamBadge teamId={match.awayTeamId} />
                </div>
            </div>
        </div>
    );
}