import type { KnockoutMatch } from "../types/tournament";
import { teams } from "../data/teams";

// Helper to check if a source can lead to a team
export const canSourceLeadToTeam = (
    source: KnockoutMatch["homeSource"],
    teamId: string,
    currentMatches: KnockoutMatch[]
): boolean => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return false;

    if (source.type === "group_winner" || source.type === "group_runner_up") {
        return source.id === team.groupId;
    }
    if (source.type === "best_third") {
        const slots: Record<string, string[]> = {
            "3AB": ["A", "B"],
            "3CD": ["C", "D"],
            "3BE": ["B", "E"],
            "3AE": ["A", "E"],
            "3CE": ["C", "E"],
            "3EH": ["E", "H"],
            "3EF": ["E", "F"],
            "3DE": ["D", "E"],
        };
        const allowedGroups = slots[source.id] || [];
        return allowedGroups.includes(team.groupId);
    }
    if (source.type === "knockout_winner" || source.type === "knockout_loser") {
        const parentMatch = currentMatches.find((m) => m.id === source.id);
        if (!parentMatch) return false;
        return (
            canSourceLeadToTeam(parentMatch.homeSource, teamId, currentMatches) ||
            canSourceLeadToTeam(parentMatch.awaySource, teamId, currentMatches)
        );
    }
    return false;
};

// Recursive backward assignment function
export const assignTeamToSource = (
    source: KnockoutMatch["homeSource"],
    teamId: string,
    currentMatches: KnockoutMatch[],
    updatedCustomGroupOrders: Record<string, string[]>
): KnockoutMatch[] => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return currentMatches;

    if (source.type === "group_winner") {
        const groupId = source.id;
        const groupTeams = teams.filter((t) => t.groupId === groupId).map((t) => t.id);
        const remaining = groupTeams.filter((id) => id !== teamId);
        const newOrder = [teamId, ...remaining];
        updatedCustomGroupOrders[groupId] = newOrder;
        return currentMatches;
    }
    
    if (source.type === "group_runner_up") {
        const groupId = source.id;
        const groupTeams = teams.filter((t) => t.groupId === groupId).map((t) => t.id);
        const remaining = groupTeams.filter((id) => id !== teamId);
        const newOrder = [remaining[0], teamId, ...remaining.slice(1)];
        updatedCustomGroupOrders[groupId] = newOrder;
        return currentMatches;
    }

    if (source.type === "best_third") {
        const groupId = team.groupId;
        const groupTeams = teams.filter((t) => t.groupId === groupId).map((t) => t.id);
        const remaining = groupTeams.filter((id) => id !== teamId);
        const newOrder = [remaining[0], remaining[1], teamId, remaining[2]];
        updatedCustomGroupOrders[groupId] = newOrder;
        return currentMatches;
    }

    if (source.type === "knockout_winner") {
        const parentMatchId = source.id;
        let updatedMatches = [...currentMatches];
        const parentMatch = updatedMatches.find((m) => m.id === parentMatchId);
        if (!parentMatch) return currentMatches;

        const homeLeads = canSourceLeadToTeam(parentMatch.homeSource, teamId, updatedMatches);
        const awayLeads = canSourceLeadToTeam(parentMatch.awaySource, teamId, updatedMatches);

        if (homeLeads) {
            updatedMatches = assignTeamToSource(
                parentMatch.homeSource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        } else if (awayLeads) {
            updatedMatches = assignTeamToSource(
                parentMatch.awaySource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        } else {
            updatedMatches = assignTeamToSource(
                parentMatch.homeSource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        }

        const isHome = homeLeads || (!homeLeads && !awayLeads);
        return updatedMatches.map((m) => {
            if (m.id !== parentMatchId) return m;
            return {
                ...m,
                prediction: {
                    homeScore: isHome ? 1 : 0,
                    awayScore: isHome ? 0 : 1,
                    winnerId: null,
                },
            };
        });
    }

    if (source.type === "knockout_loser") {
        const parentMatchId = source.id;
        let updatedMatches = [...currentMatches];
        const parentMatch = updatedMatches.find((m) => m.id === parentMatchId);
        if (!parentMatch) return currentMatches;

        const homeLeads = canSourceLeadToTeam(parentMatch.homeSource, teamId, updatedMatches);
        const awayLeads = canSourceLeadToTeam(parentMatch.awaySource, teamId, updatedMatches);

        if (homeLeads) {
            updatedMatches = assignTeamToSource(
                parentMatch.homeSource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        } else if (awayLeads) {
            updatedMatches = assignTeamToSource(
                parentMatch.awaySource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        } else {
            updatedMatches = assignTeamToSource(
                parentMatch.homeSource,
                teamId,
                updatedMatches,
                updatedCustomGroupOrders
            );
        }

        const isHome = homeLeads || (!homeLeads && !awayLeads);
        return updatedMatches.map((m) => {
            if (m.id !== parentMatchId) return m;
            return {
                ...m,
                prediction: {
                    homeScore: isHome ? 0 : 1,
                    awayScore: isHome ? 1 : 0,
                    winnerId: null,
                },
            };
        });
    }

    return currentMatches;
};
