import Papa from 'papaparse';

export interface Match {
    id: number;
    season: number;
    city: string;
    date: string;
    team1: string;
    team2: string;
    toss_winner: string;
    toss_decision: string;
    result: string;
    winner: string;
    venue: string;
    player_of_match: string;
}

export interface Delivery {
    match_id: number;
    innings: number; // Changed from inning to innings
    batting_team: string;
    bowling_team: string;
    over: number;
    ball: number;
    batter: string;
    bowler: string;
    non_striker: string;
    runs_batter: number; // Changed from batter_runs
    runs_extras: number; // Changed from extra_runs
    runs_total: number;  // Changed from total_runs
    wicket_kind: string; // Changed from wicket_label
    player_out: string;  // Added for completeness
}

export interface IPLData {
    matches: Match[];
    deliveries: Delivery[];
}

export async function fetchIPLCSV(url: string): Promise<any[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

    // Decompress only if GZIP
    let stream: ReadableStream | null = response.body;
    if (url.endsWith(".gz") && stream) {
        const ds = new DecompressionStream("gzip");
        stream = stream.pipeThrough(ds);
    }
    const blob = await new Response(stream).blob();
    const csvString = await blob.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvString, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err: any) => reject(err)
        });
    });
}

const IPL_CSV_URL = "/IPL.csv.gz";

export async function loadRealIPLData(overrideUrl?: string): Promise<IPLData> {
    console.log("Loading local IPL data (2008-2025)...");
    const data = await fetchIPLCSV(overrideUrl || IPL_CSV_URL);

    // The dataset is flat. We need to extract matches and keep deliveries.
    // Every row is a delivery. 
    return processIPLData(data);
}

export function processIPLData(data: any[]): IPLData {
    const matchesMap = new Map<number, Match>();
    const deliveries: Delivery[] = [];

    data.forEach((row: any) => {
        // Derive season from date if missing (fix for KeyError: season)
        let season = row.season;
        if (!season && row.date) {
            season = new Date(row.date).getFullYear();
        }

        // 1. Parse Match
        if (!matchesMap.has(row.match_id)) {
            matchesMap.set(row.match_id, {
                id: row.match_id,
                season: season,
                city: row.city,
                date: row.date,
                team1: row.batting_team,
                team2: row.bowling_team,
                toss_winner: row.toss_winner,
                toss_decision: row.toss_decision,
                result: row.result_type || row.result,
                winner: row.match_won_by || row.winner,
                venue: row.venue,
                player_of_match: row.player_of_match
            });
        }

        // 2. Parse Delivery
        deliveries.push({
            match_id: row.match_id,
            innings: row.inning || 1,
            batting_team: row.batting_team,
            bowling_team: row.bowling_team,
            over: row.over,
            ball: row.ball,
            batter: row.batter,
            bowler: row.bowler,
            non_striker: row.non_striker,
            runs_batter: row.batsman_runs,
            runs_extras: row.extra_runs,
            runs_total: row.total_runs,
            wicket_kind: row.is_wicket ? "out" : "",
            player_out: row.player_dismissed || ""
        });
    });

    const matches = Array.from(matchesMap.values());

    console.log(`Loaded ${matches.length} matches and ${deliveries.length} deliveries.`);

    return {
        matches: matches,
        deliveries: deliveries
    };
}
