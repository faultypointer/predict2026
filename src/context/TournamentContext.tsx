/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Match, KnockoutMatch, StandingsRow, Team } from "../types/tournament";
import { matches as initialGroupMatches } from "../data/matches";
import { initialKnockoutMatches } from "../data/knockoutMatches";
import { groups } from "../data/groups";
import { teams } from "../data/teams";
import { calculateGroupStandings, assignThirdPlaces } from "../utils/standings";
import type { ThirdPlaceRow } from "../utils/standings";
import { assignTeamToSource } from "../utils/propagation";

interface TournamentContextType {
    groupMatches: Match[];
    knockoutMatches: KnockoutMatch[];
    groupStandings: Record<string, StandingsRow[]>;
    thirdPlaceStandings: ThirdPlaceRow[];
    thirdPlaceAssignments: Record<string, string>;
    customGroupOrders: Record<string, string[]>;
    
    // Action methods
    updateGroupMatchPrediction: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
    updateKnockoutMatchPrediction: (matchId: string, homeScore: number | null, awayScore: number | null, winnerId?: string | null) => void;
    resetGroupPredictions: (groupId: string) => void;
    resetAllPredictions: () => void;
    updateCustomGroupOrder: (groupId: string, newOrder: string[]) => void;
    assignTeamToKnockoutSlot: (matchId: string, side: "home" | "away", teamId: string) => void;
    
    // Resolving helper
    resolveKnockoutTeam: (match: KnockoutMatch, side: "home" | "away") => Team | null;
    getKnockoutWinner: (match: KnockoutMatch) => string | null;
    getKnockoutLoser: (match: KnockoutMatch) => string | null;

    // Profile management
    profiles: string[];
    currentProfile: string;
    createProfile: (name: string) => void;
    switchProfile: (name: string) => void;
    deleteProfile: (name: string) => void;
    renameProfile: (oldName: string, newName: string) => void;
    updateMatchComment: (matchId: string, stage: "groups" | "knockout", comment: string) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Profile state
    const [profiles, setProfiles] = useState<string[]>(() => {
        const saved = localStorage.getItem("wc2026_profiles");
        return saved ? JSON.parse(saved) : ["Guest"];
    });

    const [currentProfile, setCurrentProfile] = useState<string>(() => {
        const saved = localStorage.getItem("wc2026_current_profile");
        return saved || "Guest";
    });

    const getProfileGroupKey = (profile: string) => `wc2026_${profile}_group_predictions`;
    const getProfileKnockoutKey = (profile: string) => `wc2026_${profile}_knockout_predictions`;
    const getProfileCustomOrdersKey = (profile: string) => `wc2026_${profile}_custom_group_orders`;

    // 2. Core State
    const [groupMatches, setGroupMatches] = useState<Match[]>(() => {
        const active = localStorage.getItem("wc2026_current_profile") || "Guest";
        const saved = localStorage.getItem(`wc2026_${active}_group_predictions`);
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
        const active = localStorage.getItem("wc2026_current_profile") || "Guest";
        const saved = localStorage.getItem(`wc2026_${active}_knockout_predictions`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing knockout predictions from localStorage", e);
            }
        }
        return initialKnockoutMatches;
    });

    const [customGroupOrders, setCustomGroupOrders] = useState<Record<string, string[]>>(() => {
        const active = localStorage.getItem("wc2026_current_profile") || "Guest";
        const saved = localStorage.getItem(`wc2026_${active}_custom_group_orders`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing custom group orders from localStorage", e);
            }
        }
        return {};
    });

    // Save profiles list to localStorage
    useEffect(() => {
        localStorage.setItem("wc2026_profiles", JSON.stringify(profiles));
    }, [profiles]);

    // Save active profile to localStorage
    useEffect(() => {
        localStorage.setItem("wc2026_current_profile", currentProfile);
    }, [currentProfile]);

    // Save predictions when they change (scoped by active profile)
    useEffect(() => {
        if (groupMatches.length > 0) {
            localStorage.setItem(getProfileGroupKey(currentProfile), JSON.stringify(groupMatches));
        }
    }, [groupMatches, currentProfile]);

    useEffect(() => {
        if (knockoutMatches.length > 0) {
            localStorage.setItem(getProfileKnockoutKey(currentProfile), JSON.stringify(knockoutMatches));
        }
    }, [knockoutMatches, currentProfile]);

    useEffect(() => {
        localStorage.setItem(getProfileCustomOrdersKey(currentProfile), JSON.stringify(customGroupOrders));
    }, [customGroupOrders, currentProfile]);

    // 3. Derived Group Standings
    const groupStandings = useMemo(() => {
        const standings: Record<string, StandingsRow[]> = {};
        for (const group of groups) {
            const customOrder = customGroupOrders[group.id];
            if (customOrder) {
                // Construct standings rows in the custom order
                standings[group.id] = customOrder.map((teamId, index) => {
                    const ranks = [
                        { played: 3, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 3, goalDifference: 3, points: 9 },
                        { played: 3, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 3, goalDifference: 1, points: 6 },
                        { played: 3, won: 1, drawn: 0, lost: 2, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 3 },
                        { played: 3, won: 0, drawn: 0, lost: 3, goalsFor: 3, goalsAgainst: 6, goalDifference: -3, points: 0 },
                    ];
                    return {
                        teamId,
                        ...ranks[index],
                    };
                });
            } else {
                const groupMatchesList = groupMatches.filter((m) => {
                    const team = teams.find((t) => t.id === m.homeTeamId);
                    return team?.groupId === group.id;
                });
                standings[group.id] = calculateGroupStandings(group.teamIds, groupMatchesList);
            }
        }
        return standings;
    }, [groupMatches, customGroupOrders]);

    // 4. Derived Third-place standings
    const thirdPlaceStandings = useMemo(() => {
        const thirds: ThirdPlaceRow[] = [];
        for (const group of groups) {
            const standings = groupStandings[group.id];
            if (standings && standings[2]) {
                thirds.push({
                    ...standings[2],
                    groupId: group.id,
                });
            }
        }
        
        // Sort the 12 third-place teams per official FIFA rules:
        // 1. Points, 2. GD, 3. GF, 4. Team conduct (skipped), 5. FIFA Ranking
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
            // FIFA Ranking (lower number = better)
            const teamA = teams.find((t) => t.id === a.teamId);
            const teamB = teams.find((t) => t.id === b.teamId);
            const rankA = teamA?.fifaRanking ?? 999;
            const rankB = teamB?.fifaRanking ?? 999;
            return rankA - rankB;
        });
        
        return thirds;
    }, [groupStandings]);

    // Top 8 qualifying third-place teams
    const qualifiedThirds = useMemo(() => {
        return thirdPlaceStandings.slice(0, 8).map((t) => ({
            groupId: t.groupId,
            teamId: t.teamId,
        }));
    }, [thirdPlaceStandings]);

    // 5. Derived Third-place Assignments
    const thirdPlaceAssignments = useMemo(() => {
        return assignThirdPlaces(qualifiedThirds);
    }, [qualifiedThirds]);

    // Helper functions inside the context to resolve knockout match winners and losers
    const getKnockoutWinner = (match: KnockoutMatch): string | null => {
        const { homeScore, awayScore, winnerId } = match.prediction;
        const homeId = resolveKnockoutTeam(match, "home")?.id;
        const awayId = resolveKnockoutTeam(match, "away")?.id;

        // Verify that the prediction's winnerId is still valid for the currently resolved teams
        let validWinnerId = winnerId;
        if (winnerId && winnerId !== homeId && winnerId !== awayId) {
            validWinnerId = null;
        }

        if (validWinnerId) return validWinnerId;
        if (homeScore !== null && awayScore !== null) {
            if (homeScore > awayScore) return homeId || null;
            if (awayScore > homeScore) return awayId || null;
            return validWinnerId || null;
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

    // 6. Actions
    const switchProfile = (profileName: string) => {
        if (profiles.includes(profileName)) {
            setCurrentProfile(profileName);
            // Load state synchronously to prevent async setItem overwrite
            const savedGroups = localStorage.getItem(getProfileGroupKey(profileName));
            setGroupMatches(savedGroups ? JSON.parse(savedGroups) : initialGroupMatches);

            const savedKnockouts = localStorage.getItem(getProfileKnockoutKey(profileName));
            setKnockoutMatches(savedKnockouts ? JSON.parse(savedKnockouts) : initialKnockoutMatches);

            const savedCustomOrders = localStorage.getItem(getProfileCustomOrdersKey(profileName));
            setCustomGroupOrders(savedCustomOrders ? JSON.parse(savedCustomOrders) : {});
        }
    };

    const createProfile = (profileName: string) => {
        const trimmed = profileName.trim();
        if (!trimmed) return;
        if (profiles.includes(trimmed)) return;

        setProfiles((prev) => [...prev, trimmed]);
        setCurrentProfile(trimmed);

        // Copy current predictions to the new profile as a starting point
        localStorage.setItem(getProfileGroupKey(trimmed), JSON.stringify(groupMatches));
        localStorage.setItem(getProfileKnockoutKey(trimmed), JSON.stringify(knockoutMatches));
        localStorage.setItem(getProfileCustomOrdersKey(trimmed), JSON.stringify(customGroupOrders));
    };

    const deleteProfile = (profileName: string) => {
        if (profiles.length <= 1) return; // Cannot delete the last profile
        
        const updatedProfiles = profiles.filter((p) => p !== profileName);
        setProfiles(updatedProfiles);

        localStorage.removeItem(getProfileGroupKey(profileName));
        localStorage.removeItem(getProfileKnockoutKey(profileName));
        localStorage.removeItem(getProfileCustomOrdersKey(profileName));

        if (currentProfile === profileName) {
            const fallback = updatedProfiles[0];
            setCurrentProfile(fallback);
            // Synchronously load fallback profile data
            const savedGroups = localStorage.getItem(getProfileGroupKey(fallback));
            setGroupMatches(savedGroups ? JSON.parse(savedGroups) : initialGroupMatches);

            const savedKnockouts = localStorage.getItem(getProfileKnockoutKey(fallback));
            setKnockoutMatches(savedKnockouts ? JSON.parse(savedKnockouts) : initialKnockoutMatches);

            const savedCustomOrders = localStorage.getItem(getProfileCustomOrdersKey(fallback));
            setCustomGroupOrders(savedCustomOrders ? JSON.parse(savedCustomOrders) : {});
        }
    };

    const renameProfile = (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        if (profiles.includes(trimmed)) return;

        setProfiles((prev) => prev.map((p) => (p === oldName ? trimmed : p)));
        if (currentProfile === oldName) {
            setCurrentProfile(trimmed);
        }

        // Copy keys to new name
        const groupData = localStorage.getItem(getProfileGroupKey(oldName));
        if (groupData) localStorage.setItem(getProfileGroupKey(trimmed), groupData);
        localStorage.removeItem(getProfileGroupKey(oldName));

        const koData = localStorage.getItem(getProfileKnockoutKey(oldName));
        if (koData) localStorage.setItem(getProfileKnockoutKey(trimmed), koData);
        localStorage.removeItem(getProfileKnockoutKey(oldName));

        const orderData = localStorage.getItem(getProfileCustomOrdersKey(oldName));
        if (orderData) localStorage.setItem(getProfileCustomOrdersKey(trimmed), orderData);
        localStorage.removeItem(getProfileCustomOrdersKey(oldName));
    };

    const updateGroupMatchPrediction = (matchId: string, homeScore: number | null, awayScore: number | null) => {
        setGroupMatches((prev) =>
            prev.map((m) =>
                m.id === matchId
                    ? {
                          ...m,
                          prediction: {
                              ...m.prediction,
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
                if (homeScore !== null && awayScore !== null) {
                    if (homeScore > awayScore) {
                        calculatedWinnerId = null;
                    } else if (awayScore > homeScore) {
                        calculatedWinnerId = null;
                    } else {
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
                        ...m.prediction,
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
                    ? { ...m, prediction: { ...m.prediction, homeScore: null, awayScore: null } }
                    : m
            )
        );

        setCustomGroupOrders((prev) => {
            const next = { ...prev };
            delete next[groupId];
            return next;
        });
    };

    const resetAllPredictions = () => {
        setGroupMatches(initialGroupMatches);
        setKnockoutMatches(initialKnockoutMatches);
        setCustomGroupOrders({});
    };

    const updateCustomGroupOrder = (groupId: string, newOrder: string[]) => {
        setCustomGroupOrders((prev) => ({
            ...prev,
            [groupId]: newOrder,
        }));
    };

    const assignTeamToKnockoutSlot = (matchId: string, side: "home" | "away", teamId: string) => {
        setKnockoutMatches((prevMatches) => {
            const targetMatch = prevMatches.find((m) => m.id === matchId);
            if (!targetMatch) return prevMatches;

            const source = side === "home" ? targetMatch.homeSource : targetMatch.awaySource;
            const updatedCustomOrders = { ...customGroupOrders };
            
            const nextMatches = assignTeamToSource(
                source,
                teamId,
                prevMatches,
                updatedCustomOrders
            );

            setCustomGroupOrders(updatedCustomOrders);
            return nextMatches;
        });
    };

    const updateMatchComment = (matchId: string, stage: "groups" | "knockout", comment: string) => {
        if (stage === "groups") {
            setGroupMatches((prev) =>
                prev.map((m) =>
                    m.id === matchId
                        ? {
                              ...m,
                              prediction: {
                                  ...m.prediction,
                                  comment: comment || undefined,
                              },
                          }
                        : m
                )
            );
        } else {
            setKnockoutMatches((prev) =>
                prev.map((m) =>
                    m.id === matchId
                        ? {
                              ...m,
                              prediction: {
                                  ...m.prediction,
                                  comment: comment || undefined,
                              },
                          }
                        : m
                )
            );
        }
    };

    return (
        <TournamentContext.Provider
            value={{
                groupMatches,
                knockoutMatches,
                groupStandings,
                thirdPlaceStandings,
                thirdPlaceAssignments,
                customGroupOrders,
                updateGroupMatchPrediction,
                updateKnockoutMatchPrediction,
                resetGroupPredictions,
                resetAllPredictions,
                updateCustomGroupOrder,
                assignTeamToKnockoutSlot,
                resolveKnockoutTeam,
                getKnockoutWinner,
                getKnockoutLoser,
                profiles,
                currentProfile,
                createProfile,
                switchProfile,
                deleteProfile,
                renameProfile,
                updateMatchComment,
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
