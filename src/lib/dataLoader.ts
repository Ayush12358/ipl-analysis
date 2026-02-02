import Papa from 'papaparse';

export interface IPLData {
    matches: any[];
    deliveries: any[];
}

export async function fetchIPLCSV(url: string): Promise<any[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

    // Decompress only if GZIP
    let stream = response.body;
    if (url.endsWith(".gz")) {
        const ds = new DecompressionStream("gzip");
        stream = stream?.pipeThrough(ds);
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
        // 1. Parse Match
        if (!matchesMap.has(row.match_id)) {
            matchesMap.set(row.match_id, {
                id: row.match_id,
                season: row.season,
                city: row.city,
                date: row.date,
                team1: row.batting_team, // In unified CSV, assuming first innings rep
                team2: row.bowling_team,
                tossWinner: row.toss_winner,
                tossDecision: row.toss_decision,
                result: row.result_type || row.result, // Handle variation
                winner: row.match_won_by || row.winner,
                venue: row.venue,
                playerOfMatch: row.player_of_match
            });
        }

        // 2. Parse Delivery
        deliveries.push({
            match_id: row.match_id,
            inning: row.inning || 1, // Default if missing
            batting_team: row.batting_team,
            bowling_team: row.bowling_team,
            over: row.over,
            ball: row.ball,
            batter: row.batter,
            bowler: row.bowler,
            non_striker: row.non_striker,
            batter_runs: row.batsman_runs,
            extra_runs: row.extra_runs,
            total_runs: row.total_runs,
            wicket_label: row.is_wicket ? "wicket" : "" // Simplified
        });
    });

    const matches = Array.from(matchesMap.values());

    console.log(`Loaded ${matches.length} matches and ${deliveries.length} deliveries.`);

    return {
        matches: matches,
        deliveries: deliveries
    };
}
