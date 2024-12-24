import axios from "axios";

export interface MatchDetails {
    idEvent: string;
    strEvent: string;
    strHomeTeam: string;
    strAwayTeam: string;
    intHomeScore: string;
    intAwayScore: string;
    strTimestamp: string;
    strSeason: string;
    dateEvent: string;
}

interface SearchResult {
    event?: MatchDetails[];
}

class SportsDBService {
    private baseUrl = "https://www.thesportsdb.com/api/v1/json/3";

    async findMatch(
        homeTeam: string,
        awayTeam: string,
        betDeadline: number,
        resolutionDeadline: number
    ): Promise<MatchDetails | null> {
        // Search both team combinations
        const firstTry = await this.searchEventByTeams(homeTeam, awayTeam);
        const secondTry = await this.searchEventByTeams(awayTeam, homeTeam);

        // Validate first try
        const validFirstTry = firstTry
            ? this.validateMatch(firstTry, betDeadline, resolutionDeadline)
            : null;

        // Validate second try
        const validSecondTry = secondTry
            ? this.validateMatch(secondTry, betDeadline, resolutionDeadline)
            : null;

        // Return the first valid match
        return validFirstTry || validSecondTry;
    }

    private async searchEventByTeams(
        homeTeam: string,
        awayTeam: string
    ): Promise<MatchDetails | null> {
        try {
            const eventName = `${homeTeam}_vs_${awayTeam}`;
            const response = await axios.get<SearchResult>(
                `${this.baseUrl}/searchevents.php`,
                {
                    params: {
                        e: eventName,
                        s: this.getCurrentSeason(),
                    },
                }
            );

            return response.data.event?.[0] || null;
        } catch (error) {
            console.error("Error searching for event:", error);
            return null;
        }
    }

    private validateMatch(
        match: MatchDetails,
        betDeadline: number,
        resolutionDeadline: number
    ): MatchDetails | null {
        // Convert match timestamp to seconds
        const matchTimestamp = new Date(match.strTimestamp).getTime() / 1000;

        // Check if match timestamp is between deadlines
        if (
            matchTimestamp >= betDeadline &&
            matchTimestamp <= resolutionDeadline
        ) {
            return match;
        }

        return null;
    }

    private getCurrentSeason(): string {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth();

        // Football/soccer season typically spans two calendar years
        const seasonStartYear = month >= 7 ? currentYear : currentYear - 1;
        return `${seasonStartYear}-${seasonStartYear + 1}`;
    }

    async findTeamShortCode(teamName: string): Promise<string | null> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/searchteams.php`,
                {
                    params: { sname: teamName },
                }
            );

            return response.data.teams?.[0]?.strTeamShort || null;
        } catch (error) {
            console.error("Error finding team short code:", error);
            return null;
        }
    }
}

export default SportsDBService;
