import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://raw.githubusercontent.com/Samkarya/online-exam-questions/main/';
const BASE_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrex-academy\\frontend\\backend\\data\\test_series';

// JEE Main papers from the config (jee.json has exactly these 4)
const JEE_MAIN_PAPERS = [
  {
    id: 'jeeMain_2026_02April_shift2',
    category: 'JEE Main',
    year: 2026,
    session: 'April',
    date: '2026-04-02',
    shift: 2,
    paperType: 'Paper 1 (PCM)',
    title: 'JEE Main 2026 (April 2nd, Shift 2)',
    path: 'India/undergraduate/JEEMains/jeeMain_2026_02April_shift2.json',
    isOfficial: true
  },
  {
    id: 'jeeMain_2026_02April_shift1',
    category: 'JEE Main',
    year: 2026,
    session: 'April',
    date: '2026-04-02',
    shift: 1,
    paperType: 'Paper 1 (PCM)',
    title: 'JEE Main 2026 (April 2nd, Shift 1)',
    path: 'India/undergraduate/JEEMains/jeeMain_2026_02April_shift1.json',
    isOfficial: true
  },
  {
    id: 'jeeMain_2025_22Jan_shift1',
    category: 'JEE Main',
    year: 2025,
    session: 'January',
    date: '2025-01-22',
    shift: 1,
    paperType: 'Paper 1 (PCM)',
    title: 'JEE Main 2025 (Jan 22nd, Shift 1)',
    path: 'India/undergraduate/JEEMains/jeeMain_2025_22Jan_shift1.json',
    isOfficial: true
  },
  {
    id: 'jeeMain_2025_22Jan_shift2',
    category: 'JEE Main',
    year: 2025,
    session: 'January',
    date: '2025-01-22',
    shift: 2,
    paperType: 'Paper 1 (PCM)',
    title: 'JEE Main 2025 (Jan 22nd, Shift 2)',
    path: 'India/undergraduate/JEEMains/jeeMain_2025_22Jan_shift2.json',
    isOfficial: true
  }
];

// Create directories
mkdirSync(join(BASE_DIR, 'jee_mains'), { recursive: true });
mkdirSync(join(BASE_DIR, 'jee_advanced'), { recursive: true });

const manifest = [];

async function downloadPaper(paper) {
  const url = BASE_URL + paper.path;
  console.log(`Downloading: ${paper.id}`);
  console.log(`  URL: ${url}`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    
    const fileName = `${paper.id}.json`;
    const filePath = join(BASE_DIR, 'jee_mains', fileName);
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    const manifestEntry = {
      id: paper.id,
      title: paper.title,
      exam: paper.category,
      year: paper.year,
      session: paper.session,
      shift: paper.shift,
      date: paper.date,
      paperType: paper.paperType,
      isOfficial: paper.isOfficial,
      questionCount: Array.isArray(data) ? data.length : (data.questions ? data.questions.length : 'unknown'),
      filePath: `jee_mains/${fileName}`
    };
    
    manifest.push(manifestEntry);
    console.log(`  ✓ Saved ${fileName} (${Array.isArray(data) ? data.length : '?'} questions)`);
    return true;
  } catch (err) {
    console.error(`  ✗ Failed to download ${paper.id}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== JEE Paper Downloader ===\n');
  console.log(`Downloading ${JEE_MAIN_PAPERS.length} JEE Main papers...\n`);
  
  let successCount = 0;
  
  for (const paper of JEE_MAIN_PAPERS) {
    const success = await downloadPaper(paper);
    if (success) successCount++;
  }
  
  // Note: No JEE Advanced papers found in this repo
  // The repo only has India/undergraduate/JEEMains/ directory
  console.log('\nNote: No JEE Advanced papers found in this repository.');
  console.log('The repo only contains JEE Main papers under India/undergraduate/JEEMains/\n');
  
  // Save manifest
  const manifestData = {
    lastUpdated: new Date().toISOString(),
    totalPapers: successCount,
    jeeMains: manifest.filter(m => m.exam === 'JEE Main').length,
    jeeAdvanced: 0,
    papers: manifest
  };
  
  const manifestPath = join(BASE_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
  
  console.log('=== Summary ===');
  console.log(`Total papers downloaded: ${successCount} / ${JEE_MAIN_PAPERS.length}`);
  console.log(`JEE Main papers: ${manifest.filter(m => m.exam === 'JEE Main').length}`);
  console.log(`JEE Advanced papers: 0 (not available in this repo)`);
  console.log(`Manifest saved to: manifest.json`);
}

main().catch(console.error);
