import { getTeamById } from "../../utils/teams";

interface Props {
    teamId?: string | null;
    placeholderText?: string;
    size?: "sm" | "md" | "lg";
    showName?: boolean;
    showCodeOnly?: boolean;
}

export default function TeamBadge({
    teamId,
    placeholderText = "TBD",
    size = "md",
    showName = true,
    showCodeOnly = false,
}: Props) {
    const team = teamId ? getTeamById(teamId) : null;

    // Sizing CSS classes
    const sizeClasses = {
        sm: {
            badge: "w-6 h-6 text-[10px]",
            text: "text-xs font-medium",
            container: "gap-1.5",
        },
        md: {
            badge: "w-8 h-8 text-xs",
            text: "text-sm font-semibold",
            container: "gap-2",
        },
        lg: {
            badge: "w-12 h-12 text-base",
            text: "text-lg font-bold",
            container: "gap-3",
        },
    };

    const activeSize = sizeClasses[size];

    if (!team) {
        // Placeholder Badge (e.g., "1A", "3CD", "Winner Match 1")
        return (
            <div className={`flex items-center ${activeSize.container} select-none`}>
                <div
                    className={`${activeSize.badge} rounded-full border-2 border-dashed border-slate-600 bg-slate-900/50 flex items-center justify-center text-slate-400 font-mono tracking-wider`}
                    title={placeholderText}
                >
                    {placeholderText.length <= 4 ? placeholderText : "TBD"}
                </div>
                {showName && (
                    <span className={`${activeSize.text} text-slate-500 font-medium italic`}>
                        {placeholderText.length > 4 ? placeholderText : `TBD (${placeholderText})`}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center ${activeSize.container} select-none`}>
            {/* Round Flag Badge */}
            <div
                className={`${activeSize.badge} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-md select-none transform transition-transform hover:scale-105 duration-200`}
                title={`${team.name} (${team.code})`}
            >
                {team.flag ? (
                    <span className={`${size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"}`}>
                        {team.flag}
                    </span>
                ) : (
                    <span className="font-bold text-slate-400 font-mono">{team.code}</span>
                )}
            </div>

            {/* Team Name or Code */}
            {showName && (
                <span className={`${activeSize.text} text-slate-200 tracking-wide truncate max-w-[120px] md:max-w-none`}>
                    {showCodeOnly ? team.code : team.name}
                </span>
            )}
        </div>
    );
}