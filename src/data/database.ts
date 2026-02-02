import { matches as mockMatches } from './mockData';
import { loadRealIPLData } from '../lib/dataLoader';

// Deliveries mock data generator with weighted player performance
export const generateDeliveries = () => {
    const deliveries: any[] = [];
    const starBatsmen = ["Virat Kohli", "MS Dhoni", "Rohit Sharma", "David Warner", "AB de Villiers", "Suresh Raina"];
    const bowlers = ["Jasprit Bumrah", "Rashid Khan", "Sunil Narine", "Lasith Malinga", "Yuzvendra Chahal", "Trent Boult"];

    mockMatches.forEach(match => {
        for (let innings = 1; innings <= 2; innings++) {
            const battingTeam = innings === 1 ? match.team1 : match.team2;
            const bowlingTeam = innings === 1 ? match.team2 : match.team1;

            // Generate a more structured set of players per match
            const lineup = starBatsmen.concat(Array.from({ length: 5 }, (_, i) => `Player ${i + 7}`));

            for (let over = 1; over <= 20; over++) {
                // Determine current batsman based on over (simplification)
                const currentBatsman = lineup[Math.floor(over / 4)];
                const currentBowler = bowlers[Math.floor(over / 5)];

                for (let ball = 1; ball <= 6; ball++) {
                    // Skill weighting: Stars hit more boundaries
                    const isStar = starBatsmen.includes(currentBatsman);
                    const runProb = isStar ? [0.3, 0.4, 0.1, 0.1, 0.05, 0, 0.05] : [0.5, 0.3, 0.1, 0.05, 0.02, 0, 0.03];

                    // Simple random run based on "skill"
                    let runs = 0;
                    const r = Math.random();
                    let cumulative = 0;
                    for (let i = 0; i < runProb.length; i++) {
                        cumulative += runProb[i];
                        if (r < cumulative) { runs = i; break; }
                    }

                    deliveries.push({
                        match_id: match.id,
                        innings,
                        batting_team: battingTeam,
                        bowling_team: bowlingTeam,
                        over,
                        ball,
                        batsman: currentBatsman,
                        bowler: currentBowler,
                        runs_overall: runs,
                        is_wicket: Math.random() < 0.04 ? 1 : 0,
                        dismissal_kind: Math.random() < 0.03 ? "caught" : null
                    });
                }
            }
        }
    });
    return deliveries;
};

export const iplDatabase = {
    matches: mockMatches,
    deliveries: generateDeliveries(),
    teams: [
        { id: 'CSK', name: 'Chennai Super Kings', captain: 'MS Dhoni', venue: 'Chepauk' },
        { id: 'MI', name: 'Mumbai Indians', captain: 'Hardik Pandya', venue: 'Wankhede' },
        { id: 'RCB', name: 'Royal Challengers Bengaluru', captain: 'Faf du Plessis', venue: 'Chinnaswamy' },
        { id: 'KKR', name: 'Kolkata Knight Riders', captain: 'Shreyas Iyer', venue: 'Eden Gardens' },
    ]
};

export async function switchToRealData() {
    try {
        const realData = await loadRealIPLData();
        iplDatabase.matches = realData.matches;
        iplDatabase.deliveries = realData.deliveries;
        console.log(`Database switched to real IPL records: ${realData.matches.length} matches, ${realData.deliveries.length} deliveries.`);
        return true;
    } catch (error) {
        console.error("Failed to load real data:", error);
        return false;
    }
}
