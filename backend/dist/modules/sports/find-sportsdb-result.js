"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class SportsDBService {
    constructor() {
        this.baseUrl = "https://www.thesportsdb.com/api/v1/json/3";
    }
    async findMatch(homeTeam, awayTeam, betDeadline, resolutionDeadline) {
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
    async searchEventByTeams(homeTeam, awayTeam) {
        try {
            const eventName = `${homeTeam}_vs_${awayTeam}`;
            const response = await axios_1.default.get(`${this.baseUrl}/searchevents.php`, {
                params: {
                    e: eventName,
                    s: this.getCurrentSeason(),
                },
            });
            return response.data.event?.[0] || null;
        }
        catch (error) {
            console.error("Error searching for event:", error);
            return null;
        }
    }
    validateMatch(match, betDeadline, resolutionDeadline) {
        // Convert match timestamp to seconds
        const matchTimestamp = new Date(match.strTimestamp).getTime() / 1000;
        // Check if match timestamp is between deadlines
        if (matchTimestamp >= betDeadline &&
            matchTimestamp <= resolutionDeadline) {
            return match;
        }
        return null;
    }
    getCurrentSeason() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth();
        // Football/soccer season typically spans two calendar years
        const seasonStartYear = month >= 7 ? currentYear : currentYear - 1;
        return `${seasonStartYear}-${seasonStartYear + 1}`;
    }
    async findTeamShortCode(teamName) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/searchteams.php`, {
                params: { sname: teamName },
            });
            return response.data.teams?.[0]?.strTeamShort || null;
        }
        catch (error) {
            console.error("Error finding team short code:", error);
            return null;
        }
    }
}
exports.default = SportsDBService;
