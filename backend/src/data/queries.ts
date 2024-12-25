export const predictionQueries = [
    {
        query: "Will Arsenal lose the match against Crystal Palace?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will Crystal Palace lose the match against Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will both teams score in Crystal Palace vs Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will Arsenal keep a clean sheet against Crystal Palace?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will Crystal Palace keep a clean sheet against Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    // New over/under goal predictions
    {
        query: "Will the total goals be over 2.5 in Crystal Palace vs Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will the total goals be under 4.5 in Crystal Palace vs Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will the total goals be over 5.5 in Crystal Palace vs Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
    {
        query: "Will the total goals be under 6.5 in Crystal Palace vs Arsenal?",
        outcomes: ["Yes", "No"] as string[],
    },
] as const;
