import { getTeamById } from "../../utils/teams";

interface Props {
    teamId: string;
}

export default function TeamBadge({ teamId }: Props) {
    const team = getTeamById(teamId);

    if (!team) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                {team.code}
            </div>

            <span>{team.name}</span>
        </div>
    )
}