import Papa from 'papaparse';

export interface IPLData {
    matches: any[];
    deliveries: any[];
}

export async function fetchIPLCSV(url: string): Promise<any[]> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

    // Decompress the GZIP stream on the fly
    const ds = new DecompressionStream("gzip");
    const decompressedStream = response.body?.pipeThrough(ds);
    const blob = await new Response(decompressedStream).blob();
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

const IPL_CSV_URL = "/IPL.csv";

export async function loadRealIPLData(): Promise<IPLData> {
    console.log("Loading local IPL data (2008-2025)...");
    const data = await fetchIPLCSV(IPL_CSV_URL);

    // The dataset is flat. We need to extract matches and keep deliveries.
    // Every row is a delivery. 
    // We group by match_id to get match metadata.

    const matchesMap = new Map();
    data.forEach(row => {
        if (!matchesMap.has(row.match_id)) {
            matchesMap.set(row.match_id, {
                id: row.match_id,
                season: row.season,
                city: row.city,
                date: row.date,
                team1: row.batting_team, // Approximation for metadata
                team2: row.bowling_team,
                toss_winner: row.toss_winner,
                toss_decision: row.toss_decision,
                result: row.result_type,
                winner: row.match_won_by,
                venue: row.venue,
                player_of_match: row.player_of_match
            });
        }
    });

    const matches = Array.from(matchesMap.values());
    const deliveries = data; // The raw data is the delivery list

    console.log(`Loaded ${matches.length} matches and ${deliveries.length} deliveries.`);

    return { matches, deliveries };
}
