import { teams } from "../data/teams";

export function getTeamById(teamId: string) {
    return teams.find((team) => team.id === teamId);
}