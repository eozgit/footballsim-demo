import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Modern __dirname alternative ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const MD_PATH = path.join(__dirname, '../docs/teams.md');
const OUTPUT_DIR = path.join(__dirname, '../public/assets/teams/');
const MAX_TEAMS_TO_PROCESS = 2; // Control variable: set to Infinity for full production
// ---------------------

const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-');

/**
 * Calculates a penalty rating based on shooting and passing with a random offset
 */
function calculatePenalty(shooting, passing) {
  const s = parseInt(shooting) || 50;
  const p = parseInt(passing) || 50;
  // Weighted formula: Shooting is the primary driver for penalties
  const base = (s * 0.75) + (p * 0.25);
  // Add randomization (-5 to +5) to ensure variation among similar players
  const randomOffset = Math.floor(Math.random() * 11) - 5;
  return Math.max(10, Math.min(99, Math.round(base + randomOffset))).toString();
}

function parseMarkdown() {
  if (!fs.existsSync(MD_PATH)) {
    console.error(`File not found: ${MD_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(MD_PATH, 'utf-8');
  const lines = content.split('\n');

  let teams = [];
  let players = [];
  let parsingTeams = false;
  let parsingPlayers = false;

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.includes('### Table 1: Team Data')) {
      parsingTeams = true;
      parsingPlayers = false;
      return;
    }
    if (trimmed.includes('### Table 2: Players')) {
      parsingTeams = false;
      parsingPlayers = true;
      return;
    }

    if (trimmed.startsWith('|') || trimmed.startsWith('+|')) {
      const cells = trimmed.split('|')
        .map(c => c.replace('+', '').trim())
        .filter(c => c !== '');

      // Skip headers or empty rows
      if (cells.length === 0 || cells[0].includes('---') || cells[0].toLowerCase().includes('id')) return;

      if (parsingTeams && cells.length >= 8) {
        teams.push({
          teamID: cells[0],
          name: cells[1],
          rating: parseInt(cells[2]),
          primaryColour: cells[3],
          secondaryColour: cells[4],
          awayColour: cells[5],
          intent: cells[6],
          description: cells[7]
        });
      } else if (parsingPlayers && cells.length >= 15) {
        players.push({
          playerID: cells[0],
          teamID: cells[1],
          name: cells[2],
          position: cells[3],
          shirtNumber: parseInt(cells[4]),
          rating: cells[5],
          skill: {
            passing: cells[6],
            shooting: cells[7],
            tackling: cells[8],
            saving: cells[9],
            agility: cells[10],
            strength: cells[11],
            jumping: cells[12],
            penalty_taking: calculatePenalty(cells[7], cells[6])
          },
          currentPOS: [parseInt(cells[13]), parseInt(cells[14])]
        });
      }
    }
  });

  return { teams, players };
}

function run() {
  const { teams, players } = parseMarkdown();

  // Check for Name Collisions to ensure unique filenames
  const nameMap = new Map();
  teams.forEach(t => {
    if (!nameMap.has(t.name)) nameMap.set(t.name, []);
    nameMap.get(t.name).push(t.teamID);
  });

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const limit = Math.min(teams.length, MAX_TEAMS_TO_PROCESS);
  const generatedFiles = []; // Track filenames for list.json

  for (let i = 0; i < limit; i++) {
    const team = teams[i];

    const teamPlayers = players
      .filter(p => p.teamID === team.teamID)
      .map(p => ({
        ...p,
        fitness: 100,
        injured: false
      }));

    let baseName = slugify(team.name);

    if (nameMap.get(team.name).length > 1) {
      baseName += `-${slugify(team.description.substring(0, 25))}`;
    }

    const finalData = {
      name: team.name,
      description: team.description,
      primaryColour: team.primaryColour,
      secondaryColour: team.secondaryColour,
      awayColour: team.awayColour,
      rating: team.rating,
      teamID: team.teamID,
      intent: team.intent,
      players: teamPlayers
    };

    const finalPath = path.join(OUTPUT_DIR, `${baseName}.json`);
    fs.writeFileSync(finalPath, JSON.stringify(finalData, null, 2));

    // Add the filename (without extension) to our list
    generatedFiles.push(baseName);
  }

  // Generate the list.json file in the same directory
  const listPath = path.join(OUTPUT_DIR, 'list.json');
  fs.writeFileSync(listPath, JSON.stringify({ files: generatedFiles }, null, 2));

  console.log(`\x1b[32m✔ Success:\x1b[0m Generated ${limit} team files and list.json in ${OUTPUT_DIR}`);
}

run();
