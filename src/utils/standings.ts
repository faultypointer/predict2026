import type { Match, StandingsRow, Group } from "../types/tournament";
import { getTeamById } from "./teams";

/**
 * FIFA World Cup 2026™ — Official Group Standings Tiebreaker
 *
 * When two or more teams are equal on points, the following criteria apply in order:
 *
 * STEP 1 (Head-to-head among tied teams):
 *   1. Greatest number of points in matches between the teams concerned
 *   2. Superior goal difference in matches between the teams concerned
 *   3. Greatest number of goals scored in matches between the teams concerned
 *
 * STEP 2 (Overall group stats, for teams still tied after Step 1):
 *   4. Superior goal difference in all group matches
 *   5. Greatest number of goals scored in all group matches
 *   (Team conduct score skipped — not available in a prediction tool)
 *
 * STEP 3 (Final fallback):
 *   6. FIFA/Coca-Cola Men's World Ranking (April 2026)
 */

/**
 * Calculate basic standings stats for a set of teams from a set of matches.
 * Used both for the full group and for head-to-head mini-tables.
 */
function buildStandingsMap(teamIds: string[], matches: Match[]): Record<string, StandingsRow> {
    const map: Record<string, StandingsRow> = {};

    for (const teamId of teamIds) {
        map[teamId] = {
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

    for (const match of matches) {
        const { homeScore, awayScore } = match.prediction;
        if (homeScore === null || awayScore === null) continue;

        const home = map[match.homeTeamId];
        const away = map[match.awayTeamId];
        if (!home || !away) continue;

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

    for (const row of Object.values(map)) {
        row.goalDifference = row.goalsFor - row.goalsAgainst;
    }

    return map;
}

/**
 * Resolve a group of tied teams using the FIFA 3-step process.
 * Returns the teamIds in sorted order (best first).
 *
 * @param tiedTeamIds - The team IDs that are tied on overall points
 * @param overallMap  - The full group standings map (for Step 2 stats)
 * @param groupMatches - All matches in the group (for building h2h mini-tables)
 */
function resolveTiedGroup(
    tiedTeamIds: string[],
    overallMap: Record<string, StandingsRow>,
    groupMatches: Match[]
): string[] {
    if (tiedTeamIds.length <= 1) return tiedTeamIds;

    // --- STEP 1: Head-to-head mini-table ---
    // Filter matches where BOTH teams are in the tied set
    const h2hMatches = groupMatches.filter(
        (m) =>
            tiedTeamIds.includes(m.homeTeamId) &&
            tiedTeamIds.includes(m.awayTeamId) &&
            m.prediction.homeScore !== null &&
            m.prediction.awayScore !== null
    );

    const h2hMap = buildStandingsMap(tiedTeamIds, h2hMatches);

    // Sort by h2h criteria: Points → GD → GF
    const h2hSorted = [...tiedTeamIds].sort((a, b) => {
        const ha = h2hMap[a];
        const hb = h2hMap[b];

        if (hb.points !== ha.points) return hb.points - ha.points;
        if (hb.goalDifference !== ha.goalDifference) return hb.goalDifference - ha.goalDifference;
        if (hb.goalsFor !== ha.goalsFor) return hb.goalsFor - ha.goalsFor;
        return 0; // still tied
    });

    // Group teams that are STILL tied after h2h
    const result: string[] = [];
    let i = 0;
    while (i < h2hSorted.length) {
        // Find the extent of the current tie cluster
        let j = i + 1;
        while (j < h2hSorted.length) {
            const a = h2hMap[h2hSorted[i]];
            const b = h2hMap[h2hSorted[j]];
            if (a.points !== b.points || a.goalDifference !== b.goalDifference || a.goalsFor !== b.goalsFor) {
                break;
            }
            j++;
        }

        const stillTied = h2hSorted.slice(i, j);

        if (stillTied.length === 1) {
            result.push(stillTied[0]);
        } else {
            // --- STEP 2: Overall stats for the sub-group still tied ---
            const step2Sorted = resolveByOverallStats(stillTied, overallMap);
            result.push(...step2Sorted);
        }

        i = j;
    }

    return result;
}

/**
 * Step 2 + Step 3: Sort teams by overall group stats, then FIFA ranking.
 * Overall GD → Overall GF → (team conduct skipped) → FIFA Ranking
 */
function resolveByOverallStats(
    teamIds: string[],
    overallMap: Record<string, StandingsRow>
): string[] {
    return [...teamIds].sort((a, b) => {
        const oa = overallMap[a];
        const ob = overallMap[b];

        // Step 2: Overall GD
        if (ob.goalDifference !== oa.goalDifference) return ob.goalDifference - oa.goalDifference;
        // Step 2: Overall GF
        if (ob.goalsFor !== oa.goalsFor) return ob.goalsFor - oa.goalsFor;

        // Step 3: FIFA Ranking (lower number = better)
        const teamA = getTeamById(a);
        const teamB = getTeamById(b);
        const rankA = teamA?.fifaRanking ?? 999;
        const rankB = teamB?.fifaRanking ?? 999;
        return rankA - rankB;
    });
}

/**
 * Calculates standings for a specific group based on predictions,
 * using the official FIFA World Cup 2026™ tiebreaker rules.
 */
export function calculateGroupStandings(teamIds: string[], groupMatches: Match[]): StandingsRow[] {
    // 1. Build overall standings
    const overallMap = buildStandingsMap(teamIds, groupMatches);

    // 2. Sort primarily by points
    const byPoints = [...teamIds].sort((a, b) => {
        return overallMap[b].points - overallMap[a].points;
    });

    // 3. Group teams by equal points
    const result: string[] = [];
    let i = 0;
    while (i < byPoints.length) {
        let j = i + 1;
        while (j < byPoints.length && overallMap[byPoints[j]].points === overallMap[byPoints[i]].points) {
            j++;
        }

        const tiedCluster = byPoints.slice(i, j);

        if (tiedCluster.length === 1) {
            result.push(tiedCluster[0]);
        } else {
            // Apply FIFA 3-step tiebreaker
            const resolved = resolveTiedGroup(tiedCluster, overallMap, groupMatches);
            result.push(...resolved);
        }

        i = j;
    }

    // 4. Return StandingsRow[] in the resolved order
    return result.map((teamId) => overallMap[teamId]);
}

export interface ThirdPlaceRow extends StandingsRow {
    groupId: string;
}

/**
 * Calculates and ranks the third-place teams across all groups.
 *
 * Official FIFA criteria for ranking 3rd-place teams:
 *   1. Points
 *   2. Goal difference in all group matches
 *   3. Goals scored in all group matches
 *   4. Team conduct score (skipped — not available in predictions)
 *   5. FIFA World Ranking
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

    // Sort the 12 third-place teams per FIFA rules
    thirds.sort((a, b) => {
        // 1. Points
        if (b.points !== a.points) return b.points - a.points;
        // 2. Goal difference
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        // 3. Goals scored
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        // 4. Team conduct — skipped
        // 5. FIFA Ranking (lower = better)
        const teamA = getTeamById(a.teamId);
        const teamB = getTeamById(b.teamId);
        const rankA = teamA?.fifaRanking ?? 999;
        const rankB = teamB?.fifaRanking ?? 999;
        return rankA - rankB;
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
