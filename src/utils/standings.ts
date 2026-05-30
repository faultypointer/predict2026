import type { Match, StandingsRow, Group } from "../types/tournament";
import { getTeamById } from "./teams";

/**
 * Calculates standings for a specific group based on predictions
 */
export function calculateGroupStandings(teamIds: string[], groupMatches: Match[]): StandingsRow[] {
    const standingsMap: Record<string, StandingsRow> = {};

    // Initialize standings for all teams in the group
    for (const teamId of teamIds) {
        standingsMap[teamId] = {
            teamId,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
        };
    }

    // Process predicted matches
    for (const match of groupMatches) {
        const { homeScore, awayScore } = match.prediction;

        // Only compute if scores are entered (not null)
        if (homeScore !== null && awayScore !== null) {
            const home = standingsMap[match.homeTeamId];
            const away = standingsMap[match.awayTeamId];

            if (home && away) {
                home.played += 1;
                away.played += 1;
                home.goalsFor += homeScore;
                home.goalsAgainst += awayScore;
                away.goalsFor += awayScore;
                away.goalsAgainst += homeScore;

                if (homeScore > awayScore) {
                    home.won += 1;
                    home.points += 3;
                    away.lost += 1;
                } else if (homeScore < awayScore) {
                    away.won += 1;
                    away.points += 3;
                    home.lost += 1;
                } else {
                    home.drawn += 1;
                    home.points += 1;
                    away.drawn += 1;
                    away.points += 1;
                }
            }
        }
    }

    // Compute goal difference and convert map to array
    const standings = Object.values(standingsMap).map((row) => {
        row.goalDifference = row.goalsFor - row.goalsAgainst;
        return row;
    });

    // Sort standings
    // Tiebreakers: 1. Points, 2. GD, 3. GF, 4. Won (wins), 5. Alphabetical Team Name
    standings.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (b.goalDifference !== a.goalDifference) {
            return b.goalDifference - a.goalDifference;
        }
        if (b.goalsFor !== a.goalsFor) {
            return b.goalsFor - a.goalsFor;
        }
        if (b.won !== a.won) {
            return b.won - a.won;
        }
        // Alphabetical code tiebreaker
        const teamA = getTeamById(a.teamId);
        const teamB = getTeamById(b.teamId);
        const nameA = teamA?.name || "";
        const nameB = teamB?.name || "";
        return nameA.localeCompare(nameB);
    });

    return standings;
}

export interface ThirdPlaceRow extends StandingsRow {
    groupId: string;
}

/**
 * Calculates and ranks the third-place teams across all groups
 */
export function calculateThirdPlaceStandings(groups: Group[], allMatches: Match[]): ThirdPlaceRow[] {
    const thirds: ThirdPlaceRow[] = [];

    for (const group of groups) {
        const groupMatches = allMatches.filter((m) => {
            const team = getTeamById(m.homeTeamId);
            return team?.groupId === group.id;
        });

        const standings = calculateGroupStandings(group.teamIds, groupMatches);
        // Take the 3rd-placed team (index 2 in sorted standings)
        if (standings[2]) {
            thirds.push({
                ...standings[2],
                groupId: group.id,
            });
        }
    }

    // Sort the 12 third-place teams
    // Tiebreakers: 1. Points, 2. GD, 3. GF, 4. Wins, 5. Alphabetical
    thirds.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        if (b.goalDifference !== a.goalDifference) {
            return b.goalDifference - a.goalDifference;
        }
        if (b.goalsFor !== a.goalsFor) {
            return b.goalsFor - a.goalsFor;
        }
        if (b.won !== a.won) {
            return b.won - a.won;
        }
        return a.groupId.localeCompare(b.groupId);
    });

    return thirds;
}

/**
 * Greedy matching algorithm to assign the 8 qualified third-place teams to their respective bracket slots:
 * ["3AB", "3CD", "3BE", "3AE", "3CE", "3EH", "3EF", "3DE"]
 */
export function assignThirdPlaces(qualifiedThirds: { groupId: string; teamId: string }[]): Record<string, string> {
    const slots = [
        { id: "3AB", groups: ["A", "B"] },
        { id: "3CD", groups: ["C", "D"] },
        { id: "3BE", groups: ["B", "E"] },
        { id: "3AE", groups: ["A", "E"] },
        { id: "3CE", groups: ["C", "E"] },
        { id: "3EH", groups: ["E", "H"] },
        { id: "3EF", groups: ["E", "F"] },
        { id: "3DE", groups: ["D", "E"] },
    ];

    const assigned: Record<string, string> = {};
    const usedTeamIds = new Set<string>();

    // Pass 1: Try to assign each slot its preferred group
    for (const slot of slots) {
        const matchingTeam = qualifiedThirds.find(
            (t) => slot.groups.includes(t.groupId) && !usedTeamIds.has(t.teamId)
        );
        if (matchingTeam) {
            assigned[slot.id] = matchingTeam.teamId;
            usedTeamIds.add(matchingTeam.teamId);
        }
    }

    // Pass 2: Fallback for slots that couldn't get their preferred group, fill with next best remaining teams
    for (const slot of slots) {
        if (!assigned[slot.id]) {
            const nextBestTeam = qualifiedThirds.find((t) => !usedTeamIds.has(t.teamId));
            if (nextBestTeam) {
                assigned[slot.id] = nextBestTeam.teamId;
                usedTeamIds.add(nextBestTeam.teamId);
            }
        }
    }

    return assigned;
}
