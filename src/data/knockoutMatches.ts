import type { KnockoutMatch } from "../types/tournament";

export const initialKnockoutMatches: KnockoutMatch[] = [
    // --- ROUND OF 32 - LEFT SIDE ---
    {
        id: "R32_1",
        stage: "R32",
        label: "Match 1",
        homeSource: { type: "group_winner", id: "E", placeholderCode: "1E" },
        awaySource: { type: "best_third", id: "3AB", placeholderCode: "3AB" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_2",
        stage: "R32",
        label: "Match 2",
        homeSource: { type: "group_winner", id: "I", placeholderCode: "1I" },
        awaySource: { type: "best_third", id: "3CD", placeholderCode: "3CD" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_3",
        stage: "R32",
        label: "Match 3",
        homeSource: { type: "group_runner_up", id: "A", placeholderCode: "2A" },
        awaySource: { type: "group_runner_up", id: "B", placeholderCode: "2B" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_4",
        stage: "R32",
        label: "Match 4",
        homeSource: { type: "group_winner", id: "F", placeholderCode: "1F" },
        awaySource: { type: "group_runner_up", id: "C", placeholderCode: "2C" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_5",
        stage: "R32",
        label: "Match 5",
        homeSource: { type: "group_runner_up", id: "K", placeholderCode: "2K" },
        awaySource: { type: "group_runner_up", id: "L", placeholderCode: "2L" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_6",
        stage: "R32",
        label: "Match 6",
        homeSource: { type: "group_winner", id: "H", placeholderCode: "1H" },
        awaySource: { type: "group_runner_up", id: "J", placeholderCode: "2J" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_7",
        stage: "R32",
        label: "Match 7",
        homeSource: { type: "group_winner", id: "D", placeholderCode: "1D" },
        awaySource: { type: "best_third", id: "3BE", placeholderCode: "3BE" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_8",
        stage: "R32",
        label: "Match 8",
        homeSource: { type: "group_winner", id: "G", placeholderCode: "1G" },
        awaySource: { type: "best_third", id: "3AE", placeholderCode: "3AE" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- ROUND OF 32 - RIGHT SIDE ---
    {
        id: "R32_9",
        stage: "R32",
        label: "Match 9",
        homeSource: { type: "group_winner", id: "C", placeholderCode: "1C" },
        awaySource: { type: "group_runner_up", id: "F", placeholderCode: "2F" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_10",
        stage: "R32",
        label: "Match 10",
        homeSource: { type: "group_runner_up", id: "E", placeholderCode: "2E" },
        awaySource: { type: "group_runner_up", id: "I", placeholderCode: "2I" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_11",
        stage: "R32",
        label: "Match 11",
        homeSource: { type: "group_winner", id: "A", placeholderCode: "1A" },
        awaySource: { type: "best_third", id: "3CE", placeholderCode: "3CE" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_12",
        stage: "R32",
        label: "Match 12",
        homeSource: { type: "group_winner", id: "L", placeholderCode: "1L" },
        awaySource: { type: "best_third", id: "3EH", placeholderCode: "3EH" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_13",
        stage: "R32",
        label: "Match 13",
        homeSource: { type: "group_winner", id: "J", placeholderCode: "1J" },
        awaySource: { type: "group_runner_up", id: "H", placeholderCode: "2H" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_14",
        stage: "R32",
        label: "Match 14",
        homeSource: { type: "group_runner_up", id: "D", placeholderCode: "2D" },
        awaySource: { type: "group_runner_up", id: "G", placeholderCode: "2G" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_15",
        stage: "R32",
        label: "Match 15",
        homeSource: { type: "group_winner", id: "B", placeholderCode: "1B" },
        awaySource: { type: "best_third", id: "3EF", placeholderCode: "3EF" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R32_16",
        stage: "R32",
        label: "Match 16",
        homeSource: { type: "group_winner", id: "K", placeholderCode: "1K" },
        awaySource: { type: "best_third", id: "3DE", placeholderCode: "3DE" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- ROUND OF 16 ---
    {
        id: "R16_1",
        stage: "R16",
        label: "Match 17",
        homeSource: { type: "knockout_winner", id: "R32_1", placeholderCode: "Winner Match 1" },
        awaySource: { type: "knockout_winner", id: "R32_2", placeholderCode: "Winner Match 2" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_2",
        stage: "R16",
        label: "Match 18",
        homeSource: { type: "knockout_winner", id: "R32_3", placeholderCode: "Winner Match 3" },
        awaySource: { type: "knockout_winner", id: "R32_4", placeholderCode: "Winner Match 4" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_3",
        stage: "R16",
        label: "Match 19",
        homeSource: { type: "knockout_winner", id: "R32_5", placeholderCode: "Winner Match 5" },
        awaySource: { type: "knockout_winner", id: "R32_6", placeholderCode: "Winner Match 6" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_4",
        stage: "R16",
        label: "Match 20",
        homeSource: { type: "knockout_winner", id: "R32_7", placeholderCode: "Winner Match 7" },
        awaySource: { type: "knockout_winner", id: "R32_8", placeholderCode: "Winner Match 8" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_5",
        stage: "R16",
        label: "Match 21",
        homeSource: { type: "knockout_winner", id: "R32_9", placeholderCode: "Winner Match 9" },
        awaySource: { type: "knockout_winner", id: "R32_10", placeholderCode: "Winner Match 10" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_6",
        stage: "R16",
        label: "Match 22",
        homeSource: { type: "knockout_winner", id: "R32_11", placeholderCode: "Winner Match 11" },
        awaySource: { type: "knockout_winner", id: "R32_12", placeholderCode: "Winner Match 12" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_7",
        stage: "R16",
        label: "Match 23",
        homeSource: { type: "knockout_winner", id: "R32_13", placeholderCode: "Winner Match 13" },
        awaySource: { type: "knockout_winner", id: "R32_14", placeholderCode: "Winner Match 14" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "R16_8",
        stage: "R16",
        label: "Match 24",
        homeSource: { type: "knockout_winner", id: "R32_15", placeholderCode: "Winner Match 15" },
        awaySource: { type: "knockout_winner", id: "R32_16", placeholderCode: "Winner Match 16" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- QUARTERFINALS ---
    {
        id: "QF_1",
        stage: "QF",
        label: "Match 25",
        homeSource: { type: "knockout_winner", id: "R16_1", placeholderCode: "Winner Match 17" },
        awaySource: { type: "knockout_winner", id: "R16_2", placeholderCode: "Winner Match 18" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "QF_2",
        stage: "QF",
        label: "Match 26",
        homeSource: { type: "knockout_winner", id: "R16_5", placeholderCode: "Winner Match 21" },
        awaySource: { type: "knockout_winner", id: "R16_6", placeholderCode: "Winner Match 22" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "QF_3",
        stage: "QF",
        label: "Match 27",
        homeSource: { type: "knockout_winner", id: "R16_3", placeholderCode: "Winner Match 19" },
        awaySource: { type: "knockout_winner", id: "R16_4", placeholderCode: "Winner Match 20" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "QF_4",
        stage: "QF",
        label: "Match 28",
        homeSource: { type: "knockout_winner", id: "R16_7", placeholderCode: "Winner Match 23" },
        awaySource: { type: "knockout_winner", id: "R16_8", placeholderCode: "Winner Match 24" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- SEMIFINALS ---
    {
        id: "SF_1",
        stage: "SF",
        label: "Match 29",
        homeSource: { type: "knockout_winner", id: "QF_1", placeholderCode: "Winner Match 25" },
        awaySource: { type: "knockout_winner", id: "QF_2", placeholderCode: "Winner Match 26" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },
    {
        id: "SF_2",
        stage: "SF",
        label: "Match 30",
        homeSource: { type: "knockout_winner", id: "QF_3", placeholderCode: "Winner Match 27" },
        awaySource: { type: "knockout_winner", id: "QF_4", placeholderCode: "Winner Match 28" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- BRONZE FINAL ---
    {
        id: "BF",
        stage: "BF",
        label: "Bronze Final",
        homeSource: { type: "knockout_loser", id: "SF_1", placeholderCode: "Loser Match 29" },
        awaySource: { type: "knockout_loser", id: "SF_2", placeholderCode: "Loser Match 30" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    },

    // --- FINAL ---
    {
        id: "F",
        stage: "F",
        label: "Final",
        homeSource: { type: "knockout_winner", id: "SF_1", placeholderCode: "Winner Match 29" },
        awaySource: { type: "knockout_winner", id: "SF_2", placeholderCode: "Winner Match 30" },
        prediction: { homeScore: null, awayScore: null, winnerId: null }
    }
];
