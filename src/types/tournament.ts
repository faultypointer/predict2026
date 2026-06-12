export interface Team {
    id: string;
    groupId: string;
    code: string;
    name: string;
    flag: string;
    fifaRanking: number; // FIFA/Coca-Cola Men's World Ranking (April 2026) — used as final tiebreaker
}

export interface MatchPrediction {
    homeScore: number | null;
    awayScore: number | null;
    winnerId?: string | null; // For knockout extra-time/penalties or direct winner picking
    comment?: string;
}

export interface Match {
    id: string;
    stage: "groups" | "knockout";
    homeTeamId: string;
    awayTeamId: string;
    prediction: MatchPrediction;
}

export interface Group {
    id: string;
    teamIds: string[];
}

export interface StandingsRow {
    teamId: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
}

export interface KnockoutMatch {
    id: string; // e.g., "R32_1", "R16_3", "QF_2", etc.
    stage: "R32" | "R16" | "QF" | "SF" | "F" | "BF";
    label: string; // e.g. "Match 1", "Bronze Final", "Final"
    homeSource: {
        type: "group_winner" | "group_runner_up" | "best_third" | "knockout_winner" | "knockout_loser";
        id: string; // Group ID (e.g. "A") or Match ID (e.g. "R32_1" or "SF_1")
        placeholderCode: string; // e.g., "1E", "3AB", "Winner R32_1", "Loser SF_1"
    };
    awaySource: {
        type: "group_winner" | "group_runner_up" | "best_third" | "knockout_winner" | "knockout_loser";
        id: string;
        placeholderCode: string;
    };
    prediction: MatchPrediction;
}