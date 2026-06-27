const fs = require('fs');

const content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const facultyMarker = '{/* ==================== FACULTY CREDENTIALS SECTION ==================== */}';
const heroMarker = '{/* ==================== HERO SECTION ==================== */}';
const quickHubMarker = '{/* ==================== MATHEMATICS QUICK HUB ==================== */}';
const toppersMarker = '{/* ==================== TOPPERS / HALL OF FAME ==================== */}';
const coursesMarker = '{/* ==================== ALL COURSES GRID ==================== */}';

const beforeFaculty = content.substring(0, content.indexOf(facultyMarker));
const facultySection = content.substring(content.indexOf(facultyMarker), content.indexOf(heroMarker));
const heroSection = content.substring(content.indexOf(heroMarker), content.indexOf(quickHubMarker));
const quickHubSection = content.substring(content.indexOf(quickHubMarker), content.indexOf(toppersMarker));
const toppersSection = content.substring(content.indexOf(toppersMarker), content.indexOf(coursesMarker));
const afterToppers = content.substring(content.indexOf(coursesMarker));

let newToppersSection = toppersSection;
newToppersSection = newToppersSection.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-8">', '<div className="w-full overflow-hidden"><div className="animate-marquee gap-8 py-4 px-4 flex flex-row flex-nowrap">');
newToppersSection = newToppersSection.replace('{(toppers || []).map((t, idx) => (', '{[...(toppers || []), ...(toppers || []), ...(toppers || []), ...(toppers || [])].map((t, idx) => (');
newToppersSection = newToppersSection.replace('className="group relative bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"', 'className="w-[300px] md:w-[400px] shrink-0 group relative bg-obsidian border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-gold/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"');
newToppersSection = newToppersSection.replace('))}\n          </div>\n        </div>', '))}\n            </div>\n          </div>\n        </div>');


const newContent = beforeFaculty + heroSection + newToppersSection + facultySection + quickHubSection + afterToppers;

fs.writeFileSync('src/pages/Home.jsx', newContent);
console.log('Reordered sections successfully.');
