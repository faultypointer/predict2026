import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Match, KnockoutMatch, StandingsRow, Team } from "../types/tournament";
import { matches as initialGroupMatches } from "../data/matches";
import { initialKnockoutMatches } from "../data/knockoutMatches";
import { groups } from "../data/groups";
import { teams } from "../data/teams";
import { calculateGroupStandings, calculateThirdPlaceStandings, assignThirdPlaces } from "../utils/standings";
import type { ThirdPlaceRow } from "../utils/standings";

interface TournamentContextType {
    groupMatches: Match[];
    knockoutMatches: KnockoutMatch[];
    groupStandings: Record<string, StandingsRow[]>;
    thirdPlaceStandings: ThirdPlaceRow[];
    thirdPlaceAssignments: Record<string, string>;
    
    // Action methods
    updateGroupMatchPrediction: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
    updateKnockoutMatchPrediction: (matchId: string, homeScore: number | null, awayScore: number | null, winnerId?: string | null) => void;
    resetGroupPredictions: (groupId: string) => void;
    resetAllPredictions: () => void;
    
    // Resolving helper
    resolveKnockoutTeam: (match: KnockoutMatch, side: "home" | "away") => Team | null;
    getKnockoutWinner: (match: KnockoutMatch) => string | null; // returns teamId of winner
    getKnockoutLoser: (match: KnockoutMatch) => string | null;  // returns teamId of loser
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const LOCAL_STORAGE_GROUP_KEY = "wc2026_group_predictions";
const LOCAL_STORAGE_KNOCKOUT_KEY = "wc2026_knockout_predictions";

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Core State
    const [groupMatches, setGroupMatches] = useState<Match[]>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_GROUP_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing group predictions from localStorage", e);
            }
        }
        return initialGroupMatches;
    });

    const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KNOCKOUT_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing knockout predictions from localStorage", e);
            }
        }
        return initialKnockoutMatches;
    });

    // Save to localStorage when state changes
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_GROUP_KEY, JSON.stringify(groupMatches));
    }, [groupMatches]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KNOCKOUT_KEY, JSON.stringify(knockoutMatches));
    }, [knockoutMatches]);

    // 2. Derived Group Standings
    const groupStandings = useMemo(() => {
        const standings: Record<string, StandingsRow[]> = {};
        for (const group of groups) {
            const groupMatchesList = groupMatches.filter((m) => {
                return group.teamIds.includes(m.homeTeamId);
            });
            standings[group.id] = calculateGroupStandings(group.teamIds, groupMatchesList);
        }
        return standings;
    }, [groupMatches]);

    // 3. Derived Third-place standings
    const thirdPlaceStandings = useMemo(() => {
        return calculateThirdPlaceStandings(groups, groupMatches);
    }, [groupMatches]);

    // Top 8 qualifying third-place teams
    const qualifiedThirds = useMemo(() => {
        return thirdPlaceStandings.slice(0, 8).map((t) => ({
            groupId: t.groupId,
            teamId: t.teamId,
        }));
    }, [thirdPlaceStandings]);

    // 4. Derived Third-place Assignments
    const thirdPlaceAssignments = useMemo(() => {
        return assignThirdPlaces(qualifiedThirds);
    }, [qualifiedThirds]);

    // Helper functions inside the context to resolve knockout match winners and losers
    const getKnockoutWinner = (match: KnockoutMatch): string | null => {
        const { homeScore, awayScore, winnerId } = match.prediction;
        if (winnerId) return winnerId;
        if (homeScore !== null && awayScore !== null) {
            const homeId = resolveKnockoutTeam(match, "home")?.id;
            const awayId = resolveKnockoutTeam(match, "away")?.id;
            if (homeScore > awayScore) return homeId || null;
            if (awayScore > homeScore) return awayId || null;
            return winnerId || null;
        }
        return null;
    };

    const getKnockoutLoser = (match: KnockoutMatch): string | null => {
        const homeId = resolveKnockoutTeam(match, "home")?.id;
        const awayId = resolveKnockoutTeam(match, "away")?.id;
        if (!homeId || !awayId) return null;

        const winner = getKnockoutWinner(match);
        if (!winner) return null;

        return winner === homeId ? awayId : homeId;
    };

    // Recursive team resolver
    const resolveSource = (source: KnockoutMatch["homeSource"]): string | null => {
        if (source.type === "group_winner") {
            const standings = groupStandings[source.id];
            return standings?.[0]?.teamId || null;
        }
        if (source.type === "group_runner_up") {
            const standings = groupStandings[source.id];
            return standings?.[1]?.teamId || null;
        }
        if (source.type === "best_third") {
            return thirdPlaceAssignments[source.id] || null;
        }
        if (source.type === "knockout_winner") {
            const parentMatch = knockoutMatches.find((m) => m.id === source.id);
            return parentMatch ? getKnockoutWinner(parentMatch) : null;
        }
        if (source.type === "knockout_loser") {
            const parentMatch = knockoutMatches.find((m) => m.id === source.id);
            return parentMatch ? getKnockoutLoser(parentMatch) : null;
        }
        return null;
    };

    // Resolves a KnockoutMatch slot to an actual Team object
    const resolveKnockoutTeam = (match: KnockoutMatch, side: "home" | "away"): Team | null => {
        const source = side === "home" ? match.homeSource : match.awaySource;
        const teamId = resolveSource(source);
        if (!teamId) return null;
        return teams.find((t) => t.id === teamId) || null;
    };

    // Stale correction: if the resolved participating teams change, reset winnerId if it's no longer one of them
    useEffect(() => {
        let changed = false;
        const updatedKnockouts = knockoutMatches.map((m) => {
            const homeTeam = resolveKnockoutTeam(m, "home");
            const awayTeam = resolveKnockoutTeam(m, "away");
            const winnerId = m.prediction.winnerId;

            // If winnerId is set but doesn't match either of the currently resolved teams, clear it
            if (winnerId && winnerId !== homeTeam?.id && winnerId !== awayTeam?.id) {
                changed = true;
                return {
                    ...m,
                    prediction: {
                        ...m.prediction,
                        winnerId: null
                    }
                };
            }
            return m;
        });

        if (changed) {
            setKnockoutMatches(updatedKnockouts);
        }
    }, [groupStandings, thirdPlaceAssignments, knockoutMatches]);

    // 5. Actions
    const updateGroupMatchPrediction = (matchId: string, homeScore: number | null, awayScore: number | null) => {
        setGroupMatches((prev) =>
            prev.map((m) =>
                m.id === matchId
                    ? {
                          ...m,
                          prediction: {
                              homeScore,
                              awayScore,
                          },
                      }
                    : m
            )
        );
    };

    const updateKnockoutMatchPrediction = (
        matchId: string,
        homeScore: number | null,
        awayScore: number | null,
        winnerId: string | null = null
    ) => {
        setKnockoutMatches((prev) =>
            prev.map((m) => {
                if (m.id !== matchId) return m;

                let calculatedWinnerId = winnerId;
                // If scores are entered and not tied, automatically decide winner
                if (homeScore !== null && awayScore !== null) {
                    if (homeScore > awayScore) {
                        calculatedWinnerId = null; // Derived from home win
                    } else if (awayScore > homeScore) {
                        calculatedWinnerId = null; // Derived from away win
                    } else {
                        // Tie: preserve winnerId if it matches home/away, else reset or use provided
                        const homeTeamId = resolveKnockoutTeam(m, "home")?.id;
                        const awayTeamId = resolveKnockoutTeam(m, "away")?.id;
                        if (winnerId !== homeTeamId && winnerId !== awayTeamId) {
                            calculatedWinnerId = null;
                        }
                    }
                }

                return {
                    ...m,
                    prediction: {
                        homeScore,
                        awayScore,
                        winnerId: calculatedWinnerId,
                    },
                };
            })
        );
    };

    const resetGroupPredictions = (groupId: string) => {
        const groupTeamIds = teams.filter((t) => t.groupId === groupId).map((t) => t.id);

        setGroupMatches((prev) =>
            prev.map((m) =>
                groupTeamIds.includes(m.homeTeamId)
                    ? { ...m, prediction: { homeScore: null, awayScore: null } }
                    : m
            )
        );
    };

    const resetAllPredictions = () => {
        setGroupMatches(initialGroupMatches);
        setKnockoutMatches(initialKnockoutMatches);
    };

    return (
        <TournamentContext.Provider
            value={{
                groupMatches,
                knockoutMatches,
                groupStandings,
                thirdPlaceStandings,
                thirdPlaceAssignments,
                updateGroupMatchPrediction,
                updateKnockoutMatchPrediction,
                resetGroupPredictions,
                resetAllPredictions,
                resolveKnockoutTeam,
                getKnockoutWinner,
                getKnockoutLoser,
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
};

export const useTournament = () => {
    const context = useContext(TournamentContext);
    if (context === undefined) {
        throw new Error("useTournament must be used within a TournamentProvider");
    }
    return context;
};
