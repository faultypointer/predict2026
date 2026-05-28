export interface Team {
    id: string;
    groupId: string;
    code: string;
    name: string;
    flag: string;
}

export interface MatchPrediction {
    homeScore: number | null;
    awayScore: number | null;
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