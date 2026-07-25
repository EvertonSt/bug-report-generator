import fs from "fs";
import path from "path";
import stringSimilarity from "string-similarity";

const LOG_PATH = path.join(process.cwd(), "bug-log.json");
const SIMILARITY_THRESHOLD = 0.55;

export function loadBugLog() {
  if (!fs.existsSync(LOG_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(LOG_PATH, "utf-8"));
  } catch {
    return [];
  }
}

export function saveBugToLog(bug) {
  const log = loadBugLog();
  log.push({ title: bug.title, createdAt: bug.createdAt });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
}

export function checkDuplicate(title, log) {
  if (!log.length) return [];
  const titles = log.map((b) => b.title);
  const { ratings } = stringSimilarity.findBestMatch(title, titles);
  return ratings
    .filter((r) => r.rating >= SIMILARITY_THRESHOLD)
    .map((r) => ({ title: r.target, score: r.rating }))
    .sort((a, b) => b.score - a.score);
}
